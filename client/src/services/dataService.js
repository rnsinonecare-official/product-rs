// Data service — all reads/writes go through the backend API (no direct DB).
import api from "./api";

// ---- Food Diary ----
export const addFoodEntry = async (userId, foodData) =>
  (await api.post("/data/food-diary", foodData)).data;

export const getFoodEntriesByDate = async (userId, date) =>
  (await api.get("/data/food-diary", { params: { date } })).data;

export const updateFoodEntry = async (entryId, updates) => {
  await api.put(`/data/food-diary/${entryId}`, updates);
  return true;
};

export const deleteFoodEntry = async (entryId) => {
  await api.delete(`/data/food-diary/${entryId}`);
  return true;
};

// ---- Health Metrics ----
export const saveHealthMetrics = async (userId, metrics) =>
  (await api.post("/data/health-metrics", metrics)).data;

export const getHealthMetrics = async (userId, startDate, endDate) =>
  (await api.get("/data/health-metrics", { params: { startDate, endDate } })).data;

// ---- Daily Health Metrics (water/steps/sleep) ----
export const saveDailyHealthMetrics = async (userId, date, metrics) =>
  (await api.put(`/data/daily-health-metrics/${date}`, metrics)).data;

export const getDailyHealthMetrics = async (userId, date) =>
  (await api.get(`/data/daily-health-metrics/${date}`)).data;

export const getDailyHealthMetricsRange = async (userId, startDate, endDate) =>
  (
    await api.get("/data/daily-health-metrics/range", {
      params: { startDate, endDate },
    })
  ).data;

export const updateDailyHealthMetric = async (userId, date, metric, value) =>
  (await api.put(`/data/daily-health-metrics/${date}`, { [metric]: value })).data;

// ---- Favorite Recipes ----
export const saveFavoriteRecipe = async (userId, recipeData) =>
  (await api.post("/data/favorite-recipes", recipeData)).data;

export const getFavoriteRecipes = async (userId) =>
  (await api.get("/data/favorite-recipes")).data;

export const removeFavoriteRecipe = async (recipeId) => {
  await api.delete(`/data/favorite-recipes/${recipeId}`);
  return true;
};

// ---- Goals ----
export const saveUserGoals = async (userId, goals) => {
  await api.put("/data/goals", goals);
  return goals;
};

export const getUserGoals = async (userId) =>
  (await api.get("/data/goals")).data;

// ---- Community ----
export const saveSharedRecipe = async (userId, recipeData) =>
  (await api.post("/data/shared-recipes", recipeData)).data;

export const getSharedRecipes = async (limitCount = 20) =>
  (await api.get("/data/shared-recipes", { params: { limit: limitCount } })).data;

// ---- Batch ----
export const saveDailyNutritionBatch = async (userId, nutritionData) => {
  await api.post("/data/food-diary/batch", { entries: nutritionData });
  return true;
};

// ---- Export ----
export const exportUserData = async (userId) =>
  (await api.get("/data/export")).data;

// ---- Analytics (computed client-side from backend data) ----
export const getNutritionAnalytics = async (userId, dateRange = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - dateRange);
  const s = startDate.toISOString().split("T")[0];
  const e = endDate.toISOString().split("T")[0];

  const [foodEntries, healthMetrics] = await Promise.all([
    api.get("/data/food-diary", { params: { startDate: s, endDate: e } }).then((r) => r.data),
    api.get("/data/health-metrics", { params: { startDate: s, endDate: e } }).then((r) => r.data),
  ]);

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
    macroBreakdown: { protein: 0, carbs: 0, fat: 0 },
  };

  const entriesByDate = {};
  (foodEntries || []).forEach((entry) => {
    if (!entriesByDate[entry.date]) entriesByDate[entry.date] = [];
    entriesByDate[entry.date].push(entry);
  });

  Object.keys(entriesByDate).forEach((date) => {
    const dayTotals = entriesByDate[date].reduce(
      (t, entry) => ({
        calories: t.calories + (entry.calories || 0),
        protein: t.protein + (entry.protein || 0),
        carbs: t.carbs + (entry.carbs || 0),
        fat: t.fat + (entry.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    analytics.totalCalories += dayTotals.calories;
    analytics.totalProtein += dayTotals.protein;
    analytics.totalCarbs += dayTotals.carbs;
    analytics.totalFat += dayTotals.fat;
    analytics.daysTracked++;
    analytics.caloriesTrend.push({ date, calories: dayTotals.calories });
  });

  if (analytics.daysTracked > 0) {
    analytics.avgCaloriesPerDay = Math.round(
      analytics.totalCalories / analytics.daysTracked
    );
    const totalMacros =
      analytics.totalProtein + analytics.totalCarbs + analytics.totalFat;
    if (totalMacros > 0) {
      analytics.macroBreakdown = {
        protein: Math.round((analytics.totalProtein / totalMacros) * 100),
        carbs: Math.round((analytics.totalCarbs / totalMacros) * 100),
        fat: Math.round((analytics.totalFat / totalMacros) * 100),
      };
    }
  }

  analytics.weightProgress = (healthMetrics || [])
    .filter((m) => m.weight)
    .map((m) => ({ date: m.date, weight: m.weight }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return analytics;
};

const dataService = {
  addFoodEntry,
  getFoodEntriesByDate,
  updateFoodEntry,
  deleteFoodEntry,
  saveHealthMetrics,
  getHealthMetrics,
  saveDailyHealthMetrics,
  getDailyHealthMetrics,
  getDailyHealthMetricsRange,
  updateDailyHealthMetric,
  saveFavoriteRecipe,
  getFavoriteRecipes,
  removeFavoriteRecipe,
  saveUserGoals,
  getUserGoals,
  getNutritionAnalytics,
  saveSharedRecipe,
  getSharedRecipes,
  saveDailyNutritionBatch,
  exportUserData,
};

export default dataService;
