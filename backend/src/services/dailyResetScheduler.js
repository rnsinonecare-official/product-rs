const tempDailyIntakeService = require('./tempDailyIntakeService');

class DailyResetScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) {
      console.log('Daily reset scheduler is already running');
      return;
    }

    console.log('🕐 Starting daily reset scheduler...');
    
    // Check every hour for daily reset
    this.intervalId = setInterval(async () => {
      try {
        await tempDailyIntakeService.checkAndResetDaily();
      } catch (error) {
        console.error('Error in daily reset scheduler:', error);
      }
    }, 60 * 60 * 1000); // Check every hour

    // Also run cleanup weekly (every 7 days)
    setInterval(async () => {
      try {
        await tempDailyIntakeService.cleanupOldArchives();
        console.log('📁 Weekly archive cleanup completed');
      } catch (error) {
        console.error('Error in weekly cleanup:', error);
      }
    }, 7 * 24 * 60 * 60 * 1000); // Every 7 days

    this.isRunning = true;
    console.log('✅ Daily reset scheduler started successfully');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Daily reset scheduler stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextCheck: this.isRunning ? 'Every hour' : 'Not scheduled'
    };
  }
}

module.exports = new DailyResetScheduler();