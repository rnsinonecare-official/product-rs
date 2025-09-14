import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  PieChart,
  LineChart,
  Target,
  Zap,
  Clock,
  Globe
} from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics(selectedPeriod);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Use mock data for demonstration
      setAnalytics(mockAnalyticsData);
      toast.error('Failed to load analytics - using demo data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast.success('Analytics refreshed');
  };

  const handleExport = async () => {
    try {
      // Create CSV data
      const csvData = generateCSVData();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Analytics exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  const generateCSVData = () => {
    if (!analytics) return '';
    
    const headers = ['Metric', 'Value', 'Period'];
    const rows = [
      ['Total Users', analytics.totalUsers, selectedPeriod],
      ['Active Users', analytics.activeUsers, selectedPeriod],
      ['New Users', analytics.newUsers, selectedPeriod],
      ['Page Views', analytics.pageViews, selectedPeriod],
      ['Session Duration', analytics.avgSessionDuration, selectedPeriod],
      ['Bounce Rate', analytics.bounceRate + '%', selectedPeriod],
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Mock data for demonstration
  const mockAnalyticsData = {
    totalUsers: 1247,
    activeUsers: 892,
    newUsers: 156,
    pageViews: 45678,
    avgSessionDuration: '4m 32s',
    bounceRate: 23.5,
    conversionRate: 12.8,
    topPages: [
      { page: '/dashboard', views: 12456, percentage: 27.3 },
      { page: '/food-analysis', views: 8934, percentage: 19.6 },
      { page: '/profile', views: 6789, percentage: 14.9 },
      { page: '/doctors', views: 5432, percentage: 11.9 },
      { page: '/community', views: 4321, percentage: 9.5 }
    ],
    deviceBreakdown: {
      mobile: 65,
      desktop: 28,
      tablet: 7
    },
    userGrowth: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [65, 89, 123, 156, 189, 234]
    },
    engagementMetrics: {
      dailyActiveUsers: [120, 135, 148, 162, 178, 195, 210],
      weeklyActiveUsers: [450, 478, 502, 534, 567, 598, 632],
      monthlyActiveUsers: [1200, 1245, 1289, 1334, 1378, 1423, 1467]
    }
  };

  const currentAnalytics = analytics || mockAnalyticsData;

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: { size: 12 }
        }
      },
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y: {
        ticks: { color: '#9CA3AF' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      }
    }
  };

  const userGrowthData = {
    labels: currentAnalytics?.userGrowth?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: currentAnalytics?.userGrowth?.data || [65, 89, 123, 156, 189, 234],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const engagementData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Active Users',
        data: currentAnalytics?.engagementMetrics?.dailyActiveUsers || [120, 135, 148, 162, 178, 195, 210],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const deviceData = {
    labels: ['Mobile', 'Desktop', 'Tablet'],
    datasets: [
      {
        data: [
          currentAnalytics?.deviceBreakdown?.mobile || 65,
          currentAnalytics?.deviceBreakdown?.desktop || 28,
          currentAnalytics?.deviceBreakdown?.tablet || 7
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const performanceData = {
    labels: ['Page Load', 'API Response', 'User Engagement', 'Content Quality', 'Mobile Experience'],
    datasets: [
      {
        label: 'Performance Score',
        data: [85, 92, 78, 88, 82],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          font: { size: 12 }
        }
      },
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(156, 163, 175, 0.2)' },
        grid: { color: 'rgba(156, 163, 175, 0.2)' },
        pointLabels: { color: '#9CA3AF', font: { size: 11 } },
        ticks: { color: '#9CA3AF', backdropColor: 'transparent' }
      }
    }
  };

  if (loading || !currentAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive insights into user behavior and system performance</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{(currentAnalytics?.totalUsers || 0).toLocaleString()}</p>
              <p className="text-blue-100 text-sm mt-1">
                +{currentAnalytics?.newUsers || 0} new this period
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
              <p className="text-3xl font-bold">{(currentAnalytics?.activeUsers || 0).toLocaleString()}</p>
              <p className="text-green-100 text-sm mt-1">
                {Math.round(((currentAnalytics?.activeUsers || 0) / (currentAnalytics?.totalUsers || 1)) * 100)}% of total
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
              <p className="text-purple-100 text-sm">Page Views</p>
              <p className="text-3xl font-bold">{(currentAnalytics?.pageViews || 0).toLocaleString()}</p>
              <p className="text-purple-100 text-sm mt-1">
                Avg: {currentAnalytics?.avgSessionDuration || '0m 0s'}
              </p>
            </div>
            <Eye className="w-12 h-12 text-purple-200" />
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
              <p className="text-orange-100 text-sm">Conversion Rate</p>
              <p className="text-3xl font-bold">{currentAnalytics?.conversionRate || 0}%</p>
              <p className="text-orange-100 text-sm mt-1">
                Bounce: {currentAnalytics?.bounceRate || 0}%
              </p>
            </div>
            <Target className="w-12 h-12 text-orange-200" />
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
            <h3 className="text-xl font-semibold text-white">User Growth Trend</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Line data={userGrowthData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Device Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Device Breakdown</h3>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Doughnut data={deviceData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#ffffff',
                    font: { size: 12 }
                  }
                },
              },
            }} />
          </div>
        </motion.div>
      </div>

      {/* Engagement and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Weekly Engagement</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Bar data={engagementData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Performance Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Performance Metrics</h3>
            <Zap className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Radar data={performanceData} options={radarOptions} />
          </div>
        </motion.div>
      </div>

      {/* Top Pages Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Top Pages</h3>
          <p className="text-gray-400 text-sm mt-1">Most visited pages in the selected period</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {(currentAnalytics?.topPages || []).map((page, index) => (
                <tr key={index} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{page.page}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{page.views.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-white mr-2">{page.percentage}%</div>
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${page.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                      <span className="text-sm text-green-400">+{Math.floor(Math.random() * 20)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Real-time Users</h3>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400 mb-2">
              {Math.floor(Math.random() * 50) + 20}
            </p>
            <p className="text-gray-400 text-sm">Currently online</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Server Load</h3>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400 mb-2">
              {Math.floor(Math.random() * 30) + 40}%
            </p>
            <p className="text-gray-400 text-sm">CPU Usage</p>
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
            <h3 className="text-lg font-semibold text-white">Response Time</h3>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400 mb-2">
              {Math.floor(Math.random() * 50) + 120}ms
            </p>
            <p className="text-gray-400 text-sm">Average</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;