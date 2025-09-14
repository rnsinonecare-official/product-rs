import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthData } from '../../context/HealthDataContext';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';
import {
  Utensils,
  Droplets,
  Footprints,
  Moon,
  Heart,
  Plus,
  Minus,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Info
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const DailyIntake = () => {
  const { dailyData, userGoals, loading, addWaterIntake, updateDailyMetric, removeFoodEntry, refreshData } = useHealthData();
  const { user, isAuthenticated } = useUser();
  const [showFoodDetails, setShowFoodDetails] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  // Calculate progress percentages
  const getProgress = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#10B981'; // Green
    if (percentage >= 75) return '#F59E0B'; // Yellow
    if (percentage >= 50) return '#3B82F6'; // Blue
    return '#EF4444'; // Red
  };

  // Handle water intake
  const handleAddWater = async (amount = 250) => {
    try {
      await addWaterIntake(amount);
      toast.success(`Added ${amount}ml water! 💧`);
    } catch (error) {
      toast.error('Failed to add water intake');
      console.error('Error adding water:', error);
    }
  };

  // Handle steps update
  const handleUpdateSteps = async (steps) => {
    try {
      await updateDailyMetric('steps', steps);
      toast.success(`Steps updated to ${steps}! 👟`);
    } catch (error) {
      toast.error('Failed to update steps');
      console.error('Error updating steps:', error);
    }
  };

  // Handle sleep update
  const handleUpdateSleep = async (hours) => {
    try {
      await updateDailyMetric('sleep', hours);
      toast.success(`Sleep updated to ${hours} hours! 😴`);
    } catch (error) {
      toast.error('Failed to update sleep');
      console.error('Error updating sleep:', error);
    }
  };

  // Handle food entry removal
  const handleRemoveFood = async (foodId) => {
    try {
      await removeFoodEntry(foodId);
      toast.success('Food entry removed! 🗑️');
    } catch (error) {
      toast.error('Failed to remove food entry');
      console.error('Error removing food:', error);
    }
  };

  // Show food details modal
  const showFoodDetailsModal = (food) => {
    setSelectedFood(food);
    setShowFoodDetails(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Track Your Daily Intake</h3>
        <p className="text-gray-600 mb-4">
          Log in to track your daily nutrition, water intake, steps, and sleep.
        </p>
        <button
          onClick={() => window.location.href = '/auth'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Log In to Start Tracking
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Today's Intake</h2>
          <p className="text-gray-600">Track your daily nutrition and wellness</p>
        </div>
        <button
          onClick={refreshData}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh data"
        >
          <TrendingUp className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Calories */}
        <motion.div
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Utensils className="w-6 h-6 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">
              {Math.round(getProgress(dailyData.totalCalories, userGoals.calorieGoal))}%
            </span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-800">
              {Math.round(dailyData.totalCalories)}
            </div>
            <div className="text-sm text-gray-600">
              / {userGoals.calorieGoal} cal
            </div>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${getProgress(dailyData.totalCalories, userGoals.calorieGoal)}%`
              }}
            ></div>
          </div>
        </motion.div>

        {/* Water */}
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            <button
              onClick={() => handleAddWater(250)}
              className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-800">
              {dailyData.water}
            </div>
            <div className="text-sm text-gray-600">
              / {userGoals.waterGoal} glasses
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${getProgress(dailyData.water, userGoals.waterGoal)}%`
              }}
            ></div>
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Footprints className="w-6 h-6 text-green-600" />
            <button
              onClick={() => {
                const steps = prompt('Enter your steps:', dailyData.steps);
                if (steps && !isNaN(steps)) {
                  handleUpdateSteps(parseInt(steps));
                }
              }}
              className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-800">
              {dailyData.steps.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              / {userGoals.stepsGoal.toLocaleString()} steps
            </div>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${getProgress(dailyData.steps, userGoals.stepsGoal)}%`
              }}
            ></div>
          </div>
        </motion.div>

        {/* Sleep */}
        <motion.div
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Moon className="w-6 h-6 text-purple-600" />
            <button
              onClick={() => {
                const sleep = prompt('Enter sleep hours:', dailyData.sleep);
                if (sleep && !isNaN(sleep)) {
                  handleUpdateSleep(parseFloat(sleep));
                }
              }}
              className="p-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-800">
              {dailyData.sleep}h
            </div>
            <div className="text-sm text-gray-600">
              / {userGoals.sleepGoal}h sleep
            </div>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${getProgress(dailyData.sleep, userGoals.sleepGoal)}%`
              }}
            ></div>
          </div>
        </motion.div>
      </div>

      {/* Nutrition Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Protein */}
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">Protein</span>
            <span className="text-xs text-red-600">
              {Math.round(getProgress(dailyData.totalProtein, userGoals.proteinGoal))}%
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800 mb-1">
            {Math.round(dailyData.totalProtein)}g / {userGoals.proteinGoal}g
          </div>
          <div className="w-full bg-red-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${getProgress(dailyData.totalProtein, userGoals.proteinGoal)}%`
              }}
            ></div>
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-yellow-700">Carbs</span>
            <span className="text-xs text-yellow-600">
              {Math.round(getProgress(dailyData.totalCarbs, userGoals.carbsGoal))}%
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800 mb-1">
            {Math.round(dailyData.totalCarbs)}g / {userGoals.carbsGoal}g
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${getProgress(dailyData.totalCarbs, userGoals.carbsGoal)}%`
              }}
            ></div>
          </div>
        </div>

        {/* Fat */}
        <div className="bg-indigo-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-700">Fat</span>
            <span className="text-xs text-indigo-600">
              {Math.round(getProgress(dailyData.totalFat, userGoals.fatGoal))}%
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800 mb-1">
            {Math.round(dailyData.totalFat)}g / {userGoals.fatGoal}g
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${getProgress(dailyData.totalFat, userGoals.fatGoal)}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Food Entries */}
      {dailyData.foodEntriesData && dailyData.foodEntriesData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Food Entries</h3>
          <div className="space-y-3">
            {dailyData.foodEntriesData.slice(0, 5).map((food, index) => (
              <motion.div
                key={food.id || index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-4 flex-shrink-0">
                    {food.image ? (
                      <img src={food.image} alt={food.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Utensils className="w-5 h-5 text-gray-400 m-auto" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{food.name}</div>
                    <div className="text-sm text-gray-600">
                      {Math.round(food.calories)} cal • {food.serving_size}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => showFoodDetailsModal(food)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveFood(food.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            
            {dailyData.foodEntriesData.length > 5 && (
              <div className="text-center text-sm text-gray-500 py-2">
                And {dailyData.foodEntriesData.length - 5} more entries...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Food Details Modal */}
      <AnimatePresence>
        {showFoodDetails && selectedFood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowFoodDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedFood.name}</h3>
                <button
                  onClick={() => setShowFoodDetails(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                >
                  ×
                </button>
              </div>
              
              {selectedFood.image && (
                <div className="w-full h-40 bg-gray-200 rounded-xl mb-4 overflow-hidden">
                  <img
                    src={selectedFood.image}
                    alt={selectedFood.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-sm text-orange-600 font-medium">Calories</div>
                    <div className="text-lg font-bold text-gray-800">{Math.round(selectedFood.calories)}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-sm text-red-600 font-medium">Protein</div>
                    <div className="text-lg font-bold text-gray-800">{Math.round(selectedFood.protein)}g</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="text-sm text-yellow-600 font-medium">Carbs</div>
                    <div className="text-lg font-bold text-gray-800">{Math.round(selectedFood.carbs)}g</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <div className="text-sm text-indigo-600 font-medium">Fat</div>
                    <div className="text-lg font-bold text-gray-800">{Math.round(selectedFood.fat)}g</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Serving Size</div>
                  <div className="text-gray-600">{selectedFood.serving_size}</div>
                </div>
                
                {selectedFood.health_score && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Health Score</div>
                    <div className="flex items-center">
                      <div className="text-lg font-bold text-gray-800">{selectedFood.health_score}/10</div>
                      <div className="ml-2 flex">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mr-1 ${
                              i < selectedFood.health_score ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedFood.recommendations && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Recommendations</div>
                    <div className="text-gray-600 text-sm">{selectedFood.recommendations}</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyIntake;