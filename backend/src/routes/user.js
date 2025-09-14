const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile with extended information
 * @access  Private
 */
router.get('/profile', asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new AppError('User profile not found', 404);
    }

    const userData = userDoc.data();

    // Get additional user statistics
    const [foodEntriesCount, metricsCount, favRecipesCount] = await Promise.all([
      db.collection('foodDiary').where('userId', '==', userId).get().then(snap => snap.size),
      db.collection('healthMetrics').where('userId', '==', userId).get().then(snap => snap.size),
      db.collection('favoriteRecipes').where('userId', '==', userId).get().then(snap => snap.size)
    ]);

    const profile = {
      ...userData,
      statistics: {
        foodEntriesCount,
        metricsCount,
        favRecipesCount,
        joinedDate: userData.createdAt
      }
    };

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get user profile', 500);
  }
}));

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  [
    body('displayName').optional().isLength({ min: 2, max: 50 }).withMessage('Display name must be 2-50 characters'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('dateOfBirth').optional().isISO8601().withMessage('Valid date is required'),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender'),
    body('height').optional().isNumeric().withMessage('Height must be a number'),
    body('activityLevel').optional().isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']).withMessage('Invalid activity level'),
    body('healthConditions').optional().isArray().withMessage('Health conditions must be an array'),
    body('dietaryPreferences').optional().isArray().withMessage('Dietary preferences must be an array'),
    body('allergies').optional().isArray().withMessage('Allergies must be an array'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    body('location').optional().isString().withMessage('Location must be a string'),
    body('timezone').optional().isString().withMessage('Timezone must be a string'),
    body('language').optional().isString().withMessage('Language must be a string'),
    body('units').optional().isIn(['metric', 'imperial']).withMessage('Units must be metric or imperial'),
    body('privacy').optional().isObject().withMessage('Privacy settings must be an object')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const userId = req.user.uid;
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

    try {
      const userRef = db.collection('users').doc(userId);
      await userRef.update(updateData);

      const updatedDoc = await userRef.get();
      const updatedProfile = updatedDoc.data();

      res.json({
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update user profile error:', error);
      throw new AppError('Failed to update profile', 500);
    }
  })
);

/**
 * @route   POST /api/user/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.post('/preferences',
  [
    body('notifications').optional().isObject().withMessage('Notifications must be an object'),
    body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme'),
    body('language').optional().isString().withMessage('Language must be a string'),
    body('units').optional().isIn(['metric', 'imperial']).withMessage('Units must be metric or imperial'),
    body('timezone').optional().isString().withMessage('Timezone must be a string'),
    body('privacy').optional().isObject().withMessage('Privacy settings must be an object'),
    body('dataSharing').optional().isObject().withMessage('Data sharing settings must be an object')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const userId = req.user.uid;
    const preferences = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    try {
      const preferencesRef = db.collection('userPreferences').doc(userId);
      await preferencesRef.set(preferences, { merge: true });

      res.json({
        success: true,
        data: preferences,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      throw new AppError('Failed to update preferences', 500);
    }
  })
);

/**
 * @route   GET /api/user/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences', asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  try {
    const preferencesDoc = await db.collection('userPreferences').doc(userId).get();

    const preferences = preferencesDoc.exists ? preferencesDoc.data() : {
      notifications: {
        email: true,
        push: true,
        mealReminders: true,
        progressUpdates: true
      },
      theme: 'light',
      language: 'en',
      units: 'metric',
      timezone: 'UTC',
      privacy: {
        profileVisible: false,
        shareProgress: false,
        shareRecipes: true
      },
      dataSharing: {
        analytics: true,
        research: false
      }
    };

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    throw new AppError('Failed to get preferences', 500);
  }
}));

/**
 * @route   GET /api/user/activity
 * @desc    Get user activity summary
 * @access  Private
 */
router.get('/activity',
  [
    query('days').optional().isInt({ min: 7, max: 90 }).withMessage('Days must be between 7 and 90')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const userId = req.user.uid;
    const days = parseInt(req.query.days) || 30;

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Get activity data
      const [foodEntries, healthMetrics, sharedRecipes, recipeLikes] = await Promise.all([
        db.collection('foodDiary')
          .where('userId', '==', userId)
          .where('date', '>=', startDateStr)
          .where('date', '<=', endDateStr)
          .get(),
        db.collection('healthMetrics')
          .where('userId', '==', userId)
          .where('date', '>=', startDateStr)
          .where('date', '<=', endDateStr)
          .get(),
        db.collection('sharedRecipes')
          .where('userId', '==', userId)
          .where('createdAt', '>=', startDate.toISOString())
          .get(),
        db.collection('recipeLikes')
          .where('userId', '==', userId)
          .where('createdAt', '>=', startDate.toISOString())
          .get()
      ]);

      // Calculate activity metrics
      const activity = {
        period: { startDate: startDateStr, endDate: endDateStr, days },
        foodTracking: {
          totalEntries: foodEntries.size,
          daysTracked: new Set(foodEntries.docs.map(doc => doc.data().date)).size,
          avgEntriesPerDay: foodEntries.size / days,
          consistency: Math.round((new Set(foodEntries.docs.map(doc => doc.data().date)).size / days) * 100)
        },
        healthTracking: {
          totalEntries: healthMetrics.size,
          daysTracked: new Set(healthMetrics.docs.map(doc => doc.data().date)).size,
          consistency: Math.round((new Set(healthMetrics.docs.map(doc => doc.data().date)).size / days) * 100)
        },
        community: {
          recipesShared: sharedRecipes.size,
          recipesLiked: recipeLikes.size
        },
        streaks: calculateStreaks(foodEntries.docs.map(doc => doc.data().date)),
        achievements: calculateAchievements(foodEntries.size, healthMetrics.size, days)
      };

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      console.error('Get user activity error:', error);
      throw new AppError('Failed to get user activity', 500);
    }
  })
);

/**
 * @route   GET /api/user/export
 * @desc    Export all user data
 * @access  Private
 */
router.get('/export', asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  try {
    // Get all user data
    const [
      userProfile,
      foodDiary,
      healthMetrics,
      favoriteRecipes,
      sharedRecipes,
      goals,
      preferences
    ] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('foodDiary').where('userId', '==', userId).get(),
      db.collection('healthMetrics').where('userId', '==', userId).get(),
      db.collection('favoriteRecipes').where('userId', '==', userId).get(),
      db.collection('sharedRecipes').where('userId', '==', userId).get(),
      db.collection('userGoals').doc(userId).get(),
      db.collection('userPreferences').doc(userId).get()
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      profile: userProfile.exists ? userProfile.data() : null,
      foodDiary: foodDiary.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      healthMetrics: healthMetrics.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      favoriteRecipes: favoriteRecipes.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      sharedRecipes: sharedRecipes.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      goals: goals.exists ? goals.data() : null,
      preferences: preferences.exists ? preferences.data() : null,
      summary: {
        totalFoodEntries: foodDiary.size,
        totalHealthMetrics: healthMetrics.size,
        totalFavoriteRecipes: favoriteRecipes.size,
        totalSharedRecipes: sharedRecipes.size
      }
    };

    res.json({
      success: true,
      data: exportData,
      message: 'User data exported successfully'
    });
  } catch (error) {
    console.error('Export user data error:', error);
    throw new AppError('Failed to export user data', 500);
  }
}));

/**
 * @route   DELETE /api/user/data
 * @desc    Delete specific user data
 * @access  Private
 */
router.delete('/data',
  [
    body('dataTypes').isArray().withMessage('Data types must be an array'),
    body('dataTypes').custom((value) => {
      const validTypes = ['foodDiary', 'healthMetrics', 'favoriteRecipes', 'sharedRecipes', 'goals', 'preferences'];
      const invalidTypes = value.filter(type => !validTypes.includes(type));
      if (invalidTypes.length > 0) {
        throw new Error(`Invalid data types: ${invalidTypes.join(', ')}`);
      }
      return true;
    }),
    body('confirmDelete').equals(true).withMessage('Confirmation required to delete data')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const userId = req.user.uid;
    const { dataTypes } = req.body;

    try {
      const batch = db.batch();
      let deletedCounts = {};

      for (const dataType of dataTypes) {
        let query;
        let collectionName;

        switch (dataType) {
          case 'foodDiary':
            collectionName = 'foodDiary';
            query = db.collection(collectionName).where('userId', '==', userId);
            break;
          case 'healthMetrics':
            collectionName = 'healthMetrics';
            query = db.collection(collectionName).where('userId', '==', userId);
            break;
          case 'favoriteRecipes':
            collectionName = 'favoriteRecipes';
            query = db.collection(collectionName).where('userId', '==', userId);
            break;
          case 'sharedRecipes':
            collectionName = 'sharedRecipes';
            query = db.collection(collectionName).where('userId', '==', userId);
            break;
          case 'goals':
            batch.delete(db.collection('userGoals').doc(userId));
            deletedCounts[dataType] = 1;
            continue;
          case 'preferences':
            batch.delete(db.collection('userPreferences').doc(userId));
            deletedCounts[dataType] = 1;
            continue;
        }

        if (query) {
          const snapshot = await query.get();
          deletedCounts[dataType] = snapshot.size;
          
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
        }
      }

      await batch.commit();

      res.json({
        success: true,
        message: 'Selected data deleted successfully',
        deletedCounts
      });
    } catch (error) {
      console.error('Delete user data error:', error);
      throw new AppError('Failed to delete user data', 500);
    }
  })
);

/**
 * @route   GET /api/user/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  try {
    // Get user registration date
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const joinDate = userData?.createdAt ? new Date(userData.createdAt) : new Date();
    const daysActive = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));

    // Get all-time statistics
    const [foodEntries, healthMetrics, favoriteRecipes, sharedRecipes, recipeLikes] = await Promise.all([
      db.collection('foodDiary').where('userId', '==', userId).get(),
      db.collection('healthMetrics').where('userId', '==', userId).get(),
      db.collection('favoriteRecipes').where('userId', '==', userId).get(),
      db.collection('sharedRecipes').where('userId', '==', userId).get(),
      db.collection('recipeLikes').where('userId', '==', userId).get()
    ]);

    // Calculate unique tracking days
    const uniqueFoodDays = new Set(foodEntries.docs.map(doc => doc.data().date)).size;
    const uniqueHealthDays = new Set(healthMetrics.docs.map(doc => doc.data().date)).size;

    // Get community engagement stats
    const mySharedRecipes = sharedRecipes.docs.map(doc => doc.data());
    const totalLikesReceived = mySharedRecipes.reduce((sum, recipe) => sum + (recipe.likes || 0), 0);
    const totalViewsReceived = mySharedRecipes.reduce((sum, recipe) => sum + (recipe.views || 0), 0);

    const stats = {
      profile: {
        joinDate: joinDate.toISOString(),
        daysActive,
        memberSince: `${Math.floor(daysActive / 30)} months`
      },
      tracking: {
        totalFoodEntries: foodEntries.size,
        totalHealthMetrics: healthMetrics.size,
        uniqueFoodTrackingDays: uniqueFoodDays,
        uniqueHealthTrackingDays: uniqueHealthDays,
        foodTrackingConsistency: daysActive > 0 ? Math.round((uniqueFoodDays / daysActive) * 100) : 0,
        healthTrackingConsistency: daysActive > 0 ? Math.round((uniqueHealthDays / daysActive) * 100) : 0
      },
      community: {
        recipesShared: sharedRecipes.size,
        recipesLiked: recipeLikes.size,
        favoriteRecipes: favoriteRecipes.size,
        likesReceived: totalLikesReceived,
        viewsReceived: totalViewsReceived
      },
      achievements: calculateAllTimeAchievements({
        foodEntries: foodEntries.size,
        healthMetrics: healthMetrics.size,
        uniqueFoodDays,
        uniqueHealthDays,
        recipesShared: sharedRecipes.size,
        daysActive
      })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    throw new AppError('Failed to get user statistics', 500);
  }
}));

// Helper functions
const calculateStreaks = (dates) => {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const uniqueDates = [...new Set(dates)].sort();
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate current streak (from today backwards)
  const today = new Date().toISOString().split('T')[0];
  const sortedDates = uniqueDates.sort().reverse();
  
  if (sortedDates[0] === today || 
      (new Date(today) - new Date(sortedDates[0])) / (1000 * 60 * 60 * 24) === 1) {
    currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = (prevDate - currDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  return { current: currentStreak, longest: longestStreak };
};

const calculateAchievements = (foodEntries, healthMetrics, days) => {
  const achievements = [];

  // Food tracking achievements
  if (foodEntries >= 7) achievements.push({ name: 'First Week', description: 'Tracked food for 7 days' });
  if (foodEntries >= 30) achievements.push({ name: 'Monthly Tracker', description: 'Tracked food for 30 days' });
  if (foodEntries >= 100) achievements.push({ name: 'Dedicated Tracker', description: 'Logged 100 food entries' });

  // Health tracking achievements
  if (healthMetrics >= 7) achievements.push({ name: 'Health Conscious', description: 'Tracked health metrics for 7 days' });
  if (healthMetrics >= 30) achievements.push({ name: 'Health Monitor', description: 'Tracked health metrics for 30 days' });

  // Consistency achievements
  const foodConsistency = days > 0 ? (foodEntries / days) * 100 : 0;
  if (foodConsistency >= 80) achievements.push({ name: 'Consistent Tracker', description: '80% tracking consistency' });
  if (foodConsistency >= 95) achievements.push({ name: 'Perfect Tracker', description: '95% tracking consistency' });

  return achievements;
};

const calculateAllTimeAchievements = (stats) => {
  const achievements = [];

  // Milestone achievements
  if (stats.foodEntries >= 100) achievements.push({ name: 'Century Club', description: '100+ food entries' });
  if (stats.foodEntries >= 500) achievements.push({ name: 'Dedicated Logger', description: '500+ food entries' });
  if (stats.foodEntries >= 1000) achievements.push({ name: 'Master Tracker', description: '1000+ food entries' });

  if (stats.uniqueFoodDays >= 30) achievements.push({ name: 'Monthly Commitment', description: '30 days of food tracking' });
  if (stats.uniqueFoodDays >= 100) achievements.push({ name: 'Hundred Days', description: '100 days of food tracking' });
  if (stats.uniqueFoodDays >= 365) achievements.push({ name: 'Year Long Journey', description: '365 days of food tracking' });

  // Community achievements
  if (stats.recipesShared >= 1) achievements.push({ name: 'Recipe Sharer', description: 'Shared first recipe' });
  if (stats.recipesShared >= 10) achievements.push({ name: 'Community Contributor', description: 'Shared 10+ recipes' });

  // Longevity achievements
  if (stats.daysActive >= 30) achievements.push({ name: 'One Month Member', description: 'Active for 30+ days' });
  if (stats.daysActive >= 365) achievements.push({ name: 'One Year Member', description: 'Active for 1+ year' });

  return achievements;
};

module.exports = router;