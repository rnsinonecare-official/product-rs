import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { searchRecipesByIngredients } from '../../services/apiService';
import { generateHealthyRecipe, generateHealthRecommendations } from '../../services/geminiService';
import { useHealthData } from '../../context/HealthDataContext';
import {
  ChefHat,
  Clock,
  Users,
  Flame,
  Star,
  Heart,
  Leaf,
  Beef,
  Search,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Timer,
  Target,
  Brain,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '../../firebase/config';
import dailyIntakeService from '../../services/dailyIntakeService';

const RecipeGenerator = () => {
  const { userProfile } = useUser();
  const { addFoodEntry } = useHealthData();
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [searchIngredient, setSearchIngredient] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [aiRecipe, setAiRecipe] = useState(null);
  const [showAiRecipeModal, setShowAiRecipeModal] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [healthRecommendations, setHealthRecommendations] = useState(null);
  const [showHealthRecommendations, setShowHealthRecommendations] = useState(false);
  const [isGeneratingHealthRecs, setIsGeneratingHealthRecs] = useState(false);

  // Mock ingredients database
  const mockIngredients = useMemo(() => [
    { id: 1, name: 'Tomato', category: 'vegetables', type: 'vegetarian' },
    { id: 2, name: 'Paneer', category: 'dairy', type: 'vegetarian' },
    { id: 3, name: 'Rice', category: 'grains', type: 'vegetarian' },
    { id: 4, name: 'Chicken', category: 'meat', type: 'non-vegetarian' },
    { id: 5, name: 'Onion', category: 'vegetables', type: 'vegetarian' },
    { id: 6, name: 'Garlic', category: 'vegetables', type: 'vegetarian' },
    { id: 7, name: 'Spinach', category: 'vegetables', type: 'vegetarian' },
    { id: 8, name: 'Lentils', category: 'legumes', type: 'vegetarian' },
    { id: 9, name: 'Potato', category: 'vegetables', type: 'vegetarian' },
    { id: 10, name: 'Fish', category: 'meat', type: 'non-vegetarian' },
    { id: 11, name: 'Yogurt', category: 'dairy', type: 'vegetarian' },
    { id: 12, name: 'Bell Pepper', category: 'vegetables', type: 'vegetarian' },
    { id: 13, name: 'Ginger', category: 'spices', type: 'vegetarian' },
    { id: 14, name: 'Cumin', category: 'spices', type: 'vegetarian' },
    { id: 15, name: 'Coconut', category: 'fruits', type: 'vegetarian' },
    { id: 16, name: 'Eggs', category: 'dairy', type: 'non-vegetarian' },
    { id: 17, name: 'Quinoa', category: 'grains', type: 'vegetarian' },
    { id: 18, name: 'Almonds', category: 'nuts', type: 'vegetarian' },
    { id: 19, name: 'Avocado', category: 'fruits', type: 'vegetarian' },
    { id: 20, name: 'Sweet Potato', category: 'vegetables', type: 'vegetarian' }
  ], []);

  // Mock recipes database
  const mockRecipes = [
    {
      id: 1,
      name: 'Paneer Butter Masala',
      ingredients: ['Paneer', 'Tomato', 'Onion', 'Garlic', 'Ginger'],
      cookingTime: 30,
      servings: 4,
      difficulty: 'Medium',
      calories: 320,
      protein: 18,
      carbs: 12,
      fat: 24,
      type: 'vegetarian',
      healthTags: ['High Protein', 'PCOS Friendly'],
      image: '/api/placeholder/300/200',
      instructions: [
        'Cut paneer into cubes and set aside',
        'Blend tomatoes, onion, garlic, and ginger into a smooth paste',
        'Heat oil in a pan and cook the paste until fragrant',
        'Add spices and cook for 2 minutes',
        'Add paneer cubes and simmer for 10 minutes',
        'Garnish with fresh herbs and serve hot'
      ],
      nutrition: {
        fiber: 4,
        sugar: 8,
        sodium: 580
      },
      warnings: [],
      benefits: ['High in protein', 'Rich in calcium', 'Good for muscle building']
    },
    {
      id: 2,
      name: 'Quinoa Salad Bowl',
      ingredients: ['Quinoa', 'Avocado', 'Bell Pepper', 'Tomato', 'Spinach'],
      cookingTime: 20,
      servings: 2,
      difficulty: 'Easy',
      calories: 280,
      protein: 12,
      carbs: 35,
      fat: 14,
      type: 'vegetarian',
      healthTags: ['Low Carb', 'High Fiber', 'PCOD Friendly'],
      image: '/api/placeholder/300/200',
      instructions: [
        'Cook quinoa according to package instructions',
        'Chop all vegetables into bite-sized pieces',
        'Mix quinoa with vegetables in a large bowl',
        'Prepare dressing with olive oil and lemon',
        'Toss salad with dressing and serve'
      ],
      nutrition: {
        fiber: 8,
        sugar: 6,
        sodium: 240
      },
      warnings: [],
      benefits: ['Complete protein', 'High fiber', 'Heart healthy']
    },
    {
      id: 3,
      name: 'Chicken Curry',
      ingredients: ['Chicken', 'Onion', 'Tomato', 'Garlic', 'Ginger', 'Coconut'],
      cookingTime: 45,
      servings: 4,
      difficulty: 'Medium',
      calories: 380,
      protein: 35,
      carbs: 8,
      fat: 22,
      type: 'non-vegetarian',
      healthTags: ['High Protein', 'Keto Friendly'],
      image: '/api/placeholder/300/200',
      instructions: [
        'Marinate chicken pieces with spices',
        'Sauté onions until golden brown',
        'Add ginger-garlic paste and cook',
        'Add tomatoes and cook until soft',
        'Add chicken and cook until done',
        'Finish with coconut milk and simmer'
      ],
      nutrition: {
        fiber: 3,
        sugar: 5,
        sodium: 720
      },
      warnings: userProfile?.healthConditions?.includes('hypertension') ? ['High sodium content'] : [],
      benefits: ['High protein', 'Rich in selenium', 'Immune boosting']
    },
    {
      id: 4,
      name: 'Lentil Dal',
      ingredients: ['Lentils', 'Onion', 'Tomato', 'Garlic', 'Ginger', 'Cumin'],
      cookingTime: 25,
      servings: 4,
      difficulty: 'Easy',
      calories: 220,
      protein: 16,
      carbs: 35,
      fat: 2,
      type: 'vegetarian',
      healthTags: ['High Protein', 'Low Fat', 'Diabetes Friendly'],
      image: '/api/placeholder/300/200',
      instructions: [
        'Wash and sort lentils',
        'Cook lentils in water until soft',
        'In another pan, sauté onions and spices',
        'Add tomatoes and cook until mushy',
        'Combine with cooked lentils',
        'Simmer and adjust consistency'
      ],
      nutrition: {
        fiber: 12,
        sugar: 4,
        sodium: 320
      },
      warnings: [],
      benefits: ['High fiber', 'Plant protein', 'Iron rich']
    },
    {
      id: 5,
      name: 'Sweet Potato Baked',
      ingredients: ['Sweet Potato', 'Olive Oil', 'Garlic', 'Spinach'],
      cookingTime: 40,
      servings: 2,
      difficulty: 'Easy',
      calories: 180,
      protein: 4,
      carbs: 42,
      fat: 0.2,
      type: 'vegetarian',
      healthTags: ['Low Fat', 'High Fiber', 'Antioxidant Rich'],
      image: '/api/placeholder/300/200',
      instructions: [
        'Preheat oven to 400°F',
        'Pierce sweet potatoes with fork',
        'Bake for 35-40 minutes until tender',
        'Sauté garlic and spinach',
        'Stuff sweet potatoes with spinach mixture',
        'Serve hot with yogurt'
      ],
      nutrition: {
        fiber: 6,
        sugar: 12,
        sodium: 180
      },
      warnings: userProfile?.healthConditions?.includes('diabetes') ? ['Natural sugars - monitor portion'] : [],
      benefits: ['Beta carotene', 'Vitamin A', 'Potassium rich']
    }
  ];

  useEffect(() => {
    // Filter ingredients based on user's diet type
    const filtered = mockIngredients.filter(ingredient => {
      if (userProfile?.dietType === 'vegetarian') {
        return ingredient.type === 'vegetarian';
      }
      return true; // Show all for non-vegetarian users
    });
    setAvailableIngredients(filtered);
  }, [userProfile, mockIngredients]);

  const handleIngredientSearch = (searchTerm) => {
    setSearchIngredient(searchTerm);
    if (searchTerm.length > 2) {
      const filtered = mockIngredients.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedIngredients.find(selected => selected.id === ingredient.id)
      );
      setAvailableIngredients(filtered);
    } else {
      setAvailableIngredients([]);
    }
  };

  const addIngredient = (ingredient) => {
    if (!selectedIngredients.find(item => item.id === ingredient.id)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
      setSearchIngredient('');
      setAvailableIngredients([]);
      toast.success(`Added "${ingredient.name}" to your ingredients!`);
    }
  };

  // Add custom ingredient
  const addCustomIngredient = () => {
    const customName = searchIngredient.trim();
    if (customName && !selectedIngredients.find(ing => ing.name.toLowerCase() === customName.toLowerCase())) {
      const customIngredient = {
        id: Date.now(),
        name: customName,
        category: 'custom',
        type: 'unknown'
      };
      setSelectedIngredients([...selectedIngredients, customIngredient]);
      setSearchIngredient('');
      setAvailableIngredients([]);
      toast.success(`Added "${customName}" to your ingredients!`);
    }
  };

  // Handle Enter key for adding custom ingredients
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchIngredient.trim()) {
      addCustomIngredient();
    }
  };

  const removeIngredient = (ingredientId) => {
    setSelectedIngredients(selectedIngredients.filter(item => item.id !== ingredientId));
  };

  const generateRecipes = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Please select at least one ingredient');
      return;
    }

    setIsLoading(true);

    try {
      // Use Gemini AI for recipe generation instead of external APIs
      const ingredientNames = selectedIngredients.map(ing => ing.name);
      const healthConditions = userProfile?.healthConditions || [];
      const dietaryPreferences = {
        vegetarian: userProfile?.dietType === 'vegetarian',
        vegan: userProfile?.dietType === 'vegan',
        glutenFree: userProfile?.allergies?.includes('gluten'),
        dairyFree: userProfile?.allergies?.includes('dairy'),
        lowSodium: healthConditions.includes('hypertension'),
        lowSugar: healthConditions.includes('diabetes'),
        antiInflammatory: healthConditions.includes('pcos') || healthConditions.includes('pcod'),
      };

      console.log('Generating AI recipes with ingredients:', ingredientNames);
      console.log('Health conditions:', healthConditions);
      
      toast.loading('AI is creating recipes for you...', { id: 'recipe-generation' });
      
      // Generate multiple recipes using AI
      const recipePromises = [];
      for (let i = 0; i < 3; i++) {
        recipePromises.push(generateHealthyRecipe(ingredientNames, healthConditions, dietaryPreferences));
      }
      
      const aiRecipes = await Promise.all(recipePromises);
      
      toast.dismiss('recipe-generation');

      // Transform AI results to match our component format
      const transformedRecipes = aiRecipes.filter(recipe => recipe).map((recipe, index) => ({
        id: `ai_recipe_${Date.now()}_${index}`,
        name: recipe.recipeName,
        image: '/api/placeholder/300/200',
        time: parseInt(recipe.cookingTime) || 30,
        difficulty: recipe.difficulty || 'Medium',
        rating: recipe.healthScore ? Math.round(recipe.healthScore / 2) : 4,
        servings: parseInt(recipe.servings) || 2,
        type: userProfile?.dietType || 'vegetarian',
        calories: parseInt(recipe.calories) || 0,
        ingredients: recipe.ingredients?.map(ing => typeof ing === 'string' ? ing : ing.item) || [],
        instructions: recipe.instructions || [],
        healthTags: recipe.healthBenefits || [],
        healthScore: recipe.healthScore || 75,
        usedIngredients: selectedIngredients.length,
        missedIngredients: 0,
        nutrition: {
          protein: recipe.nutritionFacts?.protein || '0g',
          carbs: recipe.nutritionFacts?.carbs || '0g',
          fat: recipe.nutritionFacts?.fat || '0g',
          fiber: recipe.nutritionFacts?.fiber || '0g'
        },
        isAiGenerated: true,
        aiData: recipe
      }));

      // Filter by diet compatibility
      const compatibleRecipes = transformedRecipes.filter(recipe => {
        if (userProfile?.dietType === 'vegetarian') {
          return recipe.type === 'vegetarian';
        }
        return true;
      });

      // Sort by ingredient match score
      compatibleRecipes.sort((a, b) => b.usedIngredients - a.usedIngredients);

      setRecipes(compatibleRecipes);
      setFilteredRecipes(compatibleRecipes);
      
      if (compatibleRecipes.length === 0) {
        toast.error('No recipes found with your selected ingredients. Try different ingredients!');
      } else {
        toast.success(`Found ${compatibleRecipes.length} recipe${compatibleRecipes.length > 1 ? 's' : ''}!`);
      }
    } catch (error) {
      toast.dismiss('recipe-generation');
      console.error('AI Recipe generation error:', error);
      
      // Better error handling for AI service
      if (error.message.includes('API key')) {
        toast.error('AI service configuration error. Please check setup.');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(`Error generating recipes: ${error.message}`);
      }
      
      setRecipes([]);
      setFilteredRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // AI-powered recipe generation
  const generateAiRecipe = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Please select at least one ingredient');
      return;
    }

    setIsGeneratingAi(true);

    try {
      // Get user's health conditions and dietary preferences
      const healthConditions = userProfile?.healthConditions || [];
      const dietaryPreferences = {
        vegetarian: userProfile?.dietType === 'vegetarian',
        vegan: userProfile?.dietType === 'vegan',
        glutenFree: userProfile?.allergies?.includes('gluten'),
        dairyFree: userProfile?.allergies?.includes('dairy'),
        lowSodium: healthConditions.includes('hypertension'),
        lowSugar: healthConditions.includes('diabetes'),
        antiInflammatory: healthConditions.includes('pcos') || healthConditions.includes('pcod'),
      };

      console.log('Generating AI recipe with ingredients:', selectedIngredients);
      console.log('User health conditions:', healthConditions);
      console.log('Dietary preferences:', dietaryPreferences);
      
      toast.loading('AI is creating a personalized recipe...', { id: 'ai-recipe' });

      const ingredientNames = selectedIngredients.map(ing => ing.name);
      const result = await generateHealthyRecipe(ingredientNames, healthConditions, dietaryPreferences);

      console.log('AI recipe result:', result);
      
      toast.dismiss('ai-recipe');

      if (result) {
        setAiRecipe(result);
        setShowAiRecipeModal(true);
        toast.success(`AI created a healthy recipe: ${result.recipeName}!`);
      } else {
        toast.error('Could not generate recipe');
      }
    } catch (error) {
      toast.dismiss('ai-recipe');
      console.error('AI Recipe generation error:', error);
      
      // Better error handling
      if (error.message.includes('API key')) {
        toast.error('AI service configuration error. Please check setup.');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(`Error generating recipe: ${error.message}`);
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Add AI recipe to daily intake
  const addAiRecipeToIntake = async () => {
    if (!aiRecipe) {
      toast.error('No recipe data available');
      return;
    }

    try {
      toast.loading('Adding recipe to daily intake...', { id: 'add-recipe' });

      // Check authentication first
      if (!auth.currentUser) {
        toast.dismiss('add-recipe');
        toast.error('Please log in to add recipes to your daily intake');
        return;
      }

      console.log('Adding recipe to intake:', aiRecipe.recipeName);

      // Format recipe data for Firestore storage
      const recipeData = {
        name: aiRecipe.recipeName,
        calories: parseInt(aiRecipe.calories) || 0,
        protein: parseFloat(aiRecipe.nutritionFacts?.protein) || 0,
        carbs: parseFloat(aiRecipe.nutritionFacts?.carbs) || 0,
        fat: parseFloat(aiRecipe.nutritionFacts?.fat) || 0,
        fiber: parseFloat(aiRecipe.nutritionFacts?.fiber) || 0,
        serving_size: `${aiRecipe.servings || 1} servings`,
        analysis_type: 'ai_recipe',
        health_score: aiRecipe.healthScore || 7,
        recommendations: aiRecipe.healthBenefits?.join(', ') || 'Nutritious recipe',
        metadata: {
          isHealthy: aiRecipe.healthScore >= 7,
          healthWarnings: aiRecipe.healthWarnings || [],
          healthBenefits: aiRecipe.healthBenefits || [],
          recipe_data: aiRecipe,
          ingredients: aiRecipe.ingredients || [],
          instructions: aiRecipe.instructions || [],
          cookingTime: aiRecipe.cookingTime || 0,
          difficulty: aiRecipe.difficulty || 'Medium',
          addedAt: new Date().toISOString()
        }
      };

      // Add to Firestore daily intake
      await dailyIntakeService.addFoodEntry(recipeData);
      console.log('Recipe added to Firestore successfully');

      // Also add to regular health data context for immediate UI update
      try {
        const foodEntry = {
          name: aiRecipe.recipeName,
          calories: parseInt(aiRecipe.calories) || 0,
          protein: parseFloat(aiRecipe.nutritionFacts?.protein) || 0,
          carbs: parseFloat(aiRecipe.nutritionFacts?.carbs) || 0,
          fat: parseFloat(aiRecipe.nutritionFacts?.fat) || 0,
          serving_size: `${aiRecipe.servings || 1} servings`,
          analysis_type: 'ai_recipe',
          health_score: aiRecipe.healthScore || 7,
          recipe_data: aiRecipe,
          isTemporary: true
        };

        await addFoodEntry(foodEntry);
        console.log('Recipe added to health data context');
      } catch (contextError) {
        console.warn('Failed to add to health data context:', contextError);
        // Don't fail the whole operation if context update fails
      }

      toast.dismiss('add-recipe');
      toast.success(`${aiRecipe.recipeName} added to your daily intake! 🍽️`);
      setShowAiRecipeModal(false);
    } catch (error) {
      toast.dismiss('add-recipe');
      console.error('Error adding AI recipe:', error);
      
      // Provide specific error messages
      if (error.message.includes('not authenticated')) {
        toast.error('Please log in to add recipes to your daily intake');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.message.includes('server')) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(`Error adding recipe: ${error.message}`);
      }
    }
  };

  // Helper functions for recipe transformation
  const getDifficulty = (readyInMinutes) => {
    if (readyInMinutes <= 20) return 'Easy';
    if (readyInMinutes <= 45) return 'Medium';
    return 'Hard';
  };

  const determineRecipeType = (recipe) => {
    if (recipe.vegetarian) return 'vegetarian';
    if (recipe.vegan) return 'vegetarian';
    return 'non-vegetarian';
  };

  const estimateCalories = (recipe) => {
    // Simple estimation based on number of ingredients and servings
    const baseCalories = recipe.extendedIngredients?.length * 25 || 200;
    return Math.round(baseCalories / (recipe.servings || 2));
  };

  const generateTags = (recipe) => {
    const tags = [];
    if (recipe.vegetarian) tags.push('Vegetarian');
    if (recipe.vegan) tags.push('Vegan');
    if (recipe.glutenFree) tags.push('Gluten-Free');
    if (recipe.dairyFree) tags.push('Dairy-Free');
    if (recipe.healthScore > 80) tags.push('Healthy');
    if (recipe.readyInMinutes <= 30) tags.push('Quick');
    return tags;
  };

  const filterRecipes = (filter) => {
    setActiveFilter(filter);
    
    let filtered = [...recipes];
    
    switch (filter) {
      case 'quick':
        filtered = recipes.filter(recipe => recipe.cookingTime <= 30);
        break;
      case 'healthy':
        filtered = recipes.filter(recipe => 
          recipe.healthTags.some(tag => 
            tag.includes('Friendly') || tag.includes('Low') || tag.includes('High Fiber')
          )
        );
        break;
      case 'high-protein':
        filtered = recipes.filter(recipe => recipe.protein >= 15);
        break;
      case 'vegetarian':
        filtered = recipes.filter(recipe => recipe.type === 'vegetarian');
        break;
      default:
        filtered = recipes;
    }
    
    setFilteredRecipes(filtered);
  };

  const getFilteredIngredients = () => {
    return availableIngredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(searchIngredient.toLowerCase()) &&
      !selectedIngredients.find(selected => selected.id === ingredient.id)
    );
  };

  // Generate health-focused recipe recommendations
  const generateHealthRecipes = async () => {
    setIsGeneratingHealthRecs(true);
    
    try {
      const healthConditions = userProfile?.healthConditions || [];
      const dietaryPreferences = {
        vegetarian: userProfile?.dietType === 'vegetarian',
        vegan: userProfile?.dietType === 'vegan',
        glutenFree: userProfile?.allergies?.includes('gluten'),
        dairyFree: userProfile?.allergies?.includes('dairy'),
        lowSodium: healthConditions.includes('hypertension'),
        lowSugar: healthConditions.includes('diabetes'),
        antiInflammatory: healthConditions.includes('pcos') || healthConditions.includes('pcod'),
      };

      console.log('Generating health recommendations for:', healthConditions);
      
      toast.loading('AI is creating personalized healthy recipes...', { id: 'health-recs' });

      const result = await generateHealthRecommendations({ 
        healthConditions, 
        dietaryPreferences 
      });

      console.log('Health recommendations result:', result);
      
      toast.dismiss('health-recs');

      if (result) {
        setHealthRecommendations(result);
        setShowHealthRecommendations(true);
        toast.success('Personalized healthy recipes generated!');
      } else {
        toast.error('Could not generate health recommendations');
      }
    } catch (error) {
      toast.dismiss('health-recs');
      console.error('Health recommendations error:', error);
      
      if (error.message.includes('API key')) {
        toast.error('AI service configuration error. Please check setup.');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(`Error generating recommendations: ${error.message}`);
      }
    } finally {
      setIsGeneratingHealthRecs(false);
    }
  };

  const getRecipeCompatibility = (recipe) => {
    const warnings = [...recipe.warnings];
    const benefits = [...recipe.benefits];

    // Add health condition specific warnings
    if (userProfile?.healthConditions?.includes('diabetes')) {
      if (recipe.carbs > 30) warnings.push('High carbohydrate content');
      if (recipe.nutrition.sugar > 10) warnings.push('Contains natural sugars');
    }

    if (userProfile?.healthConditions?.includes('pcos') || userProfile?.healthConditions?.includes('pcod')) {
      if (recipe.carbs > 25) warnings.push('Monitor carb intake for PCOS/PCOD');
      if (recipe.nutrition.sugar > 8) warnings.push('Limit sugar for PCOS/PCOD');
    }

    return { warnings, benefits };
  };

  const handleAddRecipeToLog = async (recipe) => {
    try {
      await addFoodEntry({
        name: recipe.name,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        fiber: recipe.nutrition.fiber,
        sugar: recipe.nutrition.sugar,
        type: recipe.type,
        servingSize: `1 serving (${recipe.servings} total servings)`,
        isRecipe: true
      });
      
      toast.success(`${recipe.name} added to your daily log!`);
      setShowRecipeModal(false);
    } catch (error) {
      toast.error('Error adding recipe to log');
    }
  };

  const RecipeModal = ({ recipe, onClose, onAdd }) => {
    const compatibility = getRecipeCompatibility(recipe);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{recipe.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.cookingTime} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{recipe.servings} servings</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{recipe.difficulty}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Recipe Image */}
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6 flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-gray-400" />
          </div>

          {/* Nutrition Info */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-orange-600">{recipe.calories}</p>
              <p className="text-xs text-gray-600">Calories</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{recipe.protein}g</p>
              <p className="text-xs text-gray-600">Protein</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-xl">
              <p className="text-2xl font-bold text-yellow-600">{recipe.carbs}g</p>
              <p className="text-xs text-gray-600">Carbs</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">{recipe.fat}g</p>
              <p className="text-xs text-gray-600">Fat</p>
            </div>
          </div>

          {/* Health Tags */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Health Benefits</h4>
            <div className="flex flex-wrap gap-2">
              {recipe.healthTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                recipe.type === 'vegetarian' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {recipe.type === 'vegetarian' ? <Leaf className="w-3 h-3" /> : <Beef className="w-3 h-3" />}
                <span className="capitalize">{recipe.type}</span>
              </span>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Ingredients</h4>
            <div className="grid grid-cols-2 gap-2">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${
                    selectedIngredients.find(selected => selected.name === ingredient)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {selectedIngredients.find(selected => selected.name === ingredient) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border border-gray-400 rounded" />
                  )}
                  <span className="text-sm">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Instructions</h4>
            <div className="space-y-3">
              {recipe.instructions.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-sage text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings & Benefits */}
          {compatibility.warnings.length > 0 && (
            <div className="mb-6">
              <h4 className="flex items-center text-red-600 font-medium mb-2">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Health Considerations
              </h4>
              <div className="space-y-2">
                {compatibility.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {compatibility.benefits.length > 0 && (
            <div className="mb-6">
              <h4 className="flex items-center text-green-600 font-medium mb-2">
                <Heart className="w-5 h-5 mr-2" />
                Health Benefits
              </h4>
              <div className="space-y-2">
                {compatibility.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded-xl">
                    <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Log Button */}
          <motion.button
            onClick={() => onAdd(recipe)}
            className="w-full bg-gradient-to-r from-sage to-light-green text-white py-4 rounded-2xl font-medium flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span>Add to Daily Log</span>
          </motion.button>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          What Can I Cook Today?
        </h1>
        <p className="text-gray-600">
          Get personalized recipes based on your available ingredients and health profile
        </p>
      </motion.div>

      {/* Ingredient Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Available Ingredients</h2>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchIngredient}
            onChange={(e) => handleIngredientSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for ingredients or type custom ingredients..."
            className="w-full pl-12 pr-16 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300"
          />
          {searchIngredient && (
            <motion.button
              onClick={addCustomIngredient}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-sage text-white px-3 py-1 rounded-lg text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Search Results */}
        {availableIngredients.length > 0 && (
          <div className="mb-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Ingredients:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableIngredients.slice(0, 6).map(ingredient => (
                <motion.button
                  key={ingredient.id}
                  onClick={() => addIngredient(ingredient)}
                  className="text-left p-2 bg-white rounded-lg border border-gray-200 hover:border-sage hover:bg-sage/5 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm font-medium text-gray-700">{ingredient.name}</span>
                  <span className="text-xs text-gray-500 block">{ingredient.category}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Ingredients:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map(ingredient => (
                <motion.div
                  key={ingredient.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 bg-sage text-white px-3 py-1 rounded-full text-sm"
                >
                  <span>{ingredient.name}</span>
                  <button
                    onClick={() => removeIngredient(ingredient.id)}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Available Ingredients */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {getFilteredIngredients().slice(0, 12).map(ingredient => (
            <motion.button
              key={ingredient.id}
              onClick={() => addIngredient(ingredient)}
              className="flex items-center justify-center p-3 border border-gray-300 rounded-xl hover:border-sage hover:bg-sage/5 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm font-medium text-gray-700">{ingredient.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Generate Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <motion.button
            onClick={generateRecipes}
            disabled={isLoading || selectedIngredients.length === 0}
            className="flex-1 md:flex-none bg-gradient-to-r from-sage to-light-green text-white px-8 py-4 rounded-2xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
            whileHover={{ scale: selectedIngredients.length > 0 ? 1.05 : 1 }}
            whileTap={{ scale: selectedIngredients.length > 0 ? 0.95 : 1 }}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner mr-2" />
                Finding Recipes...
              </>
            ) : (
              <>
                <ChefHat className="w-5 h-5" />
                <span>Find Recipes</span>
              </>
            )}
          </motion.button>

          <motion.button
            onClick={generateAiRecipe}
            disabled={isGeneratingAi || selectedIngredients.length === 0}
            className="flex-1 md:flex-none bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
            whileHover={{ scale: selectedIngredients.length > 0 ? 1.05 : 1 }}
            whileTap={{ scale: selectedIngredients.length > 0 ? 0.95 : 1 }}
          >
            {isGeneratingAi ? (
              <>
                <div className="loading-spinner mr-2" />
                AI Creating...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>AI Recipe</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </motion.button>

          <motion.button
            onClick={generateHealthRecipes}
            disabled={isGeneratingHealthRecs}
            className="flex-1 md:flex-none bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-2xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isGeneratingHealthRecs ? (
              <>
                <div className="loading-spinner mr-2" />
                AI Analyzing...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                <span>Health Recipes</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Recipe Results */}
      {recipes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Recipe Suggestions ({filteredRecipes.length})
            </h2>
            
            <div className="flex items-center space-x-2">
              {[
                { key: 'all', label: 'All', icon: BookOpen },
                { key: 'quick', label: 'Quick', icon: Timer },
                { key: 'healthy', label: 'Healthy', icon: Heart },
                { key: 'high-protein', label: 'High Protein', icon: Target },
                { key: 'vegetarian', label: 'Vegetarian', icon: Leaf }
              ].map(filter => (
                <motion.button
                  key={filter.key}
                  onClick={() => filterRecipes(filter.key)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeFilter === filter.key
                      ? 'bg-sage text-white'
                      : 'text-gray-600 hover:bg-sage/10 hover:text-sage'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <filter.icon className="w-4 h-4" />
                  <span className="hidden md:block">{filter.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => {
              const compatibility = getRecipeCompatibility(recipe);
              const matchingIngredients = selectedIngredients.filter(selected =>
                recipe.ingredients.some(ing => ing.toLowerCase() === selected.name.toLowerCase())
              );
              
              return (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="glass-card p-4 cursor-pointer card-hover"
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setShowRecipeModal(true);
                  }}
                >
                  {/* Recipe Image */}
                  <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
                    <ChefHat className="w-12 h-12 text-gray-400" />
                  </div>

                  {/* Recipe Info */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">{recipe.name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                      recipe.type === 'vegetarian' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {recipe.type === 'vegetarian' ? <Leaf className="w-3 h-3" /> : <Beef className="w-3 h-3" />}
                    </div>
                  </div>

                  {/* Recipe Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.cookingTime} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings} servings</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>{recipe.calories} cal</span>
                    </div>
                  </div>

                  {/* Matching Ingredients */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">
                      Matches {matchingIngredients.length} of your ingredients
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {matchingIngredients.slice(0, 3).map((ingredient, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                        >
                          {ingredient.name}
                        </span>
                      ))}
                      {matchingIngredients.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{matchingIngredients.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Health Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.healthTags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="font-bold text-blue-600">{recipe.protein}g</p>
                      <p className="text-gray-600">Protein</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-yellow-600">{recipe.carbs}g</p>
                      <p className="text-gray-600">Carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-purple-600">{recipe.fat}g</p>
                      <p className="text-gray-600">Fat</p>
                    </div>
                  </div>

                  {/* Warning/Benefit Indicators */}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                    {compatibility.warnings.length > 0 && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs">{compatibility.warnings.length} consideration{compatibility.warnings.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    {compatibility.benefits.length > 0 && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Star className="w-4 h-4" />
                        <span className="text-xs">{compatibility.benefits.length} benefit{compatibility.benefits.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {selectedIngredients.length === 0 && recipes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-sage to-light-green rounded-3xl flex items-center justify-center mx-auto mb-6 floating-animation">
            <ChefHat className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Ready to Cook Something Delicious?
          </h3>
          <p className="text-gray-600 mb-6">
            Select your available ingredients and we'll suggest personalized recipes
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>🥗 Get recipes that match your ingredients</p>
            <p>💚 Health-conscious recommendations based on your profile</p>
            <p>⏱️ Cooking time and difficulty filters</p>
          </div>
        </motion.div>
      )}

      {/* Recipe Modal */}
      <AnimatePresence>
        {showRecipeModal && selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            onClose={() => {
              setShowRecipeModal(false);
              setSelectedRecipe(null);
            }}
            onAdd={handleAddRecipeToLog}
          />
        )}

        {/* AI Recipe Modal */}
        {showAiRecipeModal && aiRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAiRecipeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Brain className="w-6 h-6 mr-2 text-emerald-500" />
                    AI Generated Recipe
                  </h2>
                  <h3 className="text-xl font-semibold text-emerald-600 mt-1">
                    {aiRecipe.recipeName}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAiRecipeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Recipe Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-gray-600">Cook Time</p>
                  <p className="text-lg font-bold text-blue-600">{aiRecipe.cookingTime}</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="text-lg font-bold text-green-600">{aiRecipe.difficulty}</p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm text-gray-600">Servings</p>
                  <p className="text-lg font-bold text-orange-600">{aiRecipe.servings}</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 text-center">
                  <Star className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm text-gray-600">Health Score</p>
                  <p className="text-lg font-bold text-purple-600">{aiRecipe.healthScore}/10</p>
                </div>
              </div>

              {/* Nutrition Facts */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Nutrition per Serving</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <p className="text-sm text-gray-600">Calories</p>
                    <p className="font-bold text-orange-600">{aiRecipe.calories}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-5 h-5 mx-auto mb-1 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Protein</p>
                    <p className="font-bold text-blue-600">{aiRecipe.nutritionFacts.protein}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-5 h-5 mx-auto mb-1 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Carbs</p>
                    <p className="font-bold text-green-600">{aiRecipe.nutritionFacts.carbs}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-5 h-5 mx-auto mb-1 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Fat</p>
                    <p className="font-bold text-yellow-600">{aiRecipe.nutritionFacts.fat}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-5 h-5 mx-auto mb-1 bg-purple-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Fiber</p>
                    <p className="font-bold text-purple-600">{aiRecipe.nutritionFacts.fiber}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-5 h-5 mx-auto mb-1 bg-red-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Sodium</p>
                    <p className="font-bold text-red-600">{aiRecipe.nutritionFacts.sodium}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Ingredients */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Ingredients
                  </h4>
                  <div className="space-y-2">
                    {aiRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{ingredient.item}</span>
                        <span className="text-sm text-gray-500 font-medium">{ingredient.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Timer className="w-5 h-5 mr-2" />
                    Instructions
                  </h4>
                  <div className="space-y-3">
                    {aiRecipe.instructions.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Health Benefits */}
              {aiRecipe.healthBenefits && aiRecipe.healthBenefits.length > 0 && (
                <div className="mt-6 bg-green-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Health Benefits
                  </h4>
                  <ul className="text-green-700 space-y-1">
                    {aiRecipe.healthBenefits.map((benefit, index) => (
                      <li key={index} className="text-sm">• {benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Health Condition Modifications */}
              {aiRecipe.modifications && (
                <div className="mt-6 bg-blue-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Health-Specific Modifications</h4>
                  <div className="space-y-2">
                    {Object.entries(aiRecipe.modifications).map(([condition, modification]) => (
                      modification && (
                        <div key={condition} className="text-sm">
                          <span className="font-medium text-blue-700 capitalize">{condition}: </span>
                          <span className="text-blue-600">{modification}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {aiRecipe.tips && aiRecipe.tips.length > 0 && (
                <div className="mt-6 bg-yellow-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Cooking Tips</h4>
                  <ul className="text-yellow-700 space-y-1">
                    {aiRecipe.tips.map((tip, index) => (
                      <li key={index} className="text-sm">💡 {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={addAiRecipeToIntake}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Add to Daily Intake
                </button>
                <button
                  onClick={() => setShowAiRecipeModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Health Recommendations Modal */}
        {showHealthRecommendations && healthRecommendations && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowHealthRecommendations(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Heart className="w-6 h-6 mr-2 text-rose-500" />
                    Personalized Health Recipes
                  </h2>
                  <p className="text-gray-600 mt-1">AI-curated recipes for your health goals</p>
                </div>
                <button
                  onClick={() => setShowHealthRecommendations(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Recommendations */}
              <div className="space-y-6">
                {healthRecommendations.recommendations?.map((recipe, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{recipe.recipeName}</h3>
                        <p className="text-gray-600 mt-1">{recipe.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {recipe.cookingTime}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {recipe.servings}
                          </span>
                          <span className="flex items-center">
                            <Flame className="w-4 h-4 mr-1" />
                            {recipe.calories}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-medium">
                          Health Score: {recipe.healthScore}/10
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                          {recipe.mealType}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Main Ingredients</h4>
                        <div className="flex flex-wrap gap-1">
                          {recipe.mainIngredients?.map((ingredient, i) => (
                            <span key={i} className="bg-white text-gray-700 px-2 py-1 rounded-lg text-sm">
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Key Benefits</h4>
                        <div className="flex flex-wrap gap-1">
                          {recipe.keyNutrients?.map((nutrient, i) => (
                            <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm">
                              {nutrient}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-white rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-2">Why This Recipe?</h4>
                      <p className="text-gray-700 text-sm">{recipe.whyRecommended}</p>
                    </div>

                    <div className="mt-4 p-4 bg-emerald-50 rounded-xl">
                      <h4 className="font-semibold text-emerald-800 mb-2">Perfect For</h4>
                      <div className="flex flex-wrap gap-2">
                        {recipe.suitableFor?.map((condition, i) => (
                          <span key={i} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-sm">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* General Tips */}
              {healthRecommendations.generalTips && (
                <div className="mt-6 bg-blue-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">General Cooking Tips</h4>
                  <ul className="text-blue-700 space-y-1">
                    {healthRecommendations.generalTips.map((tip, index) => (
                      <li key={index} className="text-sm">💡 {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Beneficial Ingredients */}
              {healthRecommendations.beneficialIngredients && (
                <div className="mt-6 bg-green-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-green-800 mb-3">Recommended Ingredients</h4>
                  <div className="flex flex-wrap gap-2">
                    {healthRecommendations.beneficialIngredients.map((ingredient, index) => (
                      <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients to Avoid */}
              {healthRecommendations.ingredientsToAvoid && (
                <div className="mt-6 bg-red-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-red-800 mb-3">Ingredients to Limit</h4>
                  <div className="flex flex-wrap gap-2">
                    {healthRecommendations.ingredientsToAvoid.map((ingredient, index) => (
                      <span key={index} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowHealthRecommendations(false)}
                  className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Close Recommendations
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecipeGenerator;