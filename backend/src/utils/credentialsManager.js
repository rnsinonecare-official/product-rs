const path = require('path');
const fs = require('fs');

class CredentialsManager {
  constructor() {
    this.tempCredentialsPath = path.join(__dirname, '../../temp-credentials.json');
    this.initialized = false;
  }

  setupGoogleCredentials() {
    if (this.initialized) {
      return this.tempCredentialsPath;
    }

    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        // Parse the service account from environment variable
        const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        
        // Create temporary credentials file only if it doesn't exist
        if (!fs.existsSync(this.tempCredentialsPath)) {
          fs.writeFileSync(this.tempCredentialsPath, JSON.stringify(serviceAccount, null, 2));
          console.log('🔑 Created temporary credentials file');
        }
        
        process.env.GOOGLE_APPLICATION_CREDENTIALS = this.tempCredentialsPath;
        this.initialized = true;
        
        return this.tempCredentialsPath;
      } catch (error) {
        console.error('❌ Error parsing service account from environment:', error);
        throw error;
      }
    } else {
      // Fallback to service account file (for local development)
      const serviceAccountPath = path.join(__dirname, '../../config/service-account.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;
        console.log('🔑 Using service account file:', serviceAccountPath);
        this.initialized = true;
        return serviceAccountPath;
      } else {
        throw new Error('No Google service account credentials found');
      }
    }
  }

  cleanup() {
    if (fs.existsSync(this.tempCredentialsPath)) {
      try {
        fs.unlinkSync(this.tempCredentialsPath);
        console.log('🧹 Cleaned up temporary credentials file');
      } catch (error) {
        console.warn('⚠️ Could not clean up temporary credentials file:', error.message);
      }
    }
  }
}

// Create a singleton instance
const credentialsManager = new CredentialsManager();

// Cleanup on process exit
process.on('exit', () => {
  credentialsManager.cleanup();
});

process.on('SIGINT', () => {
  credentialsManager.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  credentialsManager.cleanup();
  process.exit(0);
});

module.exports = credentialsManager;