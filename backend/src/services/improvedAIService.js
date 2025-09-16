// Improved AI Service with Dynamic, Varied Responses
// Fixes the repetitive recipe and diet plan issue

const { GoogleGenerativeAI } = require('@google/generative-ai');

class ImprovedAIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    
    // Recipe variation templates
    this.recipeStyles = [
      'Mediterranean', 'Asian-inspired', 'Indian fusion', 'Mexican-style', 
      'Italian-inspired', 'Middle Eastern', 'Thai-style', 'Japanese-inspired',
      'Greek-style', 'Moroccan-inspired', 'Korean-fusion', 'Vietnamese-style'
    ];
    
    this.cookingMethods = [
      'grilled', 'roasted', 'stir-fried', 'steamed', 'baked', 'sautéed',
      'braised', 'poached', 'air-fried', 'slow-cooked', 'pan-seared', 'broiled'
    ];
    
    this.mealTypes = [
      'comfort food', 'light and fresh', 'hearty and filling', 'quick and easy',
      'gourmet-style', 'rustic', 'elegant', 'family-friendly', 'restaurant-style',
      'home-cooked', 'fusion', 'traditional'
    ];
    
    // Diet plan variation factors
    this.cuisineRotations = [
      ['Indian', 'Continental', 'Asian'],
      ['Mediterranean', 'Mexican', 'Italian'], 
      ['Thai', 'Japanese', 'Korean'],
      ['Middle Eastern', 'Greek', 'Turkish']
    ];
    
    this.seasonalFocus = {
      spring: ['fresh greens', 'asparagus', 'peas', 'strawberries'],
      summer: ['tomatoes', 'cucumbers', 'berries', 'melons'],
      fall: ['pumpkin', 'apples', 'squash', 'root vegetables'],
      winter: ['citrus', 'hearty grains', 'warming spices', 'dried fruits']
    };
  }

  // Get random elements for variation
  getRandomElements(array, count = 1) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return count === 1 ? shuffled[0] : shuffled.slice(0, count);
  }

  // Get current season for seasonal ingredients
  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  // Generate dynamic recipe with variations
  async generateVariedRecipe(ingredients, healthConditions = [], dietType = 'vegetarian') {
    try {
      console.log('🍳 Generating varied recipe with dynamic elements...');
      
      // Add randomization elements
      const style = this.getRandomElements(this.recipeStyles);
      const method = this.getRandomElements(this.cookingMethods);
      const mealType = this.getRandomElements(this.mealTypes);
      const season = this.getCurrentSeason();
      const seasonalIngredients = this.getRandomElements(this.seasonalFocus[season], 2);
      const timestamp = Date.now();
      
      // Create dynamic, varied prompt
      const dynamicPrompt = `You are a creative ${style} chef creating a ${mealType} recipe. 

RECIPE CHALLENGE: Create a unique ${method} dish using: ${ingredients.join(', ')}

CREATIVE CONSTRAINTS:
- Style: ${style} cuisine influence
- Cooking method: Primarily ${method}
- Vibe: ${mealType}
- Season: ${season} (incorporate: ${seasonalIngredients.join(', ')})
- Diet: ${dietType}
- Health focus: ${healthConditions.join(', ') || 'general wellness'}
- Uniqueness factor: ${timestamp % 100} (make it distinctive!)

INNOVATION REQUIREMENTS:
1. Create a recipe name that's catchy and reflects the ${style} influence
2. Use an unexpected flavor combination or cooking technique
3. Include at least one surprising ingredient pairing
4. Add a unique garnish or presentation idea
5. Provide a creative backstory or inspiration for the dish

OUTPUT FORMAT (JSON only):
{
  "recipeName": "Creative name with ${style} influence",
  "inspiration": "Brief backstory or cultural inspiration",
  "description": "Enticing description highlighting unique elements",
  "cookingMethod": "${method}",
  "cuisineStyle": "${style}",
  "difficulty": "Easy/Medium/Hard",
  "prepTime": "X minutes",
  "cookingTime": "X minutes", 
  "servings": 2-4,
  "ingredients": [
    {
      "item": "ingredient name",
      "amount": "quantity",
      "preparation": "how to prep",
      "substitution": "alternative if needed"
    }
  ],
  "instructions": [
    "Step-by-step instructions with techniques"
  ],
  "uniqueTwist": "What makes this recipe special",
  "flavorProfile": "Dominant flavors and taste experience",
  "nutritionHighlights": {
    "calories": "per serving",
    "protein": "amount",
    "keyNutrients": ["highlight 2-3 key nutrients"]
  },
  "healthBenefits": ["Specific benefits for health conditions"],
  "servingSuggestions": "How to plate and serve",
  "variations": ["2-3 ways to modify the recipe"],
  "chefsTips": ["Professional cooking tips"],
  "seasonalNote": "Why this works for ${season}",
  "culturalContext": "Brief note about ${style} influence"
}

Make this recipe feel completely fresh and different from any previous suggestions!`;

      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: 2500,
          temperature: 0.8, // Higher for more creativity
          topP: 0.9,
          topK: 60
        }
      });

      const result = await model.generateContent(dynamicPrompt);
      const response = await result.response;
      const text = response.text();

      // Parse and return
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        parsedData.generationMetadata = {
          style, method, mealType, season, timestamp,
          variationId: `${style}-${method}-${timestamp % 1000}`
        };
        return parsedData;
      }

      throw new Error('Failed to parse recipe response');

    } catch (error) {
      console.error('❌ Varied recipe generation failed:', error);
      return this.getFallbackRecipe(ingredients, healthConditions);
    }
  }

  // Generate dynamic diet plan with rotation
  async generateVariedDietPlan(userProfile, mealHistory = []) {
    try {
      console.log('📋 Generating varied diet plan with rotation...');
      
      // Add variation elements
      const cuisineSet = this.getRandomElements(this.cuisineRotations);
      const season = this.getCurrentSeason();
      const seasonalFocus = this.seasonalFocus[season];
      const dayOfWeek = new Date().getDay();
      const weekPattern = ['energizing', 'balanced', 'comfort', 'light', 'hearty', 'fresh', 'nourishing'][dayOfWeek];
      const timestamp = Date.now();
      
      // Analyze meal history for variety
      const recentFoods = mealHistory.slice(0, 10);
      const avoidRepetition = recentFoods.length > 0 ? 
        `AVOID repeating these recent foods: ${recentFoods.join(', ')}` : '';

      const dynamicPrompt = `You are a nutrition expert creating a ${weekPattern} daily meal plan.

PERSONALIZATION:
- Health conditions: ${userProfile.healthConditions?.join(', ') || 'none'}
- Diet type: ${userProfile.dietType || 'vegetarian'}
- Age: ${userProfile.age || 'adult'}
- Activity level: ${userProfile.activityLevel || 'moderate'}
- Goals: ${userProfile.goals?.join(', ') || 'general health'}

VARIETY REQUIREMENTS:
- Cuisine rotation: ${cuisineSet.join(' → ')} throughout the day
- Seasonal emphasis: ${season} (feature: ${seasonalFocus.join(', ')})
- Day theme: ${weekPattern} meals
- Uniqueness factor: ${timestamp % 100}
${avoidRepetition}

CREATIVITY CONSTRAINTS:
1. Each meal should have a different cuisine influence from the rotation
2. Include at least 3 seasonal ingredients
3. Vary cooking methods across meals
4. Add one "discovery" food (something new to try)
5. Include texture variety (crunchy, creamy, chewy)
6. Balance warm and cool foods appropriately

OUTPUT FORMAT (JSON only):
{
  "planTheme": "${weekPattern} ${season} nutrition plan",
  "cuisineJourney": "${cuisineSet.join(' → ')}",
  "dailyCalorieTarget": "based on profile",
  "seasonalHighlight": "Key ${season} ingredients featured",
  "meals": {
    "breakfast": {
      "cuisineStyle": "${cuisineSet[0]}",
      "theme": "energizing start",
      "time": "7:00-8:30 AM",
      "foods": ["specific items with portions"],
      "calories": "estimated",
      "nutrients": {"protein": "Xg", "carbs": "Xg", "fat": "Xg"},
      "preparationStyle": "cooking method",
      "flavorProfile": "taste description",
      "preparationTips": ["specific tips"]
    },
    "midMorningSnack": {
      "theme": "sustained energy",
      "time": "10:00-10:30 AM", 
      "foods": ["snack options"],
      "calories": "estimated",
      "nutrients": {"protein": "Xg", "carbs": "Xg", "fat": "Xg"},
      "textureNote": "crunchy/smooth/etc"
    },
    "lunch": {
      "cuisineStyle": "${cuisineSet[1]}",
      "theme": "midday nourishment",
      "time": "12:30-1:30 PM",
      "foods": ["lunch items"],
      "calories": "estimated", 
      "nutrients": {"protein": "Xg", "carbs": "Xg", "fat": "Xg"},
      "preparationStyle": "cooking method",
      "flavorProfile": "taste description",
      "preparationTips": ["cooking suggestions"]
    },
    "eveningSnack": {
      "theme": "afternoon boost",
      "time": "4:00-4:30 PM",
      "foods": ["snack items"],
      "calories": "estimated",
      "nutrients": {"protein": "Xg", "carbs": "Xg", "fat": "Xg"},
      "moodBooster": "how this helps energy"
    },
    "dinner": {
      "cuisineStyle": "${cuisineSet[2]}",
      "theme": "evening satisfaction",
      "time": "7:00-8:00 PM",
      "foods": ["dinner options"],
      "calories": "estimated",
      "nutrients": {"protein": "Xg", "carbs": "Xg", "fat": "Xg"},
      "preparationStyle": "cooking method",
      "flavorProfile": "taste description", 
      "preparationTips": ["dinner prep advice"]
    }
  },
  "discoveryFood": "One new food to try today",
  "seasonalSpotlight": "Featured ${season} ingredient and why",
  "hydration": {
    "waterGoal": "8-10 glasses",
    "flavoredOptions": ["seasonal drink suggestions"],
    "timing": "hydration schedule"
  },
  "dailyNutritionFocus": "Key nutrients emphasized today",
  "mealPrepTips": ["Efficiency suggestions for the day"],
  "healthBenefits": ["How this plan supports your health conditions"],
  "tomorrowPreview": "Hint at tomorrow's cuisine rotation",
  "shoppingList": {
    "proteins": ["protein sources needed"],
    "vegetables": ["fresh produce with seasonal emphasis"],
    "pantryItems": ["dry goods and spices"],
    "optional": ["items for variations"]
  }
}

Make this feel like a completely new and exciting food journey!`;

      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          maxOutputTokens: 3000,
          temperature: 0.7, // Balanced creativity
          topP: 0.9,
          topK: 50
        }
      });

      const result = await model.generateContent(dynamicPrompt);
      const response = await result.response;
      const text = response.text();

      // Parse and return
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        parsedData.generationMetadata = {
          cuisineSet, season, weekPattern, timestamp,
          variationId: `${weekPattern}-${season}-${timestamp % 1000}`
        };
        return parsedData;
      }

      throw new Error('Failed to parse diet plan response');

    } catch (error) {
      console.error('❌ Varied diet plan generation failed:', error);
      return this.getFallbackDietPlan(userProfile);
    }
  }

  // Fallback recipe with some variation
  getFallbackRecipe(ingredients, healthConditions) {
    const style = this.getRandomElements(this.recipeStyles);
    const method = this.getRandomElements(this.cookingMethods);
    
    return {
      recipeName: `${style} ${method} ${ingredients[0]} Delight`,
      inspiration: `A creative ${style} approach to ${method} cooking`,
      description: `A unique ${method} dish with ${style} influences`,
      cookingMethod: method,
      cuisineStyle: style,
      difficulty: 'Easy',
      prepTime: '15 minutes',
      cookingTime: '20 minutes',
      servings: 2,
      ingredients: ingredients.map(ing => ({
        item: ing,
        amount: 'as needed',
        preparation: 'prepared as preferred',
        substitution: 'any similar ingredient'
      })),
      instructions: [
        `Prepare all ingredients in ${style} style`,
        `${method} the main ingredients until tender`,
        'Season with appropriate spices',
        'Serve hot with garnish'
      ],
      uniqueTwist: `${style} seasoning with ${method} technique`,
      flavorProfile: `${style} flavors with ${method} texture`,
      nutritionHighlights: {
        calories: '250-350 per serving',
        protein: '15-20g',
        keyNutrients: ['protein', 'fiber', 'vitamins']
      },
      healthBenefits: healthConditions.length > 0 ? 
        [`Suitable for ${healthConditions.join(', ')}`] : ['General nutrition'],
      servingSuggestions: `Serve ${style} style with fresh herbs`,
      variations: [`Try different ${style} spices`, `Experiment with ${method} timing`],
      chefsTips: [`${method} cooking requires attention to timing`],
      seasonalNote: `Works well in any season`,
      culturalContext: `Inspired by ${style} cooking traditions`,
      generationMetadata: {
        style, method, 
        fallback: true,
        timestamp: Date.now()
      }
    };
  }

  // Fallback diet plan with variation
  getFallbackDietPlan(userProfile) {
    const cuisineSet = this.getRandomElements(this.cuisineRotations);
    const season = this.getCurrentSeason();
    
    return {
      planTheme: `Balanced ${season} nutrition plan`,
      cuisineJourney: cuisineSet.join(' → '),
      dailyCalorieTarget: '1800-2200 calories',
      seasonalHighlight: `${season} seasonal ingredients`,
      meals: {
        breakfast: {
          cuisineStyle: cuisineSet[0],
          theme: 'energizing start',
          time: '7:00-8:30 AM',
          foods: ['Oatmeal with seasonal fruits', 'Green tea'],
          calories: '350-400',
          nutrients: {protein: '12g', carbs: '45g', fat: '8g'},
          preparationStyle: 'simple cooking',
          flavorProfile: 'mild and nourishing'
        },
        lunch: {
          cuisineStyle: cuisineSet[1], 
          theme: 'midday nourishment',
          time: '12:30-1:30 PM',
          foods: ['Mixed vegetable salad', 'Whole grain bread'],
          calories: '450-500',
          nutrients: {protein: '18g', carbs: '55g', fat: '12g'},
          preparationStyle: 'fresh preparation',
          flavorProfile: 'fresh and satisfying'
        },
        dinner: {
          cuisineStyle: cuisineSet[2],
          theme: 'evening satisfaction', 
          time: '7:00-8:00 PM',
          foods: ['Lentil curry', 'Brown rice'],
          calories: '400-450',
          nutrients: {protein: '16g', carbs: '50g', fat: '10g'},
          preparationStyle: 'home cooking',
          flavorProfile: 'warm and comforting'
        }
      },
      discoveryFood: 'Try a new seasonal vegetable',
      seasonalSpotlight: `${season} ingredients for optimal nutrition`,
      hydration: {
        waterGoal: '8-10 glasses',
        flavoredOptions: ['Herbal teas', 'Infused water'],
        timing: 'Every 2 hours'
      },
      healthBenefits: ['Balanced nutrition', 'Sustained energy'],
      generationMetadata: {
        cuisineSet, season,
        fallback: true,
        timestamp: Date.now()
      }
    };
  }
}

module.exports = new ImprovedAIService();