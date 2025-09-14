import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ThumbsUp, Share2, BookOpen, Activity, Brain, Utensils, Shield } from 'lucide-react';

const getImageUrlForCategory = (category, index) => {
  // Using reliable Unsplash images as fallback for better reliability
  const categoryImages = {
    nutrition: [
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=200&fit=crop&q=80'
    ],
    fitness: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=200&fit=crop&q=80'
    ],
    'mental-health': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=200&fit=crop&q=80'
    ],
    lifestyle: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop&q=80'
    ],
    prevention: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=200&fit=crop&q=80'
    ],
    all: [
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop&q=80'
    ]
  };
  
  const images = categoryImages[category] || categoryImages.all;
  return images[index % images.length];
};

const HealthTipsSection = () => {
  const [healthTips, setHealthTips] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch health tips from API
  useEffect(() => {
    const fetchHealthTips = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/admin/health-tips/active?category=${selectedCategory}`);
        if (response.ok) {
          const data = await response.json();
          const tipsWithImages = data.map((tip, index) => ({
            ...tip,
            image: tip.image || getImageUrlForCategory(tip.category, tip.id || index)
          }));
          setHealthTips(tipsWithImages);
        } else {
          // Fallback to sample data if API fails
          const fallbackHealthTips = [
            {
              id: 1,
              title: '5 Foods to Boost Your Immunity',
              content: 'Include citrus fruits, garlic, ginger, spinach, and yogurt in your daily diet to strengthen your immune system naturally.',
              category: 'nutrition',
              image: getImageUrlForCategory('nutrition', 1),
              isActive: true,
              createdAt: '2024-01-15',
              likes: 245
            },
            {
              id: 2,
              title: 'Morning Exercise Benefits',
              content: 'Starting your day with 30 minutes of exercise can improve your mood, energy levels, and overall health significantly.',
              category: 'fitness',
              image: getImageUrlForCategory('fitness', 2),
              isActive: true,
              createdAt: '2024-01-14',
              likes: 189
            }
          ];
          setHealthTips(fallbackHealthTips);
        }
      } catch (error) {
        console.error('Error fetching health tips:', error);
        // Fallback to sample data
        const fallbackHealthTips = [
          {
            id: 1,
            title: '5 Foods to Boost Your Immunity',
            content: 'Include citrus fruits, garlic, ginger, spinach, and yogurt in your daily diet to strengthen your immune system naturally.',
            category: 'nutrition',
              image: getImageUrlForCategory('nutrition', 1),
            isActive: true,
            createdAt: '2024-01-15',
            likes: 245
          }
        ];
        setHealthTips(fallbackHealthTips);
      }
    };

    fetchHealthTips();
  }, [selectedCategory]);

  const categories = [
    { id: 'all', label: 'All Tips', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils, color: 'from-green-500 to-green-600' },
    { id: 'fitness', label: 'Fitness', icon: Activity, color: 'from-orange-500 to-orange-600' },
    { id: 'mental-health', label: 'Mental Health', icon: Brain, color: 'from-purple-500 to-purple-600' },
    { id: 'lifestyle', label: 'Lifestyle', icon: Heart, color: 'from-pink-500 to-pink-600' },
    { id: 'prevention', label: 'Prevention', icon: Shield, color: 'from-indigo-500 to-indigo-600' }
  ];

  const filteredTips = selectedCategory === 'all' 
    ? healthTips 
    : healthTips.filter(tip => tip.category === selectedCategory);

  const handleLike = async (tipId) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/admin/health-tips/${tipId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setHealthTips(prev => prev.map(tip => 
          tip.id === tipId ? { ...tip, likes: tip.likes + 1 } : tip
        ));
      }
    } catch (error) {
      console.error('Error liking health tip:', error);
      // Still update UI for better UX
      setHealthTips(prev => prev.map(tip => 
        tip.id === tipId ? { ...tip, likes: tip.likes + 1 } : tip
      ));
    }
  };

  const handleShare = (tip) => {
    if (navigator.share) {
      navigator.share({
        title: tip.title,
        text: tip.content,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${tip.title}\n\n${tip.content}\n\nShared from Rainscare`);
      alert('Health tip copied to clipboard!');
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Daily Health Tips
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert-curated health tips to help you live a healthier, happier life every day
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105`
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <category.icon className="w-5 h-5" />
              <span>{category.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Health Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTips.map((tip, index) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                <img
                  src={tip.image}
                  alt={tip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback for broken images. Uses a simple placeholder with the tip's title.
                    e.target.onerror = null; 
                    e.target.src = `https://placehold.co/400x200/EBF5EE/769FCD?text=${encodeURIComponent(tip.title)}`;
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${
                    categories.find(cat => cat.id === tip.category)?.color || 'from-blue-500 to-blue-600'
                  }`}>
                    {categories.find(cat => cat.id === tip.category)?.label || tip.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {tip.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {tip.content}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(tip.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group/like"
                    >
                      <Heart className="w-5 h-5 group-hover/like:fill-current" />
                      <span className="text-sm font-medium">{tip.likes}</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare(tip)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>

                  <div className="text-sm text-gray-400">
                    {new Date(tip.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show more button */}
        {filteredTips.length > 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              View More Health Tips
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HealthTipsSection;