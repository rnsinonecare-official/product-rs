const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini AI with different model configurations
let genAI;
let models = {};

try {
  if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    
    // Default model for general use (food analysis, nutrition advice)
    models.default = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 800,     // Moderate output for general use
        temperature: 0.7,         // Balanced creativity vs consistency
        topP: 0.8,               // Nucleus sampling for better quality
        topK: 40,                // Top-k sampling for diversity
        candidateCount: 1        // Single response to save tokens
      }
    });
    
    // Chat model for conversational responses
    models.chat = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 500,     // Shorter responses for chat
        temperature: 0.8,         // More creative for conversation
        topP: 0.9,
        topK: 40,
        candidateCount: 1
      }
    });
    
    // Recipe model for detailed recipe generation
    models.recipe = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 1200,    // Longer output for detailed recipes
        temperature: 0.6,         // More consistent for structured data
        topP: 0.8,
        topK: 40,
        candidateCount: 1
      }
    });
    
    // Analysis model for food image/name analysis
    models.analysis = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 600,     // Moderate output for analysis
        temperature: 0.5,         // More factual and consistent
        topP: 0.7,
        topK: 30,
        candidateCount: 1
      }
    });
    
    // Set default model for backward compatibility
    model = models.default;
    
    console.log('✅ Gemini AI initialized successfully with multiple model configurations');
    console.log('📊 Models configured: default(800), chat(500), recipe(1200), analysis(600) tokens');
  } else {
    console.warn('⚠️ Gemini API key not found. AI features will use fallback responses.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error);
}

// Convert buffer to generative part
const bufferToGenerativePart = (buffer, mimeType) => {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: mimeType
    }
  };
};

// Analyze food image with health conditions consideration
const analyzeFoodImage = async (imageFile, userHealthConditions = []) => {
  try {
    if (!models.analysis) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    // Convert image buffer to format Gemini can process
    const imagePart = bufferToGenerativePart(imageFile.buffer, imageFile.mimetype);

    // Create health-aware prompt
    const healthConditionsText = userHealthConditions.length > 0 
      ? `User has these health conditions: ${userHealthConditions.join(', ')}. ` 
      : '';

    const prompt = `
    Analyze this food image and provide a comprehensive nutritional analysis. ${healthConditionsText}

    Please provide the response in the following JSON format:
    {
      "foodName": "Name of the food item",
      "calories": "Estimated calories per serving",
      "nutritionFacts": {
        "protein": "grams",
        "carbs": "grams", 
        "fat": "grams",
        "fiber": "grams",
        "sugar": "grams",
        "sodium": "mg"
      },
      "servingSize": "Description of serving size",
      "healthScore": "1-10 rating",
      "isHealthy": true/false,
      "recommendation": "Overall recommendation",
      "healthWarnings": ["Array of warnings based on health conditions"],
      "healthBenefits": ["Array of benefits"],
      "suitableFor": ["Which health conditions this food is good for"],
      "avoidIf": ["Which health conditions should avoid this food"],
      "alternatives": ["Healthier alternatives if applicable"],
      "preparation": "How this food appears to be prepared",
      "ingredients": ["Likely ingredients visible"]
    }

    Important considerations:
    - For DIABETES: Focus on carbs, sugar content, glycemic index
    - For HYPERTENSION: Focus on sodium content
    - For PCOS/PCOD: Consider anti-inflammatory properties, sugar content
    - For THYROID: Consider iodine content, goitrogenic foods
    - For WEIGHT MANAGEMENT: Consider calorie density, satiety

    Be very specific about health recommendations based on the user's conditions.
    `;

    const result = await models.analysis.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format from Gemini AI');
    }

  } catch (error) {
    console.error('Error analyzing food image:', error);
    
    // Fallback response
    return {
      foodName: "Food Item",
      calories: "Unable to analyze",
      nutritionFacts: {
        protein: "0g",
        carbs: "0g",
        fat: "0g",
        fiber: "0g",
        sugar: "0g",
        sodium: "0mg"
      },
      servingSize: "1 serving",
      healthScore: 5,
      isHealthy: true,
      recommendation: "Unable to analyze image. Please try uploading a clearer photo.",
      healthWarnings: ["Image analysis failed"],
      healthBenefits: [],
      suitableFor: [],
      avoidIf: [],
      alternatives: [],
      preparation: "Unknown",
      ingredients: []
    };
  }
};

// Generate recipe based on ingredients and health conditions
const generateHealthyRecipe = async (ingredients, userHealthConditions = [], dietaryPreferences = {}) => {
  try {
    if (!models.recipe) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    const healthConditionsText = userHealthConditions.length > 0 
      ? `User has these health conditions: ${userHealthConditions.join(', ')}. ` 
      : '';

    const dietaryText = Object.entries(dietaryPreferences)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(', ');

    const prompt = `
    Create a healthy recipe using these ingredients: ${ingredients.join(', ')}.
    
    ${healthConditionsText}
    ${dietaryText ? `Dietary preferences: ${dietaryText}. ` : ''}

    Please provide the response in JSON format:
    {
      "recipeName": "Name of the recipe",
      "cookingTime": "X minutes",
      "difficulty": "Easy/Medium/Hard",
      "servings": "Number of servings",
      "calories": "Calories per serving",
      "healthScore": "1-10 rating",
      "ingredients": [
        {
          "item": "ingredient name",
          "amount": "quantity",
          "notes": "preparation notes if any"
        }
      ],
      "instructions": [
        "Step 1",
        "Step 2"
      ],
      "nutritionFacts": {
        "protein": "grams",
        "carbs": "grams",
        "fat": "grams",
        "fiber": "grams",
        "sugar": "grams",
        "sodium": "mg"
      },
      "healthBenefits": ["Array of health benefits"],
      "suitableFor": ["Which health conditions this recipe helps"],
      "modifications": {
        "diabetes": "Modifications for diabetic users",
        "hypertension": "Modifications for high blood pressure",
        "pcos": "Modifications for PCOS/PCOD"
      },
      "tips": ["Cooking tips and alternatives"]
    }

    Make sure the recipe is:
    - Appropriate for the user's health conditions
    - Uses the provided ingredients as main components
    - Includes healthy cooking methods
    - Provides specific health benefits
    `;

    const result = await models.recipe.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format from Gemini AI');
    }

  } catch (error) {
    console.error('Error generating recipe:', error);
    
    // Fallback response
    return {
      recipeName: "Simple Healthy Recipe",
      cookingTime: "30 minutes",
      difficulty: "Easy",
      servings: "2-3",
      calories: "200-300 per serving",
      healthScore: 7,
      ingredients: ingredients.map(ing => ({
        item: ing,
        amount: "As needed",
        notes: "Fresh preferred"
      })),
      instructions: [
        "Prepare all ingredients",
        "Cook according to your preference",
        "Season with healthy spices",
        "Serve immediately"
      ],
      nutritionFacts: {
        protein: "15g",
        carbs: "20g",
        fat: "8g",
        fiber: "5g",
        sugar: "3g",
        sodium: "200mg"
      },
      healthBenefits: ["Provides essential nutrients"],
      suitableFor: ["General health"],
      modifications: {
        diabetes: "Reduce carbs, add more fiber",
        hypertension: "Reduce sodium, add potassium-rich foods",
        pcos: "Add anti-inflammatory spices"
      },
      tips: ["Recipe generation failed, showing basic template"]
    };
  }
};

// Generate multiple recipes from ingredients
const generateRecipeFromIngredients = async (ingredients, healthConditions = [], dietType = 'vegetarian') => {
  try {
    if (!models.recipe) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    const healthConditionsText = healthConditions.length > 0 
      ? `User has these health conditions: ${healthConditions.join(', ')}. ` 
      : '';

    const prompt = `
      Generate 3 healthy recipes using these ingredients: ${ingredients}
      
      User preferences:
      - Diet type: ${dietType}
      - ${healthConditionsText}
      
      For each recipe, provide:
      1. Recipe name
      2. Cooking time
      3. Difficulty level
      4. Servings
      5. Calories per serving
      6. Health score (1-10)
      7. Ingredients with amounts
      8. Step-by-step instructions
      9. Nutritional facts (protein, carbs, fat, fiber, sugar, sodium)
      10. Health benefits
      11. Suitable for (health conditions)
      12. Modifications for specific conditions
      13. Cooking tips
      
      Return as JSON array with this structure:
      [
        {
          "recipeName": "Recipe Name",
          "cookingTime": "30 minutes",
          "difficulty": "Easy/Medium/Hard",
          "servings": "2-3",
          "calories": "200-300 per serving",
          "healthScore": 8,
          "ingredients": [
            {
              "item": "Ingredient name",
              "amount": "1 cup",
              "notes": "Optional prep notes"
            }
          ],
          "instructions": [
            "Step 1",
            "Step 2"
          ],
          "nutritionFacts": {
            "protein": "15g",
            "carbs": "20g",
            "fat": "8g",
            "fiber": "5g",
            "sugar": "3g",
            "sodium": "200mg"
          },
          "healthBenefits": ["Benefit 1", "Benefit 2"],
          "suitableFor": ["General health", "Weight loss"],
          "modifications": {
            "diabetes": "Reduce carbs, add more fiber",
            "hypertension": "Reduce sodium, add potassium-rich foods",
            "pcos": "Add anti-inflammatory spices"
          },
          "tips": ["Tip 1", "Tip 2"]
        }
      ]
    `;

    const result = await models.recipe.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format from Gemini AI');
    }

  } catch (error) {
    console.error('Error generating recipes:', error);
    
    // Fallback response
    return [
      {
        recipeName: "Simple Healthy Recipe",
        cookingTime: "30 minutes",
        difficulty: "Easy",
        servings: "2-3",
        calories: "200-300 per serving",
        healthScore: 7,
        ingredients: [
          {
            item: ingredients,
            amount: "As needed",
            notes: "Fresh preferred"
          }
        ],
        instructions: [
          "Prepare all ingredients",
          "Cook according to your preference",
          "Season with healthy spices",
          "Serve immediately"
        ],
        nutritionFacts: {
          protein: "15g",
          carbs: "20g",
          fat: "8g",
          fiber: "5g",
          sugar: "3g",
          sodium: "200mg"
        },
        healthBenefits: ["Provides essential nutrients"],
        suitableFor: ["General health"],
        modifications: {
          diabetes: "Reduce carbs, add more fiber",
          hypertension: "Reduce sodium, add potassium-rich foods",
          pcos: "Add anti-inflammatory spices"
        },
        tips: ["Recipe generation failed, showing basic template"]
      }
    ];
  }
};

// Analyze food by name (text-based analysis)
const analyzeFoodByName = async (foodName, userHealthConditions = []) => {
  try {
    if (!models.analysis) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    const healthConditionsText = userHealthConditions.length > 0 
      ? `User has these health conditions: ${userHealthConditions.join(', ')}. ` 
      : '';

    const prompt = `
    Provide a comprehensive nutritional analysis for "${foodName}". ${healthConditionsText}

    Please provide the response in JSON format:
    {
      "foodName": "${foodName}",
      "calories": "Calories per 100g or standard serving",
      "nutritionFacts": {
        "protein": "grams",
        "carbs": "grams",
        "fat": "grams",
        "fiber": "grams",
        "sugar": "grams",
        "sodium": "mg"
      },
      "servingSize": "Standard serving size",
      "healthScore": "1-10 rating",
      "isHealthy": true/false,
      "recommendation": "Recommendation based on health conditions",
      "healthWarnings": ["Warnings for user's health conditions"],
      "healthBenefits": ["Health benefits"],
      "suitableFor": ["Which health conditions this food is good for"],
      "avoidIf": ["Which health conditions should avoid this food"],
      "alternatives": ["Healthier alternatives"],
      "bestTimeToEat": "When to consume this food",
      "portionControl": "Recommended portion sizes"
    }

    Consider the user's health conditions and provide specific advice.
    `;

    const result = await models.analysis.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format from Gemini AI');
    }

  } catch (error) {
    console.error('Error analyzing food by name:', error);
    
    // Fallback response
    return {
      foodName: foodName,
      calories: "Unable to analyze",
      nutritionFacts: {
        protein: "0g",
        carbs: "0g",
        fat: "0g",
        fiber: "0g",
        sugar: "0g",
        sodium: "0mg"
      },
      servingSize: "1 serving",
      healthScore: 5,
      isHealthy: true,
      recommendation: "Unable to analyze food. Please try again.",
      healthWarnings: ["Analysis failed"],
      healthBenefits: [],
      suitableFor: [],
      avoidIf: [],
      alternatives: [],
      bestTimeToEat: "Anytime",
      portionControl: "Moderate portions"
    };
  }
};

// Chat with AI nutritionist
const chatWithNutritionist = async (message, context = {}, healthConditions = []) => {
  try {
    if (!models.chat) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    console.log('💬 Using CHATBOT API (separate from food analysis)');
    console.log('🔑 Chatbot API Key ending in: ...', API_KEY ? API_KEY.slice(-8) : 'NOT_SET');

    const healthConditionsText = healthConditions.length > 0 
      ? `User has these health conditions: ${healthConditions.join(', ')}. ` 
      : '';

    const contextText = Object.keys(context).length > 0 
      ? `Context: ${JSON.stringify(context)}. ` 
      : '';

    const prompt = `
    You are a professional nutritionist and health advisor. ${healthConditionsText}${contextText}
    
    User message: "${message}"
    
    Please provide a helpful, accurate, and personalized response. Consider:
    - The user's health conditions
    - Nutritional science and evidence-based advice
    - Practical and actionable recommendations
    - Safety considerations
    
    Keep your response conversational but professional. If the question is outside your expertise or requires medical attention, advise the user to consult with a healthcare professional.
    `;

    const result = await models.chat.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;

  } catch (error) {
    console.error('Error in chat with nutritionist:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later or consult with a healthcare professional for personalized advice.";
  }
};

// Generate meal plan
const generateMealPlan = async (options) => {
  try {
    if (!models.recipe) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    const {
      days,
      calorieGoal,
      healthConditions = [],
      dietaryPreferences = {},
      allergies = []
    } = options;

    const healthConditionsText = healthConditions.length > 0 
      ? `Health conditions: ${healthConditions.join(', ')}. ` 
      : '';

    const allergiesText = allergies.length > 0 
      ? `Allergies: ${allergies.join(', ')}. ` 
      : '';

    const dietaryText = Object.entries(dietaryPreferences)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(', ');

    const prompt = `
    Create a ${days}-day meal plan with the following requirements:
    - ${calorieGoal ? `Daily calorie target: ${calorieGoal} calories` : 'Balanced calorie distribution'}
    - ${healthConditionsText}
    - ${allergiesText}
    - ${dietaryText ? `Dietary preferences: ${dietaryText}` : ''}
    
    Provide the response in JSON format:
    {
      "mealPlan": [
        {
          "day": 1,
          "date": "YYYY-MM-DD",
          "meals": {
            "breakfast": {
              "name": "Meal name",
              "calories": 300,
              "ingredients": ["ingredient1", "ingredient2"],
              "instructions": "Brief cooking instructions",
              "nutritionFacts": {
                "protein": "15g",
                "carbs": "30g",
                "fat": "10g"
              }
            },
            "lunch": { /* same structure */ },
            "dinner": { /* same structure */ },
            "snacks": [
              {
                "name": "Snack name",
                "calories": 100,
                "ingredients": ["ingredient1"]
              }
            ]
          },
          "dailyTotals": {
            "calories": 1800,
            "protein": "120g",
            "carbs": "200g",
            "fat": "60g"
          }
        }
      ],
      "summary": {
        "totalDays": ${days},
        "avgDailyCalories": 1800,
        "healthFocus": ["Focus areas based on health conditions"],
        "shoppingList": ["Consolidated ingredient list"],
        "tips": ["Meal prep and health tips"]
      }
    }
    
    Make sure the meal plan is:
    - Nutritionally balanced
    - Appropriate for health conditions
    - Practical and achievable
    - Varied and interesting
    `;

    const result = await models.recipe.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format from Gemini AI');
    }

  } catch (error) {
    console.error('Error generating meal plan:', error);
    
    // Fallback response
    return {
      mealPlan: [],
      summary: {
        totalDays: days,
        avgDailyCalories: calorieGoal || 1800,
        healthFocus: ["General health"],
        shoppingList: ["Unable to generate shopping list"],
        tips: ["Meal plan generation failed. Please try again."]
      }
    };
  }
};

// Get nutrition advice
const getNutritionAdvice = async (query, userProfile = {}, healthConditions = []) => {
  try {
    if (!models.default) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    const healthConditionsText = healthConditions.length > 0 
      ? `Health conditions: ${healthConditions.join(', ')}. ` 
      : '';

    const profileText = Object.keys(userProfile).length > 0 
      ? `User profile: ${JSON.stringify(userProfile)}. ` 
      : '';

    const prompt = `
    As a professional nutritionist, provide advice for this query: "${query}"
    
    ${healthConditionsText}${profileText}
    
    Please provide comprehensive advice in JSON format:
    {
      "advice": "Main advice and recommendations",
      "keyPoints": ["Important points to remember"],
      "dosList": ["Things to do"],
      "dontsList": ["Things to avoid"],
      "foodRecommendations": ["Specific foods to include"],
      "foodsToAvoid": ["Foods to limit or avoid"],
      "lifestyle": ["Lifestyle recommendations"],
      "timeline": "Expected timeline for results",
      "warnings": ["Important warnings or when to see a doctor"],
      "resources": ["Additional resources or references"]
    }
    
    Base your advice on:
    - Current nutritional science
    - User's specific health conditions
    - Practical and achievable recommendations
    - Safety considerations
    `;

    const result = await models.default.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format from Gemini AI');
    }

  } catch (error) {
    console.error('Error getting nutrition advice:', error);
    
    // Fallback response
    return {
      advice: "I'm unable to provide specific advice at the moment. Please consult with a healthcare professional.",
      keyPoints: ["Consult with a healthcare professional"],
      dosList: ["Maintain a balanced diet", "Stay hydrated", "Exercise regularly"],
      dontsList: ["Don't make drastic dietary changes without professional guidance"],
      foodRecommendations: ["Fruits", "Vegetables", "Whole grains", "Lean proteins"],
      foodsToAvoid: ["Processed foods", "Excessive sugar", "Trans fats"],
      lifestyle: ["Regular exercise", "Adequate sleep", "Stress management"],
      timeline: "Results vary by individual",
      warnings: ["Consult healthcare provider for personalized advice"],
      resources: ["Registered dietitian", "Healthcare provider"]
    };
  }
};

// Generate content with Gemini AI
const generateContent = async (prompt, modelName = 'gemini-1.5-flash') => {
  try {
    if (!models.default) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    // Select the appropriate model
    let model = models.default;
    if (modelName === 'gemini-1.5-pro' && models.analysis) {
      model = models.analysis;
    } else if (modelName === 'gemini-1.5-flash-chat' && models.chat) {
      model = models.chat;
    }

    console.log(`🤖 Generating content with ${modelName}`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating content:', error);
    return 'Sorry, I encountered an error while generating content. Please try again later.';
  }
};

// Generate structured content with Gemini AI
const generateStructuredContent = async (prompt, params = {}) => {
  try {
    if (!models.default) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    console.log('🤖 Generating structured content');
    
    // Create a structured prompt with parameters
    const structuredPrompt = `
      Topic: ${params.topic || 'Health'}
      Format: ${params.format || 'Bullet points'}
      Length: ${params.length || 'Short'}
      Tone: ${params.tone || 'Informative'}
      
      ${prompt || params.prompt || 'Provide information on this topic.'}
    `;
    
    const result = await models.default.generateContent(structuredPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating structured content:', error);
    return 'Sorry, I encountered an error while generating structured content. Please try again later.';
  }
};

module.exports = {
  analyzeFoodImage,
  generateHealthyRecipe,
  generateRecipeFromIngredients,
  analyzeFoodByName,
  chatWithNutritionist,
  generateMealPlan,
  getNutritionAdvice,
  generateContent,
  generateStructuredContent
};