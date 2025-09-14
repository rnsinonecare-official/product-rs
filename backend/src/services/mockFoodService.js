// Mock Food Analysis Service - Temporary solution while setting up Gemini API
// This provides realistic mock data for food analysis and recipe generation

const mockFoodDatabase = {
  'apple': {
    foodName: 'Apple',
    calories: '95 per medium apple',
    nutritionFacts: {
      protein: '0.5g',
      carbs: '25g',
      fat: '0.3g',
      fiber: '4g',
      sugar: '19g',
      sodium: '2mg'
    },
    servingSize: '1 medium apple (182g)',
    healthScore: 9,
    isHealthy: true,
    recommendation: 'Excellent choice! Apples are rich in fiber and antioxidants. For diabetes, eat with protein to slow sugar absorption.',
    healthWarnings: ['High in natural sugars - monitor blood glucose if diabetic'],
    healthBenefits: ['High in fiber', 'Rich in antioxidants', 'Supports heart health', 'May help with weight management'],
    suitableFor: ['heart health', 'weight management', 'general wellness'],
    avoidIf: ['severe fructose intolerance'],
    alternatives: ['berries (lower sugar)', 'pears', 'citrus fruits'],
    bestTimeToEat: 'Morning or as a snack',
    portionControl: '1-2 medium apples per day'
  },
  'banana': {
    foodName: 'Banana',
    calories: '105 per medium banana',
    nutritionFacts: {
      protein: '1.3g',
      carbs: '27g',
      fat: '0.4g',
      fiber: '3g',
      sugar: '14g',
      sodium: '1mg'
    },
    servingSize: '1 medium banana (118g)',
    healthScore: 8,
    isHealthy: true,
    recommendation: 'Great source of potassium and energy. Best consumed post-workout or in the morning.',
    healthWarnings: ['High in carbs - monitor portion if diabetic'],
    healthBenefits: ['High in potassium', 'Good source of vitamin B6', 'Natural energy boost', 'Supports muscle function'],
    suitableFor: ['athletes', 'heart health', 'muscle recovery'],
    avoidIf: ['kidney disease (high potassium)'],
    alternatives: ['berries', 'apple slices', 'orange'],
    bestTimeToEat: 'Pre or post-workout, morning',
    portionControl: '1 medium banana per day'
  },
  'chicken breast': {
    foodName: 'Chicken Breast',
    calories: '165 per 100g',
    nutritionFacts: {
      protein: '31g',
      carbs: '0g',
      fat: '3.6g',
      fiber: '0g',
      sugar: '0g',
      sodium: '74mg'
    },
    servingSize: '100g (3.5 oz)',
    healthScore: 9,
    isHealthy: true,
    recommendation: 'Excellent lean protein source. Perfect for muscle building and weight management.',
    healthWarnings: ['Ensure proper cooking to avoid foodborne illness'],
    healthBenefits: ['High quality protein', 'Low in fat', 'Rich in B vitamins', 'Supports muscle growth'],
    suitableFor: ['muscle building', 'weight loss', 'diabetes', 'heart health'],
    avoidIf: ['vegetarian/vegan diet'],
    alternatives: ['fish', 'tofu', 'legumes', 'turkey breast'],
    bestTimeToEat: 'Any meal, especially post-workout',
    portionControl: '100-150g per serving'
  },
  'rice': {
    foodName: 'White Rice',
    calories: '130 per 100g cooked',
    nutritionFacts: {
      protein: '2.7g',
      carbs: '28g',
      fat: '0.3g',
      fiber: '0.4g',
      sugar: '0.1g',
      sodium: '1mg'
    },
    servingSize: '100g cooked (1/2 cup)',
    healthScore: 6,
    isHealthy: true,
    recommendation: 'Good energy source but choose brown rice for better nutrition. Limit portions if diabetic.',
    healthWarnings: ['High glycemic index - may spike blood sugar'],
    healthBenefits: ['Quick energy source', 'Easy to digest', 'Gluten-free'],
    suitableFor: ['athletes', 'post-workout meals', 'gluten sensitivity'],
    avoidIf: ['diabetes (large portions)', 'weight loss goals'],
    alternatives: ['brown rice', 'quinoa', 'cauliflower rice'],
    bestTimeToEat: 'Post-workout, lunch',
    portionControl: '1/2 to 1 cup cooked per meal'
  }
};

const mockRecipes = [
  {
    recipeName: 'Healthy Chicken and Vegetable Stir-fry',
    description: 'A nutritious and flavorful stir-fry perfect for a balanced meal',
    ingredients: [
      { name: 'Chicken breast', amount: '200g', notes: 'Cut into strips' },
      { name: 'Broccoli', amount: '1 cup', notes: 'Cut into florets' },
      { name: 'Bell peppers', amount: '1 medium', notes: 'Sliced' },
      { name: 'Olive oil', amount: '1 tbsp', notes: 'For cooking' },
      { name: 'Garlic', amount: '2 cloves', notes: 'Minced' },
      { name: 'Low-sodium soy sauce', amount: '2 tbsp', notes: 'For flavor' }
    ],
    instructions: [
      'Heat olive oil in a large pan over medium-high heat',
      'Add chicken strips and cook until golden brown (5-6 minutes)',
      'Add garlic and cook for 30 seconds until fragrant',
      'Add broccoli and bell peppers, stir-fry for 3-4 minutes',
      'Add soy sauce and stir to combine',
      'Cook for another 2 minutes until vegetables are tender-crisp',
      'Serve immediately over brown rice or quinoa'
    ],
    cookingTime: '15 minutes',
    prepTime: '10 minutes',
    servings: 2,
    difficulty: 'Easy',
    nutritionInfo: {
      calories: '285 per serving',
      protein: '32g',
      carbs: '12g',
      fat: '12g',
      fiber: '4g'
    },
    healthBenefits: ['High protein', 'Rich in vitamins', 'Low carb', 'Heart healthy'],
    suitableFor: ['diabetes', 'weight loss', 'muscle building', 'heart health'],
    tags: ['healthy', 'quick', 'high-protein', 'low-carb'],
    tips: ['Don\'t overcook vegetables to retain nutrients', 'Can substitute chicken with tofu for vegetarian option']
  }
];

// Mock food analysis by name
const analyzeFoodByName = async (foodName, healthConditions = []) => {
  console.log('🔄 Using mock food analysis for:', foodName);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const normalizedName = foodName.toLowerCase().trim();
  let foodData = mockFoodDatabase[normalizedName];
  
  if (!foodData) {
    // Generate generic response for unknown foods
    foodData = {
      foodName: foodName,
      calories: '200-300 per serving',
      nutritionFacts: {
        protein: '10-15g',
        carbs: '20-30g',
        fat: '5-10g',
        fiber: '2-5g',
        sugar: '5-15g',
        sodium: '100-300mg'
      },
      servingSize: '1 serving',
      healthScore: 7,
      isHealthy: true,
      recommendation: `${foodName} can be part of a balanced diet. Consider portion sizes and preparation methods.`,
      healthWarnings: ['Monitor portions based on your health goals'],
      healthBenefits: ['Provides essential nutrients'],
      suitableFor: ['general health'],
      avoidIf: [],
      alternatives: ['similar foods with better nutritional profiles'],
      bestTimeToEat: 'As part of balanced meals',
      portionControl: 'Follow standard serving sizes'
    };
  }
  
  // Customize recommendations based on health conditions
  if (healthConditions.includes('diabetes')) {
    foodData.recommendation += ' Monitor blood sugar levels after consumption.';
    if (parseInt(foodData.nutritionFacts.carbs) > 20) {
      foodData.healthWarnings.push('High in carbohydrates - monitor blood glucose');
    }
  }
  
  if (healthConditions.includes('hypertension')) {
    if (parseInt(foodData.nutritionFacts.sodium.replace('mg', '')) > 200) {
      foodData.healthWarnings.push('High sodium content - limit if you have high blood pressure');
    }
  }
  
  console.log('✅ Mock food analysis completed for:', foodName);
  return foodData;
};

// Mock food image analysis
const analyzeFoodImage = async (imageFile, healthConditions = []) => {
  console.log('🔄 Using mock food image analysis');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return a generic healthy food analysis
  const mockImageAnalysis = {
    foodName: 'Mixed Salad Bowl',
    calories: '150 per serving',
    nutritionFacts: {
      protein: '8g',
      carbs: '15g',
      fat: '7g',
      fiber: '6g',
      sugar: '8g',
      sodium: '120mg'
    },
    servingSize: '1 bowl (200g)',
    healthScore: 9,
    isHealthy: true,
    recommendation: 'Excellent choice! This appears to be a nutritious meal with good balance of nutrients.',
    healthWarnings: [],
    healthBenefits: ['High in fiber', 'Rich in vitamins', 'Low calorie', 'Antioxidant rich'],
    suitableFor: ['weight loss', 'diabetes', 'heart health', 'general wellness'],
    avoidIf: [],
    alternatives: [],
    bestTimeToEat: 'Lunch or dinner',
    portionControl: '1-2 bowls per meal'
  };
  
  // Customize based on health conditions
  if (healthConditions.includes('diabetes')) {
    mockImageAnalysis.recommendation += ' Great choice for blood sugar management.';
  }
  
  console.log('✅ Mock food image analysis completed');
  return mockImageAnalysis;
};

// Mock recipe generation
const generateHealthyRecipe = async (ingredients, healthConditions = [], dietaryPreferences = {}) => {
  console.log('🔄 Using mock recipe generation for ingredients:', ingredients);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return a customized version of the mock recipe
  let recipe = { ...mockRecipes[0] };
  
  // Customize based on ingredients
  if (Array.isArray(ingredients) && ingredients.length > 0) {
    recipe.recipeName = `Healthy ${ingredients.join(' and ')} Recipe`;
    recipe.description = `A nutritious recipe featuring ${ingredients.join(', ')}`;
  }
  
  // Customize based on health conditions
  if (healthConditions.includes('diabetes')) {
    recipe.tips.push('This recipe is diabetes-friendly with controlled carbohydrates');
    recipe.suitableFor.push('diabetes management');
  }
  
  if (healthConditions.includes('hypertension')) {
    recipe.tips.push('Low sodium recipe suitable for blood pressure management');
  }
  
  console.log('✅ Mock recipe generation completed');
  return recipe;
};

// Mock multiple recipe generation
const generateRecipeFromIngredients = async (ingredients, healthConditions = [], dietType = 'vegetarian') => {
  console.log('🔄 Using mock multiple recipe generation');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate multiple recipe variations
  const recipes = [
    {
      recipeName: `${dietType} ${ingredients} Bowl`,
      cookingTime: '20 minutes',
      difficulty: 'Easy',
      servings: '2-3',
      calories: '300-400 per serving',
      healthScore: 8,
      ingredients: [
        { item: ingredients, amount: 'As needed', notes: 'Fresh preferred' }
      ],
      instructions: [
        'Prepare all ingredients according to your preference',
        'Combine in a nutritious and balanced way',
        'Season with healthy herbs and spices',
        'Serve immediately for best taste'
      ],
      nutritionFacts: {
        protein: '15-20g',
        carbs: '25-35g',
        fat: '10-15g',
        fiber: '5-8g',
        sugar: '5-10g',
        sodium: '200-400mg'
      },
      healthBenefits: ['Balanced nutrition', 'Fresh ingredients', 'Customizable'],
      suitableFor: healthConditions.length > 0 ? healthConditions : ['general health'],
      modifications: {
        diabetes: 'Reduce carbs, add more fiber and protein',
        hypertension: 'Reduce sodium, add potassium-rich foods',
        pcos: 'Add anti-inflammatory spices like turmeric'
      },
      tips: ['Adjust portions based on your needs', 'Add variety with different vegetables']
    }
  ];
  
  console.log('✅ Mock multiple recipe generation completed');
  return recipes;
};

module.exports = {
  analyzeFoodByName,
  analyzeFoodImage,
  generateHealthyRecipe,
  generateRecipeFromIngredients
};