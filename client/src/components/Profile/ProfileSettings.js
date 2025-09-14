import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Heart,
  Scale,
  Ruler,
  Target,
  Zap,
  Save,
  RefreshCw,
  Info,
  TrendingUp,
  Clock,
  Flame,
  Award,
  AlertCircle,
  CheckCircle,
  Edit3,
  Camera,
  Shield
} from 'lucide-react';

const ProfileSettings = () => {
  const { userProfile, updateUserProfile, loading } = useUser();
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        age: userProfile.age || '',
        gender: userProfile.gender || '',
        height: userProfile.height || '',
        weight: userProfile.weight || '',
        activityLevel: userProfile.activityLevel || 'moderate',
        dietType: userProfile.dietType || '',
        healthConditions: userProfile.healthConditions || [],
        fitnessGoals: userProfile.fitnessGoals || [],
        bodyFatPercentage: userProfile.bodyFatPercentage || '',
        muscleMass: userProfile.muscleMass || '',
        waistCircumference: userProfile.waistCircumference || '',
        hipCircumference: userProfile.hipCircumference || '',
        bloodPressure: userProfile.bloodPressure || '',
        restingHeartRate: userProfile.restingHeartRate || '',
        sleepHours: userProfile.sleepHours || 8,
        stressLevel: userProfile.stressLevel || 'moderate',
        smokingStatus: userProfile.smokingStatus || 'never',
        alcoholConsumption: userProfile.alcoholConsumption || 'occasional',
        preferences: userProfile.preferences || {
          notifications: true,
          dataSharing: false,
          units: 'metric'
        }
      });
    }
  }, [userProfile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...(prev[field] || []), value]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setIsDeleting(true);
    
    try {
      await performAccountDeletion();
    } catch (error) {
      console.error('❌ Error in account deletion:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        // Show a user-friendly message and handle re-authentication
        toast.error('For security, please confirm your password to delete your account.');
        setShowReauthModal(true);
      } else {
        // Handle other errors
        let errorMessage = 'Failed to delete account. ';
        
        if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.code === 'auth/user-not-found') {
          errorMessage = 'User account not found. You may already be logged out.';
        } else if (error.message && error.message.includes('No authenticated user')) {
          errorMessage = 'You are not logged in. Please log in and try again.';
        } else if (error.code === 'permission-denied') {
          errorMessage = 'Permission denied. Please make sure you are logged in with the correct account.';
        } else {
          errorMessage += `Error: ${error.message || 'Unknown error'}. Please try again or contact support.`;
        }
        
        toast.error(errorMessage);
        setIsDeleting(false);
        setShowDeleteConfirmation(false);
        setDeleteConfirmationText('');
      }
    }
  };

  const performAccountDeletion = async () => {
    // Show loading toast
    const loadingToast = toast.loading('Deleting your account...');
    
    try {
      // Import Firebase functions
      const { auth, db } = await import('../../firebase/config');
      const { deleteUser } = await import('firebase/auth');
      const { doc, deleteDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      console.log('Starting account deletion for user:', user.uid);

      // Step 1: Delete user data from Firestore first
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await deleteDoc(userDocRef);
        console.log('✅ User document deleted successfully');
      } catch (firestoreError) {
        console.warn('⚠️ Error deleting user document (may not exist):', firestoreError);
        // Continue with deletion even if user doc doesn't exist
      }

      // Step 2: Delete any additional user data (health records, progress, etc.)
      const collections = ['healthData', 'progressRecords', 'mealPlans', 'userPreferences'];
      
      for (const collectionName of collections) {
        try {
          const q = query(collection(db, collectionName), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const deletePromises = querySnapshot.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
            await Promise.all(deletePromises);
            console.log(`✅ Deleted ${querySnapshot.docs.length} documents from ${collectionName}`);
          } else {
            console.log(`ℹ️ No documents found in ${collectionName}`);
          }
        } catch (collectionError) {
          console.warn(`⚠️ Error deleting from ${collectionName}:`, collectionError);
          // Continue with deletion even if some collections fail
        }
      }

      // Step 3: Clear localStorage and session storage
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Local storage cleared');
      
      // Step 4: Delete the Firebase Auth user account (this is where the error usually occurs)
      await deleteUser(user);
      console.log('✅ Firebase Auth user deleted successfully');
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Account deleted successfully! Redirecting to login page...');
      
      // Step 5: Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
      // Reset states
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setDeleteConfirmationText('');
      
    } catch (error) {
      toast.dismiss(loadingToast);
      throw error; // Re-throw to be handled by the calling function
    }
  };

  const handleReauthAndDelete = async () => {
    if (!reauthPassword) {
      toast.error('Please enter your password');
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading('Verifying password...');

    try {
      // Import Firebase functions
      const { auth } = await import('../../firebase/config');
      const { reauthenticateWithCredential, EmailAuthProvider } = await import('firebase/auth');
      
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }

      // Create credential and re-authenticate
      const credential = EmailAuthProvider.credential(user.email, reauthPassword);
      await reauthenticateWithCredential(user, credential);
      
      toast.dismiss(loadingToast);
      toast.success('Password verified! Deleting account...');
      
      // Close re-auth modal
      setShowReauthModal(false);
      setReauthPassword('');
      
      // Now perform the account deletion
      await performAccountDeletion();
      
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('❌ Re-authentication failed:', error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later.');
      } else {
        toast.error('Failed to verify password. Please try again.');
      }
      
      setIsDeleting(false);
    }
  };

  const getBMIColor = (bmi) => {
    if (!bmi) return 'text-gray-500';
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreColor = (score) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: Mail },
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'physical', label: 'Physical', icon: Scale },
    { id: 'health', label: 'Health', icon: Heart },
    { id: 'lifestyle', label: 'Lifestyle', icon: Activity },
    { id: 'metrics', label: 'Metrics', icon: TrendingUp }
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little/no exercise' },
    { value: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
    { value: 'active', label: 'Active', description: 'Heavy exercise 6-7 days/week' },
    { value: 'very_active', label: 'Very Active', description: 'Very heavy exercise, physical job' }
  ];

  const healthConditions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Arthritis',
    'Thyroid Issues', 'High Cholesterol', 'Anxiety', 'Depression', 'None'
  ];

  const fitnessGoals = [
    'Weight Loss', 'Weight Gain', 'Muscle Building', 'Endurance',
    'Flexibility', 'General Health', 'Stress Relief', 'Better Sleep'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
              <p className="text-gray-600">Manage your health profile and preferences</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </motion.button>
              ) : (
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Health Summary Cards */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {/* BMI Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <Heart className={`w-5 h-5 ${getBMIColor(userProfile.bmi)}`} />
                <span className="text-xs text-gray-500">BMI</span>
              </div>
              <div className={`text-2xl font-bold ${getBMIColor(userProfile.bmi)}`}>
                {userProfile.bmi || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">{userProfile.bmiCategory}</div>
            </div>

            {/* Metabolic Age Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-xs text-gray-500">Metabolic Age</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {userProfile.metabolicAge || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">
                {userProfile.metabolicComparison === 'younger' && '🎉 Younger'}
                {userProfile.metabolicComparison === 'older' && '⚠️ Older'}
                {userProfile.metabolicComparison === 'same' && '✅ Same'}
              </div>
            </div>

            {/* BMR Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <span className="text-xs text-gray-500">BMR</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {userProfile.bmr || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">cal/day</div>
            </div>

            {/* Health Score Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <Award className={`w-5 h-5 ${getHealthScoreColor(userProfile.healthScore)}`} />
                <span className="text-xs text-gray-500">Health Score</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthScoreColor(userProfile.healthScore)}`}>
                {userProfile.healthScore || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">/100</div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                
                {/* Account Status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Account Active</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Your account is verified and active. You have full access to all features.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address (Login)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={userProfile?.email || ''}
                        disabled={true}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This is your login email and cannot be changed
                    </p>
                  </div>

                  {/* Account Created */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Created
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={userProfile?.createdAt ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                        disabled={true}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Last Updated
                    </label>
                    <div className="relative">
                      <RefreshCw className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={userProfile?.updatedAt ? new Date(userProfile.updatedAt.toDate()).toLocaleDateString() : 'N/A'}
                        disabled={true}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>

                  {/* User ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={userProfile?.uid || 'N/A'}
                        disabled={true}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-xs"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Unique identifier for your account
                    </p>
                  </div>
                </div>

                {/* Account Preferences */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Account Preferences</h4>
                  
                  <div className="space-y-4">
                    {/* Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                        <p className="text-xs text-gray-500">Receive updates about your health progress</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData?.preferences?.notifications || false}
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange('preferences', {
                          ...(formData.preferences || {}),
                          notifications: e.target.checked
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    {/* Data Sharing */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Anonymous Data Sharing</label>
                        <p className="text-xs text-gray-500">Help improve our services with anonymous usage data</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData?.preferences?.dataSharing || false}
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange('preferences', {
                          ...(formData.preferences || {}),
                          dataSharing: e.target.checked
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    {/* Units */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Measurement Units</label>
                        <p className="text-xs text-gray-500">Choose your preferred measurement system</p>
                      </div>
                      <select
                        value={formData?.preferences?.units || 'metric'}
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange('preferences', {
                          ...(formData.preferences || {}),
                          units: e.target.value
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      >
                        <option value="metric">Metric (kg, cm)</option>
                        <option value="imperial">Imperial (lbs, ft)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Security</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Password</p>
                          <p className="text-xs text-blue-700">Last changed: Never</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          toast.info('Password change feature coming soon!');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete Account Section */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-red-900 mb-4">Danger Zone</h4>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-red-900 mb-2">Delete Account</h5>
                        <p className="text-xs text-red-700 mb-4">
                          Once you delete your account, there is no going back. All your data including health records, 
                          progress tracking, meal plans, and personal information will be permanently deleted. 
                          If you return to the site later, you'll need to start fresh with a new account.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => setShowDeleteConfirmation(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Delete My Account
                          </button>
                          <p className="text-xs text-red-600 self-center">
                            This action cannot be undone
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="Enter your age"
                        min="1"
                        max="120"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Physical Tab */}
            {activeTab === 'physical' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Measurements</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm) *
                    </label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="Enter your height in cm"
                        min="100"
                        max="250"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg) *
                    </label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="Enter your weight in kg"
                        min="30"
                        max="300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Level
                    </label>
                    <select
                      value={formData.activityLevel}
                      onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      {activityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label} - {level.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diet Type
                    </label>
                    <select
                      value={formData.dietType}
                      onChange={(e) => handleInputChange('dietType', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="">Select Diet Type</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="non-vegetarian">Non-Vegetarian</option>
                      <option value="keto">Keto</option>
                      <option value="paleo">Paleo</option>
                      <option value="mediterranean">Mediterranean</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Health Tab */}
            {activeTab === 'health' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Health Conditions
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {healthConditions.map((condition) => (
                      <label key={condition} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.healthConditions?.includes(condition)}
                          onChange={() => handleArrayChange('healthConditions', condition)}
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fitness Goals
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {fitnessGoals.map((goal) => (
                      <label key={goal} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.fitnessGoals?.includes(goal)}
                          onChange={() => handleArrayChange('fitnessGoals', goal)}
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Lifestyle Tab */}
            {activeTab === 'lifestyle' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifestyle Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sleep Hours per Night
                    </label>
                    <input
                      type="number"
                      value={formData.sleepHours}
                      onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      min="4"
                      max="12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stress Level
                    </label>
                    <select
                      value={formData.stressLevel}
                      onChange={(e) => handleInputChange('stressLevel', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Smoking Status
                    </label>
                    <select
                      value={formData.smokingStatus}
                      onChange={(e) => handleInputChange('smokingStatus', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="never">Never</option>
                      <option value="former">Former Smoker</option>
                      <option value="current">Current Smoker</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alcohol Consumption
                    </label>
                    <select
                      value={formData.alcoholConsumption}
                      onChange={(e) => handleInputChange('alcoholConsumption', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="never">Never</option>
                      <option value="occasional">Occasional</option>
                      <option value="moderate">Moderate</option>
                      <option value="frequent">Frequent</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics Tab */}
            {activeTab === 'metrics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Metrics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Fat Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={formData.bodyFatPercentage}
                      onChange={(e) => handleInputChange('bodyFatPercentage', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="Enter body fat percentage"
                      min="5"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Muscle Mass (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.muscleMass}
                      onChange={(e) => handleInputChange('muscleMass', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="Enter muscle mass in kg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waist Circumference (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.waistCircumference}
                      onChange={(e) => handleInputChange('waistCircumference', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="Enter waist circumference"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hip Circumference (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.hipCircumference}
                      onChange={(e) => handleInputChange('hipCircumference', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="Enter hip circumference"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Pressure (mmHg)
                    </label>
                    <input
                      type="text"
                      value={formData.bloodPressure}
                      onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="e.g., 120/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resting Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={formData.restingHeartRate}
                      onChange={(e) => handleInputChange('restingHeartRate', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="Enter resting heart rate"
                      min="40"
                      max="120"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h3>
                <p className="text-gray-600 text-sm">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type "DELETE MY ACCOUNT" to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="DELETE MY ACCOUNT"
                  />
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-700">
                    <strong>What will be deleted:</strong>
                  </p>
                  <ul className="text-xs text-red-600 mt-1 space-y-1">
                    <li>• Your profile and personal information</li>
                    <li>• All health records and progress data</li>
                    <li>• Meal plans and dietary preferences</li>
                    <li>• Food analysis history</li>
                    <li>• Community posts and interactions</li>
                  </ul>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirmation(false);
                      setDeleteConfirmationText('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmationText !== 'DELETE MY ACCOUNT'}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Deleting...
                      </div>
                    ) : (
                      'Delete Account'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Re-authentication Modal */}
      <AnimatePresence>
        {showReauthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowReauthModal(false);
              setReauthPassword('');
              setIsDeleting(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Your Password</h3>
                <p className="text-gray-600 text-sm">
                  For security reasons, please enter your password to delete your account.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password:
                  </label>
                  <input
                    type="password"
                    value={reauthPassword}
                    onChange={(e) => setReauthPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && reauthPassword) {
                        handleReauthAndDelete();
                      }
                    }}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Why do we need this?</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Firebase requires recent authentication before deleting accounts to protect against unauthorized access.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowReauthModal(false);
                      setReauthPassword('');
                      setIsDeleting(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReauthAndDelete}
                    disabled={isDeleting || !reauthPassword}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Verifying...
                      </div>
                    ) : (
                      'Confirm & Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSettings;