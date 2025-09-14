const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const apiService = require('../services/apiService');

const router = express.Router();

/**
 * @route   GET /api/food/search
 * @desc    Search for food items
 * @access  Private
 */
router.get('/search',
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { q: query, limit = 20 } = req.query;

    try {
      const foods = await apiService.searchFood(query, parseInt(limit));
      
      res.json({
        success: true,
        data: foods,
        query,
        count: foods.length
      });
    } catch (error) {
      console.error('Food search error:', error);
      throw new AppError('Failed to search foods', 500);
    }
  })
);

/**
 * @route   GET /api/food/nutrition/:foodId
 * @desc    Get detailed nutrition information for a food item
 * @access  Private
 */
router.get('/nutrition/:foodId',
  [
    query('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    query('measure').optional().isString().withMessage('Measure must be a string')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { foodId } = req.params;
    const { quantity = 100, measure = 'gram' } = req.query;

    try {
      const nutrition = await apiService.getFoodNutrition(foodId, parseFloat(quantity), measure);
      
      res.json({
        success: true,
        data: nutrition,
        foodId,
        quantity: parseFloat(quantity),
        measure
      });
    } catch (error) {
      console.error('Nutrition fetch error:', error);
      throw new AppError('Failed to get nutrition information', 500);
    }
  })
);

/**
 * @route   POST /api/food/diary
 * @desc    Add food entry to diary
 * @access  Private
 */
router.post('/diary',
  [
    body('foodName').notEmpty().withMessage('Food name is required'),
    body('calories').isNumeric().withMessage('Calories must be a number'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('meal').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('protein').optional().isNumeric().withMessage('Protein must be a number'),
    body('carbs').optional().isNumeric().withMessage('Carbs must be a number'),
    body('fat').optional().isNumeric().withMessage('Fat must be a number'),
    body('fiber').optional().isNumeric().withMessage('Fiber must be a number'),
    body('sugar').optional().isNumeric().withMessage('Sugar must be a number'),
    body('sodium').optional().isNumeric().withMessage('Sodium must be a number')
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
    const foodData = {
      ...req.body,
      userId,
      createdAt: new Date().toISOString(),
      date: req.body.date || new Date().toISOString().split('T')[0]
    };

    try {
      const docRef = await db.collection('foodDiary').add(foodData);
      const newEntry = { id: docRef.id, ...foodData };

      res.status(201).json({
        success: true,
        data: newEntry,
        message: 'Food entry added successfully'
      });
    } catch (error) {
      console.error('Food diary entry error:', error);
      throw new AppError('Failed to add food entry', 500);
    }
  })
);

/**
 * @route   GET /api/food/diary
 * @desc    Get food diary entries
 * @access  Private
 */
router.get('/diary',
  [
    query('date').optional().isISO8601().withMessage('Invalid date format'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    query('meal').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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
    const { date, startDate, endDate, meal, limit = 50 } = req.query;

    try {
      let query = db.collection('foodDiary').where('userId', '==', userId);

      if (date) {
        query = query.where('date', '==', date);
      } else {
        if (startDate) {
          query = query.where('date', '>=', startDate);
        }
        if (endDate) {
          query = query.where('date', '<=', endDate);
        }
      }

      if (meal) {
        query = query.where('meal', '==', meal);
      }

      query = query.orderBy('createdAt', 'desc').limit(parseInt(limit));

      const snapshot = await query.get();
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate daily totals if date is specified
      let dailyTotals = null;
      if (date || (entries.length > 0 && entries.every(e => e.date === entries[0].date))) {
        dailyTotals = entries.reduce((totals, entry) => ({
          calories: totals.calories + (entry.calories || 0),
          protein: totals.protein + (entry.protein || 0),
          carbs: totals.carbs + (entry.carbs || 0),
          fat: totals.fat + (entry.fat || 0),
          fiber: totals.fiber + (entry.fiber || 0),
          sugar: totals.sugar + (entry.sugar || 0),
          sodium: totals.sodium + (entry.sodium || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 });
      }

      res.json({
        success: true,
        data: entries,
        count: entries.length,
        dailyTotals,
        filters: { date, startDate, endDate, meal }
      });
    } catch (error) {
      console.error('Food diary fetch error:', error);
      throw new AppError('Failed to get food diary entries', 500);
    }
  })
);

/**
 * @route   PUT /api/food/diary/:entryId
 * @desc    Update food diary entry
 * @access  Private
 */
router.put('/diary/:entryId',
  [
    body('foodName').optional().notEmpty().withMessage('Food name cannot be empty'),
    body('calories').optional().isNumeric().withMessage('Calories must be a number'),
    body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    body('meal').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
    body('protein').optional().isNumeric().withMessage('Protein must be a number'),
    body('carbs').optional().isNumeric().withMessage('Carbs must be a number'),
    body('fat').optional().isNumeric().withMessage('Fat must be a number'),
    body('fiber').optional().isNumeric().withMessage('Fiber must be a number'),
    body('sugar').optional().isNumeric().withMessage('Sugar must be a number'),
    body('sodium').optional().isNumeric().withMessage('Sodium must be a number')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { entryId } = req.params;
    const userId = req.user.uid;

    try {
      const entryRef = db.collection('foodDiary').doc(entryId);
      const entryDoc = await entryRef.get();

      if (!entryDoc.exists) {
        throw new AppError('Food entry not found', 404);
      }

      const entryData = entryDoc.data();
      if (entryData.userId !== userId) {
        throw new AppError('Unauthorized to update this entry', 403);
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

      await entryRef.update(updateData);

      const updatedDoc = await entryRef.get();
      const updatedEntry = { id: updatedDoc.id, ...updatedDoc.data() };

      res.json({
        success: true,
        data: updatedEntry,
        message: 'Food entry updated successfully'
      });
    } catch (error) {
      console.error('Food diary update error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update food entry', 500);
    }
  })
);

/**
 * @route   DELETE /api/food/diary/:entryId
 * @desc    Delete food diary entry
 * @access  Private
 */
router.delete('/diary/:entryId', asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const userId = req.user.uid;

  try {
    const entryRef = db.collection('foodDiary').doc(entryId);
    const entryDoc = await entryRef.get();

    if (!entryDoc.exists) {
      throw new AppError('Food entry not found', 404);
    }

    const entryData = entryDoc.data();
    if (entryData.userId !== userId) {
      throw new AppError('Unauthorized to delete this entry', 403);
    }

    await entryRef.delete();

    res.json({
      success: true,
      message: 'Food entry deleted successfully'
    });
  } catch (error) {
    console.error('Food diary delete error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete food entry', 500);
  }
}));

/**
 * @route   GET /api/food/analytics
 * @desc    Get nutrition analytics for user
 * @access  Private
 */
router.get('/analytics',
  [
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
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

      const query = db.collection('foodDiary')
        .where('userId', '==', userId)
        .where('date', '>=', startDateStr)
        .where('date', '<=', endDateStr)
        .orderBy('date', 'desc');

      const snapshot = await query.get();
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate analytics
      const analytics = {
        totalCalories: 0,
        avgCaloriesPerDay: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        daysTracked: 0,
        caloriesTrend: [],
        macroBreakdown: { protein: 0, carbs: 0, fat: 0 },
        mealDistribution: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
        topFoods: []
      };

      // Group entries by date
      const entriesByDate = {};
      const foodCounts = {};

      entries.forEach(entry => {
        const date = entry.date;
        if (!entriesByDate[date]) {
          entriesByDate[date] = [];
        }
        entriesByDate[date].push(entry);

        // Count food occurrences
        const foodName = entry.foodName;
        foodCounts[foodName] = (foodCounts[foodName] || 0) + 1;

        // Meal distribution
        analytics.mealDistribution[entry.meal] += entry.calories || 0;
      });

      // Calculate daily totals
      Object.keys(entriesByDate).forEach(date => {
        const dayEntries = entriesByDate[date];
        const dayTotals = dayEntries.reduce((totals, entry) => ({
          calories: totals.calories + (entry.calories || 0),
          protein: totals.protein + (entry.protein || 0),
          carbs: totals.carbs + (entry.carbs || 0),
          fat: totals.fat + (entry.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        analytics.totalCalories += dayTotals.calories;
        analytics.totalProtein += dayTotals.protein;
        analytics.totalCarbs += dayTotals.carbs;
        analytics.totalFat += dayTotals.fat;
        analytics.daysTracked++;

        analytics.caloriesTrend.push({
          date,
          calories: dayTotals.calories,
          protein: dayTotals.protein,
          carbs: dayTotals.carbs,
          fat: dayTotals.fat
        });
      });

      // Calculate averages and percentages
      if (analytics.daysTracked > 0) {
        analytics.avgCaloriesPerDay = Math.round(analytics.totalCalories / analytics.daysTracked);
        
        const totalMacros = analytics.totalProtein + analytics.totalCarbs + analytics.totalFat;
        if (totalMacros > 0) {
          analytics.macroBreakdown = {
            protein: Math.round((analytics.totalProtein / totalMacros) * 100),
            carbs: Math.round((analytics.totalCarbs / totalMacros) * 100),
            fat: Math.round((analytics.totalFat / totalMacros) * 100)
          };
        }
      }

      // Top foods
      analytics.topFoods = Object.entries(foodCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([food, count]) => ({ food, count }));

      res.json({
        success: true,
        data: analytics,
        period: { startDate: startDateStr, endDate: endDateStr, days }
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
      throw new AppError('Failed to get nutrition analytics', 500);
    }
  })
);

module.exports = router;