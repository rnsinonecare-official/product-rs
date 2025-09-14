// Authentication Service with Real Firebase
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import storageService from './storageService';
import sessionService from './sessionService';

// Google Auth Provider
// const googleProvider = new GoogleAuthProvider();

// Create user account and profile
export const registerUser = async (email, password, userData) => {
  try {
    console.log('Attempting to register user:', email);
    
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update auth profile
    await updateProfile(user, {
      displayName: userData.name
    });

    // Create user document in Firestore
    const userDocData = {
      uid: user.uid,
      email: user.email,
      name: userData.name,
      age: userData.age,
      gender: userData.gender,
      height: userData.height,
      weight: userData.weight,
      healthConditions: userData.healthConditions || [],
      dietType: userData.dietType,
      bmi: userData.bmi,
      bmiCategory: userData.bmiCategory,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isProfileComplete: userData.isProfileComplete !== false, // Default to true unless explicitly false
      preferences: {
        notifications: true,
        dataSharing: false,
        units: 'metric'
      },
      goals: userData.age ? {
        dailyCalories: calculateDailyCalories(userData),
        dailyWater: 8, // glasses
        dailySteps: 10000,
        weeklyWeightLoss: 0.5 // kg
      } : null // Only calculate goals if we have complete data
    };

    await setDoc(doc(db, 'users', user.uid), userDocData);

    return {
      user: user,
      profile: userDocData
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

// Sign in user
export const loginUser = async (email, password) => {
  try {
    console.log('Attempting to login user:', email);
    
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    let profile = null;
    
    if (userDoc.exists()) {
      profile = userDoc.data();
    } else {
      // If profile doesn't exist, create a minimal one
      profile = {
        name: user.displayName || 'User',
        email: user.email,
        isProfileComplete: false,
        uid: user.uid,
        createdAt: serverTimestamp()
      };
      
      // Save the minimal profile
      await setDoc(doc(db, 'users', user.uid), profile);
    }

    return {
      user: user,
      profile: profile
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

// Sign in with Google
export const loginWithGoogle = async () => {
  try {
    console.log('Attempting Google login');
    
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user profile exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    let profile;
    
    if (userDoc.exists()) {
      profile = userDoc.data();
    } else {
      // Create new profile for Google user
      profile = {
        name: user.displayName || 'Google User',
        email: user.email,
        photoURL: user.photoURL,
        isProfileComplete: false, // New Google user needs onboarding
        uid: user.uid,
        healthConditions: [],
        dietType: null,
        createdAt: serverTimestamp()
      };
      
      // Save profile to Firestore
      await setDoc(doc(db, 'users', user.uid), profile);
    }
    
    return {
      user: user,
      profile: profile
    };
  } catch (error) {
    console.error('Google login error:', error);
    throw new Error('Google authentication failed');
  }
};

// Sign out user
export const logoutUser = async () => {
  try {
    console.log('Logging out user');

    // Track logout in session service
    await sessionService.manualLogout();

    // Clear all cached user data before signing out
    storageService.clearAllUserData();

    await signOut(auth);
    console.log('✅ User logged out successfully');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local data even if Firebase logout fails
    storageService.clearAllUserData();
    throw new Error('Failed to logout');
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    console.log('Password reset requested for:', email);
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    console.log('Updating user profile:', userId, updates);
    
    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided');
    }

    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    // Check if the authenticated user matches the userId
    if (auth.currentUser.uid !== userId) {
      throw new Error('User ID mismatch');
    }

    console.log('Firebase auth state:', {
      currentUser: !!auth.currentUser,
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email
    });

    const userRef = doc(db, 'users', userId);
    
    console.log('Attempting to update Firestore document...');
    
    try {
      // Try to update the document first
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('Firestore document updated successfully');
    } catch (updateError) {
      // If document doesn't exist, create it with setDoc
      if (updateError.code === 'not-found') {
        console.log('Document not found, creating new document...');
        await setDoc(userRef, {
          uid: userId,
          email: auth.currentUser?.email,
          ...updates,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('Firestore document created successfully');
      } else {
        // Re-throw other errors
        throw updateError;
      }
    }

    // Also update auth profile if name changed
    if (updates.name && auth.currentUser) {
      console.log('Updating auth profile display name...');
      await updateProfile(auth.currentUser, {
        displayName: updates.name
      });
      console.log('Auth profile updated successfully');
    }

    return true;
  } catch (error) {
    console.error('Profile update error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      userId,
      updates
    });
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your account permissions.');
    } else if (error.code === 'not-found') {
      throw new Error('User profile not found. Please try signing in again.');
    } else if (error.code === 'unavailable') {
      throw new Error('Database temporarily unavailable. Please try again.');
    } else if (error.message.includes('User not authenticated')) {
      throw new Error('User not authenticated. Please sign in again.');
    } else if (error.message.includes('User ID')) {
      throw new Error('Invalid user ID. Please sign in again.');
    } else {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    console.log('Getting user profile:', userId);
    
    if (!userId) {
      console.error('No userId provided to getUserProfile');
      return null;
    }
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const profileData = userDoc.data();
      console.log('Profile found:', profileData);
      return profileData;
    } else {
      console.log('No profile document found for user:', userId);
      return null;
    }
  } catch (error) {
    console.error('Get profile error:', error);
    
    // Don't throw error, return null to allow graceful handling
    if (error.code === 'permission-denied') {
      console.error('Permission denied accessing user profile');
    } else if (error.code === 'unavailable') {
      console.error('Firestore temporarily unavailable');
    }
    
    return null;
  }
};

// Auth state listener
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Helper: Calculate daily calories based on user data
const calculateDailyCalories = (userData) => {
  const { gender, age, height, weight } = userData;
  
  // Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  
  // Multiply by activity factor (assuming lightly active)
  const dailyCalories = Math.round(bmr * 1.375);
  
  return dailyCalories;
};



// Helper: Get user-friendly error messages
const getFirebaseErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check your email or create a new account.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or reset your password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password (at least 6 characters).';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes before trying again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    default:
      return `Authentication error: ${errorCode}. Please try again or contact support.`;
  }
};

const authService = {
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  resetPassword,
  updateUserProfile,
  getUserProfile,
  onAuthStateChange
};

export default authService;