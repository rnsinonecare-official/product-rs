// Test the improved AI service to show variety in responses
const improvedAI = require('./src/services/improvedAIService');

async function testVariety() {
  console.log('🧪 Testing Recipe and Diet Plan Variety\n');
  
  // Test 1: Generate 3 different recipes with same ingredients
  console.log('🍳 RECIPE VARIETY TEST');
  console.log('===================');
  
  const ingredients = ['chicken', 'broccoli', 'rice'];
  const healthConditions = ['diabetes'];
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n📝 Recipe ${i}:`);
    try {
      const recipe = await improvedAI.generateVariedRecipe(ingredients, healthConditions, 'non-vegetarian');
      console.log(`Name: ${recipe.recipeName}`);
      console.log(`Style: ${recipe.cuisineStyle}`);
      console.log(`Method: ${recipe.cookingMethod}`);
      console.log(`Twist: ${recipe.uniqueTwist}`);
      console.log(`Inspiration: ${recipe.inspiration}`);
      console.log(`Variation ID: ${recipe.generationMetadata?.variationId}`);
    } catch (error) {
      console.log(`❌ Recipe ${i} failed:`, error.message);
    }
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Test 2: Generate 3 different diet plans for same user
  console.log('\n\n📋 DIET PLAN VARIETY TEST');
  console.log('========================');
  
  const userProfile = {
    healthConditions: ['diabetes'],
    dietType: 'vegetarian',
    age: 30,
    activityLevel: 'moderate',
    goals: ['weight management']
  };
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n📅 Diet Plan ${i}:`);
    try {
      const dietPlan = await improvedAI.generateVariedDietPlan(userProfile, []);
      console.log(`Theme: ${dietPlan.planTheme}`);
      console.log(`Cuisine Journey: ${dietPlan.cuisineJourney}`);
      console.log(`Discovery Food: ${dietPlan.discoveryFood}`);
      console.log(`Seasonal Highlight: ${dietPlan.seasonalHighlight}`);
      console.log(`Breakfast Style: ${dietPlan.meals?.breakfast?.cuisineStyle}`);
      console.log(`Lunch Style: ${dietPlan.meals?.lunch?.cuisineStyle}`);
      console.log(`Dinner Style: ${dietPlan.meals?.dinner?.cuisineStyle}`);
      console.log(`Variation ID: ${dietPlan.generationMetadata?.variationId}`);
    } catch (error) {
      console.log(`❌ Diet Plan ${i} failed:`, error.message);
    }
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n✅ Variety test completed!');
  console.log('\n💡 Key Improvements:');
  console.log('- Dynamic cuisine styles and cooking methods');
  console.log('- Seasonal ingredient rotation');
  console.log('- Unique timestamps for variation');
  console.log('- Cultural context and inspiration');
  console.log('- Meal history awareness');
  console.log('- Creative constraints for uniqueness');
}

testVariety().catch(console.error);