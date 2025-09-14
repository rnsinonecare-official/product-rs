const { GoogleGenerativeAI } = require('@google/generative-ai');

// Use the dedicated food analysis API key
const FOOD_ANALYSIS_API_KEY = process.env.GEMINI_FOOD_ANALYSIS_API_KEY;

// Initialize Gemini AI specifically for food analysis
let foodAnalysisAI;
let foodAnalysisModel;

try {
  console.log('🔍 Checking Food Analysis API Key...');
  console.log('🔑 API Key present:', !!FOOD_ANALYSIS_API_KEY);
  console.log('🔑 API Key length:', FOOD_ANALYSIS_API_KEY ? FOOD_ANALYSIS_API_KEY.length : 0);
  console.log('🔑 API Key starts with:', FOOD_ANALYSIS_API_KEY ? FOOD_ANALYSIS_API_KEY.substring(0, 10) + '...' : 'N/A');
  
  if (FOOD_ANALYSIS_API_KEY) {
    foodAnalysisAI = new GoogleGenerativeAI(FOOD_ANALYSIS_API_KEY);
    
    // Dedicated model for food analysis only
    foodAnalysisModel = foodAnalysisAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 600,     // Moderate output for analysis
        temperature: 0.5,         // More factual and consistent
        topP: 0.7,
        topK: 30,
        candidateCount: 1
      }
    });
    
    console.log('✅ Food Analysis Gemini AI initialized successfully');
    console.log('🍎 This API key is dedicated to FOOD ANALYSIS ONLY');
    console.log('🔧 Using model: gemini-1.5-flash');
  } else {
    console.warn('⚠️ Food Analysis Gemini API key not found. Food analysis features will use fallback responses.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Food Analysis Gemini AI:', error);
  console.error('❌ Error details:', error.message);
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

// Analyze food image with health conditions consideration - FOOD ANALYSIS ONLY
const analyzeFoodImage = async (imageFile, userHealthConditions = []) => {
  try {
    if (!foodAnalysisModel) {
      throw new Error('Food Analysis Gemini AI not initialized. Please check your API key.');
    }

    console.log('🍎 Using dedicated Food Analysis API for image analysis');
    console.log('🔑 API Key ending in: ...', FOOD_ANALYSIS_API_KEY.slice(-8));

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

    console.log('🔄 Sending request to Gemini API...');
    const result = await foodAnalysisModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log('📝 Raw response from Gemini:', text.substring(0, 200) + '...');

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ JSON found in response, parsing...');
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed food analysis data');
      return parsedData;
    } else {
      console.error('❌ No JSON found in response. Full response:', text);
      throw new Error('Invalid response format from Food Analysis Gemini AI');
    }

  } catch (error) {
    console.error('❌ Error analyzing food image:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
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

// Analyze food by name (text-based analysis) - FOOD ANALYSIS ONLY
const analyzeFoodByName = async (foodName, userHealthConditions = []) => {
  try {
    if (!foodAnalysisModel) {
      throw new Error('Food Analysis Gemini AI not initialized. Please check your API key.');
    }

    console.log('🍎 Using dedicated Food Analysis API for name analysis');
    console.log('🔑 API Key ending in: ...', FOOD_ANALYSIS_API_KEY.slice(-8));

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

    console.log('🔄 Sending food name analysis request to Gemini API...');
    const result = await foodAnalysisModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📝 Raw response from Gemini:', text.substring(0, 200) + '...');

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ JSON found in response, parsing...');
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed food name analysis data');
      return parsedData;
    } else {
      console.error('❌ No JSON found in response. Full response:', text);
      throw new Error('Invalid response format from Food Analysis Gemini AI');
    }

  } catch (error) {
    console.error('❌ Error analyzing food by name:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
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

module.exports = {
  analyzeFoodImage,
  analyzeFoodByName
};