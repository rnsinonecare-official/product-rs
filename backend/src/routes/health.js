const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   POST /api/health/metrics
 * @desc    Save health metrics
 * @access  Private
 */
router.post('/metrics',
  [
    body('weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('height').optional().isNumeric().withMessage('Height must be a number'),
    body('bloodPressure').optional().isObject().withMessage('Blood pressure must be an object'),
    body('bloodPressure.systolic').optional().isNumeric().withMessage('Systolic pressure must be a number'),
    body('bloodPressure.diastolic').optional().isNumeric().withMessage('Diastolic pressure must be a number'),
    body('bloodSugar').optional().isNumeric().withMessage('Blood sugar must be a number'),
    body('heartRate').optional().isNumeric().withMessage('Heart rate must be a number'),
    body('bodyFat').optional().isNumeric().withMessage('Body fat must be a number'),
    body('muscleMass').optional().isNumeric().withMessage('Muscle mass must be a number'),
    body('waterIntake').optional().isNumeric().withMessage('Water intake must be a number'),
    body('sleepHours').optional().isNumeric().withMessage('Sleep hours must be a number'),
    body('stressLevel').optional().isInt({ min: 1, max: 10 }).withMessage('Stress level must be between 1 and 10'),
    body('energyLevel').optional().isInt({ min: 1, max: 10 }).withMessage('Energy level must be between 1 and 10'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('notes').optional().isString().withMessage('Notes must be a string')
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
    const metricsData = {
      ...req.body,
      userId,
      createdAt: new Date().toISOString(),
      date: req.body.date || new Date().toISOString().split('T')[0]
    };

    // Calculate BMI if weight and height are provided
    if (metricsData.weight && metricsData.height) {
      const heightInMeters = metricsData.height / 100;
      metricsData.bmi = parseFloat((metricsData.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    try {
      const docRef = await db.collection('healthMetrics').add(metricsData);
      const newMetrics = { id: docRef.id, ...metricsData };

      res.status(201).json({
        success: true,
        data: newMetrics,
        message: 'Health metrics saved successfully'
      });
    } catch (error) {
      console.error('Health metrics save error:', error);
      throw new AppError('Failed to save health metrics', 500);
    }
  })
);

/**
 * @route   GET /api/health/metrics
 * @desc    Get health metrics
 * @access  Private
 */
router.get('/metrics',
  [
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    query('limit').optional().isInt({ min: 1, max: 365 }).withMessage('Limit must be between 1 and 365'),
    query('type').optional().isIn(['weight', 'bloodPressure', 'bloodSugar', 'all']).withMessage('Invalid metric type')
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
    const { startDate, endDate, limit = 100, type = 'all' } = req.query;

    try {
      let query = db.collection('healthMetrics').where('userId', '==', userId);

      if (startDate) {
        query = query.where('date', '>=', startDate);
      }

      if (endDate) {
        query = query.where('date', '<=', endDate);
      }

      query = query.orderBy('date', 'desc').limit(parseInt(limit));

      const snapshot = await query.get();
      let metrics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by type if specified
      if (type !== 'all') {
        metrics = metrics.filter(metric => metric[type] !== undefined);
      }

      // Calculate trends and statistics
      const stats = calculateHealthStats(metrics, type);

      res.json({
        success: true,
        data: metrics,
        count: metrics.length,
        stats,
        filters: { startDate, endDate, type }
      });
    } catch (error) {
      console.error('Health metrics fetch error:', error);
      throw new AppError('Failed to get health metrics', 500);
    }
  })
);

/**
 * @route   PUT /api/health/metrics/:metricId
 * @desc    Update health metrics
 * @access  Private
 */
router.put('/metrics/:metricId',
  [
    body('weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('height').optional().isNumeric().withMessage('Height must be a number'),
    body('bloodPressure').optional().isObject().withMessage('Blood pressure must be an object'),
    body('bloodSugar').optional().isNumeric().withMessage('Blood sugar must be a number'),
    body('heartRate').optional().isNumeric().withMessage('Heart rate must be a number'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { metricId } = req.params;
    const userId = req.user.uid;

    try {
      const metricRef = db.collection('healthMetrics').doc(metricId);
      const metricDoc = await metricRef.get();

      if (!metricDoc.exists) {
        throw new AppError('Health metric not found', 404);
      }

      const metricData = metricDoc.data();
      if (metricData.userId !== userId) {
        throw new AppError('Unauthorized to update this metric', 403);
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      // Recalculate BMI if weight or height is updated
      const currentData = metricData;
      const newWeight = updateData.weight || currentData.weight;
      const newHeight = updateData.height || currentData.height;

      if (newWeight && newHeight) {
        const heightInMeters = newHeight / 100;
        updateData.bmi = parseFloat((newWeight / (heightInMeters * heightInMeters)).toFixed(1));
      }

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await metricRef.update(updateData);

      const updatedDoc = await metricRef.get();
      const updatedMetric = { id: updatedDoc.id, ...updatedDoc.data() };

      res.json({
        success: true,
        data: updatedMetric,
        message: 'Health metrics updated successfully'
      });
    } catch (error) {
      console.error('Health metrics update error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update health metrics', 500);
    }
  })
);

/**
 * @route   DELETE /api/health/metrics/:metricId
 * @desc    Delete health metrics
 * @access  Private
 */
router.delete('/metrics/:metricId', asyncHandler(async (req, res) => {
  const { metricId } = req.params;
  const userId = req.user.uid;

  try {
    const metricRef = db.collection('healthMetrics').doc(metricId);
    const metricDoc = await metricRef.get();

    if (!metricDoc.exists) {
      throw new AppError('Health metric not found', 404);
    }

    const metricData = metricDoc.data();
    if (metricData.userId !== userId) {
      throw new AppError('Unauthorized to delete this metric', 403);
    }

    await metricRef.delete();

    res.json({
      success: true,
      message: 'Health metrics deleted successfully'
    });
  } catch (error) {
    console.error('Health metrics delete error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete health metrics', 500);
  }
}));

/**
 * @route   POST /api/health/goals
 * @desc    Set health goals
 * @access  Private
 */
router.post('/goals',
  [
    body('targetWeight').optional().isNumeric().withMessage('Target weight must be a number'),
    body('targetCalories').optional().isNumeric().withMessage('Target calories must be a number'),
    body('targetProtein').optional().isNumeric().withMessage('Target protein must be a number'),
    body('targetCarbs').optional().isNumeric().withMessage('Target carbs must be a number'),
    body('targetFat').optional().isNumeric().withMessage('Target fat must be a number'),
    body('targetWaterIntake').optional().isNumeric().withMessage('Target water intake must be a number'),
    body('targetSleepHours').optional().isNumeric().withMessage('Target sleep hours must be a number'),
    body('targetSteps').optional().isNumeric().withMessage('Target steps must be a number'),
    body('weightGoalType').optional().isIn(['lose', 'gain', 'maintain']).withMessage('Invalid weight goal type'),
    body('timeframe').optional().isNumeric().withMessage('Timeframe must be a number (weeks)'),
    body('activityLevel').optional().isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']).withMessage('Invalid activity level')
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
    const goalsData = {
      ...req.body,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const goalsRef = db.collection('userGoals').doc(userId);
      await goalsRef.set(goalsData, { merge: true });

      res.json({
        success: true,
        data: goalsData,
        message: 'Health goals set successfully'
      });
    } catch (error) {
      console.error('Health goals save error:', error);
      throw new AppError('Failed to save health goals', 500);
    }
  })
);

/**
 * @route   GET /api/health/goals
 * @desc    Get health goals
 * @access  Private
 */
router.get('/goals', asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  try {
    const goalsDoc = await db.collection('userGoals').doc(userId).get();

    if (!goalsDoc.exists) {
      return res.json({
        success: true,
        data: null,
        message: 'No health goals set yet'
      });
    }

    const goals = goalsDoc.data();

    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error('Health goals fetch error:', error);
    throw new AppError('Failed to get health goals', 500);
  }
}));

/**
 * @route   GET /api/health/progress
 * @desc    Get health progress analysis
 * @access  Private
 */
router.get('/progress',
  [
    query('days').optional().isInt({ min: 7, max: 365 }).withMessage('Days must be between 7 and 365')
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

      // Get health metrics
      const metricsQuery = db.collection('healthMetrics')
        .where('userId', '==', userId)
        .where('date', '>=', startDateStr)
        .where('date', '<=', endDateStr)
        .orderBy('date', 'asc');

      // Get food diary entries
      const foodQuery = db.collection('foodDiary')
        .where('userId', '==', userId)
        .where('date', '>=', startDateStr)
        .where('date', '<=', endDateStr)
        .orderBy('date', 'asc');

      // Get goals
      const goalsDoc = db.collection('userGoals').doc(userId);

      const [metricsSnapshot, foodSnapshot, goalsSnapshot] = await Promise.all([
        metricsQuery.get(),
        foodQuery.get(),
        goalsDoc.get()
      ]);

      const metrics = metricsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const foodEntries = foodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const goals = goalsSnapshot.exists ? goalsSnapshot.data() : null;

      // Calculate progress
      const progress = calculateHealthProgress(metrics, foodEntries, goals, days);

      res.json({
        success: true,
        data: progress,
        period: { startDate: startDateStr, endDate: endDateStr, days }
      });
    } catch (error) {
      console.error('Health progress fetch error:', error);
      throw new AppError('Failed to get health progress', 500);
    }
  })
);

/**
 * @route   GET /api/health/dashboard
 * @desc    Get health dashboard summary
 * @access  Private
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // Get today's data
    const [todayMetrics, todayFood, goals] = await Promise.all([
      db.collection('healthMetrics').where('userId', '==', userId).where('date', '==', today).get(),
      db.collection('foodDiary').where('userId', '==', userId).where('date', '==', today).get(),
      db.collection('userGoals').doc(userId).get()
    ]);

    // Get recent metrics for trends
    const recentMetrics = await db.collection('healthMetrics')
      .where('userId', '==', userId)
      .where('date', '>=', weekAgoStr)
      .orderBy('date', 'desc')
      .limit(7)
      .get();

    const dashboard = {
      today: {
        metrics: todayMetrics.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0] || null,
        nutrition: calculateDailyNutrition(todayFood.docs.map(doc => doc.data())),
        foodEntries: todayFood.docs.length
      },
      goals: goals.exists ? goals.data() : null,
      trends: calculateTrends(recentMetrics.docs.map(doc => doc.data())),
      summary: {
        totalDaysTracked: recentMetrics.docs.length,
        lastWeightEntry: getLatestMetric(recentMetrics.docs.map(doc => doc.data()), 'weight'),
        lastBPEntry: getLatestMetric(recentMetrics.docs.map(doc => doc.data()), 'bloodPressure')
      }
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Health dashboard fetch error:', error);
    throw new AppError('Failed to get health dashboard', 500);
  }
}));

// Helper functions
const calculateHealthStats = (metrics, type) => {
  if (metrics.length === 0) return null;

  const stats = {
    count: metrics.length,
    latest: metrics[0],
    oldest: metrics[metrics.length - 1]
  };

  if (type === 'weight' || type === 'all') {
    const weights = metrics.filter(m => m.weight).map(m => m.weight);
    if (weights.length > 0) {
      stats.weight = {
        current: weights[0],
        min: Math.min(...weights),
        max: Math.max(...weights),
        avg: parseFloat((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)),
        trend: weights.length > 1 ? weights[0] - weights[weights.length - 1] : 0
      };
    }
  }

  if (type === 'bloodPressure' || type === 'all') {
    const bpEntries = metrics.filter(m => m.bloodPressure);
    if (bpEntries.length > 0) {
      const systolic = bpEntries.map(m => m.bloodPressure.systolic);
      const diastolic = bpEntries.map(m => m.bloodPressure.diastolic);
      
      stats.bloodPressure = {
        current: bpEntries[0].bloodPressure,
        avgSystolic: Math.round(systolic.reduce((a, b) => a + b, 0) / systolic.length),
        avgDiastolic: Math.round(diastolic.reduce((a, b) => a + b, 0) / diastolic.length)
      };
    }
  }

  return stats;
};

const calculateHealthProgress = (metrics, foodEntries, goals, days) => {
  const progress = {
    weight: null,
    nutrition: null,
    consistency: {
      metricsTracked: metrics.length,
      foodTracked: new Set(foodEntries.map(f => f.date)).size,
      totalDays: days,
      metricsPercentage: Math.round((metrics.length / days) * 100),
      foodPercentage: Math.round((new Set(foodEntries.map(f => f.date)).size / days) * 100)
    }
  };

  // Weight progress
  if (goals && goals.targetWeight && metrics.length > 0) {
    const weights = metrics.filter(m => m.weight).sort((a, b) => new Date(a.date) - new Date(b.date));
    if (weights.length > 1) {
      const startWeight = weights[0].weight;
      const currentWeight = weights[weights.length - 1].weight;
      const targetWeight = goals.targetWeight;
      
      progress.weight = {
        startWeight,
        currentWeight,
        targetWeight,
        totalChange: currentWeight - startWeight,
        remainingChange: targetWeight - currentWeight,
        progressPercentage: Math.round(((startWeight - currentWeight) / (startWeight - targetWeight)) * 100)
      };
    }
  }

  // Nutrition progress
  if (goals && foodEntries.length > 0) {
    const dailyNutrition = {};
    foodEntries.forEach(entry => {
      if (!dailyNutrition[entry.date]) {
        dailyNutrition[entry.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      dailyNutrition[entry.date].calories += entry.calories || 0;
      dailyNutrition[entry.date].protein += entry.protein || 0;
      dailyNutrition[entry.date].carbs += entry.carbs || 0;
      dailyNutrition[entry.date].fat += entry.fat || 0;
    });

    const avgNutrition = Object.values(dailyNutrition).reduce((acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
      carbs: acc.carbs + day.carbs,
      fat: acc.fat + day.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const daysCount = Object.keys(dailyNutrition).length;
    if (daysCount > 0) {
      progress.nutrition = {
        avgCalories: Math.round(avgNutrition.calories / daysCount),
        avgProtein: Math.round(avgNutrition.protein / daysCount),
        avgCarbs: Math.round(avgNutrition.carbs / daysCount),
        avgFat: Math.round(avgNutrition.fat / daysCount),
        calorieGoalAdherence: goals.targetCalories ? 
          Math.round(((avgNutrition.calories / daysCount) / goals.targetCalories) * 100) : null
      };
    }
  }

  return progress;
};

const calculateDailyNutrition = (foodEntries) => {
  return foodEntries.reduce((totals, entry) => ({
    calories: totals.calories + (entry.calories || 0),
    protein: totals.protein + (entry.protein || 0),
    carbs: totals.carbs + (entry.carbs || 0),
    fat: totals.fat + (entry.fat || 0),
    fiber: totals.fiber + (entry.fiber || 0),
    sugar: totals.sugar + (entry.sugar || 0),
    sodium: totals.sodium + (entry.sodium || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 });
};

const calculateTrends = (metrics) => {
  if (metrics.length < 2) return null;

  const sortedMetrics = metrics.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const trends = {};
  
  // Weight trend
  const weights = sortedMetrics.filter(m => m.weight).map(m => m.weight);
  if (weights.length >= 2) {
    trends.weight = weights[weights.length - 1] - weights[0];
  }

  // BMI trend
  const bmis = sortedMetrics.filter(m => m.bmi).map(m => m.bmi);
  if (bmis.length >= 2) {
    trends.bmi = bmis[bmis.length - 1] - bmis[0];
  }

  return trends;
};

const getLatestMetric = (metrics, type) => {
  const filtered = metrics.filter(m => m[type]).sort((a, b) => new Date(b.date) - new Date(a.date));
  return filtered.length > 0 ? { date: filtered[0].date, value: filtered[0][type] } : null;
};

module.exports = router;