import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { calculateMetabolicAge /* getBMIInfo */ } from '../../utils/metabolicCalculations';
import PhoneInput from 'react-phone-number-input';
import { 
  User, 
  // Calendar, 
  // Users, 
  Ruler, 
  // Weight, 
  Heart, 
  Utensils, 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Phone,
  // MapPin,
  // AlertTriangle,
  // Activity,
  ChefHat,
  // Home,
  Mail,
  MessageCircle,
  Shield,
  Wine,
  Cigarette
} from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-phone-number-input/style.css';
import './Onboarding.css';
import TermsConditions from '../TermsConditions/TermsConditions';

const Onboarding = ({ onComplete }) => {
  const { saveUserProfile, user, isAuthenticated } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    healthConditions: [],
    dietType: '',
    // New extended profile fields
    phone: '',
    bloodGroup: '',
    address: '',
    allergies: [],
    activityLevel: 'moderate', // Default activity level for metabolic age calculation
    // Lifestyle habits
    alcoholConsumption: '',
    smokingHabits: '',
    // Personal questions
    favoriteHealthyFood: '',
    cookAtHome: '',
    fitnessGoal: '',
    workoutFrequency: '',
    stressLevel: '',
    // Marketing consent (now mandatory)
    emailConsent: true,
    whatsappConsent: true,
    termsAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  // Check authentication on component mount
  useEffect(() => {
    console.log('Onboarding mounted. Auth state:', { 
      isAuthenticated, 
      user: !!user, 
      userId: user?.uid 
    });
    console.log('Onboarding - Current form data:', formData);
    
    if (!isAuthenticated && !user) {
      console.warn('User not authenticated in onboarding');
      toast.error('Please sign in to continue with profile setup');
    }
  }, [isAuthenticated, user, formData]);

  const steps = [
    {
      title: "Welcome! Let's get to know you",
      subtitle: "Tell us about yourself",
      icon: User,
      fields: ['name', 'age', 'gender']
    },
    {
      title: "Your Physical Stats",
      subtitle: "Help us calculate your BMI",
      icon: Ruler,
      fields: ['height', 'weight']
    },
    {
      title: "Contact & Medical Info",
      subtitle: "Your contact details and medical information",
      icon: Phone,
      fields: ['phone', 'bloodGroup', 'address']
    },
    {
      title: "Health Conditions & Allergies",
      subtitle: "Any conditions or allergies we should know about?",
      icon: Heart,
      fields: ['healthConditions', 'allergies']
    },
    {
      title: "Diet Preferences",
      subtitle: "What's your dietary style?",
      icon: Utensils,
      fields: ['dietType']
    },
    {
      title: "Alcohol Consumption",
      subtitle: "Help us understand your drinking habits",
      icon: Wine,
      fields: ['alcoholConsumption']
    },
    {
      title: "Smoking Habits",
      subtitle: "Tell us about your smoking habits",
      icon: Cigarette,
      fields: ['smokingHabits']
    },
    {
      title: "Personal Questions",
      subtitle: "Help us personalize your experience",
      icon: ChefHat,
      fields: ['favoriteHealthyFood', 'cookAtHome', 'fitnessGoal', 'workoutFrequency', 'stressLevel']
    },
    {
      title: "Stay Connected",
      subtitle: "Get updates and support",
      icon: MessageCircle,
      fields: ['emailConsent', 'whatsappConsent', 'termsAccepted']
    }
  ];

  const healthConditionOptions = [
    { id: 'none', label: 'None', color: 'bg-green-100 text-green-800' },
    { id: 'pcos', label: 'PCOS', color: 'bg-pink-100 text-pink-800' },
    { id: 'pcod', label: 'PCOD', color: 'bg-purple-100 text-purple-800' },
    { id: 'diabetes', label: 'Diabetes', color: 'bg-red-100 text-red-800' },
    { id: 'thyroid', label: 'Thyroid', color: 'bg-blue-100 text-blue-800' },
    { id: 'hypertension', label: 'Hypertension', color: 'bg-orange-100 text-orange-800' },
  ];

  const allergyOptions = [
    { id: 'none', label: 'No Allergies', color: 'bg-green-100 text-green-800' },
    { id: 'nuts', label: 'Nuts', color: 'bg-amber-100 text-amber-800' },
    { id: 'dairy', label: 'Dairy', color: 'bg-blue-100 text-blue-800' },
    { id: 'gluten', label: 'Gluten', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'eggs', label: 'Eggs', color: 'bg-orange-100 text-orange-800' },
    { id: 'seafood', label: 'Seafood', color: 'bg-red-100 text-red-800' },
    { id: 'soy', label: 'Soy', color: 'bg-purple-100 text-purple-800' },
    { id: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
  ];

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const workoutFrequencyOptions = [
    { id: 'never', label: 'Never', color: 'bg-gray-100 text-gray-800' },
    { id: 'rarely', label: '1-2 times/week', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'sometimes', label: '3-4 times/week', color: 'bg-orange-100 text-orange-800' },
    { id: 'regularly', label: '5+ times/week', color: 'bg-green-100 text-green-800' },
  ];

  const stressLevelOptions = [
    { id: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { id: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
  ];

  const alcoholConsumptionOptions = [
    { id: 'never', label: 'Never', desc: '0 drinks per week', color: 'bg-green-100 text-green-800', icon: '🚫' },
    { id: 'occasional', label: 'Occasional', desc: '1-2 drinks per week', color: 'bg-blue-100 text-blue-800', icon: '🍷' },
    { id: 'moderate', label: 'Moderate', desc: '3-7 drinks per week', color: 'bg-yellow-100 text-yellow-800', icon: '🍺' },
    { id: 'frequent', label: 'Frequent', desc: '8-14 drinks per week', color: 'bg-orange-100 text-orange-800', icon: '🥃' },
    { id: 'heavy', label: 'Heavy', desc: '15+ drinks per week', color: 'bg-red-100 text-red-800', icon: '⚠️' },
  ];

  const smokingHabitsOptions = [
    { id: 'never', label: 'Never Smoked', desc: 'No smoking history', color: 'bg-green-100 text-green-800', icon: '🚭' },
    { id: 'former', label: 'Former Smoker', desc: 'Quit smoking', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    { id: 'occasional', label: 'Occasional', desc: '1-5 cigarettes per week', color: 'bg-yellow-100 text-yellow-800', icon: '🚬' },
    { id: 'light', label: 'Light Smoker', desc: '1-10 cigarettes per day', color: 'bg-orange-100 text-orange-800', icon: '📦' },
    { id: 'moderate', label: 'Moderate Smoker', desc: '11-20 cigarettes per day', color: 'bg-red-100 text-red-800', icon: '🚨' },
    { id: 'heavy', label: 'Heavy Smoker', desc: '20+ cigarettes per day', color: 'bg-red-200 text-red-900', icon: '⚠️' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHealthConditionToggle = (conditionId) => {
    setFormData(prev => {
      let newConditions = [...prev.healthConditions];
      
      if (conditionId === 'none') {
        newConditions = newConditions.includes('none') ? [] : ['none'];
      } else {
        newConditions = newConditions.filter(c => c !== 'none');
        if (newConditions.includes(conditionId)) {
          newConditions = newConditions.filter(c => c !== conditionId);
        } else {
          newConditions.push(conditionId);
        }
      }
      
      return { ...prev, healthConditions: newConditions };
    });
  };

  const handleAllergyToggle = (allergyId) => {
    setFormData(prev => {
      let newAllergies = [...prev.allergies];
      
      if (allergyId === 'none') {
        newAllergies = newAllergies.includes('none') ? [] : ['none'];
      } else {
        newAllergies = newAllergies.filter(a => a !== 'none');
        if (newAllergies.includes(allergyId)) {
          newAllergies = newAllergies.filter(a => a !== allergyId);
        } else {
          newAllergies.push(allergyId);
        }
      }
      
      return { ...prev, allergies: newAllergies };
    });
  };

  const validateStep = (step) => {
    console.log('Validating step:', step);
    const requiredFields = steps[step].fields;
    console.log('Required fields:', requiredFields);
    console.log('Current form data:', formData);
    
    for (const field of requiredFields) {
      if (field === 'healthConditions') {
        if (formData.healthConditions.length === 0) {
          toast.error('Please select at least one health condition option');
          return false;
        }
      } else if (field === 'allergies') {
        if (formData.allergies.length === 0) {
          toast.error('Please select at least one allergy option');
          return false;
        }
      } else if (field === 'termsAccepted') {
        if (!formData.termsAccepted) {
          toast.error('Please accept the terms and conditions');
          return false;
        }
      } else if (field === 'emailConsent') {
        if (!formData.emailConsent) {
          toast.error('Please consent to email updates to continue');
          return false;
        }
      } else if (field === 'whatsappConsent') {
        if (!formData.whatsappConsent) {
          toast.error('Please consent to WhatsApp updates to continue');
          return false;
        }
      } else if (!formData[field] || formData[field].toString().trim() === '') {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        toast.error(`Please fill in ${fieldName}`);
        return false;
      }
    }
    
    // Additional validations
    if (step === 0) {
      if (formData.age < 10 || formData.age > 100) {
        toast.error('Please enter a valid age');
        return false;
      }
    }
    
    if (step === 1) {
      if (formData.height < 100 || formData.height > 250) {
        toast.error('Please enter a valid height (100-250 cm)');
        return false;
      }
      if (formData.weight < 30 || formData.weight > 300) {
        toast.error('Please enter a valid weight (30-300 kg)');
        return false;
      }
    }

    if (step === 2) {
      if (formData.phone && formData.phone.length < 10) {
        toast.error('Please enter a valid phone number');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // BMI Calculation Helper Function
  const calculateBMI = (height, weight) => {
    if (!height || !weight || height <= 0 || weight <= 0) {
      return null;
    }
    
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    let category, status, colorClass;
    
    if (bmi < 18.5) {
      category = 'Underweight';
      status = 'You may need to gain weight for optimal health';
      colorClass = 'text-blue-600';
    } else if (bmi < 25) {
      category = 'Normal';
      status = 'You have a healthy weight range';
      colorClass = 'text-green-600';
    } else if (bmi < 30) {
      category = 'Overweight';
      status = 'Consider losing weight for better health';
      colorClass = 'text-yellow-600';
    } else {
      category = 'Obese';
      status = 'Weight loss is recommended for your health';
      colorClass = 'text-red-600';
    }
    
    return {
      bmi: parseFloat(bmi),
      category,
      status,
      colorClass
    };
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called, current step:', currentStep);
    
    const isValid = validateStep(currentStep);
    console.log('Step validation result:', isValid);
    
    if (!isValid) {
      console.log('Validation failed, aborting submit');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Debug authentication state
      console.log('Authentication state:', { 
        user: !!user, 
        userId: user?.uid, 
        userEmail: user?.email 
      });
      
      // Check if user is authenticated
      if (!user || !user.uid) {
        console.error('User not authenticated or missing UID');
        toast.error('Authentication required. Please sign in first.');
        setIsSubmitting(false);
        return;
      }

      // Additional check for authentication state
      if (!isAuthenticated) {
        console.error('User authentication state is false');
        toast.error('Authentication session expired. Please sign in again.');
        setIsSubmitting(false);
        return;
      }

      // Additional validation
      if (!formData.name?.trim()) {
        toast.error('Please enter your name');
        setIsSubmitting(false);
        return;
      }

      if (!formData.height || !formData.weight) {
        toast.error('Please enter your height and weight');
        setIsSubmitting(false);
        return;
      }


      
      // Retry mechanism for profile saving
      let profile;
      const maxRetries = 3;
      
      const retryProfileSave = async (currentRetry = 0) => {
        try {
          return await saveUserProfile(formData);
        } catch (retryError) {
          if (currentRetry >= maxRetries - 1) {
            throw retryError; // Re-throw the error after max retries
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (currentRetry + 1)));
          return retryProfileSave(currentRetry + 1);
        }
      };
      
      profile = await retryProfileSave();
      

      
      // Show success message with BMI and metabolic age
      let successMessage = `Welcome ${formData.name}! Your BMI is ${profile.bmi} - ${profile.bmiCategory}`;
      
      if (profile.metabolicAge && profile.age) {
        if (profile.metabolicComparison === 'younger') {
          successMessage += ` 🎉 Great news! Your metabolic age is ${profile.metabolicAge} years - ${profile.age - profile.metabolicAge} years younger than your actual age!`;
        } else if (profile.metabolicComparison === 'older') {
          successMessage += ` Your metabolic age is ${profile.metabolicAge} years. Consider increasing your activity level for better health!`;
        } else {
          successMessage += ` Your metabolic age matches your actual age - well balanced!`;
        }
      }
      
      toast.success(successMessage);
      
      // Complete onboarding after a brief delay
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // More specific error messages
      if (error.message?.includes('User not authenticated')) {
        toast.error('Authentication required. Please sign in first.');
      } else if (error.message?.includes('Firebase')) {
        toast.error('Database error. Please try again.');
      } else if (error.message?.includes('network')) {
        toast.error('Network error. Please check your connection.');
      } else if (error.message?.includes('permission')) {
        toast.error('Permission denied. Please check your account.');
      } else {
        toast.error(`Error: ${error.message || 'Something went wrong. Please try again.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your name? *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-800 placeholder-gray-500"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How old are you? *
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-800 placeholder-gray-500"
                placeholder="Enter your age"
                min="10"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Male', 'Female', 'Other'].map((gender) => (
                  <motion.button
                    key={gender}
                    type="button"
                    onClick={() => handleInputChange('gender', gender)}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                      formData.gender === gender
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {gender}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm) *
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-800 placeholder-gray-500"
                placeholder="Enter your height in cm"
                min="100"
                max="250"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg) *
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-800 placeholder-gray-500"
                placeholder="Enter your weight in kg"
                min="30"
                max="300"
              />
            </div>
            
            {/* Comprehensive BMI Display Section */}
            {formData.height && formData.weight && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200 space-y-3"
              >
                {(() => {
                  const bmiData = calculateBMI(formData.height, formData.weight);
                  if (!bmiData) return null;
                  
                  return (
                    <>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          📊 Your BMI Calculation
                        </h3>
                        <div className="flex items-center justify-center space-x-4 mb-2">
                          <span className="text-sm text-gray-600">
                            Height: <span className="font-medium">{formData.height} cm</span>
                          </span>
                          <span className="text-sm text-gray-600">
                            Weight: <span className="font-medium">{formData.weight} kg</span>
                          </span>
                        </div>
                        <div className={`text-2xl font-bold ${bmiData.colorClass} mb-1`}>
                          BMI: {bmiData.bmi} - {bmiData.category}
                        </div>
                        <p className="text-sm text-gray-600">
                          {bmiData.status}
                        </p>
                      </div>
                      
                      {/* BMI Scale Visual */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Underweight</span>
                          <span>Normal</span>
                          <span>Overweight</span>
                          <span>Obese</span>
                        </div>
                        <div className="h-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full relative">
                          <div 
                            className="absolute top-0 w-3 h-3 bg-gray-800 rounded-full transform -translate-y-0.5 -translate-x-1.5"
                            style={{
                              left: `${Math.min(Math.max((bmiData.bmi - 15) / (40 - 15) * 100, 0), 100)}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>15</span>
                          <span>18.5</span>
                          <span>25</span>
                          <span>30</span>
                          <span>40</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                className="w-full phone-input-field"
                placeholder="Enter your phone number"
                defaultCountry="IN"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group *
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-800"
              >
                <option value="">Select your blood group</option>
                {bloodGroupOptions.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-800 placeholder-gray-500"
                placeholder="Enter your address"
                rows="3"
              />
            </div>
            
            {/* Metabolic Age Calculation Display */}
            {formData.height && formData.weight && formData.age && formData.gender && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 space-y-3"
              >
                {(() => {
                  // Use centralized metabolic age calculation
                  const metabolicData = calculateMetabolicAge(
                    parseInt(formData.age), 
                    formData.gender, 
                    parseInt(formData.height), 
                    parseInt(formData.weight),
                    formData.activityLevel || 'moderate'
                  );
                  
                  return (
                    <>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          🧬 Your Metabolic Age Analysis
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Chronological Age</p>
                            <p className="text-xl font-bold text-gray-800">{formData.age} years</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Metabolic Age</p>
                            <p className={`text-xl font-bold ${metabolicData.comparisonColor}`}>
                              {metabolicData.metabolicAge} years
                            </p>
                          </div>
                        </div>
                        
                        <div className={`text-lg font-semibold ${metabolicData.comparisonColor} mb-2`}>
                          {metabolicData.comparisonIcon} Your metabolism is {metabolicData.comparison === 'younger' ? 'younger' : metabolicData.comparison === 'older' ? 'older' : 'similar to'} than your age!
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="bg-white/50 rounded-lg p-2">
                            <p className="text-gray-600">BMR</p>
                            <p className="font-semibold">{metabolicData.bmr} cal/day</p>
                          </div>
                          <div className="bg-white/50 rounded-lg p-2">
                            <p className="text-gray-600">TDEE</p>
                            <p className="font-semibold">{metabolicData.tdee} cal/day</p>
                          </div>
                          <div className="bg-white/50 rounded-lg p-2">
                            <p className="text-gray-600">Health Score</p>
                            <p className="font-semibold">{metabolicData.healthScore}/100</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Metabolic Age Factors */}
                      <div className="mt-4 text-xs text-gray-600">
                        <p className="font-medium mb-1">Calculation factors:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>• BMR Efficiency: {metabolicData.bmrEfficiency.toFixed(2)}</div>
                          <div>• BMI Impact: {formData.height && formData.weight ? ((formData.weight / ((formData.height / 100) ** 2)).toFixed(1)) : 'N/A'}</div>
                          <div>• Activity Level: {formData.activityLevel || 'Moderate'}</div>
                          <div>• Age Factor: {formData.age > 30 ? 'Adjusted' : 'Standard'}</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Level (for metabolic age calculation)
              </label>
              <select
                value={formData.activityLevel || 'moderate'}
                onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-800"
              >
                <option value="sedentary">Sedentary (Little/no exercise)</option>
                <option value="light">Light (Light exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (Moderate exercise 3-5 days/week)</option>
                <option value="active">Active (Heavy exercise 6-7 days/week)</option>
                <option value="very_active">Very Active (Very heavy exercise, physical job)</option>
              </select>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Do you have any of these health conditions? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {healthConditionOptions.map((condition) => (
                  <motion.button
                    key={condition.id}
                    type="button"
                    onClick={() => handleHealthConditionToggle(condition.id)}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                      formData.healthConditions.includes(condition.id)
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      formData.healthConditions.includes(condition.id) 
                        ? 'bg-white text-sage' 
                        : condition.color
                    }`}>
                      {condition.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Do you have any food allergies? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {allergyOptions.map((allergy) => (
                  <motion.button
                    key={allergy.id}
                    type="button"
                    onClick={() => handleAllergyToggle(allergy.id)}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                      formData.allergies.includes(allergy.id)
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      formData.allergies.includes(allergy.id) 
                        ? 'bg-white text-sage' 
                        : allergy.color
                    }`}>
                      {allergy.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What's your dietary preference? *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'vegetarian', label: 'Vegetarian 🥬', desc: 'Plant-based diet' },
                  { value: 'non-vegetarian', label: 'Non-Vegetarian 🍗', desc: 'Includes meat & fish' }
                ].map((diet) => (
                  <motion.button
                    key={diet.value}
                    type="button"
                    onClick={() => handleInputChange('dietType', diet.value)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      formData.dietType === diet.value
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-lg font-medium">{diet.label}</div>
                    <div className="text-sm opacity-75">{diet.desc}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How often do you consume alcohol? *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {alcoholConsumptionOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => handleInputChange('alcoholConsumption', option.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      formData.alcoholConsumption === option.id
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium flex items-center gap-2">
                          <span className="text-2xl">{option.icon}</span>
                          {option.label}
                        </div>
                        <div className="text-sm opacity-75 mt-1">{option.desc}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Note:</strong> This information helps us provide better health recommendations. 
                  One standard drink = 12oz beer, 5oz wine, or 1.5oz spirits.
                </p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What are your smoking habits? *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {smokingHabitsOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => handleInputChange('smokingHabits', option.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      formData.smokingHabits === option.id
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium flex items-center gap-2">
                          <span className="text-2xl">{option.icon}</span>
                          {option.label}
                        </div>
                        <div className="text-sm opacity-75 mt-1">{option.desc}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-700">
                  ⚠️ <strong>Health Note:</strong> Smoking significantly impacts your health and metabolism. 
                  If you're looking to quit, we can provide resources and support.
                </p>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your favorite healthy food? *
              </label>
              <input
                type="text"
                value={formData.favoriteHealthyFood}
                onChange={(e) => handleInputChange('favoriteHealthyFood', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-800 placeholder-gray-500"
                placeholder="e.g., Quinoa salad, Avocado toast..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you cook at home? *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'always', label: 'Always', icon: '👨‍🍳' },
                  { value: 'sometimes', label: 'Sometimes', icon: '🍳' },
                  { value: 'rarely', label: 'Rarely', icon: '🍕' }
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('cookAtHome', option.value)}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                      formData.cookAtHome === option.value
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-sm">{option.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your main fitness goal? *
              </label>
              <select
                value={formData.fitnessGoal}
                onChange={(e) => handleInputChange('fitnessGoal', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-800"
              >
                <option value="">Select your fitness goal</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="weight-gain">Weight Gain</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
                <option value="health-improvement">Health Improvement</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How often do you workout? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {workoutFrequencyOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => handleInputChange('workoutFrequency', option.id)}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                      formData.workoutFrequency === option.id
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      formData.workoutFrequency === option.id 
                        ? 'bg-white text-sage' 
                        : option.color
                    }`}>
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What's your stress level? *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {stressLevelOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => handleInputChange('stressLevel', option.id)}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                      formData.stressLevel === option.id
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      formData.stressLevel === option.id 
                        ? 'bg-white text-sage' 
                        : option.color
                    }`}>
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Stay Connected!</h3>
              <p className="text-gray-600">Get personalized health tips and updates</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-2xl">
                <input
                  type="checkbox"
                  id="emailConsent"
                  checked={formData.emailConsent}
                  onChange={(e) => handleInputChange('emailConsent', e.target.checked)}
                  className="w-5 h-5 text-sage border-gray-300 rounded focus:ring-sage"
                />
                <label htmlFor="emailConsent" className="flex-1 text-sm text-gray-700">
                  <Mail className="inline w-4 h-4 mr-2 text-blue-600" />
                  I agree to receive health tips and updates via email
                </label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-2xl">
                <input
                  type="checkbox"
                  id="whatsappConsent"
                  checked={formData.whatsappConsent}
                  onChange={(e) => handleInputChange('whatsappConsent', e.target.checked)}
                  className="w-5 h-5 text-sage border-gray-300 rounded focus:ring-sage"
                />
                <label htmlFor="whatsappConsent" className="flex-1 text-sm text-gray-700">
                  <MessageCircle className="inline w-4 h-4 mr-2 text-green-600" />
                  I agree to receive notifications via WhatsApp
                </label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-2xl">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  className="w-5 h-5 text-sage border-gray-300 rounded focus:ring-sage"
                />
                <label htmlFor="termsAccepted" className="flex-1 text-sm text-gray-700">
                  <Shield className="inline w-4 h-4 mr-2 text-red-600" />
                  I accept the <button type="button" onClick={() => setShowTerms(true)} className="text-sage underline">Terms & Conditions</button> *
                </label>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-sage/10 to-light-green/10 rounded-2xl">
              <p className="text-sm text-gray-600 text-center">
                🎉 You're almost done! Complete your profile to get personalized health recommendations.
              </p>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your favorite healthy food? *
              </label>
              <input
                type="text"
                value={formData.favoriteHealthyFood}
                onChange={(e) => handleInputChange('favoriteHealthyFood', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-800 placeholder-gray-500"
                placeholder="e.g., Avocado, Quinoa, Salmon..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Do you cook at home? *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'always', label: 'Always', emoji: '👨‍🍳' },
                  { value: 'sometimes', label: 'Sometimes', emoji: '🍳' },
                  { value: 'rarely', label: 'Rarely', emoji: '🍕' }
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('cookAtHome', option.value)}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                      formData.cookAtHome === option.value
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm">{option.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your main fitness goal? *
              </label>
              <select
                value={formData.fitnessGoal}
                onChange={(e) => handleInputChange('fitnessGoal', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-800"
              >
                <option value="">Select your fitness goal</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="weight-gain">Weight Gain</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="maintain">Maintain Current Weight</option>
                <option value="health-improvement">Overall Health Improvement</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How often do you exercise? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {workoutFrequencyOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => handleInputChange('workoutFrequency', option.id)}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                      formData.workoutFrequency === option.id
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      formData.workoutFrequency === option.id 
                        ? 'bg-white text-sage' 
                        : option.color
                    }`}>
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How would you rate your stress level? *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {stressLevelOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => handleInputChange('stressLevel', option.id)}
                    className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                      formData.stressLevel === option.id
                        ? 'border-sage bg-sage text-white'
                        : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      formData.stressLevel === option.id 
                        ? 'bg-white text-sage' 
                        : option.color
                    }`}>
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MessageCircle className="w-16 h-16 text-sage mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Stay Connected with Us!
              </h3>
              <p className="text-gray-600">
                Get personalized health tips, meal plans, and expert advice (Both consents required)
              </p>
            </div>
            
            <div className="space-y-4">
              <motion.div
                className={`flex items-center justify-between p-4 bg-white/50 rounded-2xl border transition-all duration-300 ${
                  formData.emailConsent ? 'border-gray-200' : 'border-red-300 bg-red-50/50'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-sage" />
                  <div>
                    <h4 className="font-medium text-gray-800">Email Updates *</h4>
                    <p className="text-sm text-gray-600">Weekly health tips and meal plans (Required)</p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={() => handleInputChange('emailConsent', !formData.emailConsent)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    formData.emailConsent ? 'bg-sage' : 'bg-gray-300'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{ x: formData.emailConsent ? 24 : 2 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              </motion.div>
              
              <motion.div
                className={`flex items-center justify-between p-4 bg-white/50 rounded-2xl border transition-all duration-300 ${
                  formData.whatsappConsent ? 'border-gray-200' : 'border-red-300 bg-red-50/50'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-800">WhatsApp Updates *</h4>
                    <p className="text-sm text-gray-600">Quick reminders and support (Required)</p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={() => handleInputChange('whatsappConsent', !formData.whatsappConsent)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    formData.whatsappConsent ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{ x: formData.whatsappConsent ? 24 : 2 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              </motion.div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-start space-x-3">
                <motion.button
                  type="button"
                  onClick={() => handleInputChange('termsAccepted', !formData.termsAccepted)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                    formData.termsAccepted
                      ? 'border-sage bg-sage text-white'
                      : 'border-gray-300 hover:border-sage text-gray-800 bg-white hover:text-sage'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {formData.termsAccepted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle className="w-3 h-3" />
                    </motion.div>
                  )}
                </motion.button>
                <div className="text-sm text-gray-600">
                  <p>
                    I agree to the{' '}
                    <button
                      type="button"
                      className="text-sage hover:text-sage/80 font-medium underline"
                      onClick={() => window.open('/terms', '_blank')}
                    >
                      Terms & Conditions
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      className="text-sage hover:text-sage/80 font-medium underline"
                      onClick={() => window.open('/privacy', '_blank')}
                    >
                      Privacy Policy
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container min-h-screen bg-gradient-to-br from-pastel-green via-cream to-powder-blue flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-sage to-light-green h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          className="onboarding-form glass-card p-4 sm:p-6 lg:p-8"
          layout
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Header */}
              <div className="text-center mb-6 sm:mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-sage to-light-green rounded-full mb-4"
                >
                  {React.createElement(steps[currentStep].icon, { 
                    className: "w-6 h-6 sm:w-8 sm:h-8 text-white" 
                  })}
                </motion.div>
                
                <motion.h1
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {steps[currentStep].title}
                </motion.h1>
                
                <motion.p
                  className="text-sm sm:text-base text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {steps[currentStep].subtitle}
                </motion.p>
              </div>

              {/* Step Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {renderStepContent()}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="navigation-buttons">
            <motion.button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="back-button flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-medium transition-all duration-300 text-sm sm:text-base"
              whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
              whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </motion.button>

            {currentStep < steps.length - 1 ? (
              <motion.button
                onClick={nextStep}
                className="flex items-center px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-sage to-light-green text-white rounded-2xl font-medium animated-button text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-sage to-light-green text-white rounded-2xl font-medium animated-button disabled:opacity-50"
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Complete Setup
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
      {showTerms && (
        <TermsConditions onClose={() => setShowTerms(false)} />
      )}
    </div>
  );
};

export default Onboarding;