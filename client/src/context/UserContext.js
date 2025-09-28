import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getUserProfile, updateUserProfile as updateUserProfileService } from '../services/authService';
import marketingService from '../services/marketingService';
import storageService from '../services/storageService';
import sessionService from '../services/sessionService';
import { calculateMetabolicAge as calculateMetabolicAgeUtil } from '../utils/metabolicCalculations';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper function to validate and calculate BMI
  const calculateBMI = (height, weight) => {
    // Validate inputs
    if (!height || !weight || height <= 0 || weight <= 0) {
      throw new Error('Invalid height or weight values');
    }
    
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    // Determine BMI category with more detailed status
    let bmiCategory, bmiStatus;
    if (bmi < 18.5) {
      bmiCategory = 'Underweight';
      bmiStatus = 'You may need to gain weight for optimal health';
    } else if (bmi < 25) {
      bmiCategory = 'Normal';
      bmiStatus = 'You have a healthy weight range';
    } else if (bmi < 30) {
      bmiCategory = 'Overweight';
      bmiStatus = 'Consider losing weight for better health';
    } else {
      bmiCategory = 'Obese';
      bmiStatus = 'Weight loss is recommended for your health';
    }
    
    return {
      bmi: parseFloat(bmi),
      bmiCategory,
      bmiStatus
    };
  };

  // Helper function to calculate metabolic age using centralized utility with additional factors
  const calculateMetabolicAge = (age, gender, height, weight, activityLevel = 'moderate', bodyFatPercentage = null, muscleMass = null, alcoholConsumption = null, smokingHabits = null) => {
    // Use the centralized calculation as base
    const baseResult = calculateMetabolicAgeUtil(age, gender, height, weight, activityLevel, bodyFatPercentage, muscleMass);
    
    if (!baseResult) {
      return null;
    }

    // Add additional lifestyle factors that aren't in the base calculation
    let additionalAgeScore = 0;





    // 5. Alcohol Consumption Impact (15% weight)
    if (alcoholConsumption) {
      const alcoholScores = {
        never: -1,        // Slight benefit for no alcohol
        occasional: 0,    // Minimal impact
        moderate: 2,      // Moderate negative impact
        frequent: 5,      // Significant negative impact
        heavy: 10         // Major negative impact on metabolism
      };
      additionalAgeScore += alcoholScores[alcoholConsumption] || 0;
    }

    // 6. Smoking Habits Impact (20% weight)
    if (smokingHabits) {
      const smokingScores = {
        never: -2,        // Benefit for never smoking
        former: 1,        // Slight negative impact from past smoking
        occasional: 4,    // Moderate impact
        light: 8,         // Significant impact
        moderate: 12,     // Major impact
        heavy: 18         // Severe impact on metabolism and health
      };
      additionalAgeScore += smokingScores[smokingHabits] || 0;
    }

    // Apply additional factors to the base metabolic age
    const adjustedMetabolicAge = Math.max(18, Math.min(80, baseResult.metabolicAge + additionalAgeScore));
    const adjustedHealthScore = Math.max(0, Math.min(100, baseResult.healthScore - (additionalAgeScore * 2)));

    // Determine comparison with chronological age
    const comparison = adjustedMetabolicAge < age - 2 ? 'younger' : adjustedMetabolicAge > age + 2 ? 'older' : 'same';

    return {
      metabolicAge: Math.round(adjustedMetabolicAge),
      bmr: baseResult.bmr,
      tdee: baseResult.tdee,
      comparison,
      healthScore: Math.round(adjustedHealthScore),
      bmrEfficiency: baseResult.bmrEfficiency,
      factors: {
        ...baseResult.factors,
        alcoholImpact: alcoholConsumption || 'not specified',
        smokingImpact: smokingHabits || 'not specified',
        additionalAgeScore
      }
    };
  };

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChange(async (authUser) => {
      console.log('Auth state changed:', authUser); // Debug log
      setLoading(true);
      
      if (authUser) {
        setUser(authUser);
        setIsAuthenticated(true);

        // Save last login timestamp
        storageService.saveLastLogin(authUser.uid);

        // Start session tracking
        const loginMethod = authUser.providerData && authUser.providerData.length > 0
          ? authUser.providerData[0].providerId === 'google.com' ? 'google' : 'email'
          : 'email';
        sessionService.startSession(authUser, loginMethod).catch(error => {
          console.error('Failed to start session tracking:', error);
        });
        
        // First, try to get profile from local storage for faster loading
        const cachedProfile = storageService.getUserProfile(authUser.uid);
        
        if (cachedProfile) {
          console.log('✅ Using cached profile from local storage');
          setUserProfile(cachedProfile);
          setLoading(false);
          
          // Still fetch from Firestore in background to check for updates
          try {
            const freshProfile = await getUserProfile(authUser.uid);
            if (freshProfile && JSON.stringify(freshProfile) !== JSON.stringify(cachedProfile)) {
              console.log('📱 Profile updated from server');
              setUserProfile(freshProfile);
              storageService.saveUserProfile(authUser.uid, freshProfile);
            }
          } catch (error) {
            console.log('Background profile sync failed, using cached version');
          }
        } else {
          // No cached profile, fetch from Firestore
          console.log('No cached profile found, fetching from Firestore...');
          
          try {
            const profile = await getUserProfile(authUser.uid);
            console.log('User profile loaded from server:', profile);
            
            if (profile) {
              // Profile exists in Firestore
              setUserProfile(profile);
              // Cache the profile for future visits
              storageService.saveUserProfile(authUser.uid, profile);
              console.log('Profile loaded and cached successfully');
            } else {
              // Profile not found - this could be a deleted user or new user
              console.log('⚠️ Profile not found in Firestore for authenticated user:', authUser.uid);
              console.log('This could indicate:');
              console.log('1. User data was deleted from Firebase Console');
              console.log('2. New user who needs onboarding');
              console.log('3. Database permission issue');
              
              // Clear any stale cached data for this user
              storageService.clearAllUserData();
              
              // Create a fresh minimal profile for the authenticated user
              const minimalProfile = {
                uid: authUser.uid,
                name: authUser.displayName || 'User',
                email: authUser.email,
                isProfileComplete: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              console.log('Creating fresh minimal profile for user...');
              
              // Save minimal profile to Firestore
              try {
                await updateUserProfileService(authUser.uid, minimalProfile);
                setUserProfile(minimalProfile);
                storageService.saveUserProfile(authUser.uid, minimalProfile);
                console.log('✅ Fresh minimal profile created and saved successfully');
                console.log('User will be directed to onboarding to complete profile');
              } catch (createError) {
                console.error('❌ Error creating minimal profile in Firestore:', createError);
                console.log('Setting minimal profile locally anyway...');
                // Set the minimal profile locally even if Firestore save fails
                setUserProfile(minimalProfile);
                storageService.saveUserProfile(authUser.uid, minimalProfile);
                console.log('✅ Minimal profile set locally, user can proceed with onboarding');
              }
            }
          } catch (error) {
            console.error('❌ Error fetching user profile from Firestore:', error);
            console.log('Creating fallback profile to allow user to continue...');
            
            // Clear any potentially corrupted cached data
            storageService.clearAllUserData();
            
            // Create a fallback minimal profile if there's an error
            const fallbackProfile = {
              uid: authUser.uid,
              name: authUser.displayName || 'User',
              email: authUser.email,
              isProfileComplete: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            setUserProfile(fallbackProfile);
            storageService.saveUserProfile(authUser.uid, fallbackProfile);
            console.log('✅ Fallback profile created, user can proceed with fresh start');
          }
          
          setLoading(false);
        }
      } else {
        // User is signed out - clear all data
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);

        // End session tracking
        sessionService.endSession();

        storageService.clearAllUserData();
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const saveUserProfile = async (profileData) => {
    try {
      console.log('saveUserProfile called with:', profileData);
      console.log('User state:', user);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!profileData.height || !profileData.weight) {
        throw new Error('Height and weight are required');
      }

      // Convert string values to numbers for calculations
      const height = parseFloat(profileData.height);
      const weight = parseFloat(profileData.weight);
      const age = parseInt(profileData.age);
      const bodyFatPercentage = profileData.bodyFatPercentage ? parseFloat(profileData.bodyFatPercentage) : null;
      const muscleMass = profileData.muscleMass ? parseFloat(profileData.muscleMass) : null;



      // Validate converted values
      if (isNaN(height) || isNaN(weight) || isNaN(age) || height <= 0 || weight <= 0 || age <= 0) {
        throw new Error('Invalid numeric values for height, weight, or age');
      }

      // Calculate BMI
      const { bmi, bmiCategory, bmiStatus } = calculateBMI(height, weight);

      // Calculate metabolic age
      const metabolicData = calculateMetabolicAge(
        age, 
        profileData.gender, 
        height, 
        weight, 
        profileData.activityLevel,
        bodyFatPercentage,
        muscleMass,
        profileData.alcoholConsumption,
        profileData.smokingHabits
      );

      const completeProfile = {
        ...profileData,
        bmi,
        bmiCategory,
        bmiStatus,
        ...(metabolicData && {
          metabolicAge: metabolicData.metabolicAge,
          bmr: metabolicData.bmr,
          tdee: metabolicData.tdee,
          metabolicComparison: metabolicData.comparison,
          healthScore: metabolicData.healthScore,
          bmrEfficiency: metabolicData.bmrEfficiency,
          metabolicFactors: metabolicData.factors
        }),
        isProfileComplete: true
      };

      // Update in Firebase
      await updateUserProfileService(user.uid, completeProfile);
      
      // Update local state immediately
      setUserProfile(completeProfile);
      
      // Cache the updated profile locally
      storageService.saveUserProfile(user.uid, completeProfile);
      
      // Save marketing consent if provided
      if (completeProfile.emailConsent !== undefined || completeProfile.whatsappConsent !== undefined) {
        try {
          await marketingService.saveUserConsent(completeProfile);
        } catch (marketingError) {
          console.error('Error saving marketing consent:', marketingError);
          // Don't throw error for marketing consent failure
        }
      }
      
      return completeProfile;
    } catch (error) {
      console.error('Error saving user profile:', error);
      
      // Provide more user-friendly error messages
      if (error.message?.includes('User not authenticated')) {
        throw new Error('Please sign in again to complete your profile setup.');
      } else if (error.message?.includes('permission-denied')) {
        throw new Error('Permission denied. Please check your account permissions.');
      } else if (error.message?.includes('unavailable')) {
        throw new Error('Service temporarily unavailable. Please try again in a moment.');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(`Profile setup failed: ${error.message || 'Please try again.'}`);
      }
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!userProfile) {
        throw new Error('User profile not loaded');
      }

      // Create a copy of updates to avoid mutating the original
      const updatedData = { 
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Recalculate BMI and metabolic age if relevant data changed
      if (updates.height || updates.weight || updates.age || updates.gender || updates.activityLevel) {
        const currentHeight = updates.height || userProfile.height;
        const currentWeight = updates.weight || userProfile.weight;
        const currentAge = updates.age || userProfile.age;
        const currentGender = updates.gender || userProfile.gender;
        const currentActivityLevel = updates.activityLevel || userProfile.activityLevel;
        
        if (currentHeight && currentWeight) {
          const { bmi, bmiCategory, bmiStatus } = calculateBMI(currentHeight, currentWeight);
          updatedData.bmi = bmi;
          updatedData.bmiCategory = bmiCategory;
          updatedData.bmiStatus = bmiStatus;

          // Recalculate metabolic age if we have all required data
          if (currentAge && currentGender) {
            const currentBodyFat = updates.bodyFatPercentage || userProfile.bodyFatPercentage;
            const currentMuscleMass = updates.muscleMass || userProfile.muscleMass;
            
            const metabolicData = calculateMetabolicAge(
              currentAge, 
              currentGender, 
              currentHeight, 
              currentWeight, 
              currentActivityLevel,
              currentBodyFat,
              currentMuscleMass
            );
            
            if (metabolicData) {
              updatedData.metabolicAge = metabolicData.metabolicAge;
              updatedData.bmr = metabolicData.bmr;
              updatedData.tdee = metabolicData.tdee;
              updatedData.metabolicComparison = metabolicData.comparison;
              updatedData.healthScore = metabolicData.healthScore;
              updatedData.bmrEfficiency = metabolicData.bmrEfficiency;
              updatedData.metabolicFactors = metabolicData.factors;
            }
          }
        }
      }

      // Update in Firebase
      await updateUserProfileService(user.uid, updatedData);
      
      // Update local state
      const newProfile = { ...userProfile, ...updatedData };
      setUserProfile(newProfile);
      
      // Cache the updated profile locally
      storageService.saveUserProfile(user.uid, newProfile);
      
      return newProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const clearUserData = () => {
    setUser(null);
    setUserProfile(null);
    setIsAuthenticated(false);
    // Clear all cached data
    storageService.clearAllUserData();
  };

  // Force refresh user profile from server (useful for debugging deleted users)
  const forceRefreshUserProfile = async () => {
    if (!user?.uid) {
      console.log('No authenticated user to refresh');
      return;
    }

    console.log('🔄 Force refreshing user profile from server...');
    setLoading(true);
    
    try {
      // Clear all cached data first
      storageService.clearAllUserData();
      
      // Fetch fresh profile from Firestore
      const profile = await getUserProfile(user.uid);
      
      if (profile) {
        console.log('✅ Fresh profile loaded from server:', profile);
        setUserProfile(profile);
        storageService.saveUserProfile(user.uid, profile);
      } else {
        console.log('⚠️ No profile found on server, creating fresh minimal profile...');
        
        // Create fresh minimal profile
        const minimalProfile = {
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          isProfileComplete: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Save to Firestore
        await updateUserProfileService(user.uid, minimalProfile);
        setUserProfile(minimalProfile);
        storageService.saveUserProfile(user.uid, minimalProfile);
        console.log('✅ Fresh minimal profile created');
      }
    } catch (error) {
      console.error('❌ Error force refreshing profile:', error);
      
      // Create fallback profile
      const fallbackProfile = {
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        isProfileComplete: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setUserProfile(fallbackProfile);
      storageService.saveUserProfile(user.uid, fallbackProfile);
      console.log('✅ Fallback profile created after error');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated,
    saveUserProfile,
    updateUserProfile,
    clearUserData,
    forceRefreshUserProfile
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};