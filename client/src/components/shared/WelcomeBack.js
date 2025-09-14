import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Clock, User } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import storageService from '../../services/storageService';

const WelcomeBack = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [lastLoginInfo, setLastLoginInfo] = useState(null);
  const { user, userProfile, isAuthenticated } = useUser();

  useEffect(() => {
    if (isAuthenticated && user && userProfile) {
      const lastLogin = storageService.getLastLogin(user.uid);
      
      if (lastLogin && storageService.hasRecentSession(user.uid)) {
        // Check if this is a returning user (not first login today)
        const now = new Date();
        const lastLoginDate = new Date(lastLogin.date);
        const timeDiff = now - lastLoginDate;
        
        // Show welcome back if last login was more than 1 hour ago
        if (timeDiff > 60 * 60 * 1000) {
          setLastLoginInfo(lastLogin);
          setShowWelcome(true);
          
          // Auto hide after 5 seconds
          setTimeout(() => {
            setShowWelcome(false);
          }, 5000);
        }
      }
    }
  }, [isAuthenticated, user, userProfile]);

  const formatLastLogin = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!showWelcome || !lastLoginInfo) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          duration: 0.6 
        }}
        className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-xs sm:max-w-sm w-full mx-2 sm:mx-4"
      >
        <motion.div
          className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-[2px] rounded-2xl shadow-2xl"
          animate={{
            background: [
              "linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6)",
              "linear-gradient(45deg, #3b82f6, #8b5cf6, #10b981)",
              "linear-gradient(45deg, #8b5cf6, #10b981, #3b82f6)",
              "linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="bg-white rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
              
              <div className="flex-1">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-bold text-gray-800 text-base sm:text-lg"
                >
                  Welcome back!
                </motion.h3>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600"
                >
                  <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{userProfile?.name || 'User'}</span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 mt-1"
                >
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">Last visit: {formatLastLogin(lastLoginInfo.date)}</span>
                </motion.div>
              </div>
              
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                onClick={() => setShowWelcome(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              >
                ×
              </motion.button>
            </div>
            
            {/* Progress bar for auto-hide */}
            <motion.div
              className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeBack;