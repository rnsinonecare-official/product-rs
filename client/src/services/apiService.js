// API Service for external food and recipe APIs
// This file handles integration with Edamam and Spoonacular APIs

// Edamam API Configuration
const EDAMAM_APP_ID = process.env.REACT_APP_EDAMAM_APP_ID || 'demo';
const EDAMAM_APP_KEY = process.env.REACT_APP_EDAMAM_APP_KEY || 'demo';
const EDAMAM_BASE_URL = 'https://api.edamam.com/api/food-database/v2';

// Spoonacular API Configuration  
const SPOONACULAR_API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY || 'demo';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

// Mock data fallback when APIs are not available
const mockFoodDatabase = [
  {
    foodId: "food_1",
    label: "Apple",
    nutrients: {
      ENERC_KCAL: 52,
      PROCNT: 0.3,
      FAT: 0.2,
      CHOCDF: 14,
      FIBTG: 2.4,
      SUGAR: 10
    },
    category: "fruits",
    image: "https://www.edamam.com/food-img/42c/42c006401027d35add93113548eeaae6.jpg",
    foodContentsLabel: "Apple, raw"
  },
  {
    foodId: "food_2", 
    label: "Banana",
    nutrients: {
      ENERC_KCAL: 89,
      PROCNT: 1.1,
      FAT: 0.3,
      CHOCDF: 23,
      FIBTG: 2.6,
      SUGAR: 12
    },
    category: "fruits",
    image: "https://www.edamam.com/food-img/263/263c0c72e448829e1b8e1ae8de6ea7bb.jpg",
    foodContentsLabel: "Banana, raw"
  },
  {
    foodId: "food_3",
    label: "Chicken Breast",
    nutrients: {
      ENERC_KCAL: 165,
      PROCNT: 31,
      FAT: 3.6,
      CHOCDF: 0,
      FIBTG: 0,
      SUGAR: 0
    },
    category: "meat",
    image: "https://www.edamam.com/food-img/d33/d338229d774a743f7858f6764e095878.jpg",
    foodContentsLabel: "Chicken, broilers or fryers, breast, meat only, cooked, roasted"
  },
  {
    foodId: "food_4",
    label: "Brown Rice",
    nutrients: {
      ENERC_KCAL: 112,
      PROCNT: 2.6,
      FAT: 0.9,
      CHOCDF: 23,
      FIBTG: 1.8,
      SUGAR: 0.4
    },
    category: "grains",
    image: "https://www.edamam.com/food-img/c45/c453c78db2b7c36f2049c750c1e678b6.jpg",
    foodContentsLabel: "Rice, brown, long-grain, cooked"
  },
  {
    foodId: "food_5",
    label: "Spinach",
    nutrients: {
      ENERC_KCAL: 23,
      PROCNT: 2.9,
      FAT: 0.4,
      CHOCDF: 3.6,
      FIBTG: 2.2,
      SUGAR: 0.4
    },
    category: "vegetables",
    image: "https://www.edamam.com/food-img/e6e/e6e4be375c4554ce01c8ea75232efaa6.jpg",
    foodContentsLabel: "Spinach, raw"
  },
  // Add more mock foods...
];

const mockRecipeDatabase = [
  {
    id: 1,
    title: "Healthy Quinoa Bowl",
    image: "https://spoonacular.com/recipeImages/1-312x231.jpg",
    readyInMinutes: 25,
    servings: 2,
    vegetarian: true,
    vegan: false,
    glutenFree: true,
    dairyFree: true,
    healthScore: 85,
    analyzedInstructions: [
      {
        steps: [
          { number: 1, step: "Cook quinoa according to package instructions." },
          { number: 2, step: "Prepare vegetables by chopping and sautéing." },
          { number: 3, step: "Combine quinoa with vegetables and season." }
        ]
      }
    ],
    extendedIngredients: [
      { name: "quinoa", amount: 1, unit: "cup" },
      { name: "spinach", amount: 2, unit: "cups" },
      { name: "bell pepper", amount: 1, unit: "piece" }
    ],
    nutrition: {
      calories: 320,
      protein: "12g",
      carbs: "45g", 
      fat: "8g",
      fiber: "6g"
    }
  }
  // Add more mock recipes...
];

// Food Search API
export const searchFood = async (query, limit = 20) => {
  try {
    // Try Edamam API first
    if (EDAMAM_APP_ID !== 'demo' && EDAMAM_APP_KEY !== 'demo') {
      const response = await fetch(
        `${EDAMAM_BASE_URL}/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(query)}&limit=${limit}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.hints.map(hint => ({
          foodId: hint.food.foodId,
          label: hint.food.label,
          nutrients: hint.food.nutrients,
          category: hint.food.category || 'other',
          image: hint.food.image,
          foodContentsLabel: hint.food.foodContentsLabel || hint.food.label,
          brand: hint.food.brand,
          type: determineType(hint.food.category, hint.food.label)
        }));
      }
    }
    
    // Fallback to mock data
    console.log('Using mock food data - configure Edamam API for real data');
    return mockFoodDatabase
      .filter(food => 
        food.label.toLowerCase().includes(query.toLowerCase()) ||
        food.foodContentsLabel.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit)
      .map(food => ({
        ...food,
        type: determineType(food.category, food.label)
      }));
      
  } catch (error) {
    console.error('Error searching food:', error);
    throw new Error('Failed to search food database');
  }
};

// Get detailed nutrition info for a food item
export const getFoodNutrition = async (foodId, quantity = 100, measure = 'gram') => {
  try {
    // Try Edamam API first
    if (EDAMAM_APP_ID !== 'demo' && EDAMAM_APP_KEY !== 'demo') {
      const response = await fetch(
        `${EDAMAM_BASE_URL}/nutrients?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ingredients: [{
              quantity: quantity,
              measureURI: `http://www.edamam.com/ontologies/edamam.owl#Measure_${measure}`,
              foodId: foodId
            }]
          })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return formatNutritionData(data);
      }
    }
    
    // Fallback to mock data
    const food = mockFoodDatabase.find(f => f.foodId === foodId);
    if (food) {
      return {
        calories: Math.round((food.nutrients.ENERC_KCAL * quantity) / 100),
        protein: Math.round((food.nutrients.PROCNT * quantity) / 100),
        carbs: Math.round((food.nutrients.CHOCDF * quantity) / 100),
        fat: Math.round((food.nutrients.FAT * quantity) / 100),
        fiber: Math.round((food.nutrients.FIBTG * quantity) / 100),
        sugar: Math.round((food.nutrients.SUGAR * quantity) / 100),
        sodium: 0,
        potassium: 0,
        quantity: quantity,
        measure: measure
      };
    }
    
    throw new Error('Food not found');
    
  } catch (error) {
    console.error('Error getting nutrition info:', error);
    throw new Error('Failed to get nutrition information');
  }
};

// Recipe Search API
export const searchRecipesByIngredients = async (ingredients, number = 12) => {
  try {
    // Try Spoonacular API first
    if (SPOONACULAR_API_KEY !== 'demo') {
      const ingredientString = ingredients.join(',');
      const response = await fetch(
        `${SPOONACULAR_BASE_URL}/recipes/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${encodeURIComponent(ingredientString)}&number=${number}&ranking=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          usedIngredientCount: recipe.usedIngredientCount,
          missedIngredientCount: recipe.missedIngredientCount,
          missedIngredients: recipe.missedIngredients,
          usedIngredients: recipe.usedIngredients
        }));
      }
    }
    
    // Fallback to mock data
    console.log('Using mock recipe data - configure Spoonacular API for real data');
    return mockRecipeDatabase
      .filter(recipe => 
        recipe.extendedIngredients.some(ingredient =>
          ingredients.some(userIngredient =>
            ingredient.name.toLowerCase().includes(userIngredient.toLowerCase())
          )
        )
      )
      .slice(0, number);
      
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw new Error('Failed to search recipes');
  }
};

// Get detailed recipe information
export const getRecipeDetails = async (recipeId) => {
  try {
    // Try Spoonacular API first
    if (SPOONACULAR_API_KEY !== 'demo') {
      const response = await fetch(
        `${SPOONACULAR_BASE_URL}/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        return formatRecipeData(data);
      }
    }
    
    // Fallback to mock data
    const recipe = mockRecipeDatabase.find(r => r.id === recipeId);
    if (recipe) {
      return recipe;
    }
    
    throw new Error('Recipe not found');
    
  } catch (error) {
    console.error('Error getting recipe details:', error);
    throw new Error('Failed to get recipe details');
  }
};

// Image recognition for food (placeholder - would need TensorFlow.js or ML Kit)
export const recognizeFood = async (imageFile) => {
  try {
    // This is a placeholder - in a real app you'd use:
    // - TensorFlow.js with a food recognition model
    // - Google Cloud Vision API
    // - Azure Computer Vision
    // - AWS Rekognition
    
    console.log('Food image recognition not implemented - returning mock result');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock recognition result
    return {
      predictions: [
        { label: 'Apple', confidence: 0.89 },
        { label: 'Red Apple', confidence: 0.76 },
        { label: 'Fruit', confidence: 0.65 }
      ],
      suggestedFood: mockFoodDatabase[0] // Return apple as example
    };
    
  } catch (error) {
    console.error('Error recognizing food:', error);
    throw new Error('Failed to recognize food from image');
  }
};

// Helper Functions
const determineType = (category, label) => {
  const nonVegKeywords = ['chicken', 'beef', 'pork', 'fish', 'meat', 'egg', 'turkey', 'lamb', 'seafood'];
  const isNonVeg = nonVegKeywords.some(keyword => 
    label.toLowerCase().includes(keyword) || 
    (category && category.toLowerCase().includes(keyword))
  );
  return isNonVeg ? 'non-vegetarian' : 'vegetarian';
};

const formatNutritionData = (edamamData) => {
  const nutrients = edamamData.totalNutrients;
  return {
    calories: Math.round(nutrients.ENERC_KCAL?.quantity || 0),
    protein: Math.round(nutrients.PROCNT?.quantity || 0),
    carbs: Math.round(nutrients.CHOCDF?.quantity || 0),
    fat: Math.round(nutrients.FAT?.quantity || 0),
    fiber: Math.round(nutrients.FIBTG?.quantity || 0),
    sugar: Math.round(nutrients.SUGAR?.quantity || 0),
    sodium: Math.round(nutrients.NA?.quantity || 0),
    potassium: Math.round(nutrients.K?.quantity || 0),
    calcium: Math.round(nutrients.CA?.quantity || 0),
    iron: Math.round(nutrients.FE?.quantity || 0),
    vitaminC: Math.round(nutrients.VITC?.quantity || 0),
    vitaminA: Math.round(nutrients.VITA_RAE?.quantity || 0)
  };
};

const formatRecipeData = (spoonacularData) => {
  return {
    id: spoonacularData.id,
    title: spoonacularData.title,
    image: spoonacularData.image,
    readyInMinutes: spoonacularData.readyInMinutes,
    servings: spoonacularData.servings,
    vegetarian: spoonacularData.vegetarian,
    vegan: spoonacularData.vegan,
    glutenFree: spoonacularData.glutenFree,
    dairyFree: spoonacularData.dairyFree,
    healthScore: spoonacularData.healthScore,
    analyzedInstructions: spoonacularData.analyzedInstructions,
    extendedIngredients: spoonacularData.extendedIngredients,
    nutrition: {
      calories: spoonacularData.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
      protein: spoonacularData.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
      carbs: spoonacularData.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
      fat: spoonacularData.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0,
      fiber: spoonacularData.nutrition?.nutrients?.find(n => n.name === 'Fiber')?.amount || 0,
      sugar: spoonacularData.nutrition?.nutrients?.find(n => n.name === 'Sugar')?.amount || 0
    }
  };
};

// Rate limiting helper
let lastApiCall = 0;
const API_RATE_LIMIT = 1000; // 1 second between API calls

// Helper function for rate-limited API calls
const rateLimitedFetch = async (url, options = {}) => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < API_RATE_LIMIT) {
    await new Promise(resolve => setTimeout(resolve, API_RATE_LIMIT - timeSinceLastCall));
  }
  
  lastApiCall = Date.now();
  return fetch(url, options);
};

// Export for potential future use
export { rateLimitedFetch };

const apiService = {
  searchFood,
  getFoodNutrition,
  searchRecipesByIngredients,
  getRecipeDetails,
  recognizeFood
};

export default apiService;