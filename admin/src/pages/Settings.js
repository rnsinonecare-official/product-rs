import React, { useState } from 'react';
import { Save, Key, Bell, Shield, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Rainscare',
    adminEmail: 'admin@rainscare.com',
    enableNotifications: true,
    enableRegistration: true,
    maintenanceMode: false,
    apiRateLimit: 100,
    sessionTimeout: 30
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage platform configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">General Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                className="form-input"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                className="form-input"
                value={settings.adminEmail}
                onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
              />
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({...settings, enableNotifications: e.target.checked})}
                />
                <span className="text-sm">Enable Notifications</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={settings.enableRegistration}
                  onChange={(e) => setSettings({...settings, enableRegistration: e.target.checked})}
                />
                <span className="text-sm">Enable User Registration</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                />
                <span className="text-sm">Maintenance Mode</span>
              </label>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Key className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold">API Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate Limit (requests/minute)
              </label>
              <input
                type="number"
                className="form-input"
                value={settings.apiRateLimit}
                onChange={(e) => setSettings({...settings, apiRateLimit: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                className="form-input"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">API Status</h4>
                  <p className="text-sm text-yellow-700">All services operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Database className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold">Database</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800">Connection Status</h4>
              <p className="text-sm text-green-700">Connected to Firebase</p>
            </div>
            
            <button className="btn-secondary w-full">
              Backup Database
            </button>
            
            <button className="btn-danger w-full">
              Clear Cache
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">System Information</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Environment:</span>
              <span className="font-medium">Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uptime:</span>
              <span className="font-medium">2 hours 45 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Backup:</span>
              <span className="font-medium">Today, 10:30 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;