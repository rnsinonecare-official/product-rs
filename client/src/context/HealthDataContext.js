import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import dailyIntakeService from '../services/dailyIntakeService';
import dataService from '../services/dataService';

const HealthDataContext = createContext();

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

export const HealthDataProvider = ({ children }) => {
  const { user, isAuthenticated } = useUser();
  const [dailyData, setDailyData] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    water: 0,
    steps: 0,
    sleep: 0,
    mood: 'neutral',
    foodEntries: [],
    foodEntriesData: [],
    date: new Date().toISOString().split('T')[0],
  });
  
  const [userGoals, setUserGoals] = useState({
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 250,
    fatGoal: 65,
    waterGoal: 8,
    stepsGoal: 10000,
    sleepGoal: 8
  });
  
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load today's data on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTodayDataFromFirestore();
      loadUserGoals();
    } else {
      loadTodayData();
    }
  }, [user, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTodayDataFromFirestore = async () => {
    setLoading(true);
    try {
      console.log('Loading today\'s data from Firestore...');
      
      // Get today's intake data
      const todayIntake = await dailyIntakeService.getTodayIntake();
      console.log('Today\'s intake loaded:', todayIntake);
      
      // Get today's food entries
      const foodEntries = await dailyIntakeService.getTodayFoodEntries();
      console.log('Food entries loaded:', foodEntries);
      
      // Update daily data state
      setDailyData({
        totalCalories: todayIntake.totalCalories || 0,
        totalProtein: todayIntake.totalProtein || 0,
        totalCarbs: todayIntake.totalCarbs || 0,
        totalFat: todayIntake.totalFat || 0,
        totalFiber: todayIntake.totalFiber || 0,
        water: todayIntake.water || 0,
        steps: todayIntake.steps || 0,
        sleep: todayIntake.sleep || 0,
        mood: todayIntake.mood || 'neutral',
        foodEntries: todayIntake.foodEntries || [],
        foodEntriesData: foodEntries,
        date: todayIntake.date
      });
      
      // Load weekly data
      const weeklyData = await dailyIntakeService.getWeeklyData();
      setWeeklyData(weeklyData);
      
    } catch (error) {
      console.error('Error loading today\'s data from Firestore:', error);
      // Fallback to default data
      setDailyData({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        water: 0,
        steps: 0,
        sleep: 0,
        mood: 'neutral',
        foodEntries: [],
        foodEntriesData: [],
        date: new Date().toISOString().split('T')[0],
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserGoals = async () => {
    try {
      const goals = await dailyIntakeService.getUserGoals();
      setUserGoals(goals);
    } catch (error) {
      console.error('Error loading user goals:', error);
    }
  };

  const loadTodayDataFromFirebase = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Load food entries and health metrics in parallel
      const [foodEntries, healthMetrics] = await Promise.all([
        dataService.getFoodEntriesByDate(user.uid, today),
        dataService.getDailyHealthMetrics(user.uid, today)
      ]);
      
      // Calculate totals from food entries
      const totals = foodEntries.reduce((acc, entry) => ({
        calories: acc.calories + (entry.calories || 0),
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        fat: acc.fat + (entry.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      const dailyData = {
        ...totals,
        water: healthMetrics?.water || 0,
        steps: healthMetrics?.steps || 0,
        sleep: healthMetrics?.sleep || 0,
        mood: healthMetrics?.mood || 'neutral',
        foodEntries,
        date: today,
      };

      setDailyData(dailyData);
    } catch (error) {
      console.error('Error loading Firebase data:', error);
      // Fallback to localStorage
      loadTodayData();
    } finally {
      setLoading(false);
    }
  };

  const loadTodayData = () => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem(`healthData_${today}`);
    
    if (savedData) {
      setDailyData(JSON.parse(savedData));
    } else {
      // Initialize with default values
      const defaultData = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        water: 0,
        steps: 0,
        sleep: 0,
        mood: 'neutral',
        foodEntries: [],
        date: today,
      };
      setDailyData(defaultData);
      localStorage.setItem(`healthData_${today}`, JSON.stringify(defaultData));
    }
  };

  const addFoodEntry = async (foodData) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error('Authentication required to add food entries');
      }

      console.log('Adding food entry to Firestore:', foodData);
      
      // Add to Firestore using the new service
      const newEntry = await dailyIntakeService.addFoodEntry(foodData);
      console.log('Food entry added successfully:', newEntry);

      // Update local state immediately for better UX
      const updatedData = {
        ...dailyData,
        totalCalories: dailyData.totalCalories + (foodData.calories || 0),
        totalProtein: dailyData.totalProtein + (foodData.protein || 0),
        totalCarbs: dailyData.totalCarbs + (foodData.carbs || 0),
        totalFat: dailyData.totalFat + (foodData.fat || 0),
        totalFiber: dailyData.totalFiber + (foodData.fiber || 0),
        foodEntriesData: [newEntry, ...dailyData.foodEntriesData],
        foodEntries: [...dailyData.foodEntries, newEntry.id],
      };

      setDailyData(updatedData);
      return newEntry;
    } catch (error) {
      console.error('Error adding food entry:', error);
      throw error;
    }
  };

  const updateDailyMetric = async (metric, value) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error('Authentication required to update metrics');
      }

      console.log(`Updating ${metric} to ${value}`);

      // Update in Firestore using the new service
      switch (metric) {
        case 'water':
          await dailyIntakeService.updateWaterIntake(value - dailyData.water);
          break;
        case 'steps':
          await dailyIntakeService.updateSteps(value);
          break;
        case 'sleep':
          await dailyIntakeService.updateSleep(value);
          break;
        case 'mood':
          await dailyIntakeService.updateMood(value);
          break;
        case 'calories':
          await dailyIntakeService.updateCalories(value);
          break;
        default:
          console.warn(`Unknown metric: ${metric}`);
          return;
      }

      // Update local state
      const updatedData = {
        ...dailyData,
        // Map 'calories' to 'totalCalories' for consistency
        [metric === 'calories' ? 'totalCalories' : metric]: value,
      };

      setDailyData(updatedData);
      console.log(`${metric} updated successfully to ${value}`);

      return updatedData;
    } catch (error) {
      console.error('Error updating daily metric:', error);
      throw error;
    }
  };

  const removeFoodEntry = async (foodEntryId) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error('Authentication required to remove food entries');
      }

      console.log('Removing food entry:', foodEntryId);

      // Find the food entry to get its nutritional values
      const foodEntry = dailyData.foodEntriesData.find(entry => entry.id === foodEntryId);
      if (!foodEntry) {
        throw new Error('Food entry not found');
      }

      // Remove from Firestore
      await dailyIntakeService.removeFoodEntry(foodEntryId);

      // Update local state
      const updatedData = {
        ...dailyData,
        totalCalories: Math.max(0, dailyData.totalCalories - (foodEntry.calories || 0)),
        totalProtein: Math.max(0, dailyData.totalProtein - (foodEntry.protein || 0)),
        totalCarbs: Math.max(0, dailyData.totalCarbs - (foodEntry.carbs || 0)),
        totalFat: Math.max(0, dailyData.totalFat - (foodEntry.fat || 0)),
        totalFiber: Math.max(0, dailyData.totalFiber - (foodEntry.fiber || 0)),
        foodEntriesData: dailyData.foodEntriesData.filter(entry => entry.id !== foodEntryId),
        foodEntries: dailyData.foodEntries.filter(id => id !== foodEntryId),
      };

      setDailyData(updatedData);
      console.log('Food entry removed successfully');
      return true;
    } catch (error) {
      console.error('Error removing food entry:', error);
      throw error;
    }
  };

  const updateUserGoals = async (goals) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error('Authentication required to update goals');
      }

      console.log('Updating user goals:', goals);
      await dailyIntakeService.updateUserGoals(goals);
      setUserGoals(goals);
      console.log('User goals updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user goals:', error);
      throw error;
    }
  };

  const addWaterIntake = async (amount = 250) => {
    try {
      const newWaterAmount = dailyData.water + amount;
      await updateDailyMetric('water', newWaterAmount);
      return newWaterAmount;
    } catch (error) {
      console.error('Error adding water intake:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    if (isAuthenticated && user) {
      await loadTodayDataFromFirestore();
      await loadUserGoals();
    }
  };

  // Legacy function for backward compatibility
  const getWeeklyDataLegacy = async () => {
    try {
      if (isAuthenticated && user) {
        return await dailyIntakeService.getWeeklyData();
      }
      return [];
    } catch (error) {
      console.error('Error getting weekly data:', error);
      return [];
    }
  };

  const getWeeklyData = async () => {
    try {
      const today = new Date();
      const weekData = [];
      
      if (isAuthenticated && user) {
        // Calculate date range for the week
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        const startDateString = startDate.toISOString().split('T')[0];
        
        // Get data from database
        const [healthMetricsData] = await Promise.all([
          dataService.getDailyHealthMetricsRange(user.uid, startDateString, endDate)
        ]);
        
        // Create a map for quick lookup
        const healthMetricsMap = {};
        healthMetricsData.forEach(metric => {
          healthMetricsMap[metric.date] = metric;
        });
        
        // Build week data
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          // Get food entries for this date
          let foodEntries = [];
          let foodTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          
          try {
            foodEntries = await dataService.getFoodEntriesByDate(user.uid, dateString);
            foodTotals = foodEntries.reduce((acc, entry) => ({
              calories: acc.calories + (entry.calories || 0),
              protein: acc.protein + (entry.protein || 0),
              carbs: acc.carbs + (entry.carbs || 0),
              fat: acc.fat + (entry.fat || 0)
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
          } catch (error) {
            console.error(`Error loading food entries for ${dateString}:`, error);
          }
          
          const healthMetrics = healthMetricsMap[dateString] || {};
          
          weekData.push({
            date: dateString,
            ...foodTotals,
            water: healthMetrics.water || 0,
            steps: healthMetrics.steps || 0,
            sleep: healthMetrics.sleep || 0,
            mood: healthMetrics.mood || 'neutral',
            foodEntries,
          });
        }
      } else {
        // Fallback to localStorage for non-authenticated users
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          const dayData = localStorage.getItem(`healthData_${dateString}`);
          if (dayData) {
            weekData.push(JSON.parse(dayData));
          } else {
            weekData.push({
              date: dateString,
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              water: 0,
              steps: 0,
              sleep: 0,
              foodEntries: [],
            });
          }
        }
      }
      
      setWeeklyData(weekData);
      return weekData;
    } catch (error) {
      console.error('Error getting weekly data:', error);
      // Fallback to localStorage
      const weekData = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayData = localStorage.getItem(`healthData_${dateString}`);
        if (dayData) {
          weekData.push(JSON.parse(dayData));
        } else {
          weekData.push({
            date: dateString,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            water: 0,
            steps: 0,
            sleep: 0,
            foodEntries: [],
          });
        }
      }
      
      setWeeklyData(weekData);
      return weekData;
    }
  };

  const getMonthlyData = async () => {
    try {
      const today = new Date();
      const monthData = [];
      
      if (isAuthenticated && user) {
        // Calculate date range for the month
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        const startDateString = startDate.toISOString().split('T')[0];
        
        // Get data from database
        const [healthMetricsData] = await Promise.all([
          dataService.getDailyHealthMetricsRange(user.uid, startDateString, endDate)
        ]);
        
        // Create a map for quick lookup
        const healthMetricsMap = {};
        healthMetricsData.forEach(metric => {
          healthMetricsMap[metric.date] = metric;
        });
        
        // Build month data
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          // Get food entries for this date
          let foodEntries = [];
          let foodTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          
          try {
            foodEntries = await dataService.getFoodEntriesByDate(user.uid, dateString);
            foodTotals = foodEntries.reduce((acc, entry) => ({
              calories: acc.calories + (entry.calories || 0),
              protein: acc.protein + (entry.protein || 0),
              carbs: acc.carbs + (entry.carbs || 0),
              fat: acc.fat + (entry.fat || 0)
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
          } catch (error) {
            console.error(`Error loading food entries for ${dateString}:`, error);
          }
          
          const healthMetrics = healthMetricsMap[dateString] || {};
          
          monthData.push({
            date: dateString,
            ...foodTotals,
            water: healthMetrics.water || 0,
            steps: healthMetrics.steps || 0,
            sleep: healthMetrics.sleep || 0,
            mood: healthMetrics.mood || 'neutral',
            foodEntries,
          });
        }
      } else {
        // Fallback to localStorage for non-authenticated users
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          const dayData = localStorage.getItem(`healthData_${dateString}`);
          if (dayData) {
            monthData.push(JSON.parse(dayData));
          } else {
            monthData.push({
              date: dateString,
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              water: 0,
              steps: 0,
              sleep: 0,
              foodEntries: [],
            });
          }
        }
      }
      
      setMonthlyData(monthData);
      return monthData;
    } catch (error) {
      console.error('Error getting monthly data:', error);
      // Fallback to localStorage
      const monthData = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayData = localStorage.getItem(`healthData_${dateString}`);
        if (dayData) {
          monthData.push(JSON.parse(dayData));
        } else {
          monthData.push({
            date: dateString,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            water: 0,
            steps: 0,
            sleep: 0,
            foodEntries: [],
          });
        }
      }
      
      setMonthlyData(monthData);
      return monthData;
    }
  };



  const clearAllData = () => {
    // Clear all health data from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('healthData_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Reset state
    loadTodayData();
    setWeeklyData([]);
    setMonthlyData([]);
  };

  const value = {
    dailyData,
    weeklyData,
    monthlyData,
    userGoals,
    loading,
    addFoodEntry,
    updateDailyMetric,
    removeFoodEntry,
    updateUserGoals,
    addWaterIntake,
    refreshData,
    getWeeklyData: getWeeklyDataLegacy,
    getMonthlyData,
    clearAllData,
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};