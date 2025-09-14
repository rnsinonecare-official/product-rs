import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHealthData } from '../../context/HealthDataContext';
import { 
  Calendar, 
  Droplets, 
  Activity, 
  Moon, 
  TrendingUp, 
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LineChart
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const HealthHistory = () => {
  const { getWeeklyData, getMonthlyData } = useHealthData();
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (selectedPeriod === 'week') {
        const data = await getWeeklyData();
        setWeeklyData(data);
      } else {
        const data = await getMonthlyData();
        setMonthlyData(data);
      }
    } catch (error) {
      console.error('Error loading health history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    return selectedPeriod === 'week' ? weeklyData : monthlyData;
  };

  const getMetricTrend = (data, metric) => {
    if (data.length < 2) return 'stable';
    
    const recent = data.slice(-3).map(d => d[metric] || 0);
    const earlier = data.slice(-6, -3).map(d => d[metric] || 0);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    if (recentAvg > earlierAvg * 1.1) return 'up';
    if (recentAvg < earlierAvg * 0.9) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMetricColor = (metric) => {
    const colors = {
      water: 'text-blue-600',
      steps: 'text-green-600',
      sleep: 'text-purple-600',
      calories: 'text-orange-600'
    };
    return colors[metric] || 'text-gray-600';
  };

  const getMetricIcon = (metric) => {
    const icons = {
      water: Droplets,
      steps: Activity,
      sleep: Moon,
      calories: BarChart3
    };
    const Icon = icons[metric] || BarChart3;
    return <Icon className="w-5 h-5" />;
  };

  const formatMetricValue = (metric, value) => {
    switch (metric) {
      case 'water': return `${value.toFixed(1)}L`;
      case 'steps': return value.toLocaleString();
      case 'sleep': return `${value}h`;
      case 'calories': return `${Math.round(value)} cal`;
      default: return value;
    }
  };

  const navigateDate = (direction) => {
    const days = selectedPeriod === 'week' ? 7 : 30;
    const newDate = direction === 'prev' 
      ? subDays(selectedDate, days)
      : new Date(selectedDate.getTime() + (days * 24 * 60 * 60 * 1000));
    setSelectedDate(newDate);
  };

  const data = getCurrentData();
  const metrics = ['water', 'steps', 'sleep', 'calories'];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LineChart className="w-6 h-6 text-blue-600" />
          Health History
        </h2>
        
        <div className="flex items-center gap-4">
          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
              {selectedPeriod === 'week' 
                ? `Week of ${format(startOfWeek(selectedDate), 'MMM d')}`
                : format(selectedDate, 'MMMM yyyy')
              }
            </span>
            
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={selectedDate >= new Date()}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {metrics.map((metric) => {
              const total = data.reduce((sum, day) => sum + (day[metric] || 0), 0);
              const average = data.length > 0 ? total / data.length : 0;
              const trend = getMetricTrend(data, metric);
              
              return (
                <motion.div
                  key={metric}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${getMetricColor(metric)}`}>
                      {getMetricIcon(metric)}
                    </div>
                    {getTrendIcon(trend)}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 capitalize">{metric}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatMetricValue(metric, average)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Daily Average
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Daily Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Daily Breakdown
            </h3>
            
            <div className="space-y-3">
              {data.slice().reverse().map((day, index) => (
                <motion.div
                  key={day.date}
                  className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {format(new Date(day.date), 'EEEE, MMM d')}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {format(new Date(day.date), 'yyyy')}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {day.calories > 0 ? `${Math.round(day.calories)} calories` : 'No data'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {day.foodEntries?.length || 0} food entries
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <Droplets className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {day.water?.toFixed(1) || '0.0'}L
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Water</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {(day.steps || 0).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Steps</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                        <Moon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {day.sleep || 0}h
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Sleep</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {data.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No data available for this period</p>
                <p className="text-sm text-gray-400 mt-2">
                  Start logging your daily activities to see your history here
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HealthHistory;