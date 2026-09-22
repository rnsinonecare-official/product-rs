// Authentication Service — AWS Cognito (auth) + backend API (all profile DB ops).
// No Firebase, no direct database access from the browser.
import {
  signIn,
  signOutUser,
  forgotPassword,
  confirmPassword,
  onAuthStateChange as cognitoOnAuthStateChange,
} from "../aws/cognitoAuth";
import { authAPI } from "./api";
import storageService from "./storageService";
import sessionService from "./sessionService";

// Register: create the Cognito user via backend, sign in, then save the profile.
export const registerUser = async (email, password, userData) => {
  try {
    console.log("Registering user:", email);

    // 1) Create the Cognito account (server-side admin create → confirmed user)
    await authAPI.createUser({
      email,
      password,
      displayName: userData.name,
    });

    // 2) Sign in to obtain tokens (SRP)
    const user = await signIn(email, password);

    // 3) Persist the full profile via the backend (never write the DB directly)
    const profile = {
      uid: user.uid,
      email,
      name: userData.name,
      age: userData.age,
      gender: userData.gender,
      height: userData.height,
      weight: userData.weight,
      healthConditions: userData.healthConditions || [],
      dietType: userData.dietType,
      bmi: userData.bmi,
      bmiCategory: userData.bmiCategory,
      isProfileComplete: userData.isProfileComplete !== false,
      preferences: { notifications: true, dataSharing: false, units: "metric" },
      goals: userData.age
        ? {
            dailyCalories: calculateDailyCalories(userData),
            dailyWater: 8,
            dailySteps: 10000,
            weeklyWeightLoss: 0.5,
          }
        : null,
    };

    await authAPI.updateProfile(profile);

    return { user, profile };
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
};

// Sign in and load the profile from the backend.
export const loginUser = async (email, password) => {
  try {
    console.log("Logging in user:", email);
    const user = await signIn(email, password);

    let profile = null;
    try {
      const res = await authAPI.getProfile();
      profile = res.data.user;
    } catch (e) {
      // No profile yet — create a minimal one via the backend
      profile = {
        name: user.displayName || "User",
        email: user.email,
        isProfileComplete: false,
        uid: user.uid,
      };
      await authAPI.updateProfile(profile);
    }

    return { user, profile };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
};

// Google sign-in has been removed (no Google dependency).
export const loginWithGoogle = async () => {
  throw new Error("Google sign-in is not available. Please use email and password.");
};

// Sign out.
export const logoutUser = async () => {
  try {
    try {
      await sessionService.manualLogout();
    } catch (e) {
      /* non-fatal */
    }
    storageService.clearAllUserData();
    await signOutUser();
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    storageService.clearAllUserData();
    throw new Error("Failed to logout");
  }
};

// Initiate a password reset (emails a verification code).
export const resetPassword = async (email) => {
  try {
    await forgotPassword(email);
    return true;
  } catch (error) {
    console.error("Password reset error:", error);
    throw new Error("Failed to send password reset email");
  }
};

// Complete a password reset with the emailed code.
export const confirmPasswordReset = async (email, code, newPassword) => {
  try {
    await confirmPassword(email, code, newPassword);
    return true;
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    throw new Error("Failed to reset password. Check your code and try again.");
  }
};

// Update the profile via the backend.
export const updateUserProfile = async (userId, updates) => {
  try {
    if (!userId) throw new Error("User ID is required");
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error("No updates provided");
    }
    await authAPI.updateProfile(updates);
    return true;
  } catch (error) {
    console.error("Profile update error:", error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

// Get the profile via the backend.
export const getUserProfile = async (userId) => {
  try {
    if (!userId) return null;
    const res = await authAPI.getProfile();
    return res.data.user || null;
  } catch (error) {
    if (error.response && error.response.status === 404) return null;
    console.error("Get profile error:", error);
    return null;
  }
};

// Auth state listener (Cognito).
export const onAuthStateChange = (callback) => cognitoOnAuthStateChange(callback);

// Helper: Mifflin-St Jeor daily calories.
const calculateDailyCalories = (userData) => {
  const { gender, age, height, weight } = userData;
  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return Math.round(bmr * 1.375);
};

// Helper: map Cognito / API errors to friendly messages.
const getAuthErrorMessage = (error) => {
  const name = error && error.name;
  const apiMsg =
    error && error.response && error.response.data && error.response.data.message;
  switch (name) {
    case "NotAuthorizedException":
      return "Incorrect email or password. Please try again.";
    case "UserNotFoundException":
      return "No account found with this email address.";
    case "UsernameExistsException":
      return "An account with this email already exists. Please sign in instead.";
    case "InvalidPasswordException":
      return "Password is too weak. Use at least 8 characters with upper, lower, and a number.";
    case "InvalidParameterException":
      return "Please enter a valid email and password.";
    case "TooManyRequestsException":
    case "LimitExceededException":
      return "Too many attempts. Please wait a few minutes and try again.";
    default:
      return apiMsg || (error && error.message) || "Authentication error. Please try again.";
  }
};

const authService = {
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  resetPassword,
  confirmPasswordReset,
  updateUserProfile,
  getUserProfile,
  onAuthStateChange,
};

export default authService;
