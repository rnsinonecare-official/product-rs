import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHealthData } from '../../context/HealthDataContext';
import toast from 'react-hot-toast';
import {
  Target,
  Flame,
  Droplets,
  Activity,
  Moon,
  Save,
  RefreshCw,
  Info,
  Zap
} from 'lucide-react';

const GoalsSettings = () => {
  const { userGoals, updateUserGoals } = useHealthData();
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userGoals) {
      setFormData({
        calorieGoal: userGoals.calorieGoal || 2000,
        waterGoal: userGoals.waterGoal || 8,
        stepsGoal: userGoals.stepsGoal || 10000,
        sleepGoal: userGoals.sleepGoal || 8,
        proteinGoal: userGoals.proteinGoal || 150,
        carbGoal: userGoals.carbGoal || 250,
        fatGoal: userGoals.fatGoal || 70,
      });
    }
  }, [userGoals]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Ensure we're sending the complete goals data
      const goalsData = {
        ...userGoals,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      await updateUserGoals(goalsData);
      toast.success('Goals updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating goals:', error);
      toast.error('Failed to update goals. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const goalFields = [
    {
      id: 'calorieGoal',
      label: 'Daily Calorie Target',
      icon: Flame,
      unit: 'kcal',
      min: 1200,
      max: 5000,
      step: 50,
      description: 'Your daily calorie intake goal'
    },
    {
      id: 'waterGoal',
      label: 'Water Intake',
      icon: Droplets,
      unit: 'glasses',
      min: 4,
      max: 20,
      step: 1,
      description: 'Daily water consumption goal (8 oz per glass)'
    },
    {
      id: 'stepsGoal',
      label: 'Step Count',
      icon: Activity,
      unit: 'steps',
      min: 1000,
      max: 30000,
      step: 500,
      description: 'Daily step count target'
    },
    {
      id: 'sleepGoal',
      label: 'Sleep Duration',
      icon: Moon,
      unit: 'hours',
      min: 4,
      max: 12,
      step: 0.5,
      description: 'Recommended hours of sleep per night'
    },
    {
      id: 'proteinGoal',
      label: 'Protein Intake',
      icon: Target,
      unit: 'grams',
      min: 50,
      max: 300,
      step: 5,
      description: 'Daily protein consumption goal'
    },
    {
      id: 'carbGoal',
      label: 'Carbohydrate Intake',
      icon: Target,
      unit: 'grams',
      min: 100,
      max: 500,
      step: 5,
      description: 'Daily carbohydrate consumption goal'
    },
    {
      id: 'fatGoal',
      label: 'Fat Intake',
      icon: Target,
      unit: 'grams',
      min: 30,
      max: 200,
      step: 5,
      description: 'Daily fat consumption goal'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Goals</h2>
          <p className="text-gray-600">Set and manage your daily health and nutrition targets</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {!isEditing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Target className="w-4 h-4 mr-2" />
              Edit Goals
            </motion.button>
          ) : (
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Reset form to original values
                  if (userGoals) {
                    setFormData({
                      calorieGoal: userGoals.calorieGoal || 2000,
                      waterGoal: userGoals.waterGoal || 8,
                      stepsGoal: userGoals.stepsGoal || 10000,
                      sleepGoal: userGoals.sleepGoal || 8,
                      proteinGoal: userGoals.proteinGoal || 150,
                      carbGoal: userGoals.carbGoal || 250,
                      fatGoal: userGoals.fatGoal || 70,
                    });
                  }
                  setIsEditing(false);
                }}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goalFields.map((goal) => {
          const Icon = goal.icon;
          return (
            <motion.div
              key={goal.id}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{goal.label}</h3>
                    <p className="text-xs text-gray-500">{goal.description}</p>
                  </div>
                </div>
                {isEditing && (
                  <Info className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="number"
                    value={formData[goal.id]}
                    onChange={(e) => handleInputChange(goal.id, parseFloat(e.target.value) || 0)}
                    min={goal.min}
                    max={goal.max}
                    step={goal.step}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{goal.min} {goal.unit}</span>
                    <span>{goal.max} {goal.unit}</span>
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-gray-800">
                  {formData[goal.id]} <span className="text-sm font-normal text-gray-600">{goal.unit}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start">
          <Zap className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Goal Setting Tips</h4>
            <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
              <li>Set realistic goals that challenge you but are achievable</li>
              <li>Start with smaller targets and gradually increase them</li>
              <li>Adjust your goals based on your progress and lifestyle changes</li>
              <li>Consistency is more important than perfection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsSettings;