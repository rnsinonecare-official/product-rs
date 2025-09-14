import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import ScrollAnimationWrapper from '../shared/ScrollAnimationWrapper';
import PageBackground from '../shared/PageBackground';
import { 
  fadeInUp, 
  fadeInLeft, 
  fadeInRight, 
  scaleIn, 
  staggerContainer,
  cardHover,
  tapScale,
  bounceIn
} from '../../utils/animations';
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  Star,
  ThumbsUp,
  Clock,
  Eye,
  Filter,
  Search,
  TrendingUp,
  Award,
  Leaf,
  Zap,
  Coffee,
  Target,
  Calendar,
  ChevronRight
} from 'lucide-react';

const Community = () => {
  const { userProfile } = useUser();
  const [activeTab, setActiveTab] = useState('tips');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Mock community posts
  const mockPosts = [
    {
      id: 1,
      type: 'tip',
      category: 'nutrition',
      title: 'Best Foods for PCOS Management',
      content: 'Including low-glycemic foods like quinoa, leafy greens, and lean proteins can help manage insulin levels and reduce PCOS symptoms. Try to eat every 3-4 hours to maintain stable blood sugar.',
      author: 'Dr. Sarah Doctor',
      authorAvatar: '👩‍⚕️',
      likes: 156,
      comments: 23,
      views: 1240,
      timeAgo: '2 hours ago',
      tags: ['PCOS', 'Nutrition', 'Health Tips'],
      healthConditions: ['pcos', 'pcod'],
      difficulty: 'Beginner'
    },
    {
      id: 2,
      type: 'recipe',
      category: 'recipes',
      title: 'Diabetes-Friendly Overnight Oats',
      content: 'Start your morning with this fiber-rich breakfast that helps stabilize blood sugar. Mix rolled oats, chia seeds, almond milk, and cinnamon. Add berries for natural sweetness!',
      author: 'HealthyEats_Maya',
      authorAvatar: '👩‍🍳',
      likes: 89,
      comments: 15,
      views: 567,
      timeAgo: '5 hours ago',
      tags: ['Diabetes', 'Breakfast', 'High Fiber'],
      healthConditions: ['diabetes'],
      difficulty: 'Easy'
    },
    {
      id: 3,
      type: 'story',
      category: 'success',
      title: 'My 6-Month Thyroid Management Journey',
      content: 'After being diagnosed with hypothyroidism, I struggled with weight gain and fatigue. Through consistent meal planning, regular exercise, and medication compliance, I finally feel like myself again!',
      author: 'ThyroidWarrior_Raj',
      authorAvatar: '💪',
      likes: 234,
      comments: 67,
      views: 1890,
      timeAgo: '1 day ago',
      tags: ['Thyroid', 'Success Story', 'Motivation'],
      healthConditions: ['thyroid'],
      difficulty: 'Intermediate'
    },
    {
      id: 4,
      type: 'tip',
      category: 'exercise',
      title: 'Managing Hypertension with Gentle Exercise',
      content: 'Regular walking, swimming, and yoga can significantly help lower blood pressure. Start with 15-20 minutes daily and gradually increase. Always consult your doctor before starting new exercise routines.',
      author: 'FitnessCoach_Priya',
      authorAvatar: '🏃‍♀️',
      likes: 112,
      comments: 18,
      views: 789,
      timeAgo: '3 hours ago',
      tags: ['Hypertension', 'Exercise', 'Heart Health'],
      healthConditions: ['hypertension'],
      difficulty: 'Beginner'
    },
    {
      id: 5,
      type: 'tip',
      category: 'mental-health',
      title: 'Stress Management for Better Health',
      content: 'Chronic stress can worsen many health conditions. Try mindfulness meditation, deep breathing exercises, or journaling for 10 minutes daily. Your mind and body will thank you!',
      author: 'MindfulHealth_Dr',
      authorAvatar: '🧘‍♀️',
      likes: 178,
      comments: 34,
      views: 1456,
      timeAgo: '6 hours ago',
      tags: ['Mental Health', 'Stress', 'Mindfulness'],
      healthConditions: ['all'],
      difficulty: 'Beginner'
    },
    {
      id: 6,
      type: 'recipe',
      category: 'recipes',
      title: 'Anti-Inflammatory Turmeric Latte',
      content: 'This golden milk recipe is perfect for reducing inflammation. Mix turmeric, ginger, cinnamon, and black pepper with warm almond milk. Add a touch of honey for sweetness.',
      author: 'SpiceKitchen_Anita',
      authorAvatar: '🌿',
      likes: 95,
      comments: 12,
      views: 543,
      timeAgo: '8 hours ago',
      tags: ['Anti-inflammatory', 'Beverages', 'Natural Healing'],
      healthConditions: ['all'],
      difficulty: 'Easy'
    }
  ];

  const categories = [
    { key: 'all', label: 'All Posts', icon: Users, color: 'text-gray-600' },
    { key: 'nutrition', label: 'Nutrition Tips', icon: Leaf, color: 'text-green-600' },
    { key: 'recipes', label: 'Healthy Recipes', icon: Coffee, color: 'text-orange-600' },
    { key: 'exercise', label: 'Exercise', icon: Zap, color: 'text-blue-600' },
    { key: 'success', label: 'Success Stories', icon: Award, color: 'text-purple-600' },
    { key: 'mental-health', label: 'Mental Health', icon: Heart, color: 'text-pink-600' }
  ];

  const motivationalQuotes = [
    {
      quote: "Your health is an investment, not an expense.",
      author: "Anonymous",
      category: "motivation"
    },
    {
      quote: "Take care of your body. It's the only place you have to live.",
      author: "Jim Rohn",
      category: "health"
    },
    {
      quote: "A healthy outside starts from the inside.",
      author: "Robert Urich",
      category: "wellness"
    }
  ];

  useEffect(() => {
    setPosts(mockPosts);
    setFilteredPosts(mockPosts);
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by user's health conditions for personalized content
    if (userProfile?.healthConditions && userProfile.healthConditions.length > 0) {
      const userConditions = userProfile.healthConditions;
      filtered = filtered.sort((a, b) => {
        const aRelevant = a.healthConditions.some(condition => 
          userConditions.includes(condition) || condition === 'all'
        );
        const bRelevant = b.healthConditions.some(condition => 
          userConditions.includes(condition) || condition === 'all'
        );
        
        if (aRelevant && !bRelevant) return -1;
        if (!aRelevant && bRelevant) return 1;
        return 0;
      });
    }

    setFilteredPosts(filtered);
  }, [posts, selectedCategory, searchTerm, userProfile]);

  const getPostIcon = (type) => {
    switch (type) {
      case 'tip': return BookOpen;
      case 'recipe': return Coffee;
      case 'story': return Star;
      default: return BookOpen;
    }
  };

  const getPostColor = (type) => {
    switch (type) {
      case 'tip': return 'bg-blue-100 text-blue-600';
      case 'recipe': return 'bg-orange-100 text-orange-600';
      case 'story': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const isRelevantToUser = (post) => {
    if (!userProfile?.healthConditions) return false;
    return post.healthConditions.some(condition => 
      userProfile.healthConditions.includes(condition) || condition === 'all'
    );
  };

  const PostCard = ({ post }) => {
    const PostIcon = getPostIcon(post.type);
    const isRelevant = isRelevantToUser(post);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`glass-card p-6 cursor-pointer card-hover ${isRelevant ? 'ring-2 ring-sage/30' : ''}`}
        whileHover={{ scale: 1.02 }}
      >
        {isRelevant && (
          <div className="flex items-center space-x-1 mb-3">
            <Target className="w-4 h-4 text-sage" />
            <span className="text-xs font-medium text-sage">Recommended for you</span>
          </div>
        )}

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-sage to-light-green rounded-full flex items-center justify-center text-white font-bold">
              {post.authorAvatar}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPostColor(post.type)}`}>
                <PostIcon className="w-3 h-3 mr-1" />
                {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
              </span>
              <span className="text-xs text-gray-500">{post.timeAgo}</span>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
              {post.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {post.content}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments}</span>
                </button>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">by {post.author}</span>
                <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <Share2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto relative">
      <PageBackground variant="community" />
      {/* Header */}
      <ScrollAnimationWrapper animationType="fadeInUp" className="mb-8">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Community & Tips
        </motion.h1>
        <motion.p 
          className="text-gray-600"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          Connect, learn, and get inspired by health tips and success stories
        </motion.p>
      </ScrollAnimationWrapper>

      {/* Welcome Card for User */}
      {userProfile && (
        <ScrollAnimationWrapper 
          animationType="scaleIn" 
          className="glass-card p-6 mb-8 bg-gradient-to-r from-sage/10 to-light-green/10"
          delay={0.1}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-sage to-light-green rounded-full flex items-center justify-center text-white font-bold text-xl">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">
                Welcome to the Community, {userProfile.name}! 👋
              </h2>
              <p className="text-gray-600 mb-2">
                Based on your profile, we've personalized content for {userProfile.healthConditions?.join(', ') || 'general health'}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>BMI: {userProfile.bmi} - {userProfile.bmiCategory}</span>
                {userProfile.metabolicAge && (
                  <span>Metabolic Age: {userProfile.metabolicAge}</span>
                )}
                <span>Diet: {userProfile.dietType}</span>
                <span>Active since {new Date(userProfile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </ScrollAnimationWrapper>
      )}

      {/* Daily Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 mb-8 text-center bg-gradient-to-r from-blue-50 to-purple-50"
      >
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Daily Inspiration</h3>
          <blockquote className="text-xl font-medium text-gray-700 mb-3 italic">
            "{motivationalQuotes[0].quote}"
          </blockquote>
          <cite className="text-gray-600">— {motivationalQuotes[0].author}</cite>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <ScrollAnimationWrapper 
        animationType="fadeInLeft" 
        className="mb-8"
        delay={0.3}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <motion.div 
            className="flex-1 relative"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tips, recipes, stories..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 flying-tab"
            />
          </motion.div>

          {/* Filter Button */}
          <motion.button
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-sage to-light-green text-white rounded-2xl font-medium liquid-button"
            whileHover={cardHover}
            whileTap={tapScale}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </motion.button>
        </div>

        {/* Category Tabs */}
        <motion.div 
          className="flex overflow-x-auto space-x-2 pb-2"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300 flying-tab relative overflow-hidden ${
                selectedCategory === category.key
                  ? 'bg-sage text-white'
                  : 'text-gray-600 hover:bg-sage/10 hover:text-sage'
              }`}
              variants={bounceIn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              <category.icon className={`w-5 h-5 ${selectedCategory === category.key ? 'text-white' : category.color}`} />
              <span>{category.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </ScrollAnimationWrapper>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total Posts', value: '1,234', icon: BookOpen, color: 'text-blue-600' },
          { label: 'Active Members', value: '5,678', icon: Users, color: 'text-green-600' },
          { label: 'Success Stories', value: '289', icon: Award, color: 'text-purple-600' },
          { label: 'Health Tips', value: '456', icon: Heart, color: 'text-pink-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            className="glass-card p-4 text-center"
          >
            <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Posts Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedCategory === 'all' ? 'Latest Posts' : categories.find(c => c.key === selectedCategory)?.label} 
            ({filteredPosts.length})
          </h2>
          
          <div className="flex items-center space-x-2">
            <motion.button
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-sage rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Trending</span>
            </motion.button>
            <motion.button
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-sage rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm">Recent</span>
            </motion.button>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No posts found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Community Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 glass-card p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Heart className="w-6 h-6 mr-2 text-pink-500" />
          Community Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Be Respectful</h4>
            <p className="text-sm text-gray-600">
              Treat all community members with kindness and respect. Everyone's health journey is unique.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Share Responsibly</h4>
            <p className="text-sm text-gray-600">
              Always consult healthcare professionals for medical advice. Share experiences, not medical diagnoses.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Stay Positive</h4>
            <p className="text-sm text-gray-600">
              Focus on encouragement and support. Celebrate small wins and progress together.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Be Helpful</h4>
            <p className="text-sm text-gray-600">
              Share accurate information and cite reliable sources when providing health tips or advice.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Community;