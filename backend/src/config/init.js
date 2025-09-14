const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');
require('dotenv').config();

// --- Firebase setup ---
try {
  let credential;
  
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    // Use service account from environment variable
    console.log('🔑 Using Firebase service account from environment variables');
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Fallback to service account file (for local development)
    console.log('🔑 Using Firebase service account from file');
    const firebaseServiceAccount = require(path.resolve(__dirname, '../config/service-account1.json'));
    credential = admin.credential.cert(firebaseServiceAccount);
  }

  admin.initializeApp({
    credential: credential,
    projectId: process.env.FIREBASE_PROJECT_ID || 'rainscare-58fdb',
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  process.exit(1);
}

// --- Vertex AI setup ---
let vertexAI;
try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    // Use service account from environment variable
    console.log('🔑 Using Vertex AI service account from environment variables');
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    
    vertexAI = new VertexAI({
      project: process.env.VERTEX_PROJECT_ID || 'rainscare',
      location: process.env.VERTEX_LOCATION || 'us-central1',
      googleAuthOptions: {
        credentials: {
          client_email: serviceAccount.client_email,
          private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
        },
      },
    });
  } else {
    // Fallback to service account file (for local development)
    console.log('🔑 Using Vertex AI service account from file');
    const vertexServiceAccount = require(path.resolve(__dirname, '../config/service-account.json'));
    
    vertexAI = new VertexAI({
      project: process.env.VERTEX_PROJECT_ID || 'rainscare',
      location: process.env.VERTEX_LOCATION || 'us-central1',
      googleAuthOptions: {
        credentials: {
          client_email: vertexServiceAccount.client_email,
          private_key: vertexServiceAccount.private_key.replace(/\\n/g, '\n'),
        },
      },
    });
  }
  
  console.log('✅ Vertex AI initialized');
} catch (error) {
  console.error('❌ Vertex AI initialization failed:', error.message);
  process.exit(1);
}

module.exports = { admin, vertexAI };
