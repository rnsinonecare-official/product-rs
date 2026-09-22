const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { limitTextInput, limitIngredientsInput, limitImageInput } = require('../middleware/inputLimit');
const geminiService = require('../services/bedrockService');
const vertexAIService = require('../services/bedrockService');
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
      console.log('🚀 FORCING REAL GEMINI API FOR RECIPE GENERATION');
      console.log('🔑 API Key exists:', !!process.env.GEMINI_API_KEY);
      console.log('📝 Ingredients:', ingredients);
      console.log('🏥 Health conditions:', healthConditions);
      console.log('🥗 Diet type:', dietType);

      // FORCE REAL GEMINI API - NO MOCK DATA
      const recipes = await geminiService.generateRecipeFromIngredients(ingredients, healthConditions, dietType);
      
      console.log('✅ Generated recipes with real Gemini API:', recipes.length, 'recipes');
      
      // Verify we got real data
      const hasRealData = recipes && recipes.length > 0 && recipes[0].recipeName !== "Simple Healthy Recipe";
      
      res.json({
        success: true,
        data: recipes,
        count: recipes.length,
        message: hasRealData 
          ? 'Multiple recipes generated successfully with Gemini AI' 
          : 'Recipes generated with fallback data (check Gemini API)',
        source: hasRealData ? 'gemini_ai' : 'fallback',
        apiKeyConfigured: !!process.env.GEMINI_API_KEY
      });
    } catch (error) {
      console.error('❌ Multiple recipes generation error:', error);
      
      // If Gemini fails, try one more time with detailed error logging
      try {
        console.log('🔄 Gemini failed, trying again with detailed logging...');
        const fallbackRecipes = await mockFoodService.generateRecipeFromIngredients(ingredients, healthConditions, dietType);
        
        res.json({
          success: true,
          data: fallbackRecipes,
          count: fallbackRecipes.length,
          message: 'Recipes generated with fallback service (Gemini API failed)',
          source: 'fallback',
          error: error.message,
          apiKeyConfigured: !!process.env.GEMINI_API_KEY
        });
      } catch (fallbackError) {
        console.error('❌ Even fallback failed:', fallbackError);
        throw new AppError('Failed to generate recipes with both Gemini and fallback services', 500);
      }
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
      // Debug logging to see what's being passed
      console.log('� Chat requgest debug:');
      console.log('  Message:', message);
      console.log('  Context:', context);
      console.log('  Health conditions:', healthConditions);
      console.log('  Health conditions type:', typeof healthConditions);
      console.log('  Health conditions length:', Array.isArray(healthConditions) ? healthConditions.length : 'not array');
      
      // Use intelligent fallback system for chat responses
      console.log('🔄 Generating intelligent chat response...');
      const response = await generateIntelligentChatResponse(message, context, healthConditions);
      
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
      
      // Final fallback with helpful message
      const helpfulFallback = getHelpfulFallbackMessage(message, healthConditions);
      
      res.json({
        success: true,
        data: {
          response: helpfulFallback,
          timestamp: new Date().toISOString()
        },
        message: 'Chat response generated with fallback message'
      });
    }
  })
);

// Intelligent chat response generator
const generateIntelligentChatResponse = async (message, context = {}, healthConditions = []) => {
  const lowerMessage = message.toLowerCase();
  const userName = context.name || 'there';
  const userAge = context.age || null;
  const userGender = context.gender || null;
  const fitnessGoal = context.fitnessGoal || null;
  const dietType = context.dietType || 'vegetarian';
  
  // Check if the message is health-condition related
  const isHealthConditionQuery = (message) => {
    const healthKeywords = [
      'health condition', 'medical condition', 'thyroid', 'diabetes', 'pcos', 'pcod', 
      'hypertension', 'blood pressure', 'manage', 'treatment', 'medication', 
      'symptoms', 'condition', 'disease', 'disorder', 'my health'
    ];
    const lowerMessage = message.toLowerCase();
    return healthKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Personalized greeting based on context - only mention health conditions when relevant
  const getPersonalizedGreeting = () => {
    // Only show condition-specific greetings if the query is health-related AND user has health conditions
    if (Array.isArray(healthConditions) && healthConditions.length > 0 && isHealthConditionQuery(message)) {
      if (healthConditions.includes('thyroid')) {
        return `Hi ${userName}! 👋 I understand you're managing thyroid health. I'm here to help with nutrition advice that supports thyroid function. `;
      } else if (healthConditions.includes('diabetes')) {
        return `Hello ${userName}! 🌟 I see you're managing diabetes. I can provide guidance on blood sugar-friendly nutrition. `;
      } else if (healthConditions.includes('pcos') || healthConditions.includes('pcod')) {
        return `Hey ${userName}! 💪 I'm here to help with PCOS-friendly nutrition and lifestyle advice. `;
      } else if (healthConditions.includes('hypertension')) {
        return `Hi ${userName}! ❤️ I can help with heart-healthy nutrition for managing blood pressure. `;
      }
    }
    
    // Default greeting for general nutrition questions
    return `Hello ${userName}! 🌟 I'm your AI nutrition assistant. `;
  };

  // Handle specific queries
  if (lowerMessage.includes('meal_suggestions') || lowerMessage.includes('suggest healthy meals')) {
    let response = getPersonalizedGreeting() + "Here are some personalized meal suggestions for you:\n\n";
    
    if (healthConditions.includes('thyroid')) {
      response += "🦋 **Thyroid-Supporting Meals:**\n";
      response += "• **Breakfast:** Oats with walnuts and berries (rich in selenium)\n";
      response += "• **Lunch:** Quinoa bowl with spinach and grilled fish (iodine & zinc)\n";
      response += "• **Dinner:** Lentil curry with brown rice (fiber & protein)\n";
      response += "• **Snack:** Brazil nuts (selenium powerhouse)\n\n";
      response += "💡 **Thyroid Tips:**\n";
      response += "- Include selenium-rich foods (Brazil nuts, fish)\n";
      response += "- Limit processed foods and excess soy\n";
      response += "- Stay hydrated and eat regular meals";
    } else if (fitnessGoal === 'weight-gain') {
      response += "💪 **Healthy Weight Gain Meals:**\n";
      response += "• **Breakfast:** Banana smoothie with oats, nuts & milk\n";
      response += "• **Mid-morning:** Dates with almond butter\n";
      response += "• **Lunch:** Paneer curry with quinoa and ghee\n";
      response += "• **Evening:** Trail mix with dried fruits\n";
      response += "• **Dinner:** Dal with rice and vegetables\n\n";
      response += "🎯 **Weight Gain Tips:**\n";
      response += "- Eat every 2-3 hours\n";
      response += "- Include healthy fats (nuts, avocado, ghee)\n";
      response += "- Focus on nutrient-dense calories";
    } else {
      response += "🍽️ **Balanced Meal Ideas:**\n";
      response += "• **Breakfast:** Greek yogurt with berries and granola\n";
      response += "• **Lunch:** Vegetable salad with chickpeas and olive oil\n";
      response += "• **Dinner:** Grilled vegetables with quinoa\n";
      response += "• **Snacks:** Fresh fruits, nuts, or hummus with veggies\n\n";
      response += "✨ **General Tips:**\n";
      response += "- Include protein in every meal\n";
      response += "- Eat plenty of colorful vegetables\n";
      response += "- Stay hydrated throughout the day";
    }
    
    return response;
  }

  if (lowerMessage.includes('nutrition_check') || lowerMessage.includes('analyze my nutrition')) {
    let response = getPersonalizedGreeting() + "Let me help you understand your nutritional needs:\n\n";
    
    if (userAge && userGender) {
      const ageGroup = parseInt(userAge) < 30 ? 'young adult' : parseInt(userAge) < 50 ? 'adult' : 'mature adult';
      response += `📊 **Your Profile:** ${ageGroup} ${userGender.toLowerCase()}\n`;
    }
    
    response += "🎯 **Key Nutrients to Focus On:**\n";
    
    if (healthConditions.includes('thyroid')) {
      response += "• **Selenium:** 55mcg/day (Brazil nuts, fish)\n";
      response += "• **Iodine:** 150mcg/day (iodized salt, seaweed)\n";
      response += "• **Zinc:** 8-11mg/day (pumpkin seeds, chickpeas)\n";
      response += "• **Vitamin D:** Get tested and supplement if needed\n";
    } else if (userGender === 'Female') {
      response += "• **Iron:** 18mg/day (spinach, lentils, fortified cereals)\n";
      response += "• **Calcium:** 1000mg/day (dairy, leafy greens)\n";
      response += "• **Folate:** 400mcg/day (leafy greens, legumes)\n";
      response += "• **Vitamin D:** 600-800 IU/day\n";
    } else {
      response += "• **Protein:** 0.8g per kg body weight\n";
      response += "• **Fiber:** 25-35g/day (fruits, vegetables, whole grains)\n";
      response += "• **Healthy fats:** Omega-3s from fish, nuts, seeds\n";
      response += "• **Hydration:** 8-10 glasses of water daily\n";
    }
    
    response += "\n💡 **Tip:** Track your meals for a few days to identify any gaps!";
    return response;
  }

  if (lowerMessage.includes('deficiency_check') || lowerMessage.includes('nutrients am i missing')) {
    let response = getPersonalizedGreeting() + "Based on your profile, here are nutrients you might need to focus on:\n\n";
    
    response += "⚠️ **Common Deficiencies to Watch:**\n";
    
    if (healthConditions.includes('thyroid')) {
      response += "• **Selenium deficiency** - Add 2-3 Brazil nuts daily\n";
      response += "• **Vitamin D** - Get tested; supplement if low\n";
      response += "• **B12** - Important for thyroid function\n";
      response += "• **Magnesium** - Helps with energy and mood\n";
    } else if (dietType === 'vegetarian') {
      response += "• **Vitamin B12** - Consider supplements or fortified foods\n";
      response += "• **Iron** - Combine with Vitamin C for better absorption\n";
      response += "• **Omega-3** - Include walnuts, flaxseeds, chia seeds\n";
      response += "• **Zinc** - Pumpkin seeds, chickpeas, cashews\n";
    } else {
      response += "• **Fiber** - Most people need more fruits and vegetables\n";
      response += "• **Vitamin D** - Especially if limited sun exposure\n";
      response += "• **Magnesium** - Nuts, seeds, leafy greens\n";
      response += "• **Potassium** - Bananas, potatoes, spinach\n";
    }
    
    response += "\n🔬 **Recommendation:** Consider getting a comprehensive blood test to check your levels!";
    return response;
  }

  if (lowerMessage.includes('health_condition_help') || lowerMessage.includes('help with my health condition')) {
    let response = getPersonalizedGreeting();
    
    if (healthConditions.includes('thyroid')) {
      response += "Here's how nutrition can support your thyroid health:\n\n";
      response += "✅ **Foods to Include:**\n";
      response += "• Brazil nuts (selenium)\n";
      response += "• Fish and seafood (iodine)\n";
      response += "• Leafy greens (folate)\n";
      response += "• Whole grains (B vitamins)\n\n";
      response += "❌ **Foods to Limit:**\n";
      response += "• Excessive soy products\n";
      response += "• Processed foods high in sodium\n";
      response += "• Too much caffeine\n\n";
      response += "💊 **Important:** Work with your doctor on medication timing and food interactions!";
    } else if (healthConditions.length === 0) {
      response += "I'd love to help! Could you tell me more about your specific health concerns or goals? I can provide guidance on:\n\n";
      response += "• Weight management\n";
      response += "• Energy levels\n";
      response += "• Digestive health\n";
      response += "• Sports nutrition\n";
      response += "• General wellness";
    } else {
      response += `I can help with nutrition advice for ${healthConditions.join(', ')}. What specific aspect would you like to know about?`;
    }
    
    return response;
  }

  if (lowerMessage.includes('meal_planning') || lowerMessage.includes('create a meal plan')) {
    let response = getPersonalizedGreeting() + "I'd love to help you create a meal plan! Here's a sample day:\n\n";
    
    response += "🌅 **Morning (7-8 AM):**\n";
    if (healthConditions.includes('thyroid')) {
      response += "• Oatmeal with berries and walnuts\n• Green tea (wait 1 hour after thyroid medication)\n";
    } else {
      response += "• Greek yogurt with granola and fruit\n• Green tea or coffee\n";
    }
    
    response += "\n🌞 **Mid-Morning (10 AM):**\n";
    response += "• Apple with almond butter\n• Water\n";
    
    response += "\n🌤️ **Lunch (12-1 PM):**\n";
    if (dietType === 'vegetarian') {
      response += "• Quinoa bowl with chickpeas and vegetables\n• Lemon-tahini dressing\n";
    } else {
      response += "• Grilled chicken salad with mixed greens\n• Olive oil dressing\n";
    }
    
    response += "\n🌅 **Afternoon (3-4 PM):**\n";
    response += "• Handful of nuts or hummus with carrots\n";
    
    response += "\n🌙 **Dinner (6-7 PM):**\n";
    response += "• Lentil curry with brown rice\n• Steamed vegetables\n";
    
    response += "\n💧 **Throughout the day:** 8-10 glasses of water\n";
    response += "\n📝 **Note:** Adjust portions based on your hunger and energy needs!";
    
    return response;
  }

  if (lowerMessage.includes('food_recommendations') || lowerMessage.includes('food recommendations')) {
    let response = getPersonalizedGreeting() + "Here are my top food recommendations for you:\n\n";
    
    if (healthConditions.includes('thyroid')) {
      response += "🦋 **Thyroid-Supporting Foods:**\n";
      response += "• **Brazil nuts** - 2-3 daily for selenium\n";
      response += "• **Fish** - Salmon, sardines for iodine & omega-3\n";
      response += "• **Leafy greens** - Spinach, kale for folate\n";
      response += "• **Whole grains** - Quinoa, brown rice for B vitamins\n";
      response += "• **Berries** - Antioxidants for thyroid protection\n";
    } else if (fitnessGoal === 'weight-gain') {
      response += "💪 **Healthy Weight Gain Foods:**\n";
      response += "• **Nuts & nut butters** - Calorie-dense & nutritious\n";
      response += "• **Avocados** - Healthy fats & calories\n";
      response += "• **Whole grains** - Oats, quinoa, brown rice\n";
      response += "• **Dried fruits** - Dates, raisins for quick energy\n";
      response += "• **Healthy oils** - Olive oil, ghee for cooking\n";
    } else {
      response += "🌟 **Nutrient-Dense Superfoods:**\n";
      response += "• **Berries** - Antioxidants & fiber\n";
      response += "• **Leafy greens** - Vitamins & minerals\n";
      response += "• **Nuts & seeds** - Healthy fats & protein\n";
      response += "• **Legumes** - Protein & fiber\n";
      response += "• **Colorful vegetables** - Variety of nutrients\n";
    }
    
    response += "\n🎯 **Pro tip:** Aim for a rainbow of colors on your plate!";
    return response;
  }

  // General conversational responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return getPersonalizedGreeting() + "How can I help you with your nutrition and health goals today? I can assist with meal planning, nutrient analysis, or answer any health-related questions you have! 😊";
  }

  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return `You're very welcome, ${userName}! 😊 I'm always here to help you on your health journey. Feel free to ask me anything about nutrition, meal planning, or healthy living anytime!`;
  }

  // Default intelligent response
  return getPersonalizedGreeting() + "I'm here to help with your nutrition and health questions! I can assist you with:\n\n• 🍽️ Meal planning and suggestions\n• 📊 Nutritional analysis\n• 🥗 Food recommendations\n• 💪 Health condition-specific advice\n• 🎯 Fitness and wellness goals\n\nWhat would you like to know about?";
};

// Helper function to generate helpful fallback messages
const getHelpfulFallbackMessage = (message, healthConditions = []) => {
  const lowerMessage = message.toLowerCase();
  
  // Health condition specific responses
  if (healthConditions.includes('diabetes') || lowerMessage.includes('diabetes') || lowerMessage.includes('blood sugar')) {
    return "I understand you're asking about diabetes management. While I'm having technical difficulties, here are some general tips: focus on complex carbohydrates, lean proteins, and regular meal timing. Monitor your blood sugar as advised by your healthcare provider. For personalized advice, please consult your doctor or a registered dietitian. 🩺";
  }
  
  if (healthConditions.includes('pcos') || healthConditions.includes('pcod') || lowerMessage.includes('pcos') || lowerMessage.includes('pcod')) {
    return "I see you're asking about PCOS/PCOD management. Although I'm experiencing technical issues, here are some helpful tips: focus on anti-inflammatory foods, maintain regular meal times, limit processed sugars, and include protein with each meal. Consider consulting with a healthcare provider who specializes in PCOS for personalized guidance. 💪";
  }
  
  if (healthConditions.includes('hypertension') || lowerMessage.includes('blood pressure') || lowerMessage.includes('hypertension')) {
    return "For blood pressure management, I typically recommend reducing sodium intake, increasing potassium-rich foods like bananas and leafy greens, and maintaining a balanced diet. I'm having some technical difficulties right now, so please consult your healthcare provider for specific advice. ❤️";
  }
  
  // Topic-specific responses
  if (lowerMessage.includes('nutrition') || lowerMessage.includes('nutrient') || lowerMessage.includes('vitamin')) {
    return "I'd love to help with your nutrition questions! While I'm experiencing technical difficulties, I recommend focusing on a balanced diet with plenty of fruits, vegetables, whole grains, and lean proteins. For specific nutritional needs, consider consulting with a registered dietitian. 🥗";
  }
  
  if (lowerMessage.includes('weight') || lowerMessage.includes('lose') || lowerMessage.includes('gain')) {
    return "Weight management is a common concern! Although I'm having technical issues, remember that sustainable weight management involves balanced nutrition, regular physical activity, and adequate sleep. For personalized weight management plans, consider working with a healthcare provider or registered dietitian. ⚖️";
  }
  
  if (lowerMessage.includes('meal') || lowerMessage.includes('recipe') || lowerMessage.includes('food')) {
    return "I'd be happy to help with meal planning and food suggestions! While I'm experiencing technical difficulties, try focusing on whole foods, balanced macronutrients, and foods you enjoy. The food analysis feature in the app might also be helpful for tracking your nutrition. 🍽️";
  }
  
  if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('fitness')) {
    return "Exercise is great for overall health! While I'm having technical issues, remember to start gradually, choose activities you enjoy, and consult with a healthcare provider before starting any new exercise program, especially if you have health conditions. 🏃‍♀️";
  }
  
  // General fallback
  return "I apologize, but I'm experiencing some technical difficulties right now. For personalized health and nutrition advice, I recommend consulting with a registered dietitian or your healthcare provider. In the meantime, you can explore the food analysis and tracking features in the app. Thank you for your patience! 🌟";
};

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
      // Pass the calorie goal from userProfile to the Vertex AI service
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