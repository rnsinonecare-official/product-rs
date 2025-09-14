import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, Eye, EyeOff, Database, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import storageService from '../../services/storageService';
import toast from 'react-hot-toast';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, userProfile, loading, isAuthenticated, forceRefreshUserProfile, clearUserData } = useUser();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const storageInfo = storageService.getStorageInfo();
  const lastLogin = user ? storageService.getLastLogin(user.uid) : null;

  const debugData = {
    loading,
    isAuthenticated,
    user: user ? {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified
    } : null,
    userProfile: userProfile ? {
      ...userProfile,
      // Truncate long fields for readability
      createdAt: userProfile.createdAt?.substring?.(0, 19) || userProfile.createdAt,
      updatedAt: userProfile.updatedAt?.substring?.(0, 19) || userProfile.updatedAt
    } : null,
    storage: storageInfo,
    lastLogin: lastLogin ? {
      date: lastLogin.date?.substring?.(0, 19) || lastLogin.date,
      timestamp: lastLogin.timestamp
    } : null
  };

  return (
    <>
      {/* Debug Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
        title="Toggle Debug Panel"
      >
        {isOpen ? <EyeOff className="w-5 h-5" /> : <Bug className="w-5 h-5" />}
      </motion.button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-4 right-4 z-40 bg-white rounded-lg shadow-2xl border border-gray-200 max-w-sm w-full max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-purple-500 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                <span className="font-semibold">Debug Panel</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-purple-600 p-1 rounded transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-80">
              <div className="space-y-4">
                {/* Loading State */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Loading State</h4>
                  <div className={`px-2 py-1 rounded text-sm ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {loading ? 'Loading...' : 'Loaded'}
                  </div>
                </div>

                {/* Authentication State */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Authentication</h4>
                  <div className={`px-2 py-1 rounded text-sm ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </div>
                </div>

                {/* User Data */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">User Data</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugData.user, null, 2)}
                  </pre>
                </div>

                {/* Profile Data */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Profile Data</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugData.userProfile, null, 2)}
                  </pre>
                </div>

                {/* Storage Info */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Local Storage
                  </h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugData.storage, null, 2)}
                  </pre>
                </div>

                {/* Last Login */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Last Login</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugData.lastLogin, null, 2)}
                  </pre>
                </div>

                {/* Current Page Logic */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Navigation Logic</h4>
                  <div className="text-sm space-y-1">
                    {loading && <div className="text-yellow-600">• Loading user data...</div>}
                    {!loading && !isAuthenticated && <div className="text-red-600">• Should show Auth page</div>}
                    {!loading && isAuthenticated && !userProfile && <div className="text-orange-600">• User authenticated but no profile</div>}
                    {!loading && isAuthenticated && userProfile && !userProfile.isProfileComplete && <div className="text-blue-600">• Should show Onboarding</div>}
                    {!loading && isAuthenticated && userProfile && userProfile.isProfileComplete && <div className="text-green-600">• Should show Dashboard</div>}
                    {storageInfo?.hasProfile && <div className="text-purple-600">• Profile cached locally ✓</div>}
                  </div>
                </div>

                {/* Debug Actions */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Debug Actions
                  </h4>
                  <div className="space-y-2">
                    {/* Force Refresh Profile */}
                    {isAuthenticated && (
                      <button
                        onClick={async () => {
                          setIsRefreshing(true);
                          try {
                            await forceRefreshUserProfile();
                            toast.success('Profile refreshed from server!');
                          } catch (error) {
                            toast.error('Failed to refresh profile');
                          } finally {
                            setIsRefreshing(false);
                          }
                        }}
                        disabled={isRefreshing}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm rounded transition-colors duration-200"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Force Refresh Profile'}
                      </button>
                    )}

                    {/* Clear All Data */}
                    <button
                      onClick={() => {
                        if (window.confirm('Clear all user data and cache? This will log you out.')) {
                          clearUserData();
                          storageService.clearAllUserData();
                          toast.success('All data cleared!');
                          window.location.reload();
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All Data
                    </button>

                    {/* Troubleshooting Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
                      <div className="font-semibold text-yellow-800 mb-1">Troubleshooting:</div>
                      <div className="text-yellow-700 space-y-1">
                        <div>• If user data was deleted from Firebase Console, use "Force Refresh Profile"</div>
                        <div>• If app is stuck, use "Clear All Data" to reset completely</div>
                        <div>• Check console logs for detailed error messages</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DebugPanel;