const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { limitTextInput, limitIngredientsInput, limitImageInput } = require('../middleware/inputLimit');
const geminiService = require('../services/geminiService');
const vertexAIService = require('../services/vertexAIGenAIService');
const mockFoodService = require('../services/mockFoodService');

const router = express.Router();

// Middleware to log AI API usage and input lengths
const logAIUsage = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request details
  console.log(`🤖 Request: ${req.method} ${req.path}`);
  console.log(`📊 IP: ${req.ip}`);
  
  if (req.inputInfo) {
    console.log(`📝 Input Info:`, req.inputInfo);
  }
  
  // Override res.json to log response time and token usage
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Response Time: ${duration}ms`);
    console.log(`✅ Request completed successfully`);
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Rate limiting configurations for different AI endpoints
const generalAILimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 requests per minute per IP for general AI endpoints
  message: { 
    error: "Too many requests, please try again later.",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // More requests allowed for chat (conversational)
  message: { 
    error: "Too many chat requests, please slow down.",
    retryAfter: "1 minute"
  }
});

const imageAnalysisLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Fewer requests for image analysis (more expensive)
  message: { 
    error: "Too many image analysis requests, please try again later.",
    retryAfter: "1 minute"
  }
});

const recipeGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 8, // Moderate limit for recipe generation
  message: { 
    error: "Too many recipe generation requests, please try again later.",
    retryAfter: "1 minute"
  }
});

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed', 400), false);
    }
  }
});

/**
 * @route   POST /api/ai/analyze-food-image
 * @desc    Analyze food image using Gemini AI
 * @access  Private
 */
router.post('/analyze-food-image',
  imageAnalysisLimiter,
  upload.single('image'),
  limitImageInput(5), // 5MB max image size
  logAIUsage,
  [
    //body('healthConditions').optional().isArray().withMessage('Health conditions must be an array')
    body('healthConditions').optional().custom((value) => {
  // Accept both array and JSON string that can be parsed to array
  if (Array.isArray(value)) return true;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed);
    } catch (e) {
      return false;
    }
  }
  return false;

  
}).withMessage('Health conditions must be an array or a JSON string representing an array')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    if (!req.file) {
      throw new AppError('Image file is required', 400);
    }

    // Parse healthConditions from FormData (comes as JSON string)
    let healthConditions = [];
    try {
      healthConditions = req.body.healthConditions ? JSON.parse(req.body.healthConditions) : [];
    } catch (e) {
      healthConditions = [];
    }

    try {
      // Convert buffer to file-like object for Gemini
      const imageFile = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        size: req.file.size
      };

      // Try Google GenAI with Vertex AI first
      console.log('🔄 Using Google GenAI with Vertex AI...');
      const analysis = await vertexAIService.analyzeFoodImage(imageFile, healthConditions);
      
      // Check if we got real data or fallback data
      if (analysis.calories !== "Unable to analyze") {
        console.log('✅ Google GenAI Vertex AI analysis successful');
        res.json({
          success: true,
          data: analysis,
          message: 'Food image analyzed successfully with Google GenAI Vertex AI'
        });
      } else {
        // Fallback to mock service if AI returned fallback data
        console.log('🔄 AI returned fallback data, using mock service...');
        const mockFoodService = require('../services/mockFoodService');
        const mockAnalysis = await mockFoodService.analyzeFoodImage(imageFile, healthConditions);
        
        res.json({
          success: true,
          data: mockAnalysis,
          message: 'Food image analyzed successfully with mock service (AI fallback)'
        });
      }
    } catch (error) {
      console.error('Food image analysis error:', error);
      
      // Final fallback to mock service
      try {
        console.log('🔄 Error occurred, using mock service as final fallback...');
        const mockFoodService = require('../services/mockFoodService');
        const mockAnalysis = await mockFoodService.analyzeFoodImage(req.file, healthConditions);
        
        res.json({
          success: true,
          data: mockAnalysis,
          message: 'Food image analyzed successfully with mock service (error fallback)'
        });
      } catch (mockError) {
        console.error('Mock service also failed:', mockError);
        throw new AppError('Failed to analyze food image', 500);
      }
    }
  })
);

/**
 * @route   POST /api/ai/analyze-food-name
 * @desc    Analyze food by name using Gemini AI
 * @access  Private
 */
router.post('/analyze-food-name',
  generalAILimiter,
  limitTextInput(100), // 100 chars max for food name
  [
    body('foodName').notEmpty().withMessage('Food name is required'),
    body('healthConditions').optional().isArray().withMessage('Health conditions must be an array')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { foodName, healthConditions = [] } = req.body;

    try {
      // Try Google GenAI with Vertex AI first
      console.log('🔄 Using Google GenAI with Vertex AI for food name analysis...');
      const analysis = await vertexAIService.analyzeFoodByName(foodName, healthConditions);
      
      // Check if we got real data or fallback data
      if (analysis.calories !== "Unable to analyze") {
        console.log('✅ Google GenAI Vertex AI food name analysis successful');
        res.json({
          success: true,
          data: analysis,
          message: 'Food analyzed successfully with Google GenAI Vertex AI'
        });
      } else {
        // Fallback to mock service if AI returned fallback data
        console.log('🔄 AI returned fallback data, using mock service...');
        const mockFoodService = require('../services/mockFoodService');
        const mockAnalysis = await mockFoodService.analyzeFoodByName(foodName, healthConditions);
        
        res.json({
          success: true,
          data: mockAnalysis,
          message: 'Food analyzed successfully with mock service (AI fallback)'
        });
      }
    } catch (error) {
      console.error('Food name analysis error:', error);
      
      // Final fallback to mock service
      try {
        console.log('🔄 Error occurred, using mock service as final fallback...');
        const mockFoodService = require('../services/mockFoodService');
        const mockAnalysis = await mockFoodService.analyzeFoodByName(foodName, healthConditions);
        
        res.json({
          success: true,
          data: mockAnalysis,
          message: 'Food analyzed successfully with mock service (error fallback)'
        });
      } catch (mockError) {
        console.error('Mock service also failed:', mockError);
        throw new AppError('Failed to analyze food', 500);
      }
    }
  })
);

/**
 * @route   POST /api/ai/generate-recipe
 * @desc    Generate healthy recipe using Gemini AI
 * @access  Private
 */
router.post('/generate-recipe',
  recipeGenerationLimiter,
  limitIngredientsInput(300), // 300 chars max for combined ingredients
  [
    body('ingredients').isArray().withMessage('Ingredients must be an array'),
    body('ingredients').custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('At least one ingredient is required');
      }
      return true;
    }),
    body('healthConditions').optional().isArray().withMessage('Health conditions must be an array'),
    body('dietaryPreferences').optional().isObject().withMessage('Dietary preferences must be an object')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { ingredients, healthConditions = [], dietaryPreferences = {} } = req.body;

    try {
      // Use Google GenAI with Vertex AI for recipe generation
      const recipe = await vertexAIService.generateHealthyRecipe(ingredients, healthConditions, dietaryPreferences);

      res.json({
        success: true,
        data: recipe,
        message: 'Recipe generated successfully'
      });
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw new AppError('Failed to generate recipe', 500);
    }
  })
);

/**
 * @route   POST /api/ai/generate-multiple-recipes
 * @desc    Generate multiple recipes from ingredients
 * @access  Private
 */
router.post('/generate-multiple-recipes',
  recipeGenerationLimiter,
  limitTextInput(200), // 200 chars max for ingredients string
  [
    body('ingredients').notEmpty().withMessage('Ingredients are required'),
    body('healthConditions').optional().isArray().withMessage('Health conditions must be an array'),
    body('dietType').optional().isIn(['vegetarian', 'non-vegetarian', 'vegan', 'keto', 'paleo']).withMessage('Invalid diet type')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { ingredients, healthConditions = [], dietType = 'vegetarian' } = req.body;

    try {
      // Use mock service temporarily (switch to geminiService when API key is configured)
      const recipes = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-from-ai-studio' 
        ? await geminiService.generateRecipeFromIngredients(ingredients, healthConditions, dietType)
        : await mockFoodService.generateRecipeFromIngredients(ingredients, healthConditions, dietType);

      res.json({
        success: true,
        data: recipes,
        count: recipes.length,
        message: 'Multiple recipes generated successfully'
      });
    } catch (error) {
      console.error('Multiple recipes generation error:', error);
      throw new AppError('Failed to generate recipes', 500);
    }
  })
);

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI nutritionist
 * @access  Private
 */
router.post('/chat',
  chatLimiter,
  limitTextInput(500), // 500 chars max for chat messages
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('context').optional().isObject().withMessage('Context must be an object'),
    body('healthConditions').optional().isArray().withMessage('Health conditions must be an array')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { message, context = {}, healthConditions = [] } = req.body;

    try {
      // Use Google GenAI with Vertex AI for chat responses
      console.log('🔄 Using Google GenAI with Vertex AI for chat...');
      const response = await vertexAIService.chatWithNutritionist(
        message,
        context,
        healthConditions
      );
      console.log('✅ Google GenAI Vertex AI chat response successful');

      res.json({
        success: true,
        data: {
          response,
          timestamp: new Date().toISOString()
        },
        message: 'Chat response generated successfully'
      });
    } catch (error) {
      console.error('Chat error:', error);
      throw new AppError('Failed to generate chat response', 500);
    }
  })
);

/**
 * @route   POST /api/ai/meal-plan
 * @desc    Generate personalized meal plan
 * @access  Private
 */
router.post('/meal-plan',
  recipeGenerationLimiter,
  [
    body('days').isInt({ min: 1, max: 30 }).withMessage('Days must be between 1 and 30'),
    body('calorieGoal').optional().isNumeric().withMessage('Calorie goal must be a number'),
    body('healthConditions').optional().isArray().withMessage('Health conditions must be an array'),
    body('dietaryPreferences').optional().isObject().withMessage('Dietary preferences must be an object'),
    body('allergies').optional().isArray().withMessage('Allergies must be an array')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const {
      days,
      calorieGoal,
      healthConditions = [],
      dietaryPreferences = {},
      allergies = []
    } = req.body;

    try {
      const mealPlan = await geminiService.generateMealPlan({
        days,
        calorieGoal,
        healthConditions,
        dietaryPreferences,
        allergies
      });

      res.json({
        success: true,
        data: mealPlan,
        message: 'Meal plan generated successfully'
      });
    } catch (error) {
      console.error('Meal plan generation error:', error);
      throw new AppError('Failed to generate meal plan', 500);
    }
  })
);

/**
 * @route   POST /api/ai/nutrition-advice
 * @desc    Get personalized nutrition advice
 * @access  Private
 */
router.post('/nutrition-advice',
  generalAILimiter,
  limitTextInput(400), // 400 chars max for nutrition queries
  [
    body('query').notEmpty().withMessage('Query is required'),
    body('userProfile').optional().isObject().withMessage('User profile must be an object'),
    body('healthConditions').optional().isArray().withMessage('Health conditions must be an array')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { query, userProfile = {}, healthConditions = [] } = req.body;

    try {
      const advice = await geminiService.getNutritionAdvice(
        query,
        userProfile,
        healthConditions
      );

      res.json({
        success: true,
        data: advice,
        message: 'Nutrition advice generated successfully'
      });
    } catch (error) {
      console.error('Nutrition advice error:', error);
      throw new AppError('Failed to generate nutrition advice', 500);
    }
  })
);

/**
 * @route   POST /api/ai/health-recommendations
 * @desc    Get personalized health recommendations
 * @access  Private
 */
router.post('/health-recommendations',
  generalAILimiter,
  [
    body('userProfile').optional().isObject().withMessage('User profile must be an object'),
    body('healthConditions').optional().isArray().withMessage('Health conditions must be an array')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { userProfile = {}, healthConditions = [] } = req.body;

    try {
      const recommendations = await geminiService.getNutritionAdvice(
        'Provide general health recommendations based on my profile',
        userProfile,
        healthConditions
      );

      res.json({
        success: true,
        data: recommendations,
        message: 'Health recommendations generated successfully'
      });
    } catch (error) {
      console.error('Health recommendations error:', error);
      throw new AppError('Failed to generate health recommendations', 500);
    }
  })
);

/**
 * @route   POST /api/ai/generate-diet-plan
 * @desc    Generate daily diet plan based on user preferences and meal history
 * @access  Private
 */
router.post('/generate-diet-plan',
  recipeGenerationLimiter,
  [
    body('userProfile').optional().isObject().withMessage('User profile must be an object'),
    body('mealHistory').optional().isArray().withMessage('Meal history must be an array'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { userProfile = {}, mealHistory = [], preferences = {} } = req.body;

    try {
      // Use Google GenAI with Vertex AI for diet plan generation
      console.log('🔄 Using Google GenAI with Vertex AI for diet plan generation...');
      const dietPlan = await vertexAIService.generateDailyDietPlan(userProfile, mealHistory, preferences);
      console.log('✅ Google GenAI Vertex AI diet plan generation successful');

      res.json({
        success: true,
        data: dietPlan,
        message: 'Daily diet plan generated successfully with Google GenAI Vertex AI'
      });
    } catch (error) {
      console.error('Diet plan generation error:', error);
      throw new AppError('Failed to generate diet plan', 500);
    }
  })
);

/**
 * @route   POST /api/ai/generate-content
 * @desc    Generate content using Gemini AI
 * @access  Private
 */
router.post('/generate-content',
  generalAILimiter,
  limitTextInput(1000), // 1000 chars max for prompt
  [
    body('prompt').notEmpty().withMessage('Prompt is required'),
    body('model').optional().isString().withMessage('Model must be a string'),
    body('structured').optional().isBoolean().withMessage('Structured must be a boolean'),
    body('params').optional().isObject().withMessage('Params must be an object')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { prompt, model = 'gemini-1.5-flash', structured = false, params = {} } = req.body;

    try {
      let result;
      
      if (structured) {
        // Use the structured content generation
        result = await geminiService.generateStructuredContent(prompt, params);
      } else {
        // Use the simple content generation
        result = await geminiService.generateContent(prompt, model);
      }

      res.json({
        success: true,
        data: {
          text: result,
          model: model,
          timestamp: new Date().toISOString()
        },
        message: 'Content generated successfully'
      });
    } catch (error) {
      console.error('Content generation error:', error);
      throw new AppError('Failed to generate content', 500);
    }
  })
);

module.exports = router;