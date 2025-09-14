import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { logoutUser } from '../../services/authService';
import toast from 'react-hot-toast';
import { 
  Home, 
  Camera, 
  ChefHat, 
  TrendingUp, 
  Users, 
  Menu, 
  X,
  Heart,
  User,
  Settings,
  LogOut,
  Newspaper,
  BarChart3,
  Shield,
  Lock,
  Gem,
  Crown,
  BookOpen
} from 'lucide-react';
import rainscareLogo from '../../images/RAINSCARE WOB.png';

// Animation variants
const navbarSlide = {
  hidden: { y: -100 },
  visible: { y: 0 }
};

const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

const tapScale = {
  scale: 0.95
};

const pulseAnimation = {
  scale: [1, 1.1, 1],
  transition: { duration: 2, repeat: Infinity }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
};

const slideInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const floatingAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity }
};

const scrollDirection = 'up'; // This would normally be calculated based on scroll

const Navigation = () => {
  const location = useLocation();
  const { userProfile, clearUserData } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/food-analysis', label: 'Food & Recipes', icon: Camera },
    { path: '/doctors', label: 'Doctors', icon: Heart },
    { path: '/blogs', label: 'Blogs', icon: BookOpen },
    { path: '/unrevealed', label: 'Unrevealed', icon: Gem },
    { path: '/about', label: 'About Us', icon: Users },
  ];

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin' || userProfile?.isAdmin || userProfile?.email === 'admin@rainscare.com';

  const profileMenuItems = [
    { path: '/profile', label: 'Profile Settings', icon: User },
    { path: '/settings', label: 'Goals & Settings', icon: Settings },
    { path: '/news', label: 'News & Updates', icon: Newspaper },
    { path: '/progress', label: 'Progress', icon: BarChart3 },
    { path: '/community', label: 'Community', icon: Users },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin Panel', icon: Shield }] : []),
  ];

  const handleLogout = async () => {
    try {
      toast.loading('Logging out...', { id: 'logout' });
      await logoutUser();
      clearUserData();
      toast.success('Logged out successfully!', { id: 'logout' });
      // The app will automatically redirect to auth page due to isAuthenticated becoming false
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.', { id: 'logout' });
      // Fallback: clear data anyway and reload
      clearUserData();
      window.location.reload();
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={navbarSlide}
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 border-b border-white/30 shadow-lg'
            : 'bg-white/90 border-b border-white/20'
        } ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'}`}
        style={{
          transform: scrollDirection === 'down' ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 min-h-[56px] sm:min-h-[64px]">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2"
              whileHover={hoverScale}
              whileTap={tapScale}
            >
              <motion.div 
                className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 bg-white rounded-full flex items-center justify-center p-2"
                animate={pulseAnimation}
              >
                <img 
                  src={rainscareLogo} 
                  alt="Rainscare Logo" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <motion.span 
                className="text-xl font-bold gradient-text hidden sm:block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Rainscare
              </motion.span>
            </motion.div>

            {/* Desktop Menu */}
            <motion.div 
              className="hidden md:flex items-center space-x-1"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      className={`flex items-center px-3 py-2 rounded-xl transition-all duration-300 min-h-[40px] relative overflow-hidden flying-tab ${
                        isActive 
                          ? 'bg-sage text-white shadow-lg' 
                          : 'text-gray-600 hover:bg-sage/10 hover:text-sage'
                      }`}
                      variants={fadeInDown}
                      whileHover={{
                        scale: 1.05,
                        y: -2,
                        boxShadow: "0 8px 25px rgba(144, 238, 144, 0.3)",
                        rotateY: 5,
                      }}
                      whileTap={tapScale}
                      transition={{ delay: index * 0.1 }}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-sage to-light-green"
                          layoutId="activeTab"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <motion.div className="relative z-10 flex items-center">
                        <motion.div
                          animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <item.icon className="w-5 h-5 mr-2 flex-shrink-0" />
                        </motion.div>
                        <span className="font-medium text-sm lg:text-base">{item.label}</span>
                      </motion.div>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>

            {/* Right Side - Profile and Mobile Menu */}
            <div className="flex items-center space-x-2">
              {/* Profile Menu */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-sage/10 transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 8px 25px rgba(144, 238, 144, 0.2)",
                }}
                whileTap={tapScale}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-br from-sage to-light-green rounded-full flex items-center justify-center"
                  animate={floatingAnimation}
                >
                  <span className="text-white text-sm font-bold">
                    {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </motion.div>
                <motion.span 
                  className="hidden sm:block text-sm font-medium text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {userProfile?.name || 'User'}
                </motion.span>
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95, rotateX: -15 }}
                    transition={{ 
                      type: "spring", 
                      bounce: 0.3, 
                      duration: 0.4 
                    }}
                    className="absolute right-0 mt-2 w-64 bg-white/95 rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                    style={{ transformOrigin: "top right" }}
                  >
                    {/* Profile Info */}
                    <div className="p-4 bg-gradient-to-r from-sage/10 to-light-green/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-sage to-light-green rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {userProfile?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{userProfile?.name}</p>
                          <p className="text-sm text-gray-600">
                            BMI: {userProfile?.bmi} - {userProfile?.bmiCategory}
                          </p>
                          {userProfile?.metabolicAge && (
                            <p className="text-xs text-gray-500">
                              Metabolic Age: {userProfile.metabolicAge} years
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <motion.div 
                      className="p-2"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* Profile Menu Navigation Items */}
                      {profileMenuItems.map((item, index) => (
                        <Link key={item.path} to={item.path} onClick={() => setShowProfileMenu(false)}>
                          <motion.button 
                            className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-sage/10 rounded-xl transition-all duration-300"
                            variants={slideInUp}
                            whileHover={{ 
                              x: 5, 
                              backgroundColor: "rgba(144, 238, 144, 0.1)",
                            }}
                            whileTap={tapScale}
                            transition={{ delay: index * 0.05 }}
                          >
                            <motion.div
                              animate={{ rotate: [0, 10, 0] }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                            >
                              <item.icon className="w-5 h-5 mr-3" />
                            </motion.div>
                            {item.label}
                          </motion.button>
                        </Link>
                      ))}
                      
                      {/* Divider */}
                      <motion.div 
                        className="border-t border-gray-200 my-2"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8 }}
                      />
                      
                      <motion.button 
                        className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-sage/10 rounded-xl transition-all duration-300"
                        variants={slideInUp}
                        whileHover={{ x: 5 }}
                        whileTap={tapScale}
                        onClick={() => {
                          toast.info('Download app feature coming soon!');
                          setShowProfileMenu(false);
                        }}
                      >
                        <Settings className="w-5 h-5 mr-3" />
                        Download App
                      </motion.button>
                      <motion.button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-left text-red-600 hover:bg-red/10 rounded-xl transition-all duration-300"
                        variants={slideInUp}
                        whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                        whileTap={tapScale}
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-sage/10 transition-all duration-300"
              whileHover={{ 
                scale: 1.05,
                rotate: 5,
                boxShadow: "0 8px 25px rgba(144, 238, 144, 0.2)",
              }}
              whileTap={tapScale}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-gray-600" />
                  </motion.div>
                )}
              </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ 
                type: 'spring', 
                bounce: 0.1, 
                duration: 0.5,
                opacity: { duration: 0.3 }
              }}
              className="absolute top-14 sm:top-16 right-0 w-72 sm:w-80 h-full bg-white/98 border-l border-white/20"
            >
              <div className="p-4 sm:p-6">
                {/* Profile Section */}
                <motion.div 
                  className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-sage/10 to-light-green/10 rounded-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-sage to-light-green rounded-full flex items-center justify-center"
                      animate={floatingAnimation}
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <span className="text-white font-bold">
                        {userProfile?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="font-semibold text-gray-800">{userProfile?.name}</p>
                      <p className="text-sm text-gray-600">
                        BMI: {userProfile?.bmi} - {userProfile?.bmiCategory}
                      </p>
                      {userProfile?.metabolicAge && (
                        <p className="text-xs text-gray-500">
                          Metabolic Age: {userProfile.metabolicAge} years
                        </p>
                      )}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Navigation Items */}
                <motion.div 
                  className="space-y-2"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link 
                        key={item.path} 
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <motion.div
                          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden flying-tab ${
                            isActive 
                              ? 'bg-sage text-white shadow-lg' 
                              : 'text-gray-600 hover:bg-sage/10 hover:text-sage'
                          }`}
                          variants={slideInUp}
                          whileHover={{ 
                            scale: 1.02,
                            x: 5,
                            boxShadow: "0 8px 25px rgba(144, 238, 144, 0.2)",
                            rotateY: 3,
                          }}
                          whileTap={tapScale}
                          transition={{ delay: index * 0.1 }}
                        >
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-sage to-light-green"
                              layoutId="activeMobileTab"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <motion.div className="relative z-10 flex items-center">
                            <motion.div
                              animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
                              transition={{ duration: 0.5 }}
                            >
                              <item.icon className="w-5 h-5 mr-3" />
                            </motion.div>
                            <span className="font-medium">{item.label}</span>
                          </motion.div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </motion.div>

                {/* Bottom Actions */}
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 space-y-2">
                  <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-sage/10 rounded-xl transition-all duration-300">
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red/10 rounded-xl transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </>
  );
};

export default Navigation;