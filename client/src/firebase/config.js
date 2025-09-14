// config.js

// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore /* doc */ } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Debug: Check if environment variables are loaded
console.log('Firebase Config Check:', {
  apiKey: !!firebaseConfig.apiKey,
  authDomain: !!firebaseConfig.authDomain,
  projectId: !!firebaseConfig.projectId,
  configValues: firebaseConfig
});



// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Missing Firebase configuration. Check your .env file.');
  console.error('Required environment variables:');
  console.error('- REACT_APP_FIREBASE_API_KEY');
  console.error('- REACT_APP_FIREBASE_AUTH_DOMAIN');
  console.error('- REACT_APP_FIREBASE_PROJECT_ID');
  throw new Error('Firebase configuration is incomplete. Please check your .env file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with persistence
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize analytics only if measurement ID is provided
let analytics = null;
try {
  if (firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  } else {
    console.log('ℹ️ Firebase Analytics not initialized - no measurement ID provided');
  }
} catch (error) {
  console.warn('⚠️ Firebase Analytics initialization failed:', error.message);
}

// Set persistence to local storage so users stay logged in
// (Firebase Auth persistence is enabled by default, but we'll explicitly set it)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Firebase Auth persistence enabled - users will stay logged in');
  })
  .catch((error) => {
    console.error('❌ Error enabling Firebase Auth persistence:', error);
  });

// Test Firebase connection
console.log('Firebase services initialized successfully:', {
  auth: !!auth,
  db: !!db,
  analytics: !!analytics
});



// Export all for use in your app
export { app, auth, db, analytics };

/*
------------------------------------------------------------
✅ Firestore Security Rules — Copy this into Firestore Console:
------------------------------------------------------------
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }

    // Users can read/write their own food diary entries
    match /foodDiary/{entryId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Users can read/write their own health metrics
    match /healthMetrics/{metricId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Users can read/write their own favorite recipes
    match /favoriteRecipes/{recipeId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Users can read/write their own goals
    match /userGoals/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public read access for shared recipes, write for authenticated users
    match /sharedRecipes/{recipeId} {
      allow read: if resource.data.isPublic == true || request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // User sessions for analytics
    match /userSessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Marketing consent data
    match /marketingConsent/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Default fallback rule for anything else (deny all)
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
*/
