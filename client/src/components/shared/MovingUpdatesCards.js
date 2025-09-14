import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, Award, Info, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const MovingUpdatesCards = () => {
  const [updates, setUpdates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Health quotes to show when no updates are available
  const healthQuotes = [
    {
      id: 'quote1',
      title: 'Daily Wisdom',
      description: 'Take care of your body. It\'s the only place you have to live.',
      type: 'wisdom',
      icon: 'Heart',
      color: 'green',
      author: 'Jim Rohn'
    },
    {
      id: 'quote2',
      title: 'Health Motivation',
      description: 'The groundwork for all happiness is good health.',
      type: 'motivation',
      icon: 'Award',
      color: 'purple',
      author: 'Leigh Hunt'
    },
    {
      id: 'quote3',
      title: 'Wellness Tip',
      description: 'Health is not about the weight you lose, but about the life you gain.',
      type: 'wellness',
      icon: 'Zap',
      color: 'blue',
      author: 'Dr. Josh Axe'
    },
    {
      id: 'quote4',
      title: 'Mindful Living',
      description: 'Your body can stand almost anything. It\'s your mind you have to convince.',
      type: 'mindfulness',
      icon: 'Heart',
      color: 'indigo',
      author: 'Unknown'
    },
    {
      id: 'quote5',
      title: 'Nutrition Wisdom',
      description: 'Let food be thy medicine and medicine be thy food.',
      type: 'nutrition',
      icon: 'Award',
      color: 'orange',
      author: 'Hippocrates'
    },
    {
      id: 'quote6',
      title: 'Fitness Inspiration',
      description: 'A healthy outside starts from the inside.',
      type: 'fitness',
      icon: 'Zap',
      color: 'red',
      author: 'Robert Urich'
    }
  ];

  useEffect(() => {
    fetchUpdates();
  }, []);

  useEffect(() => {
    const dataToShow = updates.length > 0 ? updates : healthQuotes;
    if (dataToShow.length > 2 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const maxIdx = Math.max(0, dataToShow.length - 2);
          return prevIndex >= maxIdx ? 0 : prevIndex + 1;
        });
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [updates, healthQuotes, isPaused]);

  const fetchUpdates = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/updates/active`);
      if (response.ok) {
        const data = await response.json();
        setUpdates(data);
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      Zap,
      Heart,
      Award,
      Info,
      Calendar,
      Clock
    };
    return icons[iconName] || Zap;
  };

  const getColorClass = (colorName) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
      yellow: 'from-yellow-500 to-yellow-600',
      indigo: 'from-indigo-500 to-indigo-600',
      pink: 'from-pink-500 to-pink-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return colors[colorName] || 'from-blue-500 to-blue-600';
  };

  const getBgColorClass = (colorName) => {
    const bgColors = {
      blue: 'from-blue-50 to-blue-100',
      green: 'from-green-50 to-green-100',
      purple: 'from-purple-50 to-purple-100',
      red: 'from-red-50 to-red-100',
      yellow: 'from-yellow-50 to-yellow-100',
      indigo: 'from-indigo-50 to-indigo-100',
      pink: 'from-pink-50 to-pink-100',
      orange: 'from-orange-50 to-orange-100'
    };
    return bgColors[colorName] || 'from-blue-50 to-blue-100';
  };

  const getBorderColorClass = (colorName) => {
    const borderColors = {
      blue: 'border-blue-200',
      green: 'border-green-200',
      purple: 'border-purple-200',
      red: 'border-red-200',
      yellow: 'border-yellow-200',
      indigo: 'border-indigo-200',
      pink: 'border-pink-200',
      orange: 'border-orange-200'
    };
    return borderColors[colorName] || 'border-blue-200';
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const now = new Date();
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const dataToShow = updates.length > 0 ? updates : healthQuotes;
  const isShowingQuotes = updates.length === 0;
  
  // Always show 2 cards at a time
  const cardsToShow = 2;
  const maxIndex = Math.max(0, dataToShow.length - cardsToShow);
  


  const nextSlide = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          {isShowingQuotes ? 'Health Wisdom' : 'Latest Updates'}
        </h2>
        
        {dataToShow.length > cardsToShow && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentIndex >= maxIndex}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Cards Container */}
      <div 
        className="relative overflow-hidden w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * 50}%)`,
            width: `${dataToShow.length * 50}%`
          }}
        >
          {dataToShow.map((item, index) => {
            const IconComponent = getIconComponent(item.icon);
            const colorClass = getColorClass(item.color);
            const bgColorClass = getBgColorClass(item.color);
            const borderColorClass = getBorderColorClass(item.color);

            return (
              <motion.div
                key={item.id}
                className="flex-shrink-0 px-2"
                style={{ width: '50%' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`glass-card p-3 sm:p-4 md:p-6 bg-gradient-to-br ${bgColorClass} border ${borderColorClass} relative overflow-hidden h-full w-full`}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <div className={`w-full h-full bg-gradient-to-br ${colorClass} rounded-full transform translate-x-6 -translate-y-6`}></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <motion.div 
                        className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center mr-3`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-800">{item.title}</h3>
                        <p className="text-xs text-gray-600 capitalize">
                          {isShowingQuotes ? item.type : item.type}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-700 mb-3 leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {isShowingQuotes ? (
                        <span className="text-xs text-gray-500 italic">— {item.author}</span>
                      ) : (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${colorClass} text-white`}>
                          New Update
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {isShowingQuotes ? 'Timeless' : getTimeAgo(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dots indicator */}
      {dataToShow.length > cardsToShow && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}


    </div>
  );
};

export default MovingUpdatesCards;