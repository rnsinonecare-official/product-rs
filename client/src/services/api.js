import axios from 'axios';
import { auth } from '../firebase/config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken(true); // Force refresh
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } else {
          // No user logged in, redirect to login
          console.warn('No authenticated user found, redirecting to login');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear any stored auth data and redirect to login
        try {
          await auth.signOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      
      // For specific endpoints, provide fallback responses
      if (originalRequest.url?.includes('/admin/announcements/active')) {
        return { data: [] };
      }
      if (originalRequest.url?.includes('/admin/success-stories/active')) {
        return { data: [] };
      }
      if (originalRequest.url?.includes('/admin/health-tips/active')) {
        return { data: [] };
      }
      if (originalRequest.url?.includes('/updates/active')) {
        return { data: [] };
      }
    }

    // Handle 404 errors gracefully for non-critical endpoints
    if (error.response?.status === 404) {
      console.warn('API endpoint not found:', originalRequest.url);
      
      // Return empty data for content endpoints
      if (originalRequest.url?.includes('/admin/') || originalRequest.url?.includes('/updates/')) {
        return { data: [] };
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  verifyToken: (idToken) => api.post('/auth/verify-token', { idToken }),
  createUser: (userData) => api.post('/auth/create-user', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  deleteAccount: () => api.delete('/auth/account'),
};

// Food API
export const foodAPI = {
  search: (query, limit = 20) => {
    if (!query || typeof query !== 'string') {
      return Promise.reject(new Error('Query parameter is required and must be a string'));
    }
    return api.get('/food/search', { params: { q: query.trim(), limit: Math.max(1, Math.min(100, limit)) } });
  },
  
  getNutrition: (foodId, quantity = 100, measure = 'gram') => {
    if (!foodId) {
      return Promise.reject(new Error('Food ID is required'));
    }
    return api.get(`/food/nutrition/${encodeURIComponent(foodId)}`, { 
      params: { 
        quantity: Math.max(1, quantity), 
        measure: measure || 'gram' 
      } 
    });
  },
  
  // Food Diary
  addEntry: (foodData) => {
    if (!foodData || typeof foodData !== 'object') {
      return Promise.reject(new Error('Food data is required'));
    }
    return api.post('/food/diary', foodData);
  },
  
  getEntries: (params = {}) => api.get('/food/diary', { params }),
  
  updateEntry: (entryId, updateData) => {
    if (!entryId) {
      return Promise.reject(new Error('Entry ID is required'));
    }
    if (!updateData || typeof updateData !== 'object') {
      return Promise.reject(new Error('Update data is required'));
    }
    return api.put(`/food/diary/${encodeURIComponent(entryId)}`, updateData);
  },
  
  deleteEntry: (entryId) => {
    if (!entryId) {
      return Promise.reject(new Error('Entry ID is required'));
    }
    return api.delete(`/food/diary/${encodeURIComponent(entryId)}`);
  },
  
  getAnalytics: (days = 30) => api.get('/food/analytics', { 
    params: { days: Math.max(1, Math.min(365, days)) } 
  }),
};

// Recipe API
export const recipeAPI = {
  search: (ingredients, number = 12) => {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return Promise.reject(new Error('Ingredients array is required and must not be empty'));
    }
    const validIngredients = ingredients.filter(ing => ing && typeof ing === 'string' && ing.trim());
    if (validIngredients.length === 0) {
      return Promise.reject(new Error('At least one valid ingredient is required'));
    }
    return api.get('/recipes/search', { 
      params: { 
        ingredients: validIngredients.map(ing => ing.trim()).join(','), 
        number: Math.max(1, Math.min(50, number)) 
      } 
    });
  },
  
  getDetails: (recipeId) => {
    if (!recipeId) {
      return Promise.reject(new Error('Recipe ID is required'));
    }
    return api.get(`/recipes/${encodeURIComponent(recipeId)}`);
  },
  
  // Favorites
  addToFavorites: (recipeData) => {
    if (!recipeData || typeof recipeData !== 'object') {
      return Promise.reject(new Error('Recipe data is required'));
    }
    return api.post('/recipes/favorites', recipeData);
  },
  
  getFavorites: (limit = 50) => api.get('/recipes/favorites/list', { 
    params: { limit: Math.max(1, Math.min(100, limit)) } 
  }),
  
  removeFavorite: (favoriteId) => {
    if (!favoriteId) {
      return Promise.reject(new Error('Favorite ID is required'));
    }
    return api.delete(`/recipes/favorites/${encodeURIComponent(favoriteId)}`);
  },
  
  // Shared Recipes
  shareRecipe: (recipeData) => {
    if (!recipeData || typeof recipeData !== 'object') {
      return Promise.reject(new Error('Recipe data is required'));
    }
    return api.post('/recipes/shared', recipeData);
  },
  
  getSharedRecipes: (params = {}) => api.get('/recipes/shared/list', { params }),
  
  getMySharedRecipes: (limit = 50) => api.get('/recipes/my-shared/list', { 
    params: { limit: Math.max(1, Math.min(100, limit)) } 
  }),
  
  likeRecipe: (recipeId) => {
    if (!recipeId) {
      return Promise.reject(new Error('Recipe ID is required'));
    }
    return api.post(`/recipes/shared/${encodeURIComponent(recipeId)}/like`);
  },
  
  unlikeRecipe: (recipeId) => {
    if (!recipeId) {
      return Promise.reject(new Error('Recipe ID is required'));
    }
    return api.delete(`/recipes/shared/${encodeURIComponent(recipeId)}/like`);
  },
};

// Health API
export const healthAPI = {
  // Metrics
  saveMetrics: (metricsData) => {
    if (!metricsData || typeof metricsData !== 'object') {
      return Promise.reject(new Error('Metrics data is required'));
    }
    return api.post('/health/metrics', metricsData);
  },
  
  getMetrics: (params = {}) => api.get('/health/metrics', { params }),
  
  updateMetrics: (metricId, updateData) => {
    if (!metricId) {
      return Promise.reject(new Error('Metric ID is required'));
    }
    if (!updateData || typeof updateData !== 'object') {
      return Promise.reject(new Error('Update data is required'));
    }
    return api.put(`/health/metrics/${encodeURIComponent(metricId)}`, updateData);
  },
  
  deleteMetrics: (metricId) => {
    if (!metricId) {
      return Promise.reject(new Error('Metric ID is required'));
    }
    return api.delete(`/health/metrics/${encodeURIComponent(metricId)}`);
  },
  
  // Goals
  setGoals: (goalsData) => {
    if (!goalsData || typeof goalsData !== 'object') {
      return Promise.reject(new Error('Goals data is required'));
    }
    return api.post('/health/goals', goalsData);
  },
  
  getGoals: () => api.get('/health/goals'),
  
  // Progress & Analytics
  getProgress: (days = 30) => api.get('/health/progress', { 
    params: { days: Math.max(1, Math.min(365, days)) } 
  }),
  
  getDashboard: () => api.get('/health/dashboard'),
};

// AI API
export const aiAPI = {
  analyzeFoodImage: (imageFile, healthConditions = []) => {
    if (!imageFile || !(imageFile instanceof File)) {
      return Promise.reject(new Error('Valid image file is required'));
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return Promise.reject(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed'));
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return Promise.reject(new Error('File size too large. Maximum size is 10MB'));
    }
    
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('healthConditions', JSON.stringify(Array.isArray(healthConditions) ? healthConditions : []));
    
    return api.post('/ai/analyze-food-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000 // 60 seconds for image analysis
    });
  },
  
  analyzeFoodByName: (foodName, healthConditions = []) => {
    if (!foodName || typeof foodName !== 'string' || !foodName.trim()) {
      return Promise.reject(new Error('Food name is required and must be a non-empty string'));
    }
    return api.post('/ai/analyze-food-name', { 
      foodName: foodName.trim(), 
      healthConditions: Array.isArray(healthConditions) ? healthConditions : [] 
    });
  },
  
  generateRecipe: (ingredients, healthConditions = [], dietaryPreferences = {}) => {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return Promise.reject(new Error('Ingredients array is required and must not be empty'));
    }
    const validIngredients = ingredients.filter(ing => ing && typeof ing === 'string' && ing.trim());
    if (validIngredients.length === 0) {
      return Promise.reject(new Error('At least one valid ingredient is required'));
    }
    return api.post('/ai/generate-recipe', { 
      ingredients: validIngredients.map(ing => ing.trim()), 
      healthConditions: Array.isArray(healthConditions) ? healthConditions : [], 
      dietaryPreferences: dietaryPreferences || {} 
    });
  },
  
  generateMultipleRecipes: (ingredients, healthConditions = [], dietType = 'vegetarian') => {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return Promise.reject(new Error('Ingredients array is required and must not be empty'));
    }
    const validIngredients = ingredients.filter(ing => ing && typeof ing === 'string' && ing.trim());
    if (validIngredients.length === 0) {
      return Promise.reject(new Error('At least one valid ingredient is required'));
    }
    const validDietTypes = ['vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'low-carb', 'high-protein'];
    const validatedDietType = validDietTypes.includes(dietType) ? dietType : 'vegetarian';
    
    return api.post('/ai/generate-multiple-recipes', { 
      ingredients: validIngredients.map(ing => ing.trim()), 
      healthConditions: Array.isArray(healthConditions) ? healthConditions : [], 
      dietType: validatedDietType 
    });
  },
  
  chat: (message, context = {}, healthConditions = []) => {
    if (!message || typeof message !== 'string' || !message.trim()) {
      return Promise.reject(new Error('Message is required and must be a non-empty string'));
    }
    return api.post('/ai/chat', { 
      message: message.trim(), 
      context: context || {}, 
      healthConditions: Array.isArray(healthConditions) ? healthConditions : [] 
    });
  },
  
  generateMealPlan: (options) => {
    if (!options || typeof options !== 'object') {
      return Promise.reject(new Error('Meal plan options are required'));
    }
    return api.post('/ai/meal-plan', options);
  },
  
  getNutritionAdvice: (query, userProfile = {}, healthConditions = []) => {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return Promise.reject(new Error('Query is required and must be a non-empty string'));
    }
    return api.post('/ai/nutrition-advice', { 
      query: query.trim(), 
      userProfile: userProfile || {}, 
      healthConditions: Array.isArray(healthConditions) ? healthConditions : [] 
    });
  },
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  
  updateProfile: (profileData) => {
    if (!profileData || typeof profileData !== 'object') {
      return Promise.reject(new Error('Profile data is required'));
    }
    return api.put('/user/profile', profileData);
  },
  
  // Preferences
  getPreferences: () => api.get('/user/preferences'),
  
  updatePreferences: (preferences) => {
    if (!preferences || typeof preferences !== 'object') {
      return Promise.reject(new Error('Preferences data is required'));
    }
    return api.post('/user/preferences', preferences);
  },
  
  // Activity & Stats
  getActivity: (days = 30) => api.get('/user/activity', { 
    params: { days: Math.max(1, Math.min(365, days)) } 
  }),
  
  getStats: () => api.get('/user/stats'),
  
  // Data Management
  exportData: () => api.get('/user/export', {
    timeout: 120000 // 2 minutes for data export
  }),
  
  deleteData: (dataTypes, confirmDelete = true) => {
    if (!dataTypes || !Array.isArray(dataTypes) || dataTypes.length === 0) {
      return Promise.reject(new Error('Data types array is required and must not be empty'));
    }
    const validDataTypes = ['profile', 'diary', 'metrics', 'favorites', 'shared', 'all'];
    const validTypes = dataTypes.filter(type => validDataTypes.includes(type));
    if (validTypes.length === 0) {
      return Promise.reject(new Error('At least one valid data type is required'));
    }
    return api.delete('/user/data', { 
      data: { 
        dataTypes: validTypes, 
        confirmDelete: Boolean(confirmDelete) 
      } 
    });
  },
};

// Generic API helper functions
export const apiHelpers = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        status,
        message: data?.message || data?.error || 'An error occurred',
        error: data?.error || 'ServerError',
        details: data?.details || null
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
        error: 'NetworkError',
        details: 'No response received from server'
      };
    } else {
      // Something else happened
      return {
        status: 0,
        message: error.message || 'An unexpected error occurred',
        error: 'UnknownError',
        details: error.stack || null
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    try {
      return !!auth.currentUser;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  },

  // Get current user token with error handling
  getCurrentUserToken: async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  },

  // Get current user token with force refresh
  getCurrentUserTokenForced: async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken(true); // Force refresh
      }
      return null;
    } catch (error) {
      console.error('Error getting refreshed user token:', error);
      return null;
    }
  },

  // Validate response data structure
  validateResponse: (response, expectedFields = []) => {
    if (!response || !response.data) {
      throw new Error('Invalid response structure');
    }
    
    if (expectedFields.length > 0) {
      const missingFields = expectedFields.filter(field => !(field in response.data));
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
    }
    
    return response.data;
  },

  // Create a safe API call wrapper
  safeApiCall: async (apiCall, fallbackValue = null) => {
    try {
      const response = await apiCall();
      return response.data;
    } catch (error) {
      console.error('API call failed:', apiHelpers.handleError(error));
      return fallbackValue;
    }
  }
};

export default api;