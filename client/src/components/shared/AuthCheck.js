import React from 'react';
import { useUser } from '../../context/UserContext';
import { auth } from '../../firebase/config';
import { AlertTriangle, LogIn } from 'lucide-react';

const AuthCheck = ({ children, fallback = null, showLoginPrompt = true }) => {
  const { user, isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated || !auth.currentUser) {
    if (fallback) {
      return fallback;
    }

    if (showLoginPrompt) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-700 mb-4">
            Please log in to use this feature and track your daily intake.
          </p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Log In
          </button>
        </div>
      );
    }

    return null;
  }

  return children;
};

export default AuthCheck;