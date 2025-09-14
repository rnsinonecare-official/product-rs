// Firebase Firestore Data Service
import { 
  doc, 
  collection,
  addDoc,
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../App';

// Food Diary Management
export const addFoodEntry = async (userId, foodData) => {
  try {
    const foodEntry = {
      ...foodData,
      userId,
      createdAt: serverTimestamp(),
      date: foodData.date || new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };

    const docRef = await addDoc(collection(db, 'foodDiary'), foodEntry);
    return { id: docRef.id, ...foodEntry };
  } catch (error) {
    console.error('Error adding food entry:', error);
    throw new Error('Failed to add food entry');
  }
};

export const getFoodEntriesByDate = async (userId, date) => {
  try {
    const q = query(
      collection(db, 'foodDiary'),
      where('userId', '==', userId),
      where('date', '==', date),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting food entries:', error);
    // Check if it's a missing index error
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      throw new Error('Missing composite index for food entries query. Please contact support or check the console for index creation link.');
    }
    throw new Error('Failed to get food entries');
  }
};

export const updateFoodEntry = async (entryId, updates) => {
  try {
    const entryRef = doc(db, 'foodDiary', entryId);
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating food entry:', error);
    throw new Error('Failed to update food entry');
  }
};

export const deleteFoodEntry = async (entryId) => {
  try {
    await deleteDoc(doc(db, 'foodDiary', entryId));
    return true;
  } catch (error) {
    console.error('Error deleting food entry:', error);
    throw new Error('Failed to delete food entry');
  }
};

// Health Metrics Management
export const saveHealthMetrics = async (userId, metrics) => {
  try {
    const metricsData = {
      ...metrics,
      userId,
      createdAt: serverTimestamp(),
      date: metrics.date || new Date().toISOString().split('T')[0]
    };

    const docRef = await addDoc(collection(db, 'healthMetrics'), metricsData);
    return { id: docRef.id, ...metricsData };
  } catch (error) {
    console.error('Error saving health metrics:', error);
    throw new Error('Failed to save health metrics');
  }
};

// Daily Health Metrics (Water, Steps, Sleep) - using upsert pattern
export const saveDailyHealthMetrics = async (userId, date, metrics) => {
  try {
    // Use a document ID based on userId and date for upsert behavior
    const docId = `${userId}_${date}`;
    const metricsRef = doc(db, 'dailyHealthMetrics', docId);
    
    const metricsData = {
      ...metrics,
      userId,
      date,
      updatedAt: serverTimestamp()
    };

    await setDoc(metricsRef, metricsData, { merge: true });
    return { id: docId, ...metricsData };
  } catch (error) {
    console.error('Error saving daily health metrics:', error);
    throw new Error('Failed to save daily health metrics');
  }
};

export const getDailyHealthMetrics = async (userId, date) => {
  try {
    const docId = `${userId}_${date}`;
    const metricsDoc = await getDoc(doc(db, 'dailyHealthMetrics', docId));
    
    if (metricsDoc.exists()) {
      return { id: metricsDoc.id, ...metricsDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting daily health metrics:', error);
    throw new Error('Failed to get daily health metrics');
  }
};

export const getDailyHealthMetricsRange = async (userId, startDate, endDate) => {
  try {
    const q = query(
      collection(db, 'dailyHealthMetrics'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting daily health metrics range:', error);
    // Check if it's a missing index error
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      throw new Error('Missing composite index for daily health metrics query. Please contact support or check the console for index creation link.');
    }
    throw new Error('Failed to get daily health metrics range');
  }
};

export const updateDailyHealthMetric = async (userId, date, metric, value) => {
  try {
    const docId = `${userId}_${date}`;
    const metricsRef = doc(db, 'dailyHealthMetrics', docId);
    
    const updateData = {
      [metric]: value,
      userId,
      date,
      updatedAt: serverTimestamp()
    };

    await setDoc(metricsRef, updateData, { merge: true });
    return { id: docId, [metric]: value };
  } catch (error) {
    console.error('Error updating daily health metric:', error);
    throw new Error('Failed to update daily health metric');
  }
};

export const getHealthMetrics = async (userId, startDate, endDate) => {
  try {
    let q = query(
      collection(db, 'healthMetrics'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }

    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting health metrics:', error);
    // Check if it's a missing index error
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      throw new Error('Missing composite index for health metrics query. Please contact support or check the console for index creation link.');
    }
    throw new Error('Failed to get health metrics');
  }
};

// Recipe Management
export const saveFavoriteRecipe = async (userId, recipeData) => {
  try {
    const favoriteRecipe = {
      ...recipeData,
      userId,
      createdAt: serverTimestamp(),
      isFavorite: true
    };

    const docRef = await addDoc(collection(db, 'favoriteRecipes'), favoriteRecipe);
    return { id: docRef.id, ...favoriteRecipe };
  } catch (error) {
    console.error('Error saving favorite recipe:', error);
    throw new Error('Failed to save favorite recipe');
  }
};

export const getFavoriteRecipes = async (userId) => {
  try {
    const q = query(
      collection(db, 'favoriteRecipes'),
      where('userId', '==', userId),
      where('isFavorite', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting favorite recipes:', error);
    // Check if it's a missing index error
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      throw new Error('Missing composite index for favorite recipes query. Please contact support or check the console for index creation link.');
    }
    throw new Error('Failed to get favorite recipes');
  }
};

export const removeFavoriteRecipe = async (recipeId) => {
  try {
    await deleteDoc(doc(db, 'favoriteRecipes', recipeId));
    return true;
  } catch (error) {
    console.error('Error removing favorite recipe:', error);
    throw new Error('Failed to remove favorite recipe');
  }
};

// Goals Management
export const saveUserGoals = async (userId, goals) => {
  try {
    const goalsRef = doc(db, 'userGoals', userId);
    await setDoc(goalsRef, {
      ...goals,
      userId,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return goals;
  } catch (error) {
    console.error('Error saving user goals:', error);
    throw new Error('Failed to save user goals');
  }
};

export const getUserGoals = async (userId) => {
  try {
    const goalsDoc = await getDoc(doc(db, 'userGoals', userId));
    
    if (goalsDoc.exists()) {
      return goalsDoc.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user goals:', error);
    throw new Error('Failed to get user goals');
  }
};

// Analytics and Progress Tracking
export const getNutritionAnalytics = async (userId, dateRange = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - dateRange);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const foodEntries = await getFoodEntriesByDate(userId, startDateStr, endDateStr);
    const healthMetrics = await getHealthMetrics(userId, startDateStr, endDateStr);

    // Calculate nutrition analytics
    const analytics = {
      totalCalories: 0,
      avgCaloriesPerDay: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      daysTracked: 0,
      nutritionGoalAdherence: 0,
      weightProgress: [],
      caloriesTrend: [],
      macroBreakdown: {
        protein: 0,
        carbs: 0,
        fat: 0
      }
    };

    // Group food entries by date
    const entriesByDate = {};
    foodEntries.forEach(entry => {
      if (!entriesByDate[entry.date]) {
        entriesByDate[entry.date] = [];
      }
      entriesByDate[entry.date].push(entry);
    });

    // Calculate daily totals
    Object.keys(entriesByDate).forEach(date => {
      const dayEntries = entriesByDate[date];
      const dayTotals = dayEntries.reduce((totals, entry) => ({
        calories: totals.calories + (entry.calories || 0),
        protein: totals.protein + (entry.protein || 0),
        carbs: totals.carbs + (entry.carbs || 0),
        fat: totals.fat + (entry.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      analytics.totalCalories += dayTotals.calories;
      analytics.totalProtein += dayTotals.protein;
      analytics.totalCarbs += dayTotals.carbs;
      analytics.totalFat += dayTotals.fat;
      analytics.daysTracked++;

      analytics.caloriesTrend.push({
        date,
        calories: dayTotals.calories
      });
    });

    if (analytics.daysTracked > 0) {
      analytics.avgCaloriesPerDay = Math.round(analytics.totalCalories / analytics.daysTracked);
      
      const totalMacros = analytics.totalProtein + analytics.totalCarbs + analytics.totalFat;
      if (totalMacros > 0) {
        analytics.macroBreakdown = {
          protein: Math.round((analytics.totalProtein / totalMacros) * 100),
          carbs: Math.round((analytics.totalCarbs / totalMacros) * 100),
          fat: Math.round((analytics.totalFat / totalMacros) * 100)
        };
      }
    }

    // Add weight progress from health metrics
    analytics.weightProgress = healthMetrics
      .filter(metric => metric.weight)
      .map(metric => ({
        date: metric.date,
        weight: metric.weight
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return analytics;
  } catch (error) {
    console.error('Error getting nutrition analytics:', error);
    throw new Error('Failed to get nutrition analytics');
  }
};

// Community Features
export const saveSharedRecipe = async (userId, recipeData) => {
  try {
    const sharedRecipe = {
      ...recipeData,
      userId,
      createdAt: serverTimestamp(),
      likes: 0,
      views: 0,
      isPublic: true
    };

    const docRef = await addDoc(collection(db, 'sharedRecipes'), sharedRecipe);
    return { id: docRef.id, ...sharedRecipe };
  } catch (error) {
    console.error('Error sharing recipe:', error);
    throw new Error('Failed to share recipe');
  }
};

export const getSharedRecipes = async (limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'sharedRecipes'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting shared recipes:', error);
    // Check if it's a missing index error
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      throw new Error('Missing composite index for shared recipes query. Please contact support or check the console for index creation link.');
    }
    throw new Error('Failed to get shared recipes');
  }
};

// Batch Operations for Performance
export const saveDailyNutritionBatch = async (userId, nutritionData) => {
  try {
    const batch = writeBatch(db);
    
    nutritionData.forEach(entry => {
      const docRef = doc(collection(db, 'foodDiary'));
      batch.set(docRef, {
        ...entry,
        userId,
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error saving nutrition batch:', error);
    throw new Error('Failed to save nutrition data');
  }
};

// Data Export for User
export const exportUserData = async (userId) => {
  try {
    const userData = {
      foodDiary: [],
      healthMetrics: [],
      favoriteRecipes: [],
      goals: null,
      exportDate: new Date().toISOString()
    };

    // Get all user data
    const [foodEntries, healthMetrics, favoriteRecipes, goals] = await Promise.all([
      getDocs(query(collection(db, 'foodDiary'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'healthMetrics'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'favoriteRecipes'), where('userId', '==', userId))),
      getDoc(doc(db, 'userGoals', userId))
    ]);

    userData.foodDiary = foodEntries.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    userData.healthMetrics = healthMetrics.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    userData.favoriteRecipes = favoriteRecipes.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    userData.goals = goals.exists() ? goals.data() : null;

    return userData;
  } catch (error) {
    console.error('Error exporting user data:', error);
    // Check if it's a missing index error
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      throw new Error('Missing composite index for data export. Please contact support or check the console for index creation link.');
    }
    throw new Error('Failed to export user data');
  }
};

const dataService = {
  // Food Diary
  addFoodEntry,
  getFoodEntriesByDate,
  updateFoodEntry,
  deleteFoodEntry,
  
  // Health Metrics
  saveHealthMetrics,
  getHealthMetrics,
  
  // Daily Health Metrics (Water, Steps, Sleep)
  saveDailyHealthMetrics,
  getDailyHealthMetrics,
  getDailyHealthMetricsRange,
  updateDailyHealthMetric,
  
  // Recipes
  saveFavoriteRecipe,
  getFavoriteRecipes,
  removeFavoriteRecipe,
  
  // Goals
  saveUserGoals,
  getUserGoals,
  
  // Analytics
  getNutritionAnalytics,
  
  // Community
  saveSharedRecipe,
  getSharedRecipes,
  
  // Batch Operations
  saveDailyNutritionBatch,
  
  // Data Export
  exportUserData
};

export default dataService;