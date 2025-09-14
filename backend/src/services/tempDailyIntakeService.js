const fs = require('fs').promises;
const path = require('path');

class TempDailyIntakeService {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.dailyFile = path.join(this.dataDir, 'daily-intake.json');
    this.archiveDir = path.join(this.dataDir, 'archive');
    this.lastResetFile = path.join(this.dataDir, 'last-reset.json');
    
    this.initializeService();
  }

  async initializeService() {
    try {
      // Create directories if they don't exist
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.archiveDir, { recursive: true });
      
      // Check if daily reset is needed
      await this.checkAndResetDaily();
    } catch (error) {
      console.error('Error initializing TempDailyIntakeService:', error);
    }
  }

  async checkAndResetDaily() {
    try {
      const today = new Date().toISOString().split('T')[0];
      let lastReset = null;

      try {
        const lastResetData = await fs.readFile(this.lastResetFile, 'utf8');
        lastReset = JSON.parse(lastResetData).date;
      } catch (error) {
        // File doesn't exist, first time setup
      }

      if (lastReset !== today) {
        await this.performDailyReset(today);
      }
    } catch (error) {
      console.error('Error checking daily reset:', error);
    }
  }

  async performDailyReset(today) {
    try {
      // Archive previous day's data if it exists
      try {
        const currentData = await fs.readFile(this.dailyFile, 'utf8');
        const parsedData = JSON.parse(currentData);
        
        if (parsedData.date && parsedData.date !== today && parsedData.entries.length > 0) {
          const archiveFile = path.join(this.archiveDir, `intake-${parsedData.date}.json`);
          await fs.writeFile(archiveFile, JSON.stringify({
            ...parsedData,
            archivedAt: new Date().toISOString()
          }, null, 2));
          console.log(`Archived daily intake data for ${parsedData.date}`);
        }
      } catch (error) {
        // No previous data to archive
      }

      // Reset daily intake file
      const freshData = {
        date: today,
        entries: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        lastUpdated: new Date().toISOString()
      };

      await fs.writeFile(this.dailyFile, JSON.stringify(freshData, null, 2));
      
      // Update last reset date
      await fs.writeFile(this.lastResetFile, JSON.stringify({ date: today }, null, 2));
      
      console.log(`Daily intake reset completed for ${today}`);
    } catch (error) {
      console.error('Error performing daily reset:', error);
    }
  }

  async addFoodEntry(userId, foodData) {
    try {
      await this.checkAndResetDaily();
      
      let currentData;
      try {
        const fileContent = await fs.readFile(this.dailyFile, 'utf8');
        currentData = JSON.parse(fileContent);
      } catch (error) {
        // File doesn't exist, create fresh data
        const today = new Date().toISOString().split('T')[0];
        currentData = {
          date: today,
          entries: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          lastUpdated: new Date().toISOString()
        };
      }

      // Create new entry
      const newEntry = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        ...foodData,
        addedAt: new Date().toISOString(),
        isTemporary: true
      };

      // Add to entries
      currentData.entries.push(newEntry);
      
      // Update totals
      currentData.totalCalories += foodData.calories || 0;
      currentData.totalProtein += foodData.protein || 0;
      currentData.totalCarbs += foodData.carbs || 0;
      currentData.totalFat += foodData.fat || 0;
      currentData.lastUpdated = new Date().toISOString();

      // Save updated data
      await fs.writeFile(this.dailyFile, JSON.stringify(currentData, null, 2));
      
      return newEntry;
    } catch (error) {
      console.error('Error adding food entry to temp storage:', error);
      throw new Error('Failed to add food entry to temporary storage');
    }
  }

  async getDailyIntake(userId) {
    try {
      await this.checkAndResetDaily();
      
      const fileContent = await fs.readFile(this.dailyFile, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Filter entries for specific user (if needed)
      const userEntries = data.entries.filter(entry => entry.userId === userId);
      
      // Calculate user-specific totals
      const userTotals = userEntries.reduce((totals, entry) => ({
        calories: totals.calories + (entry.calories || 0),
        protein: totals.protein + (entry.protein || 0),
        carbs: totals.carbs + (entry.carbs || 0),
        fat: totals.fat + (entry.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      return {
        date: data.date,
        entries: userEntries,
        totals: userTotals,
        lastUpdated: data.lastUpdated
      };
    } catch (error) {
      // Return empty data if file doesn't exist
      const today = new Date().toISOString().split('T')[0];
      return {
        date: today,
        entries: [],
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async removeFoodEntry(userId, entryId) {
    try {
      const fileContent = await fs.readFile(this.dailyFile, 'utf8');
      const data = JSON.parse(fileContent);
      
      const entryIndex = data.entries.findIndex(entry => 
        entry.id === entryId && entry.userId === userId
      );
      
      if (entryIndex === -1) {
        throw new Error('Entry not found');
      }

      const removedEntry = data.entries[entryIndex];
      
      // Remove entry
      data.entries.splice(entryIndex, 1);
      
      // Update totals
      data.totalCalories -= removedEntry.calories || 0;
      data.totalProtein -= removedEntry.protein || 0;
      data.totalCarbs -= removedEntry.carbs || 0;
      data.totalFat -= removedEntry.fat || 0;
      data.lastUpdated = new Date().toISOString();

      // Save updated data
      await fs.writeFile(this.dailyFile, JSON.stringify(data, null, 2));
      
      return true;
    } catch (error) {
      console.error('Error removing food entry from temp storage:', error);
      throw new Error('Failed to remove food entry from temporary storage');
    }
  }

  async getArchivedData(date) {
    try {
      const archiveFile = path.join(this.archiveDir, `intake-${date}.json`);
      const fileContent = await fs.readFile(archiveFile, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      return null; // No archived data for this date
    }
  }

  async getAvailableArchiveDates() {
    try {
      const files = await fs.readdir(this.archiveDir);
      const dates = files
        .filter(file => file.startsWith('intake-') && file.endsWith('.json'))
        .map(file => file.replace('intake-', '').replace('.json', ''))
        .sort((a, b) => new Date(b) - new Date(a)); // Most recent first
      
      return dates;
    } catch (error) {
      return [];
    }
  }

  // Cleanup old archives (keep last 30 days)
  async cleanupOldArchives() {
    try {
      const files = await fs.readdir(this.archiveDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      
      for (const file of files) {
        if (file.startsWith('intake-') && file.endsWith('.json')) {
          const dateStr = file.replace('intake-', '').replace('.json', '');
          const fileDate = new Date(dateStr);
          
          if (fileDate < cutoffDate) {
            await fs.unlink(path.join(this.archiveDir, file));
            console.log(`Cleaned up old archive: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old archives:', error);
    }
  }
}

module.exports = new TempDailyIntakeService();