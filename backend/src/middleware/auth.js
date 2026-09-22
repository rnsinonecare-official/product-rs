const { jwtVerifier } = require("../config/aws");

/**
 * Map a verified Cognito ID-token payload to the req.user shape the app uses.
 * (uid was the Firebase UID; it is now the Cognito `sub`.)
 */
function toUser(payload) {
  return {
    uid: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified === true || payload.email_verified === "true",
    name: payload.name || payload["cognito:username"],
    picture: payload.picture,
    claims: payload,
  };
}

/**
 * Authentication middleware — verifies a Cognito ID token.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No valid authorization token provided",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];
    if (!idToken) {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "No token provided" });
    }

    if (!jwtVerifier) {
      return res.status(500).json({
        error: "Server misconfiguration",
        message: "Cognito verifier is not configured",
      });
    }

    const payload = await jwtVerifier.verify(idToken);
    req.user = toUser(payload);
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    let message = "Invalid token";
    if (/expired/i.test(error.message)) message = "Token has expired";
    else if (/revoked/i.test(error.message)) message = "Token has been revoked";
    return res
      .status(401)
      .json({ error: "Unauthorized", message });
  }
};

/**
 * Optional authentication — never fails; sets req.user to null when absent/invalid.
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }
    const idToken = authHeader.split("Bearer ")[1];
    if (!idToken || !jwtVerifier) {
      req.user = null;
      return next();
    }
    const payload = await jwtVerifier.verify(idToken);
    req.user = toUser(payload);
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
};
