const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const { db, cognito, jwtVerifier } = require("../config/aws");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify a Cognito ID token and get/create the user profile
 * @access  Public
 */
router.post(
  "/verify-token",
  [body("idToken").notEmpty().withMessage("ID token is required")],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation failed", 400);
    }

    const { idToken } = req.body;

    try {
      const payload = await jwtVerifier.verify(idToken);

      const userRef = db.collection("users").doc(payload.sub);
      const userDoc = await userRef.get();

      let userData = {
        uid: payload.sub,
        email: payload.email,
        emailVerified:
          payload.email_verified === true || payload.email_verified === "true",
        name: payload.name || payload["cognito:username"],
        picture: payload.picture,
        lastLogin: new Date().toISOString(),
      };

      if (!userDoc.exists) {
        userData.createdAt = new Date().toISOString();
        userData.isNewUser = true;
        await userRef.set(userData);
      } else {
        userData = { ...userDoc.data(), ...userData };
        await userRef.update({ lastLogin: userData.lastLogin });
      }

      res.json({
        success: true,
        user: userData,
        message: userDoc.exists ? "User authenticated" : "New user created",
      });
    } catch (error) {
      console.error("Token verification error:", error.message);
      throw new AppError("Invalid token", 401);
    }
  })
);

/**
 * @route   POST /api/auth/create-user
 * @desc    Create a new user account in Cognito + profile in DynamoDB
 * @access  Public
 */
router.post(
  "/create-user",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("displayName")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Display name must be at least 2 characters"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "ValidationError",
        message: errors.array().map((err) => err.msg).join(", "),
      });
    }

    const { email, password, displayName } = req.body;

    try {
      // Create the Cognito user (suppress the invite email) …
      const created = await cognito.send(
        new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: email,
          MessageAction: "SUPPRESS",
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "email_verified", Value: "true" },
            ...(displayName ? [{ Name: "name", Value: displayName }] : []),
          ],
        })
      );

      // … then set a permanent password so the account is immediately usable.
      await cognito.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: USER_POOL_ID,
          Username: email,
          Password: password,
          Permanent: true,
        })
      );

      const attrs = (created.User && created.User.Attributes) || [];
      const sub = (attrs.find((a) => a.Name === "sub") || {}).Value;

      const userData = {
        uid: sub,
        email,
        displayName: displayName || "",
        createdAt: new Date().toISOString(),
        emailVerified: true,
        isNewUser: true,
      };

      if (sub) {
        await db.collection("users").doc(sub).set(userData);
      }

      res.status(201).json({
        success: true,
        user: userData,
        message: "User created successfully",
      });
    } catch (error) {
      console.error("User creation error:", error.name, error.message);
      let message = "Failed to create user";
      if (error.name === "UsernameExistsException") message = "Email already exists";
      else if (error.name === "InvalidPasswordException") message = "Password is too weak";
      else if (error.name === "InvalidParameterException") message = "Invalid email or parameters";
      throw new AppError(message, 400);
    }
  })
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  "/profile",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userRef = db.collection("users").doc(req.user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new AppError("User profile not found", 404);
    }

    res.json({ success: true, user: userDoc.data() });
  })
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  authMiddleware,
  asyncHandler(async (req, res) => {
    // Accept the profile as-is (the record is the user's own, keyed by the
    // verified token uid). Force uid/email from the token so they can't be
    // spoofed, and drop undefined values.
    const updateData = {
      ...req.body,
      uid: req.user.uid,
      updatedAt: new Date().toISOString(),
    };
    if (req.user.email) updateData.email = req.user.email;
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const userRef = db.collection("users").doc(req.user.uid);
    await userRef.set(updateData, { merge: true });
    const updatedDoc = await userRef.get();

    res.json({
      success: true,
      user: updatedDoc.data(),
      message: "Profile updated successfully",
    });
  })
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account (DynamoDB data + Cognito user)
 * @access  Private
 */
router.delete(
  "/account",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user.uid;

    try {
      const batch = db.batch();
      batch.delete(db.collection("users").doc(userId));

      const foodDiaryQuery = await db
        .collection("foodDiary")
        .where("userId", "==", userId)
        .get();
      foodDiaryQuery.docs.forEach((doc) => batch.delete(doc.ref));

      const healthMetricsQuery = await db
        .collection("healthMetrics")
        .where("userId", "==", userId)
        .get();
      healthMetricsQuery.docs.forEach((doc) => batch.delete(doc.ref));

      const favRecipesQuery = await db
        .collection("favoriteRecipes")
        .where("userId", "==", userId)
        .get();
      favRecipesQuery.docs.forEach((doc) => batch.delete(doc.ref));

      batch.delete(db.collection("userGoals").doc(userId));

      await batch.commit();

      // Delete the Cognito user (sub is accepted as Username in admin calls).
      await cognito.send(
        new AdminDeleteUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: userId,
        })
      );

      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      console.error("Account deletion error:", error.message);
      throw new AppError("Failed to delete account", 500);
    }
  })
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Token refresh is handled by the Cognito client SDK
 * @access  Public
 */
router.post(
  "/refresh-token",
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Token refresh should be handled by the Cognito client SDK",
    });
  })
);

module.exports = router;
