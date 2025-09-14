import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  Server,
  Database,
  Zap,
  FileText,
  Shield,
  RefreshCw,
  Download,
  Bell,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [userGrowth, setUserGrowth] = useState(null);
  const [contentEngagement, setContentEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');

      const [
        dashboardStats,
        healthData,
        growthData,
        engagementData
      ] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getSystemHealth(),
        adminService.getUserGrowthStats(),
        adminService.getContentEngagementStats()
      ]);

      console.log('Dashboard stats result:', dashboardStats);
      console.log('Health data result:', healthData);
      console.log('Growth data result:', growthData);
      console.log('Engagement data result:', engagementData);

      if (dashboardStats.status === 'fulfilled') {
        console.log('Setting real stats:', dashboardStats.value);
        setStats(dashboardStats.value);
      } else {
        console.error('Dashboard stats failed:', dashboardStats.reason);
        toast.error('Failed to load dashboard stats');
      }

      // Health data is no longer used in the UI
      if (healthData.status === 'fulfilled') {
        console.log('Health data loaded:', healthData.value);
      } else {
        console.error('Health data failed:', healthData.reason);
      }

      if (growthData.status === 'fulfilled') {
        console.log('Setting real user growth:', growthData.value);
        setUserGrowth(growthData.value);
      } else {
        console.error('User growth failed:', growthData.reason);
      }

      if (engagementData.status === 'fulfilled') {
        console.log('Setting real content engagement:', engagementData.value);
        setContentEngagement(engagementData.value);
      } else {
        console.error('Content engagement failed:', engagementData.reason);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  // Mock data for demonstration (replace with real data from API)
  const mockStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalContent: 156,
    systemUptime: '99.9%',
    dailyActiveUsers: 234,
    weeklyGrowth: 12.5,
    contentViews: 45678,
    errorRate: 0.1
  };

  const mockUserGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [65, 89, 123, 156, 189, 234],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Active Users',
        data: [45, 67, 89, 112, 145, 178],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }
    ],
  };

  const mockContentEngagementData = {
    labels: ['Health Tips', 'Success Stories', 'Announcements', 'Updates', 'Food Analysis'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const mockActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Activity',
        data: [120, 190, 300, 500, 200, 300, 450],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: 12
          }
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9CA3AF'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#9CA3AF'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            size: 11
          }
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentStats = stats || mockStats;
  const currentUserGrowth = userGrowth || mockUserGrowthData;
  const currentContentEngagement = contentEngagement || mockContentEngagementData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with Rainscare.</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{currentStats.totalUsers?.toLocaleString()}</p>
              <p className="text-blue-100 text-sm mt-1">
                +{currentStats.weeklyGrowth}% this week
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Users</p>
              <p className="text-3xl font-bold">{currentStats.activeUsers?.toLocaleString()}</p>
              <p className="text-green-100 text-sm mt-1">
                {currentStats.dailyActiveUsers} today
              </p>
            </div>
            <Activity className="w-12 h-12 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Content Views</p>
              <p className="text-3xl font-bold">{currentStats.contentViews?.toLocaleString()}</p>
              <p className="text-purple-100 text-sm mt-1">
                {currentStats.totalContent} total items
              </p>
            </div>
            <FileText className="w-12 h-12 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">System Health</p>
              <p className="text-3xl font-bold">{currentStats.systemUptime}</p>
              <p className="text-orange-100 text-sm mt-1">
                {currentStats.errorRate}% error rate
              </p>
            </div>
            <Shield className="w-12 h-12 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">User Growth</h3>
            <LineChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Line data={currentUserGrowth} options={chartOptions} />
          </div>
        </motion.div>

        {/* Content Engagement Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Content Engagement</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Doughnut data={currentContentEngagement} options={doughnutOptions} />
          </div>
        </motion.div>
      </div>

      {/* Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Weekly Activity</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-64">
          <Bar data={mockActivityData} options={chartOptions} />
        </div>
      </motion.div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Server className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Server Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">CPU Usage</span>
              <span className="text-white">45%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Memory</span>
              <span className="text-white">67%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Database</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Storage Used</span>
              <span className="text-white">2.4 GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Connections</span>
              <span className="text-white">23/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Response Time</span>
              <span className="text-green-400">45ms</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">New user registered</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">Content updated</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">System backup completed</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-white text-sm">Send Notification</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <Download className="w-6 h-6 text-green-400 mb-2" />
            <span className="text-white text-sm">Export Data</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <Shield className="w-6 h-6 text-yellow-400 mb-2" />
            <span className="text-white text-sm">System Backup</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <RefreshCw className="w-6 h-6 text-purple-400 mb-2" />
            <span className="text-white text-sm">Clear Cache</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;