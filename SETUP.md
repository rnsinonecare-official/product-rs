# Healthify Application Setup Guide

This guide explains how to properly set up the Healthify application with Firebase Firestore.

## Prerequisites

1. Node.js (v16 or higher)
2. npm (v8 or higher)
3. A Firebase project with Firestore enabled

## Firebase Project Setup

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard to create your project

### 2. Enable Firestore Database

1. In the Firebase Console, select your project
2. Click "Firestore Database" in the left sidebar
3. Click "Create database"
4. Choose "Start in test mode" or "Start in production mode" (test mode is fine for development)

### 3. Get Client-side Firebase Configuration

1. In the Firebase Console, click the gear icon next to "Project Overview" and select "Project settings"
2. In the "General" tab, under "Your apps", click the web icon (</>) to create a new web app
3. Register your app with a nickname (e.g., "Healthify")
4. Copy the Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 4. Get Backend Firebase Configuration

1. In the Firebase Console, go to "Project settings"
2. Click the "Service accounts" tab
3. Click "Generate new private key" to download a JSON file with your service account credentials
4. This file contains the values you need for the backend configuration

## Environment Variable Configuration

### Backend Configuration (backend/.env)

Create or update `backend/.env` with the following values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"...","universe_domain":"googleapis.com"}

# API Keys (optional for development)
GEMINI_API_KEY=your-gemini-api-key
EDAMAM_APP_ID=your-edamam-app-id
EDAMAM_APP_KEY=your-edamam-app-key
SPOONACULAR_API_KEY=your-spoonacular-api-key

# Security
JWT_SECRET=your-jwt-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Frontend Configuration (client/.env)

Create or update `client/.env` with the following values:

```env
# Backend API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Firebase Configuration (Client-side)
REACT_APP_FIREBASE_API_KEY=your-actual-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-actual-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id

# App Configuration
REACT_APP_APP_NAME=Healthify
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
```

## Firestore Security Rules

The application includes Firestore security rules in `client/firestore.rules`. Deploy these rules to your Firebase project:

1. In the Firebase Console, go to "Firestore Database"
2. Click the "Rules" tab
3. Replace the existing rules with the content from `client/firestore.rules`
4. Click "Publish"

## Composite Indexes

The application requires several composite indexes for optimal performance. These are defined in `client/firestore.indexes.json`. You can create these indexes:

1. In the Firebase Console, go to "Firestore Database" > "Indexes" tab
2. Click "Create index"
3. For each index defined in `client/firestore.indexes.json`, create a composite index with the specified fields and sort orders

Alternatively, you can use the Firebase CLI to deploy the indexes:

```bash
firebase deploy --only firestore:indexes
```

## Testing the Setup

After configuring the environment variables:

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Start the development servers:
   ```bash
   npm run dev
   ```

3. Check the health endpoints:
   - Backend health: http://localhost:5000/health
   - Backend API health: http://localhost:5000/api/health

If everything is configured correctly, these endpoints should show that Firestore is connected.

## Troubleshooting

### Firestore Connection Issues

1. **Check environment variables**: Ensure all Firebase configuration values are correct
2. **Verify Firebase project ID**: Make sure the project ID matches your Firebase project
3. **Check service account key**: Ensure the service account key is valid and has the necessary permissions
4. **Check network connectivity**: Ensure your development machine can access Firebase services

### Authentication Issues

1. **Check Firebase Auth configuration**: Ensure the client-side Firebase config includes the correct API key and auth domain
2. **Enable Email/Password sign-in**: In the Firebase Console, go to "Authentication" > "Sign-in method" and enable Email/Password

### Missing Indexes

If you see errors about missing indexes:
1. Check the browser console for links to create the required indexes
2. Click these links to automatically create the indexes in the Firebase Console
3. Wait for the indexes to finish building (this can take a few minutes)

## Production Deployment

For production deployment, make sure to:

1. Update environment variables for production values
2. Set `NODE_ENV=production` in backend
3. Use secure, production-ready API keys
4. Review and tighten security rules for production use
5. Set up proper authentication and authorization