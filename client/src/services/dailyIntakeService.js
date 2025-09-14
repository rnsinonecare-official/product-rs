import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

class DailyIntakeService {
  constructor() {
    this.collections = {
      dailyIntake: 'daily_intake',
      foodEntries: 'food_entries',
      healthMetrics: 'health_metrics',
      goals: 'goals'
    };
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get or create today's daily intake document
   */
  async getTodayIntake() {
    try {
      const userId = this.getCurrentUserId();
      const today = this.getTodayDate();
      
      const docRef = doc(db, 'users', userId, this.collections.dailyIntake, today);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        // Create new daily intake document
        const newIntake = {
          userId,
          date: today,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          totalFiber: 0,
          water: 0,
          steps: 0,
          sleep: 0,
          mood: 'neutral',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(docRef, newIntake);
        return { id: docRef.id, ...newIntake };
      }
    } catch (error) {
      console.error('Error getting today\'s intake:', error);
      throw error;
    }
  }

  /**
   * Add food entry to daily intake
   */
  async addFoodEntry(foodData) {
    try {
      const userId = this.getCurrentUserId();
      const today = this.getTodayDate();
      
      // Create food entry document
      const foodEntry = {
        userId,
        date: today,
        name: foodData.name,
        calories: parseFloat(foodData.calories) || 0,
        protein: parseFloat(foodData.protein) || 0,
        carbs: parseFloat(foodData.carbs) || 0,
        fat: parseFloat(foodData.fat) || 0,
        fiber: parseFloat(foodData.fiber) || 0,
        serving_size: foodData.serving_size || '1 serving',
        analysis_type: foodData.analysis_type || 'manual',
        health_score: parseFloat(foodData.health_score) || 5,
        recommendations: foodData.recommendations || '',
        image: foodData.image || null,
        metadata: foodData.metadata || {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add to food entries collection
      const dailyIntakeDocRef = doc(db, 'users', userId, this.collections.dailyIntake, today);
      const foodEntryRef = await addDoc(collection(dailyIntakeDocRef, this.collections.foodEntries), foodEntry);
      const foodEntryWithId = { id: foodEntryRef.id, ...foodEntry };

      // Update daily intake totals
      
      // Get current daily intake or create if doesn't exist
      await this.getTodayIntake();
      
      // Update totals
      await updateDoc(dailyIntakeDocRef, {
        totalCalories: increment(foodEntry.calories),
        totalProtein: increment(foodEntry.protein),
        totalCarbs: increment(foodEntry.carbs),
        totalFat: increment(foodEntry.fat),
        totalFiber: increment(foodEntry.fiber),
        updatedAt: serverTimestamp()
      });

      console.log('Food entry added successfully:', foodEntryWithId);
      return foodEntryWithId;
    } catch (error) {
      console.error('Error adding food entry:', error);
      throw error;
    }
  }

  /**
   * Remove food entry from daily intake
   */
  async removeFoodEntry(foodEntryId) {
    try {
      const userId = this.getCurrentUserId();
      const today = this.getTodayDate();
      
      // Get food entry to subtract from totals
      const dailyIntakeDocRef = doc(db, 'users', userId, this.collections.dailyIntake, today);
      const foodEntryRef = doc(dailyIntakeDocRef, this.collections.foodEntries, foodEntryId);
      const foodEntrySnap = await getDoc(foodEntryRef);
      
      if (!foodEntrySnap.exists()) {
        throw new Error('Food entry not found');
      }
      
      const foodEntry = foodEntrySnap.data();
      
      // Delete food entry
      await deleteDoc(foodEntryRef);
      
      // Update daily intake totals
      await updateDoc(dailyIntakeDocRef, {
        totalCalories: increment(-foodEntry.calories),
        totalProtein: increment(-foodEntry.protein),
        totalCarbs: increment(-foodEntry.carbs),
        totalFat: increment(-foodEntry.fat),
        totalFiber: increment(-foodEntry.fiber || 0),
        updatedAt: serverTimestamp()
      });

      console.log('Food entry removed successfully');
      return true;
    } catch (error) {
      console.error('Error removing food entry:', error);
      throw error;
    }
  }

  /**
   * Update water intake
   */
  async updateWaterIntake(amount) {
    try {
      const userId = this.getCurrentUserId();
      const today = this.getTodayDate();
      
      // Ensure daily intake exists
      await this.getTodayIntake();
      
      const dailyIntakeRef = doc(db, 'users', userId, this.collections.dailyIntake, today);
      await updateDoc(dailyIntakeRef, {
        water: increment(amount),
        updatedAt: serverTimestamp()
      });

      console.log('Water intake updated:', amount);
      return true;
    } catch (error) {
      console.error('Error updating water intake:', error);
      throw error;
    }
  }

  /**
   * Update steps
   */
  async updateSteps(steps) {
    try {
      const userId = this.getCurrentUserId();
      const today = this.getTodayDate();
      
      // Ensure daily intake exists
      await this.getTodayIntake();
      
      const dailyIntakeRef = doc(db, 'users', userId, this.collections.dailyIntake, today);
      await updateDoc(dailyIntakeRef, {
        steps: steps,
        updatedAt: serverTimestamp()
      });

      console.log('Steps updated:', steps);
      return true;
    } catch (error) {
      console.error('Error updating steps:', error);
      throw error;
    }
  }

  /**
   * Update sleep hours
   */
  async updateSleep(hours) {
    try {
      const userId = this.getCurrentUserId();
      const today = this.getTodayDate();
      
      // Ensure daily intake exists
      await this.getTodayIntake();
      
      const dailyIntakeRef = doc(db, 'users', userId, this.collections.dailyIntake, today);
      await updateDoc(dailyIntakeRef, {
        sleep: hours,
        updatedAt: serverTimestamp()
      });

      console.log('Sleep updated:', hours);
      return true;
    } catch (error) {
      console.error('Error updating sleep:', error);
      throw error;
    }
  }

  /**
   * Update mood
   */
  async updateMood(mood) {
    try {
      const userId = this.getCurrentUserId();
      const today = this.getTodayDate();

      // Ensure daily intake exists
      await this.getTodayIntake();

      const dailyIntakeRef = doc(db, 'users', userId, this.collections.dailyIntake, today);
      await updateDoc(dailyIntakeRef, {
        mood: mood,
        updatedAt: serverTimestamp()
      });

      console.log('Mood updated:', mood);
      return true;
    } catch (error) {
      console.error('Error updating mood:', error);
      throw error;
    }
  }

  /**
   * Update calories (for manual adjustment)
   */
  async updateCalories(calories) {
    try {
      const userId = this.getCurrentUserId();
      const today = this.getTodayDate();

      // Ensure daily intake exists
      await this.getTodayIntake();

      const dailyIntakeRef = doc(db, 'users', userId, this.collections.dailyIntake, today);
      await updateDoc(dailyIntakeRef, {
        totalCalories: calories,
        updatedAt: serverTimestamp()
      });

      console.log('Calories updated:', calories);
      return true;
    } catch (error) {
      console.error('Error updating calories:', error);
      throw error;
    }
  }

  /**
   * Get food entries for today
   */
  async getTodayFoodEntries() {
    try {
      const userId = this.getCurrentUserId();
      const today = this.getTodayDate();
      
      const dailyIntakeDocRef = doc(db, 'users', userId, this.collections.dailyIntake, today);
      const foodEntriesCollectionRef = collection(dailyIntakeDocRef, this.collections.foodEntries);
      
      const q = query(
        foodEntriesCollectionRef,
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const foodEntries = [];
      
      querySnapshot.forEach((doc) => {
        foodEntries.push({ id: doc.id, ...doc.data() });
      });
      
      return foodEntries;
    } catch (error) {
      console.error('Error getting today\'s food entries:', error);
      throw error;
    }
  }

  /**
   * Get daily intake for a specific date
   */
  async getDailyIntakeByDate(date) {
    try {
      const userId = this.getCurrentUserId();
      
      const docRef = doc(db, 'users', userId, this.collections.dailyIntake, date);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const dailyIntake = { id: docSnap.id, ...docSnap.data() };
        
        // Get food entries for this date
        const foodEntries = await this.getFoodEntriesByDate(date);
        dailyIntake.foodEntriesData = foodEntries;
        
        return dailyIntake;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting daily intake by date:', error);
      throw error;
    }
  }

  /**
   * Get food entries for a specific date
   */
  async getFoodEntriesByDate(date) {
    try {
      const userId = this.getCurrentUserId();
      
      const dailyIntakeDocRef = doc(db, 'users', userId, this.collections.dailyIntake, date);
      const foodEntriesCollectionRef = collection(dailyIntakeDocRef, this.collections.foodEntries);

      const q = query(
        foodEntriesCollectionRef,
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const foodEntries = [];
      
      querySnapshot.forEach((doc) => {
        foodEntries.push({ id: doc.id, ...doc.data() });
      });
      
      return foodEntries;
    } catch (error) {
      console.error('Error getting food entries by date:', error);
      throw error;
    }
  }

  /**
   * Get weekly data (last 7 days)
   */
  async getWeeklyData() {
    try {
      const userId = this.getCurrentUserId();
      const weeklyData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dailyIntake = await this.getDailyIntakeByDate(dateString);
        weeklyData.push(dailyIntake || {
          date: dateString,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          water: 0,
          steps: 0,
          sleep: 0
        });
      }
      
      return weeklyData;
    } catch (error) {
      console.error('Error getting weekly data:', error);
      throw error;
    }
  }

  /**
   * Get user's daily goals
   */
  async getUserGoals() {
    try {
      const userId = this.getCurrentUserId();
      const docRef = doc(db, 'users', userId, this.collections.goals, 'daily');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Return default goals
        return {
          calorieGoal: 2000,
          proteinGoal: 150,
          carbsGoal: 250,
          fatGoal: 65,
          waterGoal: 8,
          stepsGoal: 10000,
          sleepGoal: 8
        };
      }
    } catch (error) {
      console.error('Error getting user goals:', error);
      throw error;
    }
  }

  /**
   * Update user's daily goals
   */
  async updateUserGoals(goals) {
    try {
      const userId = this.getCurrentUserId();
      const docRef = doc(db, 'users', userId, this.collections.goals, 'daily');
      
      await setDoc(docRef, {
        ...goals,
        userId,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('User goals updated:', goals);
      return true;
    } catch (error) {
      console.error('Error updating user goals:', error);
      throw error;
    }
  }
}

export default new DailyIntakeService();