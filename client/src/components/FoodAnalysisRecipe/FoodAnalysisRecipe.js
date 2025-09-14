import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  // Upload, 
  Zap, 
  ChefHat, 
  Clock, 
  Users,
  Star,
  Heart,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Utensils,
  Leaf,
  Target
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';

const FoodAnalysisRecipe = () => {
  const { userProfile } = useUser();
  const [activeTab, setActiveTab] = useState('analysis');
  const [imagePreview, setImagePreview] = useState(null);
  const [ingredients, setIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recipes, setRecipes] = useState([]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up any ongoing operations when component unmounts
      setIsAnalyzing(false);
    };
  }, []);

  // Function to clear form and reset state
  const clearForm = () => {
    setImagePreview(null);
    setIngredients('');
    setAnalysisResult(null);
    setRecipes([]);
    // Reset file input
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.onerror = () => {
        toast.error('Error reading the image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!imagePreview && !ingredients.trim()) {
      toast.error('Please upload an image or enter ingredients');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => {
        setTimeout(() => {
          // Process ingredients properly
          let processedIngredients;
          if (ingredients.trim()) {
            processedIngredients = ingredients.split(',').map(i => i.trim()).filter(i => i);
          } else {
            // Default ingredients when only image is provided
            processedIngredients = ['Quinoa', 'Avocado', 'Chickpeas', 'Spinach', 'Olive Oil'];
          }

          const mockAnalysis = {
            foodName: imagePreview ? 'Quinoa Bowl' : 'Custom Recipe',
            calories: 450,
            protein: 18,
            carbs: 65,
            fat: 12,
            fiber: 8,
            sugar: 6,
            sodium: 340,
            healthScore: 85,
            ingredients: processedIngredients,
            benefits: [
              'High in complete protein',
              'Rich in healthy fats',
              'Good source of fiber',
              'Contains antioxidants'
            ],
            concerns: [
              'Moderate sodium content',
              'High calorie density'
            ],
            recommendations: [
              'Perfect for post-workout meal',
              'Suitable for vegetarian diet',
              'Consider reducing salt for hypertension'
            ]
          };
          
          setAnalysisResult(mockAnalysis);
          generateRecipes(mockAnalysis.ingredients);
          resolve();
        }, 2000);
      });
    } catch (error) {
      toast.error('Failed to analyze food. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateRecipes = (foodIngredients) => {
    // Generate recipes based on the analyzed ingredients
    const baseRecipes = [
      {
        id: 1,
        name: 'Protein-Rich Quinoa Salad',
        image: '/api/placeholder/300/200',
        time: 25,
        difficulty: 'Easy',
        rating: 4.8,
        serves: 4,
        healthScore: 92,
        tags: ['High Protein', 'Gluten Free', 'Vegetarian'],
        ingredients: ['Quinoa', 'Black beans', 'Avocado', 'Lime', 'Cilantro'],
        nutrition: { calories: 380, protein: 16, carbs: 45, fat: 14 },
        suitableFor: userProfile?.healthConditions || ['general'],
        description: 'A nutrient-dense salad perfect for your health goals'
      },
      {
        id: 2,
        name: 'Mediterranean Chickpea Bowl',
        image: '/api/placeholder/300/200',
        time: 20,
        difficulty: 'Easy',
        rating: 4.6,
        serves: 3,
        healthScore: 88,
        tags: ['Anti-inflammatory', 'Heart Healthy', 'Mediterranean'],
        ingredients: ['Chickpeas', 'Cucumber', 'Tomatoes', 'Feta', 'Olive Oil'],
        nutrition: { calories: 420, protein: 14, carbs: 52, fat: 16 },
        suitableFor: userProfile?.healthConditions || ['general'],
        description: 'Mediterranean flavors with anti-inflammatory benefits'
      },
      {
        id: 3,
        name: 'Green Goddess Smoothie Bowl',
        image: '/api/placeholder/300/200',
        time: 15,
        difficulty: 'Easy',
        rating: 4.7,
        serves: 2,
        healthScore: 95,
        tags: ['Detox', 'Low Calorie', 'Antioxidant Rich'],
        ingredients: ['Spinach', 'Avocado', 'Banana', 'Chia seeds', 'Coconut milk'],
        nutrition: { calories: 280, protein: 8, carbs: 35, fat: 12 },
        suitableFor: userProfile?.healthConditions || ['general'],
        description: 'Nutrient-packed smoothie bowl for optimal health'
      }
    ];

    // Filter recipes based on common ingredients (if any)
    const relevantRecipes = baseRecipes.filter(recipe => {
      if (!foodIngredients || foodIngredients.length === 0) return true;
      
      return recipe.ingredients.some(ingredient => 
        foodIngredients.some(foodIngredient => 
          ingredient.toLowerCase().includes(foodIngredient.toLowerCase()) ||
          foodIngredient.toLowerCase().includes(ingredient.toLowerCase())
        )
      );
    });
    
    // If no relevant recipes found, return all recipes
    setRecipes(relevantRecipes.length > 0 ? relevantRecipes : baseRecipes);
  };

  const NutritionCard = ({ title, value, unit, color, icon: Icon }) => (
    <motion.div
      className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-all"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}<span className="text-sm text-gray-500">{unit}</span></p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const RecipeCard = ({ recipe }) => (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative">
        <img 
          src={recipe.image} 
          alt={recipe.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{recipe.rating}</span>
          </div>
        </div>
        <div className="absolute top-3 left-3 bg-sage/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-sm font-medium">{recipe.healthScore}% Healthy</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{recipe.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.time} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{recipe.serves} serves</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChefHat className="w-4 h-4" />
            <span>{recipe.difficulty}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-sage/10 text-sage text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 mb-3">
          <div className="text-center">
            <p className="font-medium">{recipe.nutrition.calories}</p>
            <p>Calories</p>
          </div>
          <div className="text-center">
            <p className="font-medium">{recipe.nutrition.protein}g</p>
            <p>Protein</p>
          </div>
          <div className="text-center">
            <p className="font-medium">{recipe.nutrition.carbs}g</p>
            <p>Carbs</p>
          </div>
          <div className="text-center">
            <p className="font-medium">{recipe.nutrition.fat}g</p>
            <p>Fat</p>
          </div>
        </div>
        
        <button className="w-full bg-sage text-white py-2 rounded-xl hover:bg-sage/90 transition-colors">
          Get Full Recipe
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-green via-cream to-powder-blue p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Food Analysis & Recipe Suggestions
          </h1>
          <p className="text-gray-600 text-lg">
            Upload food images or enter ingredients to get nutritional insights and healthy recipe recommendations
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/30 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            <div className="flex space-x-2">
              {[
                { id: 'analysis', label: 'Food Analysis', icon: Zap },
                { id: 'recipes', label: 'Recipe Suggestions', icon: ChefHat }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-sage text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <AnimatePresence mode="wait">
          {activeTab === 'analysis' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Upload Section */}
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Food Image or Enter Ingredients</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Food Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="imageUpload"
                      />
                      <label
                        htmlFor="imageUpload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <>
                            <Camera className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-gray-600">Click to upload food image</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Ingredients Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or Enter Ingredients
                    </label>
                    <textarea
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder="Enter ingredients separated by commas (e.g., quinoa, avocado, chickpeas)"
                      className="w-full h-64 p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    onClick={analyzeFood}
                    disabled={isAnalyzing}
                    className="bg-sage text-white px-8 py-3 rounded-2xl hover:bg-sage/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Analyze Food</span>
                      </>
                    )}
                  </button>
                  
                  {(imagePreview || ingredients.trim() || analysisResult) && (
                    <button
                      onClick={clearForm}
                      disabled={isAnalyzing}
                      className="bg-gray-500 text-white px-6 py-3 rounded-2xl hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Analysis Results */}
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Food Info */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-800">{analysisResult.foodName}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-5 h-5 text-red-500" />
                          <span className="text-lg font-semibold text-gray-700">{analysisResult.healthScore}%</span>
                        </div>
                        <span className="text-sm text-gray-500">Health Score</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <NutritionCard title="Calories" value={analysisResult.calories} unit="" color="bg-red-500" icon={Zap} />
                      <NutritionCard title="Protein" value={analysisResult.protein} unit="g" color="bg-blue-500" icon={TrendingUp} />
                      <NutritionCard title="Carbs" value={analysisResult.carbs} unit="g" color="bg-green-500" icon={Leaf} />
                      <NutritionCard title="Fat" value={analysisResult.fat} unit="g" color="bg-yellow-500" icon={Target} />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Benefits */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          Benefits
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.benefits.map((benefit, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Concerns */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                          Concerns
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.concerns.map((concern, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <Utensils className="w-5 h-5 text-sage mr-2" />
                          Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="w-2 h-2 bg-sage rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Recipe Suggestions */}
          {activeTab === 'recipes' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Personalized Recipe Suggestions
                </h2>
                <p className="text-gray-600 mb-6">
                  Recipes tailored to your health conditions and dietary preferences
                </p>
                
                {recipes.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No recipes yet. Analyze some food first!</p>
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className="bg-sage text-white px-6 py-3 rounded-2xl hover:bg-sage/90 transition-colors"
                    >
                      Start Food Analysis
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FoodAnalysisRecipe;