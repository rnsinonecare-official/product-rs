import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import GoalsSettings from '../components/Settings/GoalsSettings';
import {
  Settings as SettingsIcon,
  Target,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  ChevronRight
} from 'lucide-react';

const Settings = () => {
  const { user, isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState('goals');

  const tabs = [
    { id: 'goals', label: 'Daily Goals', icon: Target, description: 'Set your daily nutrition and wellness targets' },
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal information' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure your notification preferences' },
    { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Control your data and privacy settings' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Customize the app appearance' },
    { id: 'data', label: 'Data Management', icon: Database, description: 'Export or delete your data' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'goals':
        return <GoalsSettings />;
      case 'profile':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Settings</h2>
            <p className="text-gray-600">Profile management features coming soon...</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Notification Settings</h2>
            <p className="text-gray-600">Notification preferences coming soon...</p>
          </div>
        );
      case 'privacy':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Privacy Settings</h2>
            <p className="text-gray-600">Privacy controls coming soon...</p>
          </div>
        );
      case 'appearance':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Appearance Settings</h2>
            <p className="text-gray-600">Theme and appearance options coming soon...</p>
          </div>
        );
      case 'data':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Management</h2>
            <p className="text-gray-600">Data export and management tools coming soon...</p>
          </div>
        );
      default:
        return <GoalsSettings />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <SettingsIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Settings</h1>
            <p className="text-gray-600 mb-6">
              Log in to access your settings and customize your Healthify experience.
            </p>
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Log In to Access Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600">
            Customize your Healthify experience and manage your preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium">{tab.label}</div>
                          <div className="text-xs text-gray-500 hidden sm:block">
                            {tab.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  );
                })}
              </nav>
            </div>

            {/* User Info */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mt-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-800">
                    {user?.displayName || user?.email || 'User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;