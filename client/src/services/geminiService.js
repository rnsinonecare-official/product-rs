// Gemini AI Service for Food Analysis and Recipe Generation
// Now uses backend API for security and better architecture
import api from "./api";

// Convert file to base64 for backend upload
// const fileToBase64 = async (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64Data = reader.result.split(',')[1];
//       resolve({
//         data: base64Data,
//         mimeType: file.type,
//         name: file.name
//       });
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// };

// Analyze food image with health conditions consideration
export const analyzeFoodImage = async (
  imageFile,
  userHealthConditions = []
) => {
  try {
    console.log("🤖 Starting food image analysis via backend API");

    // Validate input parameters
    if (!imageFile || !(imageFile instanceof File)) {
      throw new Error("Valid image file is required");
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed"
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      throw new Error("File size too large. Maximum size is 10MB");
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append(
      "healthConditions",
      JSON.stringify(
        Array.isArray(userHealthConditions) ? userHealthConditions : []
      )
    );

    // Try authenticated endpoint first, fallback to public endpoint
    let response;
    try {
      response = await api.post("/ai/analyze-food-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds for image analysis
      });
    } catch (authError) {
      console.log("🔄 Auth endpoint failed, trying AI endpoint...");
      // Use AI endpoint as fallback
      response = await api.post("/ai/analyze-food-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      });
    }

    // Handle different response structures
    console.log(response.data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error analyzing food image:", error);

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
        sodium: "0mg",
      },
      servingSize: "1 serving",
      healthScore: 5,
      isHealthy: true,
      recommendation:
        "Unable to analyze image. Please try uploading a clearer photo.",
      healthWarnings: ["Image analysis failed"],
      healthBenefits: [],
      suitableFor: [],
      avoidIf: [],
      alternatives: [],
      preparation: "Unknown",
      ingredients: [],
    };
  }
};

// Generate recipe based on ingredients and health conditions
export const generateHealthyRecipe = async (
  ingredients,
  userHealthConditions = [],
  dietaryPreferences = {}
) => {
  try {
    console.log("🤖 Generating healthy recipe via backend API");

    // Validate input parameters
    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      throw new Error("Ingredients array is required and must not be empty");
    }

    const validIngredients = ingredients.filter(
      (ing) => ing && typeof ing === "string" && ing.trim()
    );
    if (validIngredients.length === 0) {
      throw new Error("At least one valid ingredient is required");
    }

    const response = await api.post("/ai/generate-recipe", {
      ingredients: validIngredients.map((ing) => ing.trim()),
      healthConditions: Array.isArray(userHealthConditions)
        ? userHealthConditions
        : [],
      dietaryPreferences: dietaryPreferences || {},
    });

    // Handle different response structures
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error generating recipe:", error);

    // Fallback response
    return {
      recipeName: "Simple Healthy Recipe",
      cookingTime: "30 minutes",
      difficulty: "Easy",
      servings: "2-3",
      calories: "200-300 per serving",
      healthScore: 7,
      ingredients: ingredients.map((ing) => ({
        item: ing,
        amount: "As needed",
        notes: "Fresh preferred",
      })),
      instructions: [
        "Prepare all ingredients",
        "Cook according to your preference",
        "Season with healthy spices",
        "Serve immediately",
      ],
      nutritionFacts: {
        protein: "15g",
        carbs: "20g",
        fat: "8g",
        fiber: "5g",
        sugar: "3g",
        sodium: "200mg",
      },
      healthBenefits: ["Provides essential nutrients"],
      suitableFor: ["General health"],
      modifications: {
        diabetes: "Reduce carbs, add more fiber",
        hypertension: "Reduce sodium, add potassium-rich foods",
        pcos: "Add anti-inflammatory spices",
      },
      tips: ["Recipe generation failed, showing basic template"],
    };
  }
};

// Generate multiple recipes from ingredients
export const generateRecipeFromIngredients = async (
  ingredients,
  healthConditions = [],
  dietType = "vegetarian"
) => {
  try {
    console.log("🤖 Generating multiple recipes via backend API");

    const response = await api.post("/ai/generate-multiple-recipes", {
      ingredients,
      healthConditions,
      dietType,
    });

    return response.data.data;
  } catch (error) {
    console.error("Error generating recipes:", error);

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
            notes: "Fresh preferred",
          },
        ],
        instructions: [
          "Prepare all ingredients",
          "Cook according to your preference",
          "Season with healthy spices",
          "Serve immediately",
        ],
        nutritionFacts: {
          protein: "15g",
          carbs: "20g",
          fat: "8g",
          fiber: "5g",
          sugar: "3g",
          sodium: "200mg",
        },
        healthBenefits: ["Provides essential nutrients"],
        suitableFor: ["General health"],
        modifications: {
          diabetes: "Reduce carbs, add more fiber",
          hypertension: "Reduce sodium, add potassium-rich foods",
          pcos: "Add anti-inflammatory spices",
        },
        tips: ["Recipe generation failed, showing basic template"],
      },
    ];
  }
};

// Analyze food by name (text-based analysis)
export const analyzeFoodByName = async (
  foodName,
  userHealthConditions = []
) => {
  try {
    console.log("🤖 Starting food analysis by name via backend API");
    console.log("🍎 Food name:", foodName);
    console.log("🏥 Health conditions:", userHealthConditions);

    // Validate input parameters
    if (!foodName || typeof foodName !== "string" || !foodName.trim()) {
      throw new Error("Food name is required and must be a non-empty string");
    }

    // Try authenticated endpoint first, fallback to public endpoint
    let response;
    try {
      response = await api.post("/ai/analyze-food-name", {
        foodName: foodName.trim(),
        healthConditions: Array.isArray(userHealthConditions)
          ? userHealthConditions
          : [],
      });
      console.log("✅ Auth endpoint response:", response.data);
    } catch (authError) {
      console.log("🔄 Auth endpoint failed, trying public endpoint...");
      console.log("Auth error:", authError.response?.status, authError.message);
      
      // Use AI endpoint as fallback
      response = await api.post("/ai/analyze-food-name", {
        foodName: foodName.trim(),
        healthConditions: Array.isArray(userHealthConditions)
          ? userHealthConditions
          : [],
      });
      console.log("✅ AI endpoint response:", response.data);
    }

    // Handle different response structures
    const result = response.data?.data || response.data;
    console.log("🔍 Final result being returned:", result);
    return result;
  } catch (error) {
    console.error("Error analyzing food by name:", error);

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
        sodium: "0mg",
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
    };
  }
};

// Get meal recommendations based on health conditions
export const getMealRecommendations = async (
  mealType,
  userHealthConditions = [],
  dietaryPreferences = {}
) => {
  try {
    console.log("🤖 Getting meal recommendations via backend API");

    const response = await api.post("/ai/meal-recommendations", {
      mealType,
      healthConditions: userHealthConditions,
      dietaryPreferences,
    });

    return response.data.data;
  } catch (error) {
    console.error("Error getting meal recommendations:", error);

    // Fallback response
    return {
      mealType,
      recommendations: [
        {
          name: "Healthy Option",
          description: "A nutritious meal option",
          calories: "300-400",
          healthScore: 7,
          suitableFor: ["General health"],
        },
      ],
      tips: ["Meal recommendation service temporarily unavailable"],
    };
  }
};

// Generate daily diet plan based on user preferences and meal history
export const generateDailyDietPlan = async (
  userProfile = {},
  mealHistory = [],
  userGoals = {} // Add userGoals parameter
) => {
  try {
    console.log("🤖 Generating daily diet plan via backend API");

    const response = await api.post("/ai/generate-diet-plan", {
      userProfile: {
        healthConditions: userProfile.healthConditions || [],
        dietType: userProfile.dietType || "vegetarian",
        age: userProfile.age,
        gender: userProfile.gender,
        activityLevel: userProfile.activityLevel || "moderate",
        goals: userProfile.goals || [],
        calorieGoal: userGoals.calorieGoal || 1500, // Add calorie goal
        location: userProfile.location || "India", // Add location with default to India
        cuisinePreferences: userProfile.cuisinePreferences || [], // Add cuisine preferences
      },
      mealHistory: mealHistory.slice(0, 20), // Last 20 meals
      preferences: {
        cuisineType: userProfile.cuisinePreferences || [],
        allergies: userProfile.allergies || [],
        dislikes: userProfile.dislikes || [],
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error generating diet plan:", error);

    // Fallback response
    return {
      dailyCalorieTarget: userGoals.calorieGoal || 2000, // Use user's calorie goal
      meals: {
        breakfast: {
          time: "7:00 AM - 8:00 AM",
          foods: ["Oatmeal with fruits", "Green tea"],
          calories: 350,
          nutrients: { protein: "12g", carbs: "45g", fat: "8g" },
        },
        midMorningSnack: {
          time: "10:00 AM - 10:30 AM",
          foods: ["Mixed nuts", "Water"],
          calories: 150,
          nutrients: { protein: "6g", carbs: "8g", fat: "12g" },
        },
        lunch: {
          time: "12:30 PM - 1:30 PM",
          foods: ["Vegetable salad", "Brown rice", "Dal"],
          calories: 450,
          nutrients: { protein: "18g", carbs: "55g", fat: "12g" },
        },
        eveningSnack: {
          time: "4:00 PM - 4:30 PM",
          foods: ["Fruit", "Herbal tea"],
          calories: 100,
          nutrients: { protein: "2g", carbs: "25g", fat: "1g" },
        },
        dinner: {
          time: "7:00 PM - 8:00 PM",
          foods: ["Grilled vegetables", "Quinoa", "Soup"],
          calories: 400,
          nutrients: { protein: "15g", carbs: "50g", fat: "10g" },
        },
      },
      hydration: {
        waterGoal: "8-10 glasses",
        timing: "Every 2 hours",
        alternatives: ["Herbal tea", "Coconut water"],
      },
      tips: [
        "Eat at regular intervals",
        "Stay hydrated throughout the day",
        "Include variety in your meals",
      ],
      healthBenefits: [
        "Balanced nutrition",
        "Sustained energy levels",
        "Better digestion",
      ],
    };
  }
};

// Get nutrition advice based on health conditions
export const getNutritionAdvice = async (
  userHealthConditions = [],
  currentDiet = {}
) => {
  try {
    console.log("🤖 Getting nutrition advice via backend API");

    const response = await api.post("/ai/nutrition-advice", {
      healthConditions: userHealthConditions,
      currentDiet,
    });

    return response.data.data;
  } catch (error) {
    console.error("Error getting nutrition advice:", error);

    // Fallback response
    return {
      advice: "Focus on a balanced diet with plenty of fruits and vegetables.",
      recommendations: [
        "Eat regular meals",
        "Stay hydrated",
        "Include variety in your diet",
      ],
      warnings: [],
      suitableFor: userHealthConditions,
    };
  }
};

// Generate chatbot response for health and nutrition questions
export const generateChatbotResponse = async (message, userContext = {}, conversationHistory = []) => {
  try {
    console.log("🤖 Generating health advisor response via backend API");
    console.log("📝 Message:", message);

    const response = await api.post("/health-advisor/chat", {
      message
    });

    console.log("✅ Health advisor response received:", response.data);
    return response.data.data.response;
  } catch (error) {
    console.error("Error generating health advisor response:", error);
    console.error("Error details:", error.response?.data || error.message);

    // Simple fallback response
    return "I'm sorry, I'm having technical difficulties right now. Please try asking your health question again, or consult with a healthcare professional for personalized advice.";
  }
};

// Generate health recommendations based on user profile
export const generateHealthRecommendations = async (userProfile = {}) => {
  try {
    console.log("🤖 Generating health recommendations via backend API");

    const response = await api.post("/ai/health-recommendations", {
      userProfile: userProfile.userProfile || userProfile,
      healthConditions: userProfile.healthConditions || [],
    });

    return response.data.data;
  } catch (error) {
    console.error("Error generating health recommendations:", error);

    // Fallback response
    return {
      recommendations: [
        {
          category: "Nutrition",
          title: "Balanced Diet",
          description:
            "Focus on a balanced diet with plenty of fruits and vegetables",
          priority: "high",
        },
        {
          category: "Exercise",
          title: "Regular Activity",
          description: "Aim for at least 30 minutes of moderate exercise daily",
          priority: "medium",
        },
        {
          category: "Hydration",
          title: "Stay Hydrated",
          description: "Drink at least 8 glasses of water daily",
          priority: "medium",
        },
      ],
      tips: [
        "Eat regular meals throughout the day",
        "Include variety in your diet",
        "Monitor portion sizes",
      ],
    };
  }
};

const geminiService = {
  analyzeFoodImage,
  generateHealthyRecipe,
  generateRecipeFromIngredients,
  analyzeFoodByName,
  getMealRecommendations,
  getNutritionAdvice,
  generateChatbotResponse,
  generateHealthRecommendations,
};

export default geminiService;
