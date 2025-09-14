// Local Storage Service for User Data Persistence
class StorageService {
  constructor() {
    this.USER_PROFILE_KEY = 'rainscare_user_profile';
    this.USER_AUTH_KEY = 'rainscare_user_auth';
    this.LAST_LOGIN_KEY = 'rainscare_last_login';
    this.SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  }

  // Save user profile to local storage
  saveUserProfile(userId, profileData) {
    try {
      const dataToStore = {
        userId,
        profile: profileData,
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(dataToStore));
      console.log('✅ User profile saved to local storage');
      return true;
    } catch (error) {
      console.error('❌ Error saving user profile to local storage:', error);
      return false;
    }
  }

  // Get user profile from local storage
  getUserProfile(userId) {
    try {
      const storedData = localStorage.getItem(this.USER_PROFILE_KEY);
      
      if (!storedData) {
        console.log('No user profile found in local storage');
        return null;
      }

      const parsedData = JSON.parse(storedData);
      
      // Check if the stored profile is for the current user
      if (parsedData.userId !== userId) {
        console.log('Stored profile is for different user, clearing...');
        this.clearUserProfile();
        return null;
      }

      // Check if the data is not too old (30 days)
      const now = Date.now();
      const dataAge = now - parsedData.timestamp;
      
      if (dataAge > this.SESSION_TIMEOUT) {
        console.log('Stored profile is too old, clearing...');
        this.clearUserProfile();
        return null;
      }

      console.log('✅ User profile loaded from local storage');
      return parsedData.profile;
    } catch (error) {
      console.error('❌ Error loading user profile from local storage:', error);
      this.clearUserProfile(); // Clear corrupted data
      return null;
    }
  }

  // Clear user profile from local storage
  clearUserProfile() {
    try {
      localStorage.removeItem(this.USER_PROFILE_KEY);
      console.log('✅ User profile cleared from local storage');
    } catch (error) {
      console.error('❌ Error clearing user profile from local storage:', error);
    }
  }

  // Save last login timestamp
  saveLastLogin(userId) {
    try {
      const loginData = {
        userId,
        timestamp: Date.now(),
        date: new Date().toISOString()
      };
      
      localStorage.setItem(this.LAST_LOGIN_KEY, JSON.stringify(loginData));
      console.log('✅ Last login timestamp saved');
    } catch (error) {
      console.error('❌ Error saving last login timestamp:', error);
    }
  }

  // Get last login timestamp
  getLastLogin(userId) {
    try {
      const storedData = localStorage.getItem(this.LAST_LOGIN_KEY);
      
      if (!storedData) {
        return null;
      }

      const parsedData = JSON.parse(storedData);
      
      if (parsedData.userId !== userId) {
        return null;
      }

      return parsedData;
    } catch (error) {
      console.error('❌ Error loading last login timestamp:', error);
      return null;
    }
  }

  // Check if user has recent session
  hasRecentSession(userId) {
    const lastLogin = this.getLastLogin(userId);
    
    if (!lastLogin) {
      return false;
    }

    const now = Date.now();
    const sessionAge = now - lastLogin.timestamp;
    
    // Consider session recent if within 30 days
    return sessionAge < this.SESSION_TIMEOUT;
  }

  // Save user preferences
  saveUserPreferences(userId, preferences) {
    try {
      const key = `rainscare_preferences_${userId}`;
      const dataToStore = {
        preferences,
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(key, JSON.stringify(dataToStore));
      console.log('✅ User preferences saved to local storage');
    } catch (error) {
      console.error('❌ Error saving user preferences:', error);
    }
  }

  // Get user preferences
  getUserPreferences(userId) {
    try {
      const key = `rainscare_preferences_${userId}`;
      const storedData = localStorage.getItem(key);
      
      if (!storedData) {
        return null;
      }

      const parsedData = JSON.parse(storedData);
      return parsedData.preferences;
    } catch (error) {
      console.error('❌ Error loading user preferences:', error);
      return null;
    }
  }

  // Clear all user data
  clearAllUserData() {
    try {
      const keysToRemove = [
        this.USER_PROFILE_KEY,
        this.USER_AUTH_KEY,
        this.LAST_LOGIN_KEY
      ];

      // Also remove user-specific preference keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('rainscare_preferences_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('✅ All user data cleared from local storage');
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
    }
  }

  // Get storage usage info
  getStorageInfo() {
    try {
      const profile = localStorage.getItem(this.USER_PROFILE_KEY);
      const lastLogin = localStorage.getItem(this.LAST_LOGIN_KEY);
      
      return {
        hasProfile: !!profile,
        hasLastLogin: !!lastLogin,
        profileSize: profile ? profile.length : 0,
        totalKeys: Object.keys(localStorage).filter(key => key.startsWith('rainscare_')).length
      };
    } catch (error) {
      console.error('❌ Error getting storage info:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const storageService = new StorageService();
export default storageService;