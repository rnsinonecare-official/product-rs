const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const tempDailyIntakeService = require('../services/tempDailyIntakeService');
const imageCompressionService = require('../utils/imageCompression');

const router = express.Router();

/**
 * @route   POST /api/temp-intake/add
 * @desc    Add food entry to temporary daily intake
 * @access  Private
 */
router.post('/add',
  [
    body('name').notEmpty().withMessage('Food name is required'),
    body('calories').isNumeric().withMessage('Calories must be a number'),
    body('protein').optional().isNumeric().withMessage('Protein must be a number'),
    body('carbs').optional().isNumeric().withMessage('Carbs must be a number'),
    body('fat').optional().isNumeric().withMessage('Fat must be a number'),
    body('serving_size').optional().isString().withMessage('Serving size must be a string'),
    body('image').optional().isString().withMessage('Image must be a base64 string'),
    body('analysis_type').optional().isString().withMessage('Analysis type must be a string'),
    body('health_score').optional().isNumeric().withMessage('Health score must be a number'),
    body('recommendations').optional().isString().withMessage('Recommendations must be a string')
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
    let foodData = { ...req.body };

    try {
      // Compress image if provided
      if (foodData.image) {
        console.log('Compressing food image...');
        const compressionResult = await imageCompressionService.compressForFoodStorage(foodData.image);
        
        foodData.image = compressionResult.compressedImage;
        foodData.imageMetadata = {
          originalSize: compressionResult.originalSize,
          compressedSize: compressionResult.compressedSize,
          compressionRatio: compressionResult.compressionRatio,
          compressed: compressionResult.metadata.compressed
        };
        
        console.log(`Image compressed: ${compressionResult.compressionRatio}% reduction`);
      }

      // Add to temporary storage
      const newEntry = await tempDailyIntakeService.addFoodEntry(userId, foodData);

      res.status(201).json({
        success: true,
        data: newEntry,
        message: 'Food entry added to daily intake successfully'
      });
    } catch (error) {
      console.error('Error adding food to temp intake:', error);
      throw new AppError('Failed to add food entry to daily intake', 500);
    }
  })
);

/**
 * @route   GET /api/temp-intake/today
 * @desc    Get today's temporary daily intake
 * @access  Private
 */
router.get('/today', asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  try {
    const dailyIntake = await tempDailyIntakeService.getDailyIntake(userId);

    res.json({
      success: true,
      data: dailyIntake,
      message: 'Daily intake retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting daily intake:', error);
    throw new AppError('Failed to get daily intake', 500);
  }
}));

/**
 * @route   DELETE /api/temp-intake/:entryId
 * @desc    Remove food entry from temporary daily intake
 * @access  Private
 */
router.delete('/:entryId', asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const userId = req.user.uid;

  try {
    await tempDailyIntakeService.removeFoodEntry(userId, entryId);

    res.json({
      success: true,
      message: 'Food entry removed from daily intake successfully'
    });
  } catch (error) {
    console.error('Error removing food from temp intake:', error);
    if (error.message === 'Entry not found') {
      throw new AppError('Food entry not found', 404);
    }
    throw new AppError('Failed to remove food entry from daily intake', 500);
  }
}));

/**
 * @route   GET /api/temp-intake/archive/:date
 * @desc    Get archived daily intake for specific date
 * @access  Private
 */
router.get('/archive/:date', asyncHandler(async (req, res) => {
  const { date } = req.params;
  const userId = req.user.uid;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
  }

  try {
    const archivedData = await tempDailyIntakeService.getArchivedData(date);
    
    if (!archivedData) {
      return res.status(404).json({
        success: false,
        message: 'No archived data found for this date'
      });
    }

    // Filter entries for specific user
    const userEntries = archivedData.entries.filter(entry => entry.userId === userId);
    
    // Calculate user-specific totals
    const userTotals = userEntries.reduce((totals, entry) => ({
      calories: totals.calories + (entry.calories || 0),
      protein: totals.protein + (entry.protein || 0),
      carbs: totals.carbs + (entry.carbs || 0),
      fat: totals.fat + (entry.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    res.json({
      success: true,
      data: {
        date: archivedData.date,
        entries: userEntries,
        totals: userTotals,
        archivedAt: archivedData.archivedAt
      },
      message: 'Archived daily intake retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting archived intake:', error);
    throw new AppError('Failed to get archived daily intake', 500);
  }
}));

/**
 * @route   GET /api/temp-intake/archive-dates
 * @desc    Get available archive dates
 * @access  Private
 */
router.get('/archive-dates', asyncHandler(async (req, res) => {
  try {
    const availableDates = await tempDailyIntakeService.getAvailableArchiveDates();

    res.json({
      success: true,
      data: availableDates,
      count: availableDates.length,
      message: 'Available archive dates retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting archive dates:', error);
    throw new AppError('Failed to get archive dates', 500);
  }
}));

/**
 * @route   POST /api/temp-intake/compress-image
 * @desc    Compress image for storage
 * @access  Private
 */
router.post('/compress-image',
  [
    body('image').notEmpty().withMessage('Image data is required'),
    body('options').optional().isObject().withMessage('Options must be an object')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { image, options = {} } = req.body;

    try {
      const compressionResult = await imageCompressionService.compressForFoodStorage(image);

      res.json({
        success: true,
        data: compressionResult,
        message: 'Image compressed successfully'
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new AppError('Failed to compress image', 500);
    }
  })
);

/**
 * @route   POST /api/temp-intake/reset
 * @desc    Manually trigger daily reset (admin/testing)
 * @access  Private
 */
router.post('/reset', asyncHandler(async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await tempDailyIntakeService.performDailyReset(today);

    res.json({
      success: true,
      message: 'Daily intake reset completed successfully'
    });
  } catch (error) {
    console.error('Error resetting daily intake:', error);
    throw new AppError('Failed to reset daily intake', 500);
  }
}));

/**
 * @route   POST /api/temp-intake/cleanup
 * @desc    Cleanup old archived data (admin/maintenance)
 * @access  Private
 */
router.post('/cleanup', asyncHandler(async (req, res) => {
  try {
    await tempDailyIntakeService.cleanupOldArchives();

    res.json({
      success: true,
      message: 'Archive cleanup completed successfully'
    });
  } catch (error) {
    console.error('Error cleaning up archives:', error);
    throw new AppError('Failed to cleanup archives', 500);
  }
}));

module.exports = router;