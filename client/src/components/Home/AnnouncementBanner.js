import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Calendar, Info, AlertTriangle, Megaphone } from 'lucide-react';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch announcements from API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/admin/announcements/active`);
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
        } else {
          // Fallback to sample data if API fails
          const fallbackAnnouncements = [
            {
              id: 1,
              title: 'Welcome to Rainscare!',
              content: 'Start your health journey with our personalized nutrition and wellness programs.',
              type: 'info',
              priority: 'high',
              isActive: true,
              createdAt: '2024-01-15',
              views: 1250
            }
          ];
          setAnnouncements(fallbackAnnouncements);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
        // Fallback to sample data
        const fallbackAnnouncements = [
          {
            id: 1,
            title: 'Welcome to Rainscare!',
            content: 'Start your health journey with our personalized nutrition and wellness programs.',
            type: 'info',
            priority: 'high',
            isActive: true,
            createdAt: '2024-01-15',
            views: 1250
          }
        ];
        setAnnouncements(fallbackAnnouncements);
      }
    };

    fetchAnnouncements();
  }, []);

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'event':
        return <Calendar className="w-5 h-5" />;
      case 'promotion':
        return <Megaphone className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'warning':
        return 'from-red-500 to-orange-500';
      case 'info':
        return 'from-blue-500 to-cyan-500';
      case 'event':
        return 'from-purple-500 to-pink-500';
      case 'promotion':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  if (!isVisible || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="relative z-50 w-full"
      >
        <div className={`bg-gradient-to-r ${getTypeColor(currentAnnouncement.type)} text-white shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  {getIcon(currentAnnouncement.type)}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:space-x-4"
                    >
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        {currentAnnouncement.title}
                      </h3>
                      <p className="text-xs sm:text-sm opacity-90 truncate">
                        {currentAnnouncement.content}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {/* Pagination dots */}
                {announcements.length > 1 && (
                  <div className="hidden sm:flex space-x-1">
                    {announcements.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                  aria-label="Close announcement"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementBanner;