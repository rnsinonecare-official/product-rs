import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHealthData } from '../../context/HealthDataContext';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';
import {
  Target,
  Utensils,
  Droplets,
  Footprints,
  Moon,
  Save,
  RotateCcw,
  TrendingUp,
  Info
} from 'lucide-react';

const GoalsSettings = () => {
  const { userGoals, updateUserGoals, loading } = useHealthData();
  const { user, isAuthenticated } = useUser();
  const [goals, setGoals] = useState({
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 250,
    fatGoal: 65,
    waterGoal: 8,
    stepsGoal: 10000,
    sleepGoal: 8
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load user goals when component mounts
  useEffect(() => {
    if (userGoals) {
      setGoals(userGoals);
    }
  }, [userGoals]);

  // Check for changes
  useEffect(() => {
    if (userGoals) {
      const hasChanged = Object.keys(goals).some(key => goals[key] !== userGoals[key]);
      setHasChanges(hasChanged);
    }
  }, [goals, userGoals]);

  const handleGoalChange = (goalType, value) => {
    const numValue = parseFloat(value) || 0;
    setGoals(prev => ({
      ...prev,
      [goalType]: numValue
    }));
  };

  const handleSaveGoals = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save your goals');
      return;
    }

    setSaving(true);
    try {
      await updateUserGoals(goals);
      toast.success('Goals updated successfully! 🎯');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    const defaultGoals = {
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 250,
      fatGoal: 65,
      waterGoal: 8,
      stepsGoal: 10000,
      sleepGoal: 8
    };
    setGoals(defaultGoals);
    toast.info('Goals reset to defaults');
  };

  const getRecommendedGoals = () => {
    // Basic recommendations based on general guidelines
    return {
      calories: "2000-2500 for adults (varies by age, gender, activity)",
      protein: "0.8-1.2g per kg body weight",
      carbs: "45-65% of total calories",
      fat: "20-35% of total calories",
      water: "8-10 glasses per day",
      steps: "10,000 steps for general health",
      sleep: "7-9 hours for adults"
    };
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Set Your Health Goals</h3>
        <p className="text-gray-600 mb-4">
          Log in to customize your daily health and nutrition goals.
        </p>
        <button
          onClick={() => window.location.href = '/auth'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Log In to Set Goals
        </button>
      </div>
    );
  }

  const recommendations = getRecommendedGoals();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daily Goals</h2>
          <p className="text-gray-600">Customize your daily health and nutrition targets</p>
        </div>
        <Target className="w-8 h-8 text-blue-600" />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Nutrition Goals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Utensils className="w-5 h-5 mr-2 text-orange-600" />
              Nutrition Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Calories */}
              <motion.div
                className="bg-orange-50 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-orange-700">Daily Calories</label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-orange-500 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {recommendations.calories}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={goals.calorieGoal}
                  onChange={(e) => handleGoalChange('calorieGoal', e.target.value)}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1000"
                  max="5000"
                  step="50"
                />
                <div className="text-xs text-orange-600 mt-1">calories per day</div>
              </motion.div>

              {/* Protein */}
              <motion.div
                className="bg-red-50 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-red-700">Protein</label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-red-500 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {recommendations.protein}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={goals.proteinGoal}
                  onChange={(e) => handleGoalChange('proteinGoal', e.target.value)}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="50"
                  max="300"
                  step="5"
                />
                <div className="text-xs text-red-600 mt-1">grams per day</div>
              </motion.div>

              {/* Carbs */}
              <motion.div
                className="bg-yellow-50 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-yellow-700">Carbohydrates</label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-yellow-500 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {recommendations.carbs}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={goals.carbsGoal}
                  onChange={(e) => handleGoalChange('carbsGoal', e.target.value)}
                  className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="100"
                  max="500"
                  step="10"
                />
                <div className="text-xs text-yellow-600 mt-1">grams per day</div>
              </motion.div>

              {/* Fat */}
              <motion.div
                className="bg-indigo-50 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-indigo-700">Fat</label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-indigo-500 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {recommendations.fat}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={goals.fatGoal}
                  onChange={(e) => handleGoalChange('fatGoal', e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min="20"
                  max="150"
                  step="5"
                />
                <div className="text-xs text-indigo-600 mt-1">grams per day</div>
              </motion.div>
            </div>
          </div>

          {/* Lifestyle Goals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Lifestyle Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Water */}
              <motion.div
                className="bg-blue-50 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-blue-700 flex items-center">
                    <Droplets className="w-4 h-4 mr-1" />
                    Water
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-blue-500 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {recommendations.water}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={goals.waterGoal}
                  onChange={(e) => handleGoalChange('waterGoal', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="4"
                  max="20"
                  step="1"
                />
                <div className="text-xs text-blue-600 mt-1">glasses per day</div>
              </motion.div>

              {/* Steps */}
              <motion.div
                className="bg-green-50 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-green-700 flex items-center">
                    <Footprints className="w-4 h-4 mr-1" />
                    Steps
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-green-500 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {recommendations.steps}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={goals.stepsGoal}
                  onChange={(e) => handleGoalChange('stepsGoal', e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="5000"
                  max="30000"
                  step="500"
                />
                <div className="text-xs text-green-600 mt-1">steps per day</div>
              </motion.div>

              {/* Sleep */}
              <motion.div
                className="bg-purple-50 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-purple-700 flex items-center">
                    <Moon className="w-4 h-4 mr-1" />
                    Sleep
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-purple-500 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {recommendations.sleep}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  value={goals.sleepGoal}
                  onChange={(e) => handleGoalChange('sleepGoal', e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="4"
                  max="12"
                  step="0.5"
                />
                <div className="text-xs text-purple-600 mt-1">hours per night</div>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <motion.button
              onClick={handleSaveGoals}
              disabled={!hasChanges || saving}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                hasChanges && !saving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={hasChanges && !saving ? { scale: 1.02 } : {}}
              whileTap={hasChanges && !saving ? { scale: 0.98 } : {}}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving...' : 'Save Goals'}
            </motion.button>

            <motion.button
              onClick={handleResetToDefaults}
              className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset to Defaults
            </motion.button>
          </div>

          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800"
            >
              <Info className="w-4 h-4 inline mr-2" />
              You have unsaved changes. Click "Save Goals" to apply them.
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalsSettings;