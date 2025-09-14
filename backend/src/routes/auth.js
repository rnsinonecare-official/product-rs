const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, db } = require('../config/firebase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify Firebase ID token and get user info
 * @access  Public
 */
router.post('/verify-token', 
  [
    body('idToken').notEmpty().withMessage('ID token is required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { idToken } = req.body;

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      
      // Get or create user profile in Firestore
      const userRef = db.collection('users').doc(decodedToken.uid);
      const userDoc = await userRef.get();

      let userData = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        lastLogin: new Date().toISOString()
      };

      if (!userDoc.exists) {
        // Create new user profile
        userData.createdAt = new Date().toISOString();
        userData.isNewUser = true;
        await userRef.set(userData);
      } else {
        // Update last login
        userData = { ...userDoc.data(), ...userData };
        await userRef.update({ lastLogin: userData.lastLogin });
      }

      res.json({
        success: true,
        user: userData,
        message: userDoc.exists ? 'User authenticated' : 'New user created'
      });

    } catch (error) {
      console.error('Token verification error:', error);
      throw new AppError('Invalid token', 401);
    }
  })
);

/**
 * @route   POST /api/auth/create-user
 * @desc    Create a new user account
 * @access  Public
 */
router.post('/create-user',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('displayName').optional().isLength({ min: 2 }).withMessage('Display name must be at least 2 characters')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { email, password, displayName } = req.body;

    try {
      const userRecord = await auth.createUser({
        email,
        password,
        displayName
      });

      // Create user profile in Firestore
      const userData = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: displayName || '',
        createdAt: new Date().toISOString(),
        emailVerified: false,
        isNewUser: true
      };

      await db.collection('users').doc(userRecord.uid).set(userData);

      res.status(201).json({
        success: true,
        user: userData,
        message: 'User created successfully'
      });

    } catch (error) {
      console.error('User creation error:', error);
      
      let message = 'Failed to create user';
      if (error.code === 'auth/email-already-exists') {
        message = 'Email already exists';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak';
      }
      
      throw new AppError(message, 400);
    }
  })
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const userRef = db.collection('users').doc(req.user.uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new AppError('User profile not found', 404);
  }

  res.json({
    success: true,
    user: userDoc.data()
  });
}));

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  authMiddleware,
  [
    body('displayName').optional().isLength({ min: 2 }).withMessage('Display name must be at least 2 characters'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('dateOfBirth').optional().isISO8601().withMessage('Valid date is required'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
    body('height').optional().isNumeric().withMessage('Height must be a number'),
    body('weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('activityLevel').optional().isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']).withMessage('Invalid activity level'),
    body('healthConditions').optional().isArray().withMessage('Health conditions must be an array'),
    body('dietaryPreferences').optional().isArray().withMessage('Dietary preferences must be an array')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const userRef = db.collection('users').doc(req.user.uid);
    await userRef.update(updateData);

    const updatedDoc = await userRef.get();

    res.json({
      success: true,
      user: updatedDoc.data(),
      message: 'Profile updated successfully'
    });
  })
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  try {
    // Delete user data from Firestore
    const batch = db.batch();
    
    // Delete user profile
    batch.delete(db.collection('users').doc(userId));
    
    // Delete user's food diary entries
    const foodDiaryQuery = await db.collection('foodDiary').where('userId', '==', userId).get();
    foodDiaryQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete user's health metrics
    const healthMetricsQuery = await db.collection('healthMetrics').where('userId', '==', userId).get();
    healthMetricsQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete user's favorite recipes
    const favRecipesQuery = await db.collection('favoriteRecipes').where('userId', '==', userId).get();
    favRecipesQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete user goals
    batch.delete(db.collection('userGoals').doc(userId));
    
    await batch.commit();
    
    // Delete user from Firebase Auth
    await auth.deleteUser(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    throw new AppError('Failed to delete account', 500);
  }
}));

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh user token (handled by Firebase client SDK)
 * @access  Public
 */
router.post('/refresh-token', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Token refresh should be handled by Firebase client SDK'
  });
}));

module.exports = router;