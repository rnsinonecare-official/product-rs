# Firestore Setup Guide

This guide explains how to set up Firestore for the Healthify application, including security rules and composite indexes.

## Security Rules

The Firestore security rules have been updated in `firestore.rules` to ensure proper access control for all collections used in the application.

## Composite Indexes

The Healthify application uses several queries that require composite indexes in Firestore. These indexes have been defined in `firestore.indexes.json`.

### How to Create Composite Indexes

1. **Using the Firebase Console (Recommended)**:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to Firestore Database > Indexes tab
   - Click "Create index"
   - For each index defined in `firestore.indexes.json`, create a composite index with the specified fields and sort orders

2. **Using the Firebase CLI**:
   - Install the Firebase CLI if you haven't already: `npm install -g firebase-tools`
   - Login to Firebase: `firebase login`
   - Deploy the indexes: `firebase deploy --only firestore:indexes`

### Required Composite Indexes

The following composite indexes are required for the application to function properly:

1. **Food Diary Index**:
   - Collection: `foodDiary`
   - Fields:
     - `userId` (ASCENDING)
     - `date` (ASCENDING)
     - `createdAt` (DESCENDING)

2. **Health Metrics Index**:
   - Collection: `healthMetrics`
   - Fields:
     - `userId` (ASCENDING)
     - `date` (DESCENDING)

3. **Favorite Recipes Index**:
   - Collection: `favoriteRecipes`
   - Fields:
     - `userId` (ASCENDING)
     - `isFavorite` (ASCENDING)
     - `createdAt` (DESCENDING)

4. **Shared Recipes Index**:
   - Collection: `sharedRecipes`
   - Fields:
     - `isPublic` (ASCENDING)
     - `createdAt` (DESCENDING)

### Automatic Index Creation

When the application encounters a query that requires a composite index that doesn't exist, Firebase will return an error with a link to automatically create the required index. Click this link to create the index in the Firebase Console.

## Troubleshooting

If you encounter errors related to missing indexes:

1. Check the browser console for specific error messages
2. Look for links to create the required indexes
3. If no link is provided, manually create the indexes using the definitions in `firestore.indexes.json`

## Additional Notes

- Make sure to deploy the updated security rules to Firebase
- Index creation can take a few minutes to complete
- Once indexes are created, the application should work correctly with Firestore queries