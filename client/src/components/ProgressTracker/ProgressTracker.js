import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { useHealthData } from '../../context/HealthDataContext';
import sessionService from '../../services/sessionService';
import PageBackground from '../shared/PageBackground';
import StepSync from './StepSync';
import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  Flame,
  Droplets,
  Activity,
  Moon,
  Scale,
  Heart,
  BarChart3,
  PieChart,
  LineChart,
  Plus,
  Minus,
  Edit3,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ProgressTracker = () => {
  const { userProfile } = useUser();
  const { dailyData, weeklyData: contextWeeklyData, monthlyData: contextMonthlyData, userGoals, getWeeklyData, getMonthlyData, updateDailyMetric } = useHealthData();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [editingMetric, setEditingMetric] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showStepSync, setShowStepSync] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load weekly and monthly data if not already loaded
        if (contextWeeklyData.length === 0) {
          await getWeeklyData();
        }
        if (contextMonthlyData.length === 0) {
          await getMonthlyData();
        }
      } catch (error) {
        console.error('Error loading progress data:', error);
      }
    };

    loadData();
  }, [getWeeklyData, getMonthlyData, contextWeeklyData.length, contextMonthlyData.length]);

  const dailyGoals = [
    {
      key: 'totalCalories',
      label: 'Calories',
      current: dailyData.totalCalories || dailyData.calories || 0,
      target: userGoals?.calorieGoal || userGoals?.dailyCalories || 2000,
      unit: 'kcal',
      icon: Flame,
      color: '#ef4444',
      bgColor: 'bg-red-100',
    },
    {
      key: 'water',
      label: 'Water',
      current: dailyData.water || 0,
      target: userGoals?.waterGoal || userGoals?.dailyWater || 8,
      unit: 'liters',
      icon: Droplets,
      color: '#3b82f6',
      bgColor: 'bg-blue-100',
    },
    {
      key: 'steps',
      label: 'Steps',
      current: dailyData.steps || 0,
      target: userGoals?.stepsGoal || userGoals?.dailySteps || 10000,
      unit: 'steps',
      icon: Activity,
      color: '#10b981',
      bgColor: 'bg-green-100',
    },
    {
      key: 'sleep',
      label: 'Sleep',
      current: dailyData.sleep || 0,
      target: userGoals?.sleepGoal || userGoals?.dailySleep || 8,
      unit: 'hours',
      icon: Moon,
      color: '#8b5cf6',
      bgColor: 'bg-purple-100',
    },
  ];

  const handleQuickUpdate = async (metric, increment) => {
    const currentValue = dailyData[metric] || 0;
    let newValue = currentValue + increment;

    // Ensure non-negative values
    if (newValue < 0) newValue = 0;

    // Set reasonable maximums
    const maxValues = {
      water: 5.0, // 5 liters max
      sleep: 12,
      steps: 50000,
      totalCalories: 5000
    };

    if (newValue > maxValues[metric]) newValue = maxValues[metric];

    await updateDailyMetric(metric, newValue);

    // Track feature usage
    sessionService.trackFeatureUsage('update_metric', {
      metric: metric,
      increment: increment,
      newValue: newValue,
      method: 'quick_update'
    });
  };

  const handleEditMetric = (metric) => {
    setEditingMetric(metric);
    setEditValue(dailyData[metric].toString());
  };

  const handleSaveEdit = async () => {
    if (editingMetric && editValue !== '') {
      const value = parseFloat(editValue);
      if (!isNaN(value) && value >= 0) {
        await updateDailyMetric(editingMetric, value);
      }
    }
    setEditingMetric(null);
    setEditValue('');
  };

  const calculateWeeklyAverage = (data, metric) => {
    if (!data || !Array.isArray(data) || data.length === 0) return '0.0';

    const total = data.reduce((sum, day) => {
      if (!day) return sum;

      let value = 0;
      // Handle different field name formats
      if (metric === 'totalCalories') value = day.totalCalories || day.calories || 0;
      else if (metric === 'totalProtein') value = day.totalProtein || day.protein || 0;
      else if (metric === 'totalCarbs') value = day.totalCarbs || day.carbs || 0;
      else if (metric === 'totalFat') value = day.totalFat || day.fat || 0;
      else value = day[metric] || 0;

      return sum + value;
    }, 0);

    return (total / data.length).toFixed(1);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#10b981'; // green
    if (percentage >= 75) return '#f59e0b'; // yellow
    if (percentage >= 50) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  const getMoodEmoji = (mood) => {
    const moodMap = {
      excellent: '😄',
      good: '😊',
      neutral: '😐',
      tired: '😴',
      stressed: '😰'
    };
    return moodMap[mood] || '😐';
  };

  const WeeklyChart = ({ data, metric, color }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="h-32 flex items-center justify-center">
          <p className="text-sm text-gray-500">No data available</p>
        </div>
      );
    }

    const maxValue = Math.max(...data.map(day => {
      if (!day) return 0;
      // Handle different field name formats
      if (metric === 'totalCalories') return day.totalCalories || day.calories || 0;
      if (metric === 'totalProtein') return day.totalProtein || day.protein || 0;
      if (metric === 'totalCarbs') return day.totalCarbs || day.carbs || 0;
      if (metric === 'totalFat') return day.totalFat || day.fat || 0;
      return day[metric] || 0;
    }), 1);

    return (
      <div className="h-32">
        <div className="flex items-end justify-between h-full space-x-1">
          {data.map((day, index) => {
            if (!day) {
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex-1 flex items-end justify-center w-full">
                    <div className="w-full rounded-t-lg opacity-30 bg-gray-300" style={{ height: '10%' }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">N/A</div>
                  <div className="text-xs font-medium text-gray-400">0</div>
                </div>
              );
            }

            let value = 0;
            // Handle different field name formats
            if (metric === 'totalCalories') value = day.totalCalories || day.calories || 0;
            else if (metric === 'totalProtein') value = day.totalProtein || day.protein || 0;
            else if (metric === 'totalCarbs') value = day.totalCarbs || day.carbs || 0;
            else if (metric === 'totalFat') value = day.totalFat || day.fat || 0;
            else value = day[metric] || 0;

            const height = (value / maxValue) * 100;
            const date = new Date(day.date);
            const isToday = day.date === new Date().toISOString().split('T')[0];

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="flex-1 flex items-end justify-center w-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`w-full rounded-t-lg ${isToday ? 'opacity-100' : 'opacity-70'}`}
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xs font-medium text-gray-800">
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const NutritionChart = ({ data }) => {
    const totalCalories = data.totalCalories || data.calories || 1;
    const proteinCals = (data.totalProtein || data.protein || 0) * 4;
    const carbsCals = (data.totalCarbs || data.carbs || 0) * 4;
    const fatCals = (data.totalFat || data.fat || 0) * 9;
    
    const proteinPercent = (proteinCals / totalCalories) * 100;
    const carbsPercent = (carbsCals / totalCalories) * 100;
    const fatPercent = (fatCals / totalCalories) * 100;
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Protein</span>
            <span className="text-sm font-medium">{data.totalProtein || data.protein || 0}g ({proteinPercent.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${proteinPercent}%` }}
              transition={{ duration: 0.8 }}
              className="bg-blue-500 h-2 rounded-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Carbs</span>
            <span className="text-sm font-medium">{data.totalCarbs || data.carbs || 0}g ({carbsPercent.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${carbsPercent}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-yellow-500 h-2 rounded-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Fat</span>
            <span className="text-sm font-medium">{data.totalFat || data.fat || 0}g ({fatPercent.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fatPercent}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-purple-500 h-2 rounded-full"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto relative">
      <PageBackground variant="progress" />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Progress Tracker
        </h1>
        <p className="text-gray-600">
          Monitor your daily goals and track your health journey
        </p>
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-2">
          {[
            { key: 'today', label: 'Today', icon: Target },
            { key: 'week', label: 'This Week', icon: Calendar },
            { key: 'month', label: 'This Month', icon: TrendingUp }
          ].map(period => (
            <motion.button
              key={period.key}
              onClick={() => {
                setSelectedPeriod(period.key);
                // Track feature usage
                sessionService.trackFeatureUsage('view_period', {
                  period: period.key,
                  previousPeriod: selectedPeriod
                });
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                selectedPeriod === period.key
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <period.icon className="w-5 h-5" />
              <span>{period.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {selectedPeriod === 'today' && (
        <>
          {/* Daily Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dailyGoals.map((goal, index) => {
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                
                return (
                  <motion.div
                    key={goal.key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${goal.bgColor} rounded-full flex items-center justify-center`}>
                        <goal.icon className="w-6 h-6" style={{ color: goal.color }} />
                      </div>
                      <button
                        onClick={() => handleEditMetric(goal.key)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    
                    {/* Progress Circle */}
                    <div className="w-20 h-20 mx-auto mb-4">
                      <CircularProgressbar
                        value={percentage}
                        text={`${percentage.toFixed(0)}%`}
                        styles={buildStyles({
                          pathColor: goal.color,
                          textColor: goal.color,
                          trailColor: '#f3f4f6',
                        })}
                      />
                    </div>
                    
                    <h3 className="font-semibold text-gray-800 text-center mb-2">{goal.label}</h3>
                    
                    {editingMetric === goal.key ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          min="0"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-center text-gray-600 mb-4">
                        {goal.key === 'water' ? goal.current.toFixed(2) : goal.current} / {goal.target} {goal.unit}
                      </p>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="flex items-center justify-center space-x-2">
                      <motion.button
                        onClick={() => handleQuickUpdate(goal.key, goal.key === 'water' ? -0.25 : goal.key === 'sleep' ? -0.5 : goal.key === 'steps' ? -1000 : -100)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </motion.button>
                      
                      {goal.key === 'steps' && (
                        <motion.button
                          onClick={() => setShowStepSync(true)}
                          className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Sync Steps"
                        >
                          <RefreshCw className="w-4 h-4 text-white" />
                        </motion.button>
                      )}
                      
                      <motion.button
                        onClick={() => handleQuickUpdate(goal.key, goal.key === 'water' ? 0.25 : goal.key === 'sleep' ? 0.5 : goal.key === 'steps' ? 1000 : 100)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
                        style={{ backgroundColor: goal.color }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Nutrition Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Macronutrients */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <PieChart className="w-6 h-6 mr-2 text-green-600" />
                  Nutrition Breakdown
                </h3>
                <NutritionChart data={dailyData} />
              </div>

              {/* Meal Summary */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Flame className="w-6 h-6 mr-2 text-orange-500" />
                  Today's Meals
                </h3>
                {(dailyData.foodEntriesData && dailyData.foodEntriesData.length > 0) ||
                 (dailyData.foodEntries && dailyData.foodEntries.length > 0) ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {(dailyData.foodEntriesData || dailyData.foodEntries || []).map((entry, index) => (
                      <div
                        key={entry.id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{entry.name}</p>
                          <p className="text-sm text-gray-600">
                            {entry.createdAt ? new Date(entry.createdAt.seconds * 1000).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Time not available'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{entry.calories || 0} cal</p>
                          <p className="text-xs text-gray-500">
                            P:{entry.protein || entry.totalProtein || 0}g C:{entry.carbs || entry.totalCarbs || 0}g F:{entry.fat || entry.totalFat || 0}g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Flame className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No meals logged today</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}

      {selectedPeriod === 'week' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Weekly Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dailyGoals.map((goal, index) => (
              <motion.div
                key={goal.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${goal.bgColor} rounded-full flex items-center justify-center`}>
                      <goal.icon className="w-5 h-5" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{goal.label}</h3>
                      <p className="text-sm text-gray-600">
                        Avg: {calculateWeeklyAverage(contextWeeklyData, goal.key)} {goal.unit}
                      </p>
                    </div>
                  </div>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                
                <WeeklyChart
                  data={contextWeeklyData}
                  metric={goal.key}
                  color={goal.color}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {selectedPeriod === 'month' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dailyGoals.map((goal, index) => {
              const monthlyAvg = calculateWeeklyAverage(contextMonthlyData, goal.key);
              const monthlyProgress = (monthlyAvg / goal.target) * 100;
              
              return (
                <motion.div
                  key={goal.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="glass-card p-6 text-center"
                >
                  <div className={`w-16 h-16 ${goal.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <goal.icon className="w-8 h-8" style={{ color: goal.color }} />
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2">{goal.label}</h3>
                  
                  <div className="w-12 h-12 mx-auto mb-3">
                    <CircularProgressbar
                      value={monthlyProgress}
                      text={`${monthlyProgress.toFixed(0)}%`}
                      styles={buildStyles({
                        pathColor: goal.color,
                        textColor: goal.color,
                        trailColor: '#f3f4f6',
                        textSize: '24px',
                      })}
                    />
                  </div>
                  
                  <p className="text-lg font-bold" style={{ color: goal.color }}>
                    {monthlyAvg}
                  </p>
                  <p className="text-sm text-gray-600">
                    Daily Average
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Goal: {goal.target} {goal.unit}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'First Day Complete',
              description: 'Logged your first day of data',
              icon: '🎯',
              achieved: (dailyData.totalCalories || dailyData.calories || 0) > 0 || (dailyData.water || 0) > 0,
              color: 'bg-green-100 text-green-800'
            },
            {
              title: 'Water Warrior',
              description: 'Drink 8 glasses of water in a day',
              icon: '💧',
              achieved: (dailyData.water || 0) >= 8,
              color: 'bg-blue-100 text-blue-800'
            },
            {
              title: 'Step Master',
              description: 'Reach 10,000 steps in a day',
              icon: '👟',
              achieved: (dailyData.steps || 0) >= 10000,
              color: 'bg-purple-100 text-purple-800'
            },
            {
              title: 'Nutrition Balance',
              description: 'Log all macronutrients',
              icon: '🥗',
              achieved: (dailyData.totalProtein || dailyData.protein || 0) > 0 &&
                       (dailyData.totalCarbs || dailyData.carbs || 0) > 0 &&
                       (dailyData.totalFat || dailyData.fat || 0) > 0,
              color: 'bg-yellow-100 text-yellow-800'
            },
            {
              title: 'Sleep Champion',
              description: 'Get 8 hours of sleep',
              icon: '😴',
              achieved: (dailyData.sleep || 0) >= 8,
              color: 'bg-indigo-100 text-indigo-800'
            },
            {
              title: 'Weekly Warrior',
              description: 'Complete 7 days of tracking',
              icon: '🏆',
              achieved: contextWeeklyData.filter(day => (day.totalCalories || day.calories || 0) > 0).length >= 7,
              color: 'bg-orange-100 text-orange-800'
            }
          ].map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`glass-card p-4 ${achievement.achieved ? 'ring-2 ring-green-400' : 'opacity-60'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                {achievement.achieved && (
                  <Award className="w-6 h-6 text-green-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
            Health Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Progress Summary</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>You've logged {(dailyData.foodEntriesData || dailyData.foodEntries || []).length} meals today</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Average weekly calories: {calculateWeeklyAverage(contextWeeklyData, 'totalCalories')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Water intake is {(dailyData.water || 0) >= 2.0 ? 'excellent' : 'needs improvement'}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {(dailyData.water || 0) < 6 && (
                  <li className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Try to increase your water intake</span>
                  </li>
                )}
                {(dailyData.steps || 0) < 8000 && (
                  <li className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span>Take a short walk to boost your step count</span>
                  </li>
                )}
                {(dailyData.sleep || 0) < 7 && (
                  <li className="flex items-center space-x-2">
                    <Moon className="w-4 h-4 text-purple-500" />
                    <span>Consider getting more sleep for better recovery</span>
                  </li>
                )}
                {((dailyData.foodEntriesData || dailyData.foodEntries || []).length === 0) && (
                  <li className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>Start logging your meals to track nutrition</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step Sync Modal */}
      {showStepSync && (
        <StepSync onClose={() => setShowStepSync(false)} />
      )}
    </div>
  );
};

export default ProgressTracker;