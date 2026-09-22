import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Heart,
  Leaf,
  Zap,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, resetPassword } from '../../services/authService';
import toast from 'react-hot-toast';
import rainscareLogo from '../../images/RAINSCARE WOB.png';

const Auth = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        console.log('Attempting login with:', formData.email);
        result = await loginUser(formData.email, formData.password);
        console.log('Login successful:', result);
        toast.success('Welcome back!');
      } else {
        // For registration, create minimal profile that needs completion
        const basicUserData = {
          name: formData.name,
          age: null, // Will be completed in onboarding
          gender: null,
          height: null,
          weight: null,
          healthConditions: [],
          dietType: null,
          isProfileComplete: false // Mark as incomplete to trigger onboarding
        };
        
        console.log('Attempting registration with:', formData.email);
        result = await registerUser(formData.email, formData.password, basicUserData);
        console.log('Registration successful:', result);
        toast.success('Account created successfully!');
      }

      console.log('Auth result:', result); // Debug log
      onAuthSuccess(result);
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      await resetPassword(email);
      toast.success('Password reset email sent!');
      setShowForgotPassword(false);
    } catch (error) {
      toast.error(error.message);
    }
  };



  const features = [
    {
      icon: Heart,
      title: 'Personalized Health Tracking',
      description: 'Track your nutrition based on your specific health conditions'
    },
    {
      icon: Leaf,
      title: 'Smart Food Analysis',
      description: 'AI-powered food recognition and nutrition analysis'
    },
    {
      icon: Zap,
      title: 'Custom Recipe Generation',
      description: 'Get recipes tailored to your available ingredients'
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected'
    }
  ];





  if (showForgotPassword) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sage/20 to-light-green/20"
      >
        <div className="glass-card p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
            <p className="text-gray-600">Enter your email to receive reset instructions</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleForgotPassword(formData.email);
          }}>
            <div className="mb-6">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sage to-light-green text-white py-3 rounded-2xl font-medium mb-4 transition-transform hover:scale-105"
            >
              Send Reset Email
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-gray-600 hover:text-sage transition-colors"
            >
              Back to Login
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sage to-light-green p-6 lg:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-2xl flex items-center justify-center mr-4 p-3">
                <img 
                  src={rainscareLogo} 
                  alt="Rainscare Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold">Rainscare</h1>
            </div>
            
            <h2 className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-6">
              Your Personalized Health Journey Starts Here
            </h2>
            
            <p className="text-lg lg:text-xl mb-8 lg:mb-12 text-white/90">
              Track nutrition, analyze food, and get customized recommendations based on your health profile.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full floating-animation"></div>
        <div className="absolute bottom-20 right-32 w-16 h-16 bg-white/5 rounded-full floating-animation" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-8 w-12 h-12 bg-white/15 rounded-full floating-animation" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 lg:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 p-3 shadow-lg">
                <img 
                  src={rainscareLogo} 
                  alt="Rainscare Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {isLogin ? 'Welcome Back!' : 'Join Rainscare'}
              </h2>
              <p className="text-gray-600">
                {isLogin 
                  ? 'Continue your health journey' 
                  : 'Start your personalized health tracking'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm Password"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sage hover:text-light-green transition-colors text-sm"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sage to-light-green text-white py-3 rounded-2xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6">
              {/* Admin Login Button */}
              <motion.button
                onClick={() => {
                  const adminUrl = process.env.REACT_APP_ADMIN_URL || 'https://rainscareadmin.vercel.app';
                  window.location.href = adminUrl; // Open separate Admin app (Login page will render there)
                }}
                className="w-full mt-3 border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Admin Access</span>
                <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-bold">
                  ADMIN
                </div>
              </motion.button>

            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                {' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sage hover:text-light-green font-medium transition-colors"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>


          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;