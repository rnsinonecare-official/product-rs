import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageBackground from '../shared/PageBackground';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Heart, 
  Zap, 
  Users,
  BookOpen,
  Star,
  ArrowRight,
  Filter,
  Search,
  Tag,
  Eye,
  MessageCircle,
  Share2,
  Bell
} from 'lucide-react';

const NewsUpdates = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNews, setFilteredNews] = useState([]);

  const newsCategories = [
    { id: 'all', label: 'All Updates', icon: BookOpen },
    { id: 'pcos', label: 'PCOS & Hormones', icon: Heart },
    { id: 'diabetes', label: 'Diabetes Care', icon: Zap },
    { id: 'nutrition', label: 'Nutrition Tips', icon: Users },
    { id: 'research', label: 'Research', icon: TrendingUp },
    { id: 'platform', label: 'Platform News', icon: Bell }
  ];

  const newsUpdates = [
    {
      id: 1,
      title: "New PCOS Diet Plan Added - 7-Day Hormone Balancing Menu",
      excerpt: "Our doctors have created a comprehensive 7-day meal plan specifically designed for PCOS management, featuring anti-inflammatory foods and blood sugar stabilizers.",
      category: "pcos",
      date: "2024-01-15",
      author: "Dr. Sarah Johnson",
      readTime: "5 min read",
      image: "https://cdn.pixabay.com/photo/2017/09/25/13/12/weight-loss-2785763_1280.jpg",
      tags: ["PCOS", "Diet Plan", "Hormones", "Meal Planning"],
      views: 1234,
      likes: 89,
      featured: true,
      content: `
        Managing PCOS through nutrition has never been easier! Our new 7-day meal plan includes:
        
        • Anti-inflammatory breakfast options
        • Blood sugar stabilizing snacks
        • Hormone-balancing dinner recipes
        • Complete shopping lists and prep guides
        
        This plan has been tested with over 200 women and shows promising results in managing PCOS symptoms.
      `
    },
    {
      id: 2,
      title: "Breakthrough Research: Cinnamon's Impact on Blood Sugar Control",
      excerpt: "Latest studies show that adding 1/2 teaspoon of cinnamon daily can significantly improve insulin sensitivity in people with type 2 diabetes.",
      category: "diabetes",
      date: "2024-01-12",
      author: "Dr. Michael Chen",
      readTime: "3 min read",
      image: "https://cdn.pixabay.com/photo/2017/02/01/13/40/fitness-2029768_1280.jpg",
      tags: ["Diabetes", "Research", "Cinnamon", "Blood Sugar"],
      views: 892,
      likes: 67,
      featured: false,
      content: `
        New research from the Journal of Nutrition reveals exciting findings about cinnamon's role in diabetes management:
        
        • 23% improvement in insulin sensitivity
        • 10-15% reduction in fasting blood glucose
        • Better HbA1c levels after 3 months
        
        Our app now includes cinnamon-rich recipes specifically for diabetic users.
      `
    },
    {
      id: 3,
      title: "Platform Update: AI-Powered Meal Recommendations Now Live",
      excerpt: "Our new AI system analyzes your health conditions, preferences, and nutritional needs to suggest personalized meals in real-time.",
      category: "platform",
      date: "2024-01-10",
      author: "Tech Team",
      readTime: "2 min read",
      image: "https://cdn.pixabay.com/photo/2016/03/09/09/22/meal-1245905_1280.jpg",
      tags: ["Platform Update", "AI", "Meal Recommendations", "Technology"],
      views: 567,
      likes: 45,
      featured: true,
      content: `
        We're excited to announce our biggest feature update yet:
        
        • AI analyzes your health profile in real-time
        • Personalized meal suggestions based on your conditions
        • Smart grocery lists with local store integration
        • Recipe modifications for dietary restrictions
        
        The AI learns from your preferences and improves recommendations over time.
      `
    },
    {
      id: 4,
      title: "Understanding Thyroid Function: The Role of Iodine and Selenium",
      excerpt: "Learn how these essential minerals support thyroid health and which foods provide the optimal amounts for thyroid function.",
      category: "nutrition",
      date: "2024-01-08",
      author: "Dr. Priya Sharma",
      readTime: "6 min read",
      image: "https://cdn.pixabay.com/photo/2018/04/26/16/22/diet-3352275_1280.jpg",
      tags: ["Thyroid", "Nutrition", "Iodine", "Selenium"],
      views: 743,
      likes: 56,
      featured: false,
      content: `
        Thyroid health is crucial for metabolism and overall well-being. Key nutrients include:
        
        • Iodine: Found in seaweed, dairy, and iodized salt
        • Selenium: Brazil nuts, fish, and eggs
        • Zinc: Pumpkin seeds, chickpeas, and cashews
        • Vitamin D: Sunlight exposure and fortified foods
        
        Our thyroid-support meal plans now include these nutrient-dense foods.
      `
    },
    {
      id: 5,
      title: "Community Spotlight: 50+ Success Stories from Our Users",
      excerpt: "Real transformations from our community members who've improved their health through personalized nutrition plans.",
      category: "platform",
      date: "2024-01-05",
      author: "Community Team",
      readTime: "4 min read",
      image: "https://cdn.pixabay.com/photo/2015/05/31/13/53/woman-792247_1280.jpg",
      tags: ["Success Stories", "Community", "Transformation", "Motivation"],
      views: 1567,
      likes: 123,
      featured: true,
      content: `
        Our community continues to inspire us with incredible transformations:
        
        • Sarah lost 25 lbs and improved her PCOS symptoms
        • Michael reduced his HbA1c from 8.5 to 6.2
        • Priya gained energy and balanced her thyroid naturally
        • David built muscle while managing diabetes
        
        Read their full stories and get inspired for your own journey.
      `
    },
    {
      id: 6,
      title: "New Feature: Medication-Food Interaction Checker",
      excerpt: "Stay safe with our new tool that alerts you about potential interactions between your medications and foods.",
      category: "platform",
      date: "2024-01-03",
      author: "Dr. Sarah Johnson",
      readTime: "3 min read",
      image: "https://cdn.pixabay.com/photo/2017/07/24/19/57/medical-2535753_1280.jpg",
      tags: ["Medication", "Safety", "Food Interactions", "Health"],
      views: 456,
      likes: 34,
      featured: false,
      content: `
        Your safety is our priority. Our new interaction checker covers:
        
        • Common diabetes medications
        • Thyroid hormone replacements
        • Blood pressure medications
        • Supplements and vitamins
        
        Get instant alerts when logging foods that might interact with your medications.
      `
    },
    {
      id: 7,
      title: "Research Update: Mediterranean Diet and PCOS Management",
      excerpt: "New evidence suggests the Mediterranean diet may be more effective than low-carb diets for managing PCOS symptoms.",
      category: "research",
      date: "2024-01-01",
      author: "Dr. Michael Chen",
      readTime: "5 min read",
      image: "https://cdn.pixabay.com/photo/2016/06/02/02/08/table-1430158_1280.jpg",
      tags: ["Mediterranean Diet", "PCOS", "Research", "Women's Health"],
      views: 678,
      likes: 52,
      featured: false,
      content: `
        A groundbreaking study published in the Journal of Women's Health reveals:
        
        • 40% improvement in insulin sensitivity
        • Better hormone balance compared to low-carb diets
        • Reduced inflammation markers
        • Improved quality of life scores
        
        Our Mediterranean PCOS meal plans are now available in the app.
      `
    },
    {
      id: 8,
      title: "Hydration Guide: How Much Water Do You Really Need?",
      excerpt: "Debunking the 8-glasses myth and providing personalized hydration recommendations based on your activity level and health conditions.",
      category: "nutrition",
      date: "2023-12-28",
      author: "Dr. Priya Sharma",
      readTime: "4 min read",
      image: "https://cdn.pixabay.com/photo/2015/11/19/14/01/water-1052284_1280.jpg",
      tags: ["Hydration", "Water", "Health Tips", "Wellness"],
      views: 834,
      likes: 61,
      featured: false,
      content: `
        Proper hydration is more complex than the old "8 glasses" rule:
        
        • Your needs vary based on activity, climate, and health
        • People with diabetes may need more water
        • Certain medications affect hydration needs
        • Quality matters as much as quantity
        
        Use our hydration calculator to find your personal daily goal.
      `
    }
  ];

  useEffect(() => {
    let filtered = newsUpdates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(news =>
        news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        news.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        news.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredNews(filtered);
  }, [selectedCategory, searchTerm]);

  const NewsCard = ({ news, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass-card overflow-hidden hover:shadow-xl transition-all duration-300 ${
        news.featured ? 'ring-2 ring-sage/20' : ''
      }`}
      whileHover={{ scale: 1.02 }}
    >
      {news.featured && (
        <div className="bg-gradient-to-r from-sage to-light-green text-white px-4 py-2 text-sm font-medium">
          ⭐ Featured Article
        </div>
      )}
      
      <div className="relative">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-sm font-medium text-gray-700">{news.readTime}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {new Date(news.date).toLocaleDateString()}
              </span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{news.author}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{news.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{news.likes}</span>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
          {news.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {news.excerpt}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {news.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-sage/10 text-sage text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button className="flex items-center space-x-2 text-sage hover:text-sage/80 transition-colors">
            <span className="font-medium">Read More</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MessageCircle className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const FeaturedCard = ({ news }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden mb-8 hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.01 }}
    >
      <div className="md:flex">
        <div className="md:w-1/2">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-64 md:h-full object-cover"
          />
        </div>
        <div className="md:w-1/2 p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-sage">Featured Article</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {news.title}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {news.excerpt}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {news.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-sage/10 text-sage text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(news.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{news.readTime}</span>
              </div>
            </div>
            
            <button className="flex items-center space-x-2 bg-sage text-white px-6 py-2 rounded-xl hover:bg-sage/90 transition-colors">
              <span>Read Article</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const featuredNews = newsUpdates.filter(news => news.featured)[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-green via-cream to-powder-blue p-4 relative">
      <PageBackground variant="default" />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Health News & Updates
          </h1>
          <p className="text-gray-600 text-lg">
            Stay informed with the latest health research, platform updates, and nutrition insights
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent"
              >
                {newsCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto space-x-4 mb-8 pb-2">
          {newsCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-sage text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-sage/10'
              }`}
            >
              <category.icon className="w-5 h-5" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {featuredNews && selectedCategory === 'all' && (
          <FeaturedCard news={featuredNews} />
        )}

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((news, index) => (
            <NewsCard key={news.id} news={news} index={index} />
          ))}
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 glass-card p-8 text-center"
        >
          <Bell className="w-16 h-16 text-sage mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Stay Updated
          </h3>
          <p className="text-gray-600 mb-6">
            Get the latest health news and platform updates delivered to your inbox
          </p>
          <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent"
            />
            <button className="bg-sage text-white px-6 py-3 rounded-2xl hover:bg-sage/90 transition-colors">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewsUpdates;