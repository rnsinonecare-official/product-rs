import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '../../context/UserContext';
import { useHealthData } from '../../context/HealthDataContext';
import AnimatedSection from '../shared/AnimatedSection';
import PageBackground from '../shared/PageBackground';
import AnnouncementBanner from '../Home/AnnouncementBanner';
import HealthTipsSection from '../Home/HealthTipsSection';
import SuccessStoriesSection from '../Home/SuccessStoriesSection';
import MovingCards from '../shared/MovingCards';
import MovingUpdatesCards from '../shared/MovingUpdatesCards';
import MetabolicAgeTipsPopup from './MetabolicAgeTipsPopup';
import DailyIntake from './DailyIntake';
import BrandPartners from '../BrandPartners/BrandPartners';

import { calculateMetabolicAge, getBMIInfo } from '../../utils/metabolicCalculations';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  fadeInUp, 
  fadeInLeft, 
  fadeInRight, 
  scaleIn, 
  staggerContainer,
  cardHover,
  tapScale,
  floatingAnimation,
  pulseAnimation,
  bounceIn
} from '../../utils/animations';
import {
  Heart,
  Droplets,
  Moon,
  Camera,
  TrendingUp,
  Target,
  Award,
  Flame,
  Activity,
  Newspaper,
  UserCheck,
  Clock,
  Info,
  Zap,
  Plus,
  Minus,
  Edit3,
  CheckCircle
} from 'lucide-react';


const Dashboard = () => {
  const { userProfile } = useUser();
  const { dailyData, userGoals, getWeeklyData, updateDailyMetric } = useHealthData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weeklyData, setWeeklyData] = useState([]);
  const [showMetabolicAgeTips, setShowMetabolicAgeTips] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Simple function to handle popup opening
  const handleMetabolicAgePopup = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowMetabolicAgeTips(true);
  };

  // Function to handle popup closing
  const handleCloseMetabolicAgePopup = () => {
    setShowMetabolicAgeTips(false);
  };
  
  // Handlers for goal intake inputs with plus/minus buttons
  const handleIncrementGoal = async (e, goal, amount) => {
    e.stopPropagation();
    
    try {
      // Calculate the increment amount based on goal type
      const incrementValue = goal.label === 'Water' ? 
        parseFloat(amount.toFixed(2)) : // For water, use decimal precision
        parseInt(amount);               // For other metrics, use integers
      
      // Calculate new value
      const newValue = Math.max(0, goal.current + incrementValue);
      
      // Update the metric in context
      await updateDailyMetric(goal.label.toLowerCase(), newValue);
      
      // Show success message
      if (incrementValue > 0) {
        toast.success(`Added ${incrementValue} ${goal.unit} to ${goal.label}`);
      } else {
        toast.success(`Reduced ${goal.label} by ${Math.abs(incrementValue)} ${goal.unit}`);
      }
    } catch (error) {
      console.error(`Error updating ${goal.label}:`, error);
      toast.error(`Failed to update ${goal.label}`);
    }
  };

  // Quick update function for simple plus/minus buttons
  const handleQuickUpdate = async (metric, increment) => {
    // Map metric names to actual data properties
    const dataKey = metric === 'calories' ? 'totalCalories' : metric;
    const currentValue = dailyData[dataKey] || 0;
    let newValue = currentValue + increment;

    // Ensure non-negative values
    if (newValue < 0) newValue = 0;

    // Set reasonable maximums
    const maxValues = {
      water: 5.0, // 5 liters max
      sleep: 12,
      steps: 50000,
      calories: 5000
    };

    if (newValue > maxValues[metric]) newValue = maxValues[metric];

    await updateDailyMetric(metric, newValue);
  };

  // Edit metric functions
  const handleEditMetric = (metric) => {
    setEditingMetric(metric);
    setEditValue(dailyData[metric].toString());
  };

  const handleSaveEdit = async () => {
    if (editingMetric && editValue !== '') {
      const value = parseFloat(editValue);
      if (!isNaN(value) && value >= 0) {
        await updateDailyMetric(editingMetric, value);
        toast.success(`Updated ${editingMetric}`);
      }
    }
    setEditingMetric(null);
    setEditValue('');
  };

  // BMI Calculation Helper Function (using centralized utility)
  const calculateBMI = (height, weight) => {
    if (!height || !weight || height <= 0 || weight <= 0) {
      return null;
    }
    
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters));
    const bmiInfo = getBMIInfo(bmi);
    
    return {
      bmi: Math.round(bmi * 10) / 10,
      category: bmiInfo.category,
      status: bmiInfo.description,
      colorClass: bmiInfo.color
    };
  };

  // Note: Using centralized metabolic age calculation from utils

  // Helper functions - defined before use
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBMIBgColor = (bmi) => {
    if (bmi < 18.5) return 'from-blue-200 to-blue-300';
    if (bmi < 25) return 'from-green-200 to-green-300';
    if (bmi < 30) return 'from-yellow-200 to-yellow-300';
    return 'from-red-200 to-red-300';
  };

  const getMetabolicAgeColor = (comparison) => {
    if (comparison === 'younger') return 'text-green-600';
    if (comparison === 'older') return 'text-red-600';
    return 'text-blue-600';
  };

  const getMetabolicAgeBgColor = (comparison) => {
    if (comparison === 'younger') return 'from-green-200 to-green-300';
    if (comparison === 'older') return 'from-red-200 to-red-300';
    return 'from-blue-200 to-blue-300';
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBgColor = (score) => {
    if (score >= 80) return 'from-green-200 to-green-300';
    if (score >= 60) return 'from-yellow-200 to-yellow-300';
    return 'from-red-200 to-red-300';
  };

  const getBMREfficiencyColor = (efficiency) => {
    if (efficiency >= 105) return 'text-orange-700';
    if (efficiency >= 95) return 'text-green-700';
    return 'text-blue-700';
  };

  const getBMREfficiencyBgColor = (efficiency) => {
    if (efficiency >= 105) return 'from-orange-200 to-orange-300';
    if (efficiency >= 95) return 'from-green-200 to-green-300';
    return 'from-blue-200 to-blue-300';
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Load weekly data asynchronously
    const loadWeeklyData = async () => {
      try {
        const data = await getWeeklyData();
        setWeeklyData(data);
      } catch (error) {
        console.error('Error loading weekly data:', error);
      }
    };
    
    loadWeeklyData();
    return () => clearInterval(timer);
  }, [getWeeklyData]);

  // Use stored BMI and Metabolic Age from userProfile, or calculate if not available
  const computedBMI = userProfile?.bmi && userProfile?.bmiCategory 
    ? {
        bmi: parseFloat(userProfile.bmi),
        category: userProfile.bmiCategory,
        status: userProfile.bmiStatus || 'BMI calculated',
        colorClass: getBMIColor(parseFloat(userProfile.bmi))
      }
    : (userProfile?.height && userProfile?.weight 
        ? calculateBMI(parseFloat(userProfile.height), parseFloat(userProfile.weight))
        : null);

  const computedMetabolicAge = userProfile?.metabolicAge 
    ? {
        metabolicAge: parseInt(userProfile.metabolicAge),
        bmr: parseInt(userProfile.bmr),
        tdee: parseInt(userProfile.tdee) || null,
        comparison: userProfile.metabolicComparison || 'same',
        healthScore: parseInt(userProfile.healthScore),
        bmrEfficiency: parseFloat(userProfile.bmrEfficiency)
      }
    : (userProfile?.age && userProfile?.gender && userProfile?.height && userProfile?.weight
        ? calculateMetabolicAge(
            parseInt(userProfile.age), 
            userProfile.gender, 
            parseFloat(userProfile.height), 
            parseFloat(userProfile.weight),
            userProfile.activityLevel || 'moderate'
          )
        : null);





  const quickActions = [
    {
      title: 'Analyze Food & Recipes',
      description: 'Scan food & get healthy recipes',
      icon: Camera,
      path: '/food-analysis',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Book Doctor',
      description: 'Consult with expert doctors',
      icon: UserCheck,
      path: '/doctors',
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
    },
    {
      title: 'Health News',
      description: 'Latest health tips & updates',
      icon: Newspaper,
      path: '/news',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
    },
    {
      title: 'Track Progress',
      description: 'Monitor your health journey',
      icon: TrendingUp,
      path: '/progress',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
    },
    {
      title: 'Join Community',
      description: 'Connect with like-minded people',
      icon: Heart,
      path: '/community',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
    },
  ];

  const dailyGoals = [
    {
      key: 'calories',
      label: 'Calories',
      current: dailyData.totalCalories || 0,
      target: userGoals.calorieGoal || 2000,
      unit: 'kcal',
      icon: Flame,
      color: '#ef4444',
      bgColor: 'bg-red-100',
    },
    {
      key: 'water',
      label: 'Water',
      current: dailyData.water || 0,
      target: userGoals.waterGoal || 8,
      unit: 'glasses',
      icon: Droplets,
      color: '#3b82f6',
      bgColor: 'bg-blue-100',
    },
    {
      key: 'steps',
      label: 'Steps',
      current: dailyData.steps || 0,
      target: userGoals.stepsGoal || 10000,
      unit: 'steps',
      icon: Activity,
      color: '#10b981',
      bgColor: 'bg-green-100',
    },
    {
      key: 'sleep',
      label: 'Sleep',
      current: dailyData.sleep || 0,
      target: userGoals.sleepGoal || 8,
      unit: 'hours',
      icon: Moon,
      color: '#8b5cf6',
      bgColor: 'bg-purple-100',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen relative"
    >
      {/* Background Component */}
      <PageBackground variant="dashboard" />
      
      {/* Admin Announcements Banner */}
      <AnnouncementBanner />
      
      <div className="relative z-10 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <AnimatedSection animation={fadeInUp} className="mb-6 sm:mb-8">
        <div className="glass-card p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex-1">
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {getGreeting()}, {userProfile?.name || 'User'}! 👋
              </motion.h1>
              
              <motion.p
                className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </motion.p>



              {userProfile && (
                <div className="space-y-3">
                  {/* BMI Display */}
                  {computedBMI && (
                    <motion.div
                      className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r ${getBMIBgColor(computedBMI.bmi)}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${getBMIColor(computedBMI.bmi)}`} />
                      <span className={`text-sm sm:text-base font-semibold ${getBMIColor(computedBMI.bmi)}`}>
                        BMI: {computedBMI.bmi} - {computedBMI.category}
                      </span>
                    </motion.div>
                  )}

                  {/* BMI Status */}
                  {computedBMI?.status && (
                    <motion.div
                      className="flex items-start space-x-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {computedBMI.status}
                      </p>
                    </motion.div>
                  )}

                  {/* Metabolic Age Display - Always show if profile is complete */}
                  {computedMetabolicAge && (
                    <motion.button
                      onClick={handleMetabolicAgePopup}
                      className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r ${
                        computedMetabolicAge 
                          ? getMetabolicAgeBgColor(computedMetabolicAge.comparison)
                          : 'from-gray-200 to-gray-300'
                      } hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Clock className={`w-5 h-5 mr-2 ${
                        computedMetabolicAge 
                          ? getMetabolicAgeColor(computedMetabolicAge.comparison)
                          : 'text-gray-600'
                      } group-hover:animate-pulse`} />
                      <span className={`text-sm sm:text-base font-semibold ${
                        computedMetabolicAge 
                          ? getMetabolicAgeColor(computedMetabolicAge.comparison)
                          : 'text-gray-600'
                      }`}>
                        Metabolic Age: {computedMetabolicAge.metabolicAge || 'Calculating...'} {computedMetabolicAge.metabolicAge ? 'years' : ''}
                      </span>
                      <Info className={`w-4 h-4 ml-2 ${
                        computedMetabolicAge 
                          ? getMetabolicAgeColor(computedMetabolicAge.comparison)
                          : 'text-gray-600'
                      } opacity-70 group-hover:opacity-100`} />
                    </motion.button>
                  )}

                  {/* Metabolic Age Explanation */}
                  {computedMetabolicAge && userProfile.age && (
                    <motion.div
                      className="flex items-start space-x-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Zap className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {computedMetabolicAge.comparison === 'younger' && 
                          `Great! Your metabolism is ${userProfile.age - computedMetabolicAge.metabolicAge} years younger than your actual age.`}
                        {computedMetabolicAge.comparison === 'older' && 
                          `Your metabolism is ${computedMetabolicAge.metabolicAge - userProfile.age} years older than your actual age. Consider increasing activity levels.`}
                        {computedMetabolicAge.comparison === 'same' && 
                          'Your metabolic age matches your actual age - well balanced!'}
                      </p>
                    </motion.div>
                  )}

                  {/* Show message if metabolic age is not calculated yet */}
                  {(!computedMetabolicAge && userProfile.age && userProfile.height && userProfile.weight) && (
                    <motion.div
                      className="flex items-start space-x-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-600 leading-relaxed">
                        Complete your profile with activity level to calculate your metabolic age!
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center"
                animate={floatingAnimation}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 360,
                  transition: { duration: 0.8 }
                }}
              >
                <motion.div animate={pulseAnimation}>
                  <Heart className="w-12 h-12 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        </AnimatedSection>

        {/* Quick Actions */}
        <AnimatedSection animation={fadeInLeft} className="mb-6 sm:mb-8">
        <motion.h2 
          className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Quick Actions
        </motion.h2>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {quickActions.map((action, index) => (
            <Link key={action.title} to={action.path}>
              <motion.div
                className={`glass-card p-3 sm:p-4 lg:p-6 cursor-pointer bg-gradient-to-br ${action.bgColor} card-action flex flex-col relative overflow-hidden`}
                variants={scaleIn}
                whileHover={cardHover}
                whileTap={tapScale}
                transition={{ delay: 0.1 * index }}
              >
                <motion.div 
                  className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0`}
                  animate={floatingAnimation}
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 360,
                    transition: { duration: 0.6 }
                  }}
                >
                  <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2 leading-tight line-clamp-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* Latest Updates Cards */}
      <AnimatedSection animation={fadeInUp} className="mb-8 sm:mb-12">
        <MovingCards />
      </AnimatedSection>

      {/* Updates Section */}
      <AnimatedSection animation={fadeInUp} className="mb-6 sm:mb-8">
        <MovingUpdatesCards />
      </AnimatedSection>

      {/* Daily Goals */}
      <AnimatedSection animation={fadeInRight} className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Today's Goals</h2>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Daily Targets
          </div>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {dailyGoals.map((goal, index) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            
            return (
              <motion.div
                key={goal.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${goal.bgColor} rounded-full flex items-center justify-center`}>
                    <goal.icon className="w-6 h-6" style={{ color: goal.color }} />
                  </div>
                  <button
                    onClick={() => handleEditMetric(goal.key)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                {/* Progress Circle */}
                <div className="w-20 h-20 mx-auto mb-4">
                  <CircularProgressbar
                    value={percentage}
                    text={`${percentage.toFixed(0)}%`}
                    styles={buildStyles({
                      pathColor: goal.color,
                      textColor: goal.color,
                      trailColor: '#f3f4f6',
                    })}
                  />
                </div>
                
                <h3 className="font-semibold text-gray-800 text-center mb-2">{goal.label}</h3>
                
                {editingMetric === goal.key ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      min="0"
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-gray-600 mb-4">
                    {goal.key === 'water' ? goal.current.toFixed(2) : goal.current} / {goal.target} {goal.unit}
                  </p>
                )}
                
                {/* Quick Actions */}
                <div className="flex items-center justify-center space-x-2">
                  <motion.button
                    onClick={() => handleQuickUpdate(goal.key, goal.key === 'water' ? -0.25 : goal.key === 'sleep' ? -0.5 : goal.key === 'steps' ? -1000 : -100)}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleQuickUpdate(goal.key, goal.key === 'water' ? 0.25 : goal.key === 'sleep' ? 0.5 : goal.key === 'steps' ? 1000 : 100)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
                    style={{ backgroundColor: goal.color }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatedSection>

      {/* Brand Partners Section */}
      <AnimatedSection animation={fadeInUp} className="mb-6 sm:mb-8">
        <BrandPartners />
      </AnimatedSection>

      {/* Daily Intake Section */}
      <AnimatedSection animation={fadeInUp} className="mb-6 sm:mb-8">
        <DailyIntake />
      </AnimatedSection>



      {/* Health Metrics Section */}
      {computedMetabolicAge && (
        <AnimatedSection animation={fadeInUp} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Health Metrics</h2>
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Metabolic Data
            </div>
          </div>
          
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* BMR Card */}
            <motion.div
              className="glass-card p-3 sm:p-4 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden border border-blue-200"
              variants={bounceIn}
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)",
              }}
              whileTap={tapScale}
            >
              <div className="flex items-center justify-between mb-2">
                <motion.div 
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm"
                  animate={floatingAnimation}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </motion.div>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">BMR</h3>
              <p className="text-sm sm:text-base font-bold text-blue-700 mb-1">{computedMetabolicAge.bmr}</p>
              <p className="text-xs text-gray-600">cal/day rest</p>
            </motion.div>

            {/* TDEE Card */}
            <motion.div
              className="glass-card p-3 sm:p-4 bg-gradient-to-br from-green-100 to-green-200 relative overflow-hidden border border-green-200"
              variants={bounceIn}
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: "0 8px 25px rgba(34, 197, 94, 0.15)",
              }}
              whileTap={tapScale}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <motion.div 
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm"
                  animate={floatingAnimation}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </motion.div>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">TDEE</h3>
              <p className="text-sm sm:text-base font-bold text-green-700 mb-1">{computedMetabolicAge.tdee}</p>
              <p className="text-xs text-gray-600">total daily cal</p>
            </motion.div>

            {/* BMI Card */}
            {computedBMI && (
              <motion.div
                className={`glass-card p-3 sm:p-4 bg-gradient-to-br ${getBMIBgColor(computedBMI.bmi)} relative overflow-hidden border ${getBMIColor(computedBMI.bmi).replace('text', 'border')}-200`}
                variants={bounceIn}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                }}
                whileTap={tapScale}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <motion.div 
                    className={`w-7 h-7 sm:w-8 sm:h-8 ${getBMIColor(computedBMI.bmi).replace('text', 'bg')}-500 rounded-lg flex items-center justify-center shadow-sm`}
                    animate={floatingAnimation}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </motion.div>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">BMI</h3>
                <p className={`text-sm sm:text-base font-bold mb-1 ${getBMIColor(computedBMI.bmi)}`}>{computedBMI.bmi}</p>
                <p className="text-xs text-gray-600">{computedBMI.category}</p>
              </motion.div>
            )}

            {/* Metabolic Age Card - Always show if basic profile data exists */}
            {computedMetabolicAge && (
              <motion.button
                onClick={handleMetabolicAgePopup}
                className={`glass-card p-3 sm:p-4 bg-gradient-to-br ${
                  computedMetabolicAge 
                    ? getMetabolicAgeBgColor(computedMetabolicAge.comparison)
                    : 'from-gray-200 to-gray-300'
                } relative overflow-hidden border ${
                  computedMetabolicAge 
                    ? getMetabolicAgeColor(computedMetabolicAge.comparison).replace('text', 'border')
                    : 'border-gray'
                }-200 cursor-pointer group w-full text-left`}
                variants={bounceIn}
                whileHover={{
                  scale: 1.05,
                  y: -4,
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
                }}
                whileTap={tapScale}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <motion.div 
                    className={`w-7 h-7 sm:w-8 sm:h-8 ${
                      computedMetabolicAge 
                        ? getMetabolicAgeColor(computedMetabolicAge.comparison).replace('text', 'bg')
                        : 'bg-gray'
                    }-500 rounded-lg flex items-center justify-center shadow-sm group-hover:animate-pulse`}
                    animate={floatingAnimation}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </motion.div>
                  <Info className={`w-4 h-4 ${
                    computedMetabolicAge 
                      ? getMetabolicAgeColor(computedMetabolicAge.comparison)
                      : 'text-gray-600'
                  } opacity-60 group-hover:opacity-100 transition-opacity`} />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Metabolic Age</h3>
                <p className={`text-sm sm:text-base font-bold mb-1 ${
                  computedMetabolicAge 
                    ? getMetabolicAgeColor(computedMetabolicAge.comparison)
                    : 'text-gray-600'
                }`}>
                  {computedMetabolicAge ? `${computedMetabolicAge.metabolicAge}y` : 'Calculating...'}
                </p>
                <p className="text-xs text-gray-600">
                  {computedMetabolicAge ? (
                    <>
                      {computedMetabolicAge.comparison === 'younger' && '🎉 Younger'}
                      {computedMetabolicAge.comparison === 'older' && '⚠️ Older'}
                      {computedMetabolicAge.comparison === 'same' && '✅ Same'}
                    </>
                  ) : (
                    'Complete profile'
                  )}
                </p>
                <p className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {computedMetabolicAge ? 'Click for tips & insights' : 'Complete profile to calculate'}
                </p>
              </motion.button>
            )}

            {/* Health Score Card */}
            {computedMetabolicAge?.healthScore && (
              <motion.div
                className={`glass-card p-3 sm:p-4 bg-gradient-to-br ${getHealthScoreBgColor(computedMetabolicAge.healthScore)} relative overflow-hidden border ${getHealthScoreColor(computedMetabolicAge.healthScore).replace('text', 'border')}-200`}
                variants={bounceIn}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                }}
                whileTap={tapScale}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <motion.div 
                    className={`w-7 h-7 sm:w-8 sm:h-8 ${getHealthScoreColor(computedMetabolicAge.healthScore).replace('text', 'bg')}-500 rounded-lg flex items-center justify-center shadow-sm`}
                    animate={floatingAnimation}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </motion.div>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Health Score</h3>
                <p className={`text-sm sm:text-base font-bold mb-1 ${getHealthScoreColor(computedMetabolicAge.healthScore)}`}>
                  {computedMetabolicAge.healthScore}/100
                </p>
                <p className="text-xs text-gray-600">
                  {computedMetabolicAge.healthScore >= 80 && '🏆 Excellent'}
                  {computedMetabolicAge.healthScore >= 60 && computedMetabolicAge.healthScore < 80 && '👍 Good'}
                  {computedMetabolicAge.healthScore < 60 && '💪 Improve'}
                </p>
              </motion.div>
            )}

            {/* BMR Efficiency Card */}
            {computedMetabolicAge?.bmrEfficiency && (
              <motion.div
                className={`glass-card p-3 sm:p-4 bg-gradient-to-br ${getBMREfficiencyBgColor(computedMetabolicAge.bmrEfficiency)} relative overflow-hidden border ${getBMREfficiencyColor(computedMetabolicAge.bmrEfficiency).replace('text', 'border')}-200`}
                variants={bounceIn}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                }}
                whileTap={tapScale}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <motion.div 
                    className={`w-7 h-7 sm:w-8 sm:h-8 ${getBMREfficiencyColor(computedMetabolicAge.bmrEfficiency).replace('text', 'bg')}-500 rounded-lg flex items-center justify-center shadow-sm`}
                    animate={floatingAnimation}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </motion.div>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">BMR Efficiency</h3>
                <p className={`text-sm sm:text-base font-bold mb-1 ${getBMREfficiencyColor(computedMetabolicAge.bmrEfficiency)}`}>
                  {computedMetabolicAge.bmrEfficiency}%
                </p>
                <p className="text-xs text-gray-600">
                  {computedMetabolicAge.bmrEfficiency >= 105 && '🔥 High'}
                  {computedMetabolicAge.bmrEfficiency >= 95 && computedMetabolicAge.bmrEfficiency < 105 && '✅ Normal'}
                  {computedMetabolicAge.bmrEfficiency < 95 && '🐌 Below avg'}
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatedSection>
      )}

      {/* Recent Activity & Weekly Overview */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Recent Food Entries */}
        <AnimatedSection animation={fadeInLeft}>
          <div className="glass-card p-4 sm:p-6 card-extra-large flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Recent Meals</h3>
              <Link 
                to="/food-analysis"
                className="text-green-600 hover:text-green-500 text-sm font-medium"
              >
                Add Food →
              </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {dailyData.foodEntries.length > 0 ? (
                <div className="space-y-3">
                  {dailyData.foodEntries.slice(-3).map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{entry.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {entry.createdAt && entry.createdAt.toDate ? 
                          entry.createdAt.toDate().toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 
                          new Date().toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        }
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-green-600 text-sm sm:text-base">{entry.calories} cal</p>
                      <p className="text-xs text-gray-500">
                        P:{entry.protein}g C:{entry.carbs}g F:{entry.fat}g
                      </p>
                    </div>
                  </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-500 mb-2 text-sm sm:text-base">No meals logged today</p>
                  <Link 
                    to="/food-analysis"
                    className="text-green-600 hover:text-green-500 font-medium"
                  >
                    Add your first meal
                  </Link>
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Weekly Summary */}
        <AnimatedSection animation={fadeInRight}>
          <div className="glass-card p-4 sm:p-6 card-extra-large flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">This Week</h3>
              <Link 
                to="/progress"
                className="text-green-600 hover:text-green-500 text-sm font-medium"
              >
                View Details →
              </Link>
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-center text-xs font-medium text-gray-600 p-1 sm:p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {weeklyData.map((day, index) => {
                const isToday = day.date === new Date().toISOString().split('T')[0];
                const hasData = day.calories > 0;
                
                return (
                  <motion.div
                    key={day.date}
                    className={`h-8 sm:h-10 md:h-12 rounded-lg flex items-center justify-center text-xs font-medium ${
                      isToday 
                        ? 'bg-green-600 text-white' 
                        : hasData 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    {day.calories || '—'}
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Weekly Average</span>
                <span className="font-semibold text-green-600 text-sm sm:text-base">
                  {Math.round(weeklyData.reduce((acc, day) => acc + day.calories, 0) / 7)} cal/day
                </span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </motion.div>





      {/* Motivational Quote */}
      <AnimatedSection animation={scaleIn} className="mt-6 sm:mt-8">
        <motion.div 
          className="glass-card p-4 sm:p-6 text-center bg-gradient-to-r from-green-50 to-green-100"
          whileHover={{
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(144, 238, 144, 0.2)",
          }}
        >
          <motion.div
            animate={pulseAnimation}
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.8 }}
          >
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2 sm:mb-3" />
          </motion.div>
          <motion.p 
            className="text-base sm:text-lg font-medium text-gray-800 mb-1 sm:mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            "The groundwork for all happiness is good health."
          </motion.p>
          <motion.p 
            className="text-xs sm:text-sm text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            — Leigh Hunt
          </motion.p>
        </motion.div>
        </AnimatedSection>
      </div>



      {/* Admin-managed content sections */}
      <HealthTipsSection />
      <SuccessStoriesSection />

      {/* Metabolic Age Tips Popup */}
      <AnimatePresence>
        {showMetabolicAgeTips && (
          <MetabolicAgeTipsPopup 
            key="metabolic-age-popup"
            onClose={handleCloseMetabolicAgePopup}
            userProfile={{
              ...userProfile,
              metabolicAge: computedMetabolicAge?.metabolicAge,
              metabolicComparison: computedMetabolicAge?.comparison
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;