import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { useHealthData } from "../../context/HealthDataContext";
import ScrollAnimationWrapper from "../shared/ScrollAnimationWrapper";
import PageBackground from "../shared/PageBackground";
import {
  // fadeInUp,
  // fadeInLeft,
  // fadeInRight,
  // scaleIn,
  staggerContainer,
  cardHover,
  tapScale,
  bounceIn,
} from "../../utils/animations";
import /* searchFood, recognizeFood */ "../../services/apiService";
import {
  analyzeFoodImage,
  analyzeFoodByName,
  generateRecipeFromIngredients,
  generateDailyDietPlan,
} from "../../services/geminiService";
import dailyIntakeService from "../../services/dailyIntakeService";
import sessionService from "../../services/sessionService";
import {
  Camera,
  Search,
  Upload,
  X,
  Plus,
  AlertTriangle,
  CheckCircle,
  Leaf,
  Beef,
  Scale,
  Flame,
  Star,
  Brain,
  Heart,
  ShieldAlert,
  ChefHat,
  Users,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const FoodAnalysis = () => {
  const { userProfile, isAuthenticated, user } = useUser();
  const { addFoodEntry, userGoals } = useHealthData();

  // Load saved diet plans on component mount
  React.useEffect(() => {
    const loadSavedDietPlans = () => {
      try {
        const saved = localStorage.getItem("savedDietPlans");
        if (saved) {
          const plans = JSON.parse(saved);
          // Filter out plans older than 7 days
          const validPlans = plans.filter((plan) => {
            const planDate = new Date(plan.savedAt);
            const daysDiff = (new Date() - planDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
          });
          setSavedDietPlans(validPlans);
          // Update localStorage with filtered plans
          localStorage.setItem("savedDietPlans", JSON.stringify(validPlans));
        }
      } catch (error) {
        console.error("Error loading saved diet plans:", error);
      }
    };

    loadSavedDietPlans();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [recipeIngredients, setRecipeIngredients] = useState("");
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDietPlanner, setShowDietPlanner] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [isGeneratingDietPlan, setIsGeneratingDietPlan] = useState(false);
  const [savedDietPlans, setSavedDietPlans] = useState([]);
  const fileInputRef = useRef(null);

  // All food analysis is now AI-powered - no mock data needed

  // Function to clear uploaded image and reset analysis
  const clearImageAnalysis = () => {
    setUploadedImage(null);
    setAiAnalysisResult(null);
    setShowAiModal(false);
    setIsAnalyzing(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const searchFoodApi = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔍 Searching for food with AI via backend:", query);

      // Use Gemini AI for food analysis instead of external APIs
      const healthConditions = userProfile?.healthConditions || [];
      console.log("🏥 Health conditions:", healthConditions);

      toast.loading("Analyzing food options...", {
        id: "food-search",
      });

      const result = await analyzeFoodByName(query, healthConditions);

      toast.dismiss("food-search");

      if (result) {
        // Transform Gemini result to match our component format
        const transformedResult = {
          id: `ai_${Date.now()}`,
          name: result.foodName,
          calories: parseInt(result.calories) || 0,
          protein: parseFloat(result.nutritionFacts.protein) || 0,
          carbs: parseFloat(result.nutritionFacts.carbs) || 0,
          fat: parseFloat(result.nutritionFacts.fat) || 0,
          fiber: parseFloat(result.nutritionFacts.fiber) || 0,
          sugar: parseFloat(result.nutritionFacts.sugar) || 0,
          type: result.isHealthy ? "healthy" : "moderate",
          image: "/api/placeholder/150/150",
          warnings: result.healthWarnings || [],
          benefits: result.healthBenefits || [],
          servingSize: result.servingSize || "100g",
          healthScore: result.healthScore || 5,
          aiAnalysis: result,
          isAiGenerated: true,
        };

        setSearchResults([transformedResult]);
        toast.success(`Food analyzed: ${result.foodName}`);

        // Track feature usage
        sessionService.trackFeatureUsage("food_analysis", {
          method: "image_upload",
          foodName: result.foodName,
          hasResult: true,
        });
      } else {
        toast.error("Could not analyze the food item");
        setSearchResults([]);
      }
    } catch (error) {
      toast.dismiss("food-search");
      console.error("Food search error:", error);

      if (error.message.includes("API key")) {
        toast.error("Service configuration error. Please check setup.");
      } else if (error.message.includes("network")) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(`Error analyzing food: ${error.message}`);
      }
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        setUploadedImage(e.target.result);
        setIsAnalyzing(true);

        try {
          // Get user's health conditions for personalized analysis
          const healthConditions = userProfile?.healthConditions || [];

          toast.loading("Analyzing food with AI...", {
            id: "ai-analysis",
          });

          // Use Gemini AI for food analysis
          const result = await analyzeFoodImage(file, healthConditions);

          toast.dismiss("ai-analysis");

          if (result) {
            setAiAnalysisResult(result);
            setShowAiModal(true);
            toast.success(`Food analyzed: ${result.foodName}!`);
          } else {
            toast.error("Could not analyze the food in the image");
          }
        } catch (error) {
          toast.dismiss("ai-analysis");
          console.error("Image analysis error:", error);

          // Better error handling
          if (error.message.includes("API key")) {
            toast.error("AI service configuration error. Please check setup.");
          } else if (error.message.includes("network")) {
            toast.error("Network error. Please check your connection.");
          } else if (error.message.includes("file type")) {
            toast.error("Invalid image format. Please use JPEG, PNG, or WebP.");
          } else if (error.message.includes("size")) {
            toast.error("Image file is too large. Please use a smaller image.");
          } else {
            toast.error(`Error analyzing image: ${error.message}`);
          }
        } finally {
          setIsAnalyzing(false);
        }
      };

      reader.onerror = () => {
        toast.error("Error reading the image file");
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(file);
    }
  };

  // AI-powered food analysis by name
  const handleAiAnalysis = async (foodName) => {
    if (!foodName.trim()) {
      toast.error("Please enter a food name");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Get user's health conditions for personalized analysis
      const healthConditions = userProfile?.healthConditions || [];

      console.log("Starting AI analysis for:", foodName);
      console.log("User health conditions:", healthConditions);

      toast.loading("Analyzing food with AI...", {
        id: "ai-text-analysis",
      });

      // Use Gemini AI for food analysis
      const result = await analyzeFoodByName(foodName, healthConditions);

      console.log("AI analysis result:", result);

      toast.dismiss("ai-text-analysis");

      if (result) {
        console.log("✅ Setting analysis result:", result);
        console.log("✅ Result has foodName:", result.foodName);
        console.log("✅ Result has calories:", result.calories);
        setAiAnalysisResult(result);
        setShowAiModal(true);
        console.log("✅ Modal should now be visible");
        toast.success(`Analysis complete for ${result.foodName}!`);
      } else {
        console.log("❌ No result received");
        toast.error("Could not analyze the food");
      }
    } catch (error) {
      toast.dismiss("ai-text-analysis");
      console.error("Text analysis error:", error);

      // Better error handling
      if (error.message.includes("API key")) {
        toast.error("AI service configuration error. Please check setup.");
      } else if (error.message.includes("network")) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(`Error analyzing food: ${error.message}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add AI analyzed food to temporary daily intake
  const addAiFoodToIntake = async () => {
    if (!aiAnalysisResult) {
      toast.error("No food analysis data available");
      return;
    }

    try {
      toast.loading("Adding to daily intake...", { id: "add-food" });

      // Check authentication first
      if (!isAuthenticated || !user) {
        toast.dismiss("add-food");
        toast.error("Please log in to add food to your daily intake");
        return;
      }

      console.log("Adding food to intake:", aiAnalysisResult.foodName);

      // Format food data for Firestore storage
      const foodData = {
        name: aiAnalysisResult.foodName,
        calories: parseFloat(aiAnalysisResult.calories) || 0,
        protein: parseFloat(aiAnalysisResult.nutritionFacts?.protein) || 0,
        carbs: parseFloat(aiAnalysisResult.nutritionFacts?.carbs) || 0,
        fat: parseFloat(aiAnalysisResult.nutritionFacts?.fat) || 0,
        fiber: parseFloat(aiAnalysisResult.nutritionFacts?.fiber) || 0,
        serving_size: aiAnalysisResult.servingSize || "1 serving",
        analysis_type: "ai_powered",
        health_score: parseFloat(aiAnalysisResult.healthScore) || 5,
        recommendations: aiAnalysisResult.recommendation || "",
        image: uploadedImage || null,
        metadata: {
          isHealthy:
            aiAnalysisResult.isHealthy || aiAnalysisResult.healthScore >= 7,
          healthWarnings: aiAnalysisResult.healthWarnings || [],
          healthBenefits: aiAnalysisResult.healthBenefits || [],
          alternatives: aiAnalysisResult.alternatives || [],
          addedAt: new Date().toISOString(),
        },
      };
      console.log("Formatted food data:", foodData);

      // Add to Firestore daily intake
      const result = await dailyIntakeService.addFoodEntry(foodData);
      console.log("Food added to Firestore:", result);

      // Also add to regular health data context for immediate UI update
      try {
        const foodEntry = {
          name: aiAnalysisResult.foodName,
          calories: parseInt(aiAnalysisResult.calories) || 0,
          protein: parseFloat(aiAnalysisResult.nutritionFacts.protein) || 0,
          carbs: parseFloat(aiAnalysisResult.nutritionFacts.carbs) || 0,
          fat: parseFloat(aiAnalysisResult.nutritionFacts.fat) || 0,
          serving_size: aiAnalysisResult.servingSize || "1 serving",
          analysis_type: "ai_powered_temp",
          health_score: aiAnalysisResult.healthScore,
          recommendations: aiAnalysisResult.recommendation,
          isTemporary: true,
        };

        await addFoodEntry(foodEntry);
        console.log("Food added to health data context");
      } catch (contextError) {
        console.warn("Failed to add to health data context:", contextError);
        // Don't fail the whole operation if context update fails
      }

      toast.dismiss("add-food");
      toast.success(
        `${aiAnalysisResult.foodName} added to your daily intake! 🍽️`
      );

      // Track feature usage
      sessionService.trackFeatureUsage("add_food_to_intake", {
        foodName: aiAnalysisResult.foodName,
        method: "ai_analysis",
        calories: aiAnalysisResult.calories,
        analysisType: "ai_powered",
      });

      setShowAiModal(false);
      setAiAnalysisResult(null);
      setUploadedImage(null);
    } catch (error) {
      toast.dismiss("add-food");
      console.error("Error adding AI food entry:", error);

      // Provide specific error messages
      if (error.message.includes("not authenticated")) {
        toast.error("Please log in to add food to your daily intake");
      } else if (error.message.includes("network")) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else if (error.message.includes("server")) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(`Error adding food: ${error.message}`);
      }
    }
  };

  // Generate recipes from ingredients - FORCE REAL GEMINI API
  const generateRecipes = async () => {
    if (!recipeIngredients.trim()) {
      toast.error("Please enter some ingredients");
      return;
    }

    setIsGeneratingRecipes(true);

    try {
      const healthConditions = userProfile?.healthConditions || [];
      const dietType = userProfile?.dietType || "vegetarian";

      console.log("🚀 Generating recipes with AI");
      console.log("📝 Ingredients:", recipeIngredients);
      console.log("🏥 Health conditions:", healthConditions);
      console.log("🥗 Diet type:", dietType);

      toast.loading("🤖 Generating personalized recipes...", {
        id: "recipe-generation",
      });

      // Force real Gemini API call
      const recipes = await generateRecipeFromIngredients(
        recipeIngredients,
        healthConditions,
        dietType
      );

      toast.dismiss("recipe-generation");

      console.log("✅ Received recipes:", recipes);

      if (recipes && recipes.length > 0) {
        // Verify we got real data, not mock data
        const hasRealData = recipes.some(
          (recipe) =>
            recipe.recipeName &&
            recipe.recipeName !== "Simple Healthy Recipe" &&
            recipe.nutritionFacts &&
            recipe.nutritionFacts.protein !== "15g" // Mock data check
        );

        if (hasRealData) {
          setSuggestedRecipes(recipes);
          toast.success(`🎉 Generated ${recipes.length} personalized recipes!`);

          // Track successful real API usage
          sessionService.trackFeatureUsage("recipe_generation_real_gemini", {
            ingredients: recipeIngredients,
            recipeCount: recipes.length,
            hasHealthConditions: healthConditions.length > 0,
          });
        } else {
          console.warn("⚠️ Received fallback data instead of AI data");
          setSuggestedRecipes(recipes);
          toast.warning("Generated recipes (using fallback data)");
        }
      } else {
        toast.error("No recipes generated - check Gemini API configuration");
      }
    } catch (error) {
      toast.dismiss("recipe-generation");
      console.error("❌ Recipe generation error:", error);

      if (error.message.includes("API key")) {
        toast.error("AI service configuration error");
      } else if (error.message.includes("network")) {
        toast.error("Network error - check internet connection");
      } else {
        toast.error(`Recipe generation failed: ${error.message}`);
      }
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  // Get recipes based on analyzed food
  const getRecipesForFood = async (foodName) => {
    setIsGeneratingRecipes(true);

    try {
      const healthConditions = userProfile?.healthConditions || [];
      const dietType = userProfile?.dietType || "vegetarian";

      const recipes = await generateRecipeFromIngredients(
        foodName,
        healthConditions,
        dietType
      );

      if (recipes && recipes.length > 0) {
        setSuggestedRecipes(recipes);
        toast.success(`Found ${recipes.length} recipes with ${foodName}!`);
      }
    } catch (error) {
      toast.error("Error finding recipes");
      console.error("Recipe search error:", error);
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  // Generate daily diet plan based on user's meal history and preferences
  const generateDietPlan = async () => {
    setIsGeneratingDietPlan(true);

    try {
      toast.loading("Generating personalized daily diet plan...", {
        id: "diet-plan",
      });

      // Get user's recent meal history
      const recentMeals = await dailyIntakeService.getWeeklyData();
      const mealHistory = recentMeals
        .flatMap((day) => day.foodEntriesData || [])
        .map((meal) => meal.name)
        .filter((name) => name && name.trim())
        .slice(0, 20); // Last 20 meals

      // Use the Gemini service to generate diet plan
      const result = await generateDailyDietPlan(userProfile, mealHistory, userGoals);

      toast.dismiss("diet-plan");

      if (result) {
        setDietPlan(result);
        setShowDietPlanner(true);
        toast.success("Daily diet plan generated successfully!");

        // Track feature usage
        sessionService.trackFeatureUsage("daily_diet_plan", {
          hasHealthConditions: (userProfile?.healthConditions || []).length > 0,
          dietType: userProfile?.dietType || "vegetarian",
          mealHistoryCount: mealHistory.length,
        });
      } else {
        throw new Error("Failed to generate diet plan");
      }
    } catch (error) {
      toast.dismiss("diet-plan");
      console.error("Diet plan generation error:", error);
      toast.error("Error generating diet plan. Please try again.");
    } finally {
      setIsGeneratingDietPlan(false);
    }
  };

  // Helper function to get health warnings based on user profile
  const getHealthWarnings = (food, userProfile) => {
    const warnings = [];

    if (!userProfile?.healthConditions) return warnings;

    const nutrients = food.nutrients || food;

    if (userProfile.healthConditions.includes("diabetes")) {
      if (nutrients.CHOCDF > 20 || nutrients.SUGAR > 10) {
        warnings.push("High in carbs/sugar - monitor blood glucose");
      }
    }

    if (userProfile.healthConditions.includes("hypertension")) {
      if (nutrients.NA > 400) {
        warnings.push("High sodium content");
      }
    }

    if (
      userProfile.healthConditions.includes("pcos") ||
      userProfile.healthConditions.includes("pcod")
    ) {
      if (nutrients.CHOCDF > 15 && nutrients.SUGAR > 8) {
        warnings.push("High glycemic - may affect PCOS symptoms");
      }
    }

    return warnings;
  };

  // Helper function to get health benefits
  const getHealthBenefits = (food) => {
    const benefits = [];
    const nutrients = food.nutrients || food;

    if (nutrients.PROCNT > 10) benefits.push("High protein");
    if (nutrients.FIBTG > 3) benefits.push("High fiber");
    if (nutrients.FAT < 3) benefits.push("Low fat");
    if (nutrients.ENERC_KCAL < 100) benefits.push("Low calorie");
    if (nutrients.VITC > 10) benefits.push("Rich in Vitamin C");
    if (nutrients.CA > 100) benefits.push("Good source of calcium");
    if (nutrients.FE > 2) benefits.push("Contains iron");

    return benefits.length > 0 ? benefits : ["Nutritious food choice"];
  };

  const getFoodTypeIcon = (type) => {
    return type === "vegetarian" ? (
      <Leaf className="w-4 h-4 text-green-600" />
    ) : (
      <Beef className="w-4 h-4 text-red-600" />
    );
  };

  const getFoodTypeColor = (type) => {
    return type === "vegetarian"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getSuitabilityForUser = (food) => {
    const warnings = [];
    const benefits = [...food.benefits];

    // Check diet compatibility
    if (
      userProfile?.dietType === "vegetarian" &&
      food.type === "non-vegetarian"
    ) {
      warnings.push("Not suitable for vegetarian diet");
    }

    // Check health conditions
    if (
      userProfile?.healthConditions?.includes("pcos") ||
      userProfile?.healthConditions?.includes("pcod")
    ) {
      if (food.sugar > 10)
        warnings.push("High sugar content - limit for PCOS/PCOD");
      if (food.carbs > 20)
        warnings.push("High carb content - monitor for PCOS/PCOD");
    }

    if (userProfile?.healthConditions?.includes("diabetes")) {
      if (food.sugar > 5) warnings.push("High sugar - monitor blood glucose");
      if (food.carbs > 15) warnings.push("High carbs - consider portion size");
    }

    if (userProfile?.healthConditions?.includes("hypertension")) {
      // This would be based on sodium content in a real app
      if (food.name.toLowerCase().includes("processed")) {
        warnings.push("May contain high sodium");
      }
    }

    return { warnings: [...food.warnings, ...warnings], benefits };
  };

  const handleAddFood = async (food) => {
    try {
      await addFoodEntry({
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        sugar: food.sugar,
        type: food.type,
        servingSize: food.servingSize,
      });

      toast.success(`${food.name} added to your daily log!`);
      setSelectedFood(null);
      setShowNutritionModal(false);
    } catch (error) {
      toast.error("Error adding food to log");
      console.error("Add food error:", error);
    }
  };

  const NutritionModal = ({ food, onClose, onAdd }) => {
    const suitability = getSuitabilityForUser(food);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 line-clamp-2 mr-2">
              {food.name}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Food Image */}
          <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 sm:mb-6 flex items-center justify-center">
            <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
          </div>

          {/* Serving Size & Type */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">{food.servingSize}</span>
            </div>
            <div
              className={`flex items-center space-x-1 px-3 py-1 rounded-full ${getFoodTypeColor(
                food.type
              )}`}
            >
              {getFoodTypeIcon(food.type)}
              <span className="text-sm font-medium capitalize">
                {food.type}
              </span>
            </div>
          </div>

          {/* Calories */}
          <div className="text-center mb-6 p-4 bg-gradient-to-r from-sage/10 to-light-green/10 rounded-2xl">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <span className="text-3xl font-bold text-gray-800">
                {food.calories}
              </span>
              <span className="text-gray-600">calories</span>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">
                {food.protein}g
              </p>
              <p className="text-sm text-gray-600">Protein</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-xl">
              <p className="text-2xl font-bold text-yellow-600">
                {food.carbs}g
              </p>
              <p className="text-sm text-gray-600">Carbs</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">{food.fat}g</p>
              <p className="text-sm text-gray-600">Fat</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Fiber:</span>
              <span className="font-medium">{food.fiber}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sugar:</span>
              <span className="font-medium">{food.sugar}g</span>
            </div>
          </div>

          {/* Warnings */}
          {suitability.warnings.length > 0 && (
            <div className="mb-6">
              <h4 className="flex items-center text-red-600 font-medium mb-2">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Considerations
              </h4>
              <div className="space-y-2">
                {suitability.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 p-3 bg-red-50 rounded-xl"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {suitability.benefits.length > 0 && (
            <div className="mb-6">
              <h4 className="flex items-center text-green-600 font-medium mb-2">
                <CheckCircle className="w-5 h-5 mr-2" />
                Benefits
              </h4>
              <div className="space-y-2">
                {suitability.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 p-3 bg-green-50 rounded-xl"
                  >
                    <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={() => onAdd(food)}
              className="w-full bg-gradient-to-r from-sage to-light-green text-white py-4 rounded-2xl font-medium flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>Add to Daily Log</span>
            </motion.button>

            <motion.button
              onClick={() => {
                getRecipesForFood(food.name);
                onClose();
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-medium flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChefHat className="w-5 h-5" />
              <span>Get Recipes</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 max-w-6xl mx-auto relative">
      <PageBackground variant="food" />

      {/* Header */}
      <ScrollAnimationWrapper animationType="fadeInUp" className="mb-6 sm:mb-8">
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Food Analysis & Recipe Suggestions
        </motion.h1>
        <motion.p
          className="text-sm sm:text-base text-gray-600"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          Analyze nutrition, get personalized recommendations, and discover
          healthy recipes
        </motion.p>
      </ScrollAnimationWrapper>

      {/* AI Food Analysis Section */}
      <ScrollAnimationWrapper
        animationType="fadeInLeft"
        className="glass-card p-4 sm:p-6 mb-6 sm:mb-8"
        delay={0.1}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center space-x-2">
          <Brain className="w-6 h-6 text-emerald-600" />
          <span>AI Food Analysis</span>
        </h2>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAiAnalysis(searchTerm);
                }
              }}
              placeholder="Enter food name for AI analysis (e.g., banana, grilled chicken)..."
              className="w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            />
            <Brain className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <motion.button
              onClick={() => handleAiAnalysis(searchTerm)}
              disabled={isAnalyzing || !searchTerm.trim()}
              className={`flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base ${
                isAnalyzing || !searchTerm.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105"
              }`}
              whileHover={{
                scale: isAnalyzing || !searchTerm.trim() ? 1 : 1.05,
              }}
              whileTap={{ scale: isAnalyzing || !searchTerm.trim() ? 1 : 0.95 }}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  <span>Analyze with AI</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Quick AI Analysis Buttons */}
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
          <span className="text-xs sm:text-sm text-gray-600 mr-2">
            Quick Analysis:
          </span>
          {["Banana", "Chicken Breast", "Rice", "Avocado", "Oatmeal"].map(
            (food) => (
              <motion.button
                key={food}
                onClick={() => {
                  setSearchTerm(food);
                  handleAiAnalysis(food);
                }}
                className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm hover:bg-emerald-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {food}
              </motion.button>
            )
          )}
        </div>
      </ScrollAnimationWrapper>

      {/* Search and Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-4 sm:p-6 mb-6 sm:mb-8"
      >
        <div className="flex flex-col gap-4">
          {/* Upload & Camera Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base"
              whileHover={cardHover}
              whileTap={tapScale}
              disabled={isAnalyzing}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              </motion.div>
              <span>Take Photo</span>
            </motion.button>

            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isAnalyzing}
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>Upload</span>
            </motion.button>
          </div>
        </div>

        {/* Uploaded Image Preview */}
        {uploadedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 relative inline-block"
          >
            <img
              src={uploadedImage}
              alt="Uploaded food"
              className={`w-32 h-32 object-cover rounded-2xl ${
                isAnalyzing ? "opacity-50" : ""
              }`}
            />

            {/* Loading overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>
            )}

            <button
              onClick={clearImageAnalysis}
              disabled={isAnalyzing}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear image and analysis"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* AI Analysis Results */}
      {aiAnalysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <span>AI Analysis Results</span>
          </h2>

          <div className="bg-emerald-50 rounded-2xl p-6 text-gray-800">
            <h3 className="text-xl font-semibold text-emerald-800 mb-4">
              {aiAnalysisResult.foodName}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nutrition Facts */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  Nutrition Facts
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span className="font-medium">
                      {aiAnalysisResult.calories}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span className="font-medium">
                      {aiAnalysisResult.nutritionFacts?.protein || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs:</span>
                    <span className="font-medium">
                      {aiAnalysisResult.nutritionFacts?.carbs || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat:</span>
                    <span className="font-medium">
                      {aiAnalysisResult.nutritionFacts?.fat || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fiber:</span>
                    <span className="font-medium">
                      {aiAnalysisResult.nutritionFacts?.fiber || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Information */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  Health Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Health Score:</span>
                    <span className="font-medium">
                      {aiAnalysisResult.healthScore}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Serving Size:</span>
                    <span className="font-medium">
                      {aiAnalysisResult.servingSize}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Healthy:</span>
                    <span
                      className={`font-medium ${
                        aiAnalysisResult.isHealthy
                          ? "text-emerald-600"
                          : "text-orange-600"
                      }`}
                    >
                      {aiAnalysisResult.isHealthy ? "Yes" : "Moderate"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {aiAnalysisResult.recommendation && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Personalized Recommendation
                </h4>
                <p className="text-blue-700">
                  {aiAnalysisResult.recommendation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
              <motion.button
                onClick={addAiFoodToIntake}
                className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add to Daily Log
              </motion.button>

              <motion.button
                onClick={() => setAiAnalysisResult(null)}
                className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 mr-2" />
                Clear
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* RECIPE SUGGESTIONS - AI POWERED */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <ChefHat className="w-6 h-6 text-orange-600" />
          <span>Smart Recipe Suggestions</span>
        </h2>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              value={recipeIngredients}
              onChange={(e) => {
                setRecipeIngredients(e.target.value);
                if (e.target.value.trim() === "") {
                  setSuggestedRecipes([]);
                }
              }}
              className="w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              placeholder="Enter ingredients (e.g., chicken, tomatoes, onions)"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  generateRecipes();
                }
              }}
            />
            <ChefHat className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={generateRecipes}
              disabled={isGeneratingRecipes || !recipeIngredients.trim()}
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                isGeneratingRecipes || !recipeIngredients.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:scale-105"
              }`}
            >
              {isGeneratingRecipes ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  <span>Generating Recipes...</span>
                </>
              ) : (
                <>
                  <ChefHat className="w-5 h-5 mr-2" />
                  <span>Generate Smart Recipes</span>
                </>
              )}
            </button>

            {suggestedRecipes.length > 0 && (
              <button
                onClick={() => {
                  setSuggestedRecipes([]);
                  setRecipeIngredients("");
                  toast.success("Recipes cleared");
                }}
                className="px-4 py-4 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* RECIPE RESULTS - DIRECTLY BELOW INPUT */}
        {suggestedRecipes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Generated Recipes ({suggestedRecipes.length})</span>
            </h3>

            <div className="space-y-4">
              {suggestedRecipes.map((recipe, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setShowRecipeModal(true);
                  }}
                >
                  {/* Recipe Header */}
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-gray-800 text-lg">
                      {recipe.recipeName}
                    </h4>
                    <div className="flex items-center space-x-1 text-orange-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        {recipe.healthScore}/10
                      </span>
                    </div>
                  </div>

                  {/* Recipe Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.cookingTime}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings} servings</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Flame className="w-4 h-4" />
                      <span>{recipe.calories}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>{recipe.difficulty}</span>
                    </div>
                  </div>

                  {/* Nutrition Facts */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <h5 className="font-semibold text-gray-700 mb-2">
                      Nutrition Facts
                    </h5>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-blue-600">
                          {recipe.nutritionFacts?.protein || "0g"}
                        </div>
                        <div className="text-gray-600">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-yellow-600">
                          {recipe.nutritionFacts?.carbs || "0g"}
                        </div>
                        <div className="text-gray-600">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-purple-600">
                          {recipe.nutritionFacts?.fat || "0g"}
                        </div>
                        <div className="text-gray-600">Fat</div>
                      </div>
                    </div>
                  </div>

                  {/* Health Benefits */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(recipe.healthBenefits || [])
                      .slice(0, 3)
                      .map((benefit, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                        >
                          {benefit}
                        </span>
                      ))}
                  </div>

                  <p className="text-xs text-gray-500">
                    Click to view full recipe with instructions
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Daily Diet Planner Section */}
      <ScrollAnimationWrapper
        animationType="fadeInRight"
        className="glass-card p-4 sm:p-6 mb-6 sm:mb-8"
        delay={0.2}
      >
        <motion.h2
          className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center space-x-2"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-6 h-6 text-pink-600" />
          </motion.div>
          <span>Daily Diet Planner</span>
        </motion.h2>

        <div className="text-center">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Get a personalized daily diet plan based on your meal history and
            health preferences
          </p>

          <motion.button
            onClick={generateDietPlan}
            disabled={isGeneratingDietPlan}
            className={`flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base mx-auto ${
              isGeneratingDietPlan
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:scale-105"
            }`}
            whileHover={{ scale: isGeneratingDietPlan ? 1 : 1.05 }}
            whileTap={{ scale: isGeneratingDietPlan ? 1 : 0.95 }}
          >
            {isGeneratingDietPlan ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                <span>Generating Plan...</span>
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 mr-2" />
                <span>Generate Daily Diet Plan</span>
              </>
            )}
          </motion.button>
        </div>
      </ScrollAnimationWrapper>

      {/* Saved Diet Plans */}
      {savedDietPlans.length > 0 && (
        <ScrollAnimationWrapper
          animationType="fadeInLeft"
          className="glass-card p-4 sm:p-6 mb-6 sm:mb-8"
          delay={0.3}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span>Saved Diet Plans</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {savedDietPlans.map((plan) => (
              <motion.div
                key={plan.id}
                className="border border-gray-200 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setDietPlan(plan);
                  setShowDietPlanner(true);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {plan.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(plan.savedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-center p-2 bg-green-50 rounded-lg mb-2">
                  <p className="text-lg font-bold text-green-600">
                    {plan.dailyCalorieTarget}
                  </p>
                  <p className="text-xs text-gray-600">calories/day</p>
                </div>

                <div className="text-xs text-gray-600">
                  <p>{Object.keys(plan.meals || {}).length} meals planned</p>
                  <p className="mt-1 line-clamp-2">
                    {plan.tips?.[0] || "Personalized nutrition plan"}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const updatedPlans = savedDietPlans.filter(
                      (p) => p.id !== plan.id
                    );
                    setSavedDietPlans(updatedPlans);
                    localStorage.setItem(
                      "savedDietPlans",
                      JSON.stringify(updatedPlans)
                    );
                    toast.success("Diet plan deleted");
                  }}
                  className="mt-2 text-red-500 hover:text-red-700 text-xs"
                >
                  Delete Plan
                </button>
              </motion.div>
            ))}
          </div>
        </ScrollAnimationWrapper>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Searching for food items...</p>
        </motion.div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <ScrollAnimationWrapper animationType="fadeInUp" delay={0.2}>
          <motion.h2
            className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Search Results ({searchResults.length})
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {searchResults.map((food, index) => {
              const suitability = getSuitabilityForUser(food);

              return (
                <motion.div
                  key={food.id}
                  variants={bounceIn}
                  whileHover={cardHover}
                  whileTap={tapScale}
                  className="glass-card p-3 sm:p-4 cursor-pointer flex flex-col min-h-[280px] sm:min-h-[320px] relative overflow-hidden"
                  onClick={() => {
                    setSelectedFood(food);
                    setShowNutritionModal(true);
                  }}
                >
                  {/* Food Image */}
                  <div className="w-full h-24 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3 sm:mb-4 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>

                  {/* Food Info - flexible content */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base leading-tight line-clamp-2 flex-1 mr-2">
                        {food.name}
                      </h3>
                      <div
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getFoodTypeColor(
                          food.type
                        )} flex-shrink-0`}
                      >
                        {getFoodTypeIcon(food.type)}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      {food.servingSize}
                    </p>

                    {/* Calories */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center space-x-1">
                        <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                        <span className="font-bold text-gray-800 text-sm sm:text-base">
                          {food.calories} cal
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                      </div>
                    </div>

                    {/* Warnings/Benefits Indicator - push to bottom */}
                    <div className="flex justify-between items-center mt-auto">
                      {suitability.warnings.length > 0 && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs">
                            {suitability.warnings.length} warning
                            {suitability.warnings.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}

                      {suitability.benefits.length > 0 && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Star className="w-4 h-4" />
                          <span className="text-xs">
                            {suitability.benefits.length} benefit
                            {suitability.benefits.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </ScrollAnimationWrapper>
      )}

      {/* No Results */}
      {searchTerm && !isLoading && searchResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No food items found
          </h3>
          <p className="text-gray-500">
            Try searching with different keywords or upload an image
          </p>
        </motion.div>
      )}

      {/* Empty State */}
      {!searchTerm && searchResults.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="flex justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-sage to-light-green rounded-2xl flex items-center justify-center floating-animation">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center floating-animation"
              style={{ animationDelay: "0.5s" }}
            >
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Ready to Analyze Food?
          </h3>
          <p className="text-gray-600 mb-6">
            Search for food items or upload a photo to get detailed nutritional
            information
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>
              ✨ Get personalized recommendations based on your health profile
            </p>
            <p>🔍 Search from thousands of food items</p>
            <p>📸 AI-powered food recognition from photos</p>
          </div>
        </motion.div>
      )}

      {/* Nutrition Modal */}
      <AnimatePresence>
        {showNutritionModal && selectedFood && (
          <NutritionModal
            food={selectedFood}
            onClose={() => {
              setShowNutritionModal(false);
              setSelectedFood(null);
            }}
            onAdd={handleAddFood}
          />
        )}

        {/* AI Analysis Modal */}
        {showAiModal && aiAnalysisResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
            onClick={() => setShowAiModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white rounded-3xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-emerald-500" />
                    AI Food Analysis
                  </h2>
                  <h3 className="text-base sm:text-xl font-semibold text-sage mt-1 line-clamp-2">
                    {aiAnalysisResult.foodName}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Health Score */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Health Score</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {aiAnalysisResult.healthScore}/10
                    </p>
                  </div>
                  <div className="flex items-center">
                    {aiAnalysisResult.isHealthy ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Nutrition Facts */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-orange-50 rounded-2xl p-3 sm:p-4 text-center">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-xs sm:text-sm text-gray-600">Calories</p>
                  <p className="text-base sm:text-lg font-bold text-orange-600">
                    {aiAnalysisResult.calories}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-3 sm:p-4 text-center">
                  <Scale className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-xs sm:text-sm text-gray-600">Protein</p>
                  <p className="text-base sm:text-lg font-bold text-blue-600">
                    {aiAnalysisResult.nutritionFacts.protein}
                  </p>
                </div>
                <div className="bg-green-50 rounded-2xl p-3 sm:p-4 text-center">
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-green-500" />
                  <p className="text-xs sm:text-sm text-gray-600">Carbs</p>
                  <p className="text-base sm:text-lg font-bold text-green-600">
                    {aiAnalysisResult.nutritionFacts.carbs}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-2xl p-3 sm:p-4 text-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 bg-yellow-500 rounded-full"></div>
                  <p className="text-xs sm:text-sm text-gray-600">Fat</p>
                  <p className="text-base sm:text-lg font-bold text-yellow-600">
                    {aiAnalysisResult.nutritionFacts.fat}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-3 sm:p-4 text-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 bg-purple-500 rounded-full"></div>
                  <p className="text-xs sm:text-sm text-gray-600">Fiber</p>
                  <p className="text-base sm:text-lg font-bold text-purple-600">
                    {aiAnalysisResult.nutritionFacts.fiber}
                  </p>
                </div>
                <div className="bg-red-50 rounded-2xl p-3 sm:p-4 text-center">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-red-500" />
                  <p className="text-xs sm:text-sm text-gray-600">Sodium</p>
                  <p className="text-base sm:text-lg font-bold text-red-600">
                    {aiAnalysisResult.nutritionFacts.sodium}
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  AI Recommendation
                </h4>
                <p className="text-gray-700">
                  {aiAnalysisResult.recommendation}
                </p>
              </div>

              {/* Health Warnings */}
              {aiAnalysisResult.healthWarnings &&
                aiAnalysisResult.healthWarnings.length > 0 && (
                  <div className="bg-red-50 rounded-2xl p-4 mb-4">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                      <ShieldAlert className="w-5 h-5 mr-2" />
                      Health Warnings
                    </h4>
                    <ul className="text-red-700 space-y-1">
                      {aiAnalysisResult.healthWarnings.map((warning, index) => (
                        <li key={index} className="text-sm">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Health Benefits */}
              {aiAnalysisResult.healthBenefits &&
                aiAnalysisResult.healthBenefits.length > 0 && (
                  <div className="bg-green-50 rounded-2xl p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Health Benefits
                    </h4>
                    <ul className="text-green-700 space-y-1">
                      {aiAnalysisResult.healthBenefits.map((benefit, index) => (
                        <li key={index} className="text-sm">
                          • {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Suitable For / Avoid If */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {aiAnalysisResult.suitableFor &&
                  aiAnalysisResult.suitableFor.length > 0 && (
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Good For:
                      </h4>
                      <ul className="text-blue-700 space-y-1">
                        {aiAnalysisResult.suitableFor.map(
                          (condition, index) => (
                            <li key={index} className="text-sm">
                              • {condition}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {aiAnalysisResult.avoidIf &&
                  aiAnalysisResult.avoidIf.length > 0 && (
                    <div className="bg-orange-50 rounded-2xl p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">
                        Avoid If:
                      </h4>
                      <ul className="text-orange-700 space-y-1">
                        {aiAnalysisResult.avoidIf.map((condition, index) => (
                          <li key={index} className="text-sm">
                            • {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* Alternative Suggestions */}
              {aiAnalysisResult.alternatives &&
                aiAnalysisResult.alternatives.length > 0 && (
                  <div className="bg-yellow-50 rounded-2xl p-4 mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      Healthier Alternatives:
                    </h4>
                    <ul className="text-yellow-700 space-y-1">
                      {aiAnalysisResult.alternatives.map(
                        (alternative, index) => (
                          <li key={index} className="text-sm">
                            • {alternative}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={addAiFoodToIntake}
                  className="flex-1 bg-gradient-to-r from-sage to-light-green text-white py-3 px-6 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Add to Daily Intake
                </button>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Recipe Modal */}
        {showRecipeModal && selectedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRecipeModal(false)}
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
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedRecipe.recipeName}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{selectedRecipe.cookingTime}</span>
                    <span>•</span>
                    <span>{selectedRecipe.difficulty}</span>
                    <span>•</span>
                    <span>{selectedRecipe.servings}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowRecipeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Ingredients & Instructions */}
                <div className="space-y-6">
                  {/* Ingredients */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Ingredients
                    </h3>
                    <div className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                        >
                          <span className="font-medium text-gray-800">
                            {ingredient.item}
                          </span>
                          <span className="text-sage">{ingredient.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Instructions
                    </h3>
                    <div className="space-y-3">
                      {selectedRecipe.instructions.map((step, index) => (
                        <div key={index} className="flex space-x-3">
                          <div className="w-6 h-6 bg-sage text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 flex-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Nutrition & Benefits */}
                <div className="space-y-6">
                  {/* Nutrition Facts */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Nutrition Facts
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedRecipe.nutritionFacts).map(
                        ([key, value]) => (
                          <div key={key} className="p-3 bg-gray-50 rounded-xl">
                            <div className="text-sm text-gray-600 capitalize">
                              {key}
                            </div>
                            <div className="font-semibold text-gray-800">
                              {value}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Health Benefits */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Health Benefits
                    </h3>
                    <div className="space-y-2">
                      {selectedRecipe.healthBenefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-3 bg-green-50 rounded-xl"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-700">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cooking Tips */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Cooking Tips
                    </h3>
                    <div className="space-y-2">
                      {selectedRecipe.tips.map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-2 p-3 bg-blue-50 rounded-xl"
                        >
                          <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowRecipeModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-sage to-light-green text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Close Recipe
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Diet Plan Modal */}
        {showDietPlanner && dietPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
            onClick={() => setShowDietPlanner(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center space-x-2">
                  <Heart className="w-6 h-6 text-pink-600" />
                  <span>Your Daily Diet Plan</span>
                </h3>
                <button
                  onClick={() => setShowDietPlanner(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Daily Calorie Target */}
              <div className="text-center mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <span className="text-2xl font-bold text-gray-800">
                    {dietPlan.dailyCalorieTarget || 2000}
                  </span>
                  <span className="text-gray-600">calories/day</span>
                </div>
                <p className="text-sm text-gray-600">
                  Recommended daily intake
                </p>
              </div>

              {/* Meals */}
              <div className="space-y-4 mb-6">
                {dietPlan.meals &&
                  Object.entries(dietPlan.meals).map(([mealType, meal]) => (
                    <div
                      key={mealType}
                      className="border border-gray-200 rounded-2xl p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-semibold text-gray-800 capitalize">
                          {mealType.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{meal.time}</p>
                          <p className="text-sm font-medium text-green-600">
                            {meal.calories} cal
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">
                            Foods:
                          </h5>
                          <ul className="space-y-1">
                            {meal.foods &&
                              meal.foods.map((food, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-gray-600 flex items-center space-x-2"
                                >
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span>{food}</span>
                                </li>
                              ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">
                            Nutrients:
                          </h5>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center p-2 bg-blue-50 rounded-lg">
                              <p className="font-medium text-blue-600">
                                {meal.nutrients?.protein || "0g"}
                              </p>
                              <p className="text-gray-600">Protein</p>
                            </div>
                            <div className="text-center p-2 bg-yellow-50 rounded-lg">
                              <p className="font-medium text-yellow-600">
                                {meal.nutrients?.carbs || "0g"}
                              </p>
                              <p className="text-gray-600">Carbs</p>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded-lg">
                              <p className="font-medium text-purple-600">
                                {meal.nutrients?.fat || "0g"}
                              </p>
                              <p className="text-gray-600">Fat</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Hydration */}
              {dietPlan.hydration && (
                <div className="mb-6 p-4 bg-blue-50 rounded-2xl">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                    <span>Hydration Plan</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Daily Goal:</p>
                      <p className="text-gray-600">
                        {dietPlan.hydration.waterGoal}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Timing:</p>
                      <p className="text-gray-600">
                        {dietPlan.hydration.timing}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Alternatives:</p>
                      <p className="text-gray-600">
                        {dietPlan.hydration.alternatives?.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips and Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {dietPlan.tips && dietPlan.tips.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-2xl">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-green-600" />
                      <span>Tips</span>
                    </h4>
                    <ul className="space-y-2">
                      {dietPlan.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 flex items-start space-x-2"
                        >
                          <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {dietPlan.healthBenefits &&
                  dietPlan.healthBenefits.length > 0 && (
                    <div className="p-4 bg-purple-50 rounded-2xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-purple-600" />
                        <span>Health Benefits</span>
                      </h4>
                      <ul className="space-y-2">
                        {dietPlan.healthBenefits.map((benefit, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 flex items-start space-x-2"
                          >
                            <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={() => {
                    // Save diet plan with timestamp
                    const planWithMetadata = {
                      ...dietPlan,
                      savedAt: new Date().toISOString(),
                      id: Date.now().toString(),
                      name: `Diet Plan - ${new Date().toLocaleDateString()}`,
                    };

                    // Get existing plans and add new one
                    const existingPlans = savedDietPlans.filter((plan) => {
                      const planDate = new Date(plan.savedAt).toDateString();
                      const today = new Date().toDateString();
                      return planDate !== today; // Remove today's plan if exists
                    });

                    const updatedPlans = [planWithMetadata, ...existingPlans];
                    setSavedDietPlans(updatedPlans);
                    localStorage.setItem(
                      "savedDietPlans",
                      JSON.stringify(updatedPlans)
                    );
                    toast.success("Diet plan saved successfully!");
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-2xl font-medium flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Save Plan</span>
                </motion.button>

                <motion.button
                  onClick={() => generateDietPlan()}
                  disabled={isGeneratingDietPlan}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-2xl font-medium flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Brain className="w-5 h-5" />
                  <span>Generate New Plan</span>
                </motion.button>

                <motion.button
                  onClick={() => setShowDietPlanner(false)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-2xl font-medium flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-5 h-5" />
                  <span>Close</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodAnalysis;
