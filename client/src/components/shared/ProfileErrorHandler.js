import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, LogOut, User } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { logoutUser } from '../../services/authService';
import toast from 'react-hot-toast';

const ProfileErrorHandler = ({ error, onRetry }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { forceRefreshUserProfile, clearUserData } = useUser();

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forceRefreshUserProfile();
      toast.success('Profile refreshed successfully!');
      if (onRetry) onRetry();
    } catch (error) {
      console.error('Force refresh failed:', error);
      toast.error('Failed to refresh profile. Please try logging out and back in.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      clearUserData();
      toast.success('Logged out successfully. Please sign in again.');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Refreshing page...');
      window.location.reload();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          Profile Data Issue
        </motion.h1>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8 space-y-3"
        >
          <p>
            We're having trouble loading your profile data. This might happen if:
          </p>
          <ul className="text-left text-sm space-y-1 bg-gray-50 rounded-lg p-4">
            <li>• Your data was recently updated or reset</li>
            <li>• There's a temporary connection issue</li>
            <li>• Your session has expired</li>
          </ul>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          {/* Try Refresh */}
          <button
            onClick={handleForceRefresh}
            disabled={isRefreshing}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Try Refreshing Profile'}
          </button>

          {/* Start Fresh */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <LogOut className={`w-5 h-5 ${isLoggingOut ? 'animate-spin' : ''}`} />
            {isLoggingOut ? 'Logging out...' : 'Start Fresh (Logout)'}
          </button>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-xs text-gray-500"
        >
          If the problem persists, try clearing your browser cache or contact support.
        </motion.div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-left"
          >
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Error Details (Dev Only)
            </summary>
            <pre className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded overflow-x-auto">
              {error.toString()}
            </pre>
          </motion.details>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileErrorHandler;