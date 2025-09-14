import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Watch, 
  Activity, 
  RefreshCw as Sync, 
  CheckCircle, 
  AlertCircle,
  Plus,
  RefreshCw,
  Settings
} from 'lucide-react';
import stepSyncService from '../../services/stepSyncService';
import { useHealthData } from '../../context/HealthDataContext';

const StepSync = ({ onClose }) => {
  const { updateDailyMetric } = useHealthData();
  const [syncStatus, setSyncStatus] = useState(stepSyncService.getSyncStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [manualSteps, setManualSteps] = useState('');
  const [activeTab, setActiveTab] = useState('auto');

  useEffect(() => {
    // Listen for step updates
    const handleStepsUpdated = (event) => {
      const { steps } = event.detail;
      updateDailyMetric('steps', steps);
      setSyncStatus(stepSyncService.getSyncStatus());
    };

    window.addEventListener('stepsUpdated', handleStepsUpdated);
    return () => window.removeEventListener('stepsUpdated', handleStepsUpdated);
  }, [updateDailyMetric]);

  const handleAutoSync = async (service) => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      let result;
      switch (service) {
        case 'google':
          result = await stepSyncService.syncWithGoogleFit();
          break;
        case 'apple':
          result = await stepSyncService.syncWithAppleHealth();
          break;
        case 'samsung':
          result = await stepSyncService.syncWithSamsungHealth();
          break;
        case 'device':
          const stepCounter = await stepSyncService.startStepCounting();
          // Let it run for 3 seconds to get a reading
          setTimeout(() => {
            stepCounter.stop();
            result = {
              success: true,
              steps: stepCounter.getStepCount(),
              source: 'Device Motion'
            };
            setSyncResult(result);
          }, 3000);
          return;
        default:
          throw new Error('Unknown service');
      }

      setSyncResult(result);
      if (result.success) {
        updateDailyMetric('steps', result.steps);
      }
    } catch (error) {
      setSyncResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = async () => {
    const steps = parseInt(manualSteps);
    if (isNaN(steps) || steps < 0) {
      setSyncResult({
        success: false,
        error: 'Please enter a valid number of steps'
      });
      return;
    }

    setIsLoading(true);
    const result = await stepSyncService.manualStepEntry(steps);
    setSyncResult(result);
    
    if (result.success) {
      updateDailyMetric('steps', steps);
      setManualSteps('');
    }
    setIsLoading(false);
  };

  const toggleAutoSync = () => {
    if (syncStatus.isAutoSyncActive) {
      stepSyncService.stopAutoSync();
    } else {
      stepSyncService.startAutoSync();
    }
    setSyncStatus(stepSyncService.getSyncStatus());
  };

  const syncOptions = [
    {
      id: 'google',
      name: 'Google Fit',
      icon: Activity,
      description: 'Sync with Google Fit app',
      available: true,
      color: 'bg-green-500'
    },
    {
      id: 'apple',
      name: 'Apple Health',
      icon: Watch,
      description: 'Sync with Apple Health app',
      available: /iPhone|iPad|iPod/.test(navigator.userAgent),
      color: 'bg-gray-800'
    },
    {
      id: 'samsung',
      name: 'Samsung Health',
      icon: Smartphone,
      description: 'Sync with Samsung Health app',
      available: /Android/.test(navigator.userAgent),
      color: 'bg-blue-600'
    },
    {
      id: 'device',
      name: 'Device Motion',
      icon: Activity,
      description: 'Use device sensors to count steps',
      available: syncStatus.isSupported,
      color: 'bg-purple-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Step Sync</h2>
              <p className="text-sm text-gray-600">Connect your fitness apps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Current Status */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Today's Steps</span>
            <span className="text-2xl font-bold text-green-600">
              {syncStatus.todaySteps.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Auto Sync</span>
            <button
              onClick={toggleAutoSync}
              className={`w-10 h-6 rounded-full transition-colors ${
                syncStatus.isAutoSyncActive ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  syncStatus.isAutoSyncActive ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('auto')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'auto'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Auto Sync
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'manual'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Manual Entry
          </button>
        </div>

        {/* Auto Sync Tab */}
        {activeTab === 'auto' && (
          <div className="space-y-3">
            {syncOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => handleAutoSync(option.id)}
                disabled={!option.available || isLoading}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  option.available
                    ? 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                }`}
                whileHover={option.available ? { scale: 1.02 } : {}}
                whileTap={option.available ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${option.color} rounded-full flex items-center justify-center`}>
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-800">{option.name}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : (
                    <Sync className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Step Count
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={manualSteps}
                  onChange={(e) => setManualSteps(e.target.value)}
                  placeholder="e.g., 8500"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  max="100000"
                />
                <motion.button
                  onClick={handleManualEntry}
                  disabled={isLoading || !manualSteps}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Manual Entry Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Check your phone's health app for accurate counts</li>
                    <li>• Average person takes 2,000-2,500 steps per mile</li>
                    <li>• Daily goal is typically 8,000-10,000 steps</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync Result */}
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-xl ${
              syncResult.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              {syncResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className={`font-medium ${
                  syncResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {syncResult.success ? 'Sync Successful!' : 'Sync Failed'}
                </p>
                {syncResult.success ? (
                  <p className="text-sm text-green-700">
                    {syncResult.steps?.toLocaleString()} steps from {syncResult.source}
                  </p>
                ) : (
                  <p className="text-sm text-red-700">{syncResult.error}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StepSync;