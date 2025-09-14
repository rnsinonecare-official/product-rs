const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin SDK
let app;

try {
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Use service account from environment variable
    console.log("🔑 Using Firebase service account from environment variables");
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Fallback to service account file (for local development)
    console.log("🔑 Using Firebase service account from file");
    const firebaseServiceAccountPath = path.join(
      __dirname,
      "../../config/firebase-service-account.json"
    );
    credential = admin.credential.cert(require(firebaseServiceAccountPath));
  }

  app = admin.initializeApp({
    credential: credential,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log("✅ Firebase Admin SDK initialized successfully");
  console.log("🏢 Project ID:", process.env.FIREBASE_PROJECT_ID);
  console.log("🪣 Storage Bucket:", process.env.FIREBASE_STORAGE_BUCKET);
} catch (error) {
  console.error("❌ Firebase Admin SDK initialization failed:", error.message);
  console.error(
    "❌ Make sure FIREBASE_SERVICE_ACCOUNT_KEY environment variable is set"
  );
  process.exit(1);
}

// Export Firebase services
const auth = admin.auth();
const db = admin.firestore();

// Initialize storage only if needed (optional)
let storage = null;
try {
  if (process.env.FIREBASE_STORAGE_BUCKET) {
    storage = admin.storage();
  }
} catch (error) {
  console.warn("⚠️ Firebase Storage not initialized:", error.message);
}

// Firestore settings
db.settings({
  timestampsInSnapshots: true,
});

module.exports = {
  admin,
  auth,
  db,
  storage,
  app,
};
