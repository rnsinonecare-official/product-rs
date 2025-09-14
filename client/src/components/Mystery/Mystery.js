import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Gift, 
  Sparkles, 
  Star, 
  Heart,
  Zap,
  Crown,
  Gem,
  Clock,
  Bell,
  Mail,
  Calendar
} from 'lucide-react';
import PageBackground from '../shared/PageBackground';
import AnimatedSection from '../shared/AnimatedSection';
import { fadeInUp, scaleIn, bounceIn } from '../../utils/animations';

const Mystery = () => {
  const [showModal, setShowModal] = useState(false);
  const [particles, setParticles] = useState([]);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Generate random particles for background
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
        type: Math.random() > 0.5 ? 'star' : 'sparkle'
      }));
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  // Countdown timer (example: 30 days from now)
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGiftBoxClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleNotifyMe = () => {
    // In a real app, this would save the user's email for notifications
    alert('You\'ll be notified when this feature launches! 🎉');
    closeModal();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <PageBackground variant="mystery" />
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          >
            {particle.type === 'star' ? (
              <Star 
                className="text-purple-300/40" 
                size={particle.size * 4} 
                fill="currentColor"
              />
            ) : (
              <Sparkles 
                className="text-pink-300/40" 
                size={particle.size * 4}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full blur-sm"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${15 + (i % 4) * 20}%`,
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              background: `linear-gradient(45deg, 
                rgba(147, 51, 234, 0.3), 
                rgba(219, 39, 119, 0.3), 
                rgba(59, 130, 246, 0.3)
              )`
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <AnimatedSection animation={fadeInUp} className="text-center max-w-4xl mx-auto">
          
          {/* Premium Title */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-300/30 mb-4"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(147, 51, 234, 0.3)",
                  "0 0 40px rgba(147, 51, 234, 0.5)",
                  "0 0 20px rgba(147, 51, 234, 0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-purple-200 font-medium">Premium Feature</span>
              <Gem className="w-5 h-5 text-pink-400" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 mb-4 tracking-tight">
              Something Amazing
            </h1>
            <h2 className="text-3xl md:text-4xl font-light text-purple-200/80 mb-6">
              is Coming Soon ✨
            </h2>
          </motion.div>

          {/* Enhanced Description */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="text-xl md:text-2xl text-purple-200/90 mb-6 max-w-2xl mx-auto leading-relaxed">
              We're crafting something extraordinary that will revolutionize your health journey
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-purple-300/80">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span>Personalized</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span>Innovative</span>
              </div>
            </div>
          </motion.div>

          {/* Premium Gift Box */}
          <motion.div
            className="relative inline-block cursor-pointer mb-12"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGiftBoxClick}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.8, type: "spring", stiffness: 100 }}
          >
            {/* Gift Box Container */}
            <motion.div
              className="relative w-56 h-56 md:w-64 md:h-64 mx-auto"
              animate={{
                y: [-5, 5, -5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Enhanced Shadow */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-3 bg-black/20 rounded-full blur-md"></div>
              
              {/* Luxury Gift Box */}
              <div className="relative w-full h-full">
                {/* Premium Box Base */}
                <motion.div 
                  className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-3xl shadow-2xl relative overflow-hidden border-2 border-purple-200/50"
                  animate={{
                    boxShadow: [
                      "0 20px 40px rgba(147, 51, 234, 0.2), 0 0 0 1px rgba(147, 51, 234, 0.1)",
                      "0 25px 50px rgba(147, 51, 234, 0.3), 0 0 0 1px rgba(147, 51, 234, 0.2)",
                      "0 20px 40px rgba(147, 51, 234, 0.2), 0 0 0 1px rgba(147, 51, 234, 0.1)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {/* Luxury inner glow */}
                  <div className="absolute inset-3 bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-transparent rounded-2xl"></div>
                  
                  {/* Premium pattern */}
                  <div className="absolute inset-6 border-2 border-purple-200/40 rounded-2xl">
                    <div className="absolute inset-4 border border-purple-100/60 rounded-xl"></div>
                  </div>
                </motion.div>

                {/* Elegant Ribbon - Vertical */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-full bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600 shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/30 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-px h-full bg-purple-700/50"></div>
                </div>
                
                {/* Elegant Ribbon - Horizontal */}
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-4 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full h-px bg-purple-700/50"></div>
                </div>
                
                {/* Luxury Bow */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    {/* Left wing */}
                    <motion.div 
                      className="absolute -left-4 top-2 w-8 h-6 bg-gradient-to-br from-purple-300 via-purple-400 to-purple-500 rounded-full transform -rotate-12 shadow-xl"
                      animate={{ rotate: [-12, -8, -12] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    {/* Right wing */}
                    <motion.div 
                      className="absolute -right-4 top-2 w-8 h-6 bg-gradient-to-br from-purple-300 via-purple-400 to-purple-500 rounded-full transform rotate-12 shadow-xl"
                      animate={{ rotate: [12, 8, 12] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    {/* Center knot */}
                    <div className="absolute left-1/2 top-3 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-full shadow-xl border border-purple-300"></div>
                  </div>
                </div>

                {/* Premium Mystery Symbol */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 rounded-3xl flex items-center justify-center shadow-xl border-2 border-purple-200/50"
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <motion.span 
                      className="text-4xl md:text-5xl"
                      animate={{ 
                        textShadow: [
                          "0 0 10px rgba(147, 51, 234, 0.5)",
                          "0 0 20px rgba(147, 51, 234, 0.8)",
                          "0 0 10px rgba(147, 51, 234, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ✨
                    </motion.span>
                  </motion.div>
                </div>
              </div>

              {/* Enhanced Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(147, 51, 234, 0.2), 0 0 60px rgba(219, 39, 119, 0.1)",
                    "0 0 50px rgba(147, 51, 234, 0.4), 0 0 100px rgba(219, 39, 119, 0.2)",
                    "0 0 30px rgba(147, 51, 234, 0.2), 0 0 60px rgba(219, 39, 119, 0.1)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Floating Magic Elements */}
              {Array.from({ length: 6 }, (_, i) => (
                <motion.div
                  key={`magic-${i}`}
                  className="absolute"
                  style={{
                    left: `${30 + Math.cos(i * 60 * Math.PI / 180) * 80}px`,
                    top: `${30 + Math.sin(i * 60 * Math.PI / 180) * 80}px`,
                  }}
                  animate={{
                    y: [-8, 8, -8],
                    opacity: [0.4, 0.9, 0.4],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 3 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                >
                  {i % 3 === 0 ? (
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  ) : i % 3 === 1 ? (
                    <Sparkles className="w-3 h-3 text-pink-400" />
                  ) : (
                    <Gem className="w-3 h-3 text-purple-400" />
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Click instruction */}
            <motion.p
              className="text-purple-300 text-lg md:text-xl mt-8 font-light tracking-wide"
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Gift className="inline w-5 h-5 mr-2" />
              Click to discover the surprise
            </motion.p>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            {[
              { label: 'Days', value: countdown.days },
              { label: 'Hours', value: countdown.hours },
              { label: 'Minutes', value: countdown.minutes },
              { label: 'Seconds', value: countdown.seconds }
            ].map((item, index) => (
              <div key={item.label} className="text-center">
                <motion.div
                  className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-3 border border-purple-300/30"
                  animate={{
                    scale: item.label === 'Seconds' ? [1, 1.05, 1] : 1
                  }}
                  transition={{
                    duration: 1,
                    repeat: item.label === 'Seconds' ? Infinity : 0
                  }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-purple-300 uppercase tracking-wider">
                    {item.label}
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <motion.button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Bell className="inline w-5 h-5 mr-2" />
              Notify Me When Ready
            </motion.button>
          </motion.div>
        </AnimatedSection>
      </div>

      {/* Enhanced Coming Soon Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-purple-800/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full mx-4 relative border border-purple-400/30 shadow-2xl"
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 text-purple-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Modal content */}
              <div className="text-center">
                {/* Premium icon */}
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 rounded-3xl flex items-center justify-center shadow-xl border-2 border-purple-200/50"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.span 
                    className="text-5xl"
                    animate={{
                      textShadow: [
                        "0 0 20px rgba(147, 51, 234, 0.8)",
                        "0 0 40px rgba(147, 51, 234, 1)",
                        "0 0 20px rgba(147, 51, 234, 0.8)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🎁
                  </motion.span>
                </motion.div>

                <motion.h2
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-4 tracking-wide"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Something Magical
                </motion.h2>

                <motion.h3
                  className="text-2xl font-light text-purple-200 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  is Coming Soon ✨
                </motion.h3>

                <motion.p
                  className="text-purple-200/90 text-lg mb-8 font-light leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  We're putting the finishing touches on something extraordinary that will transform your health journey. 
                  <br /><br />
                  <strong className="text-purple-100">Stay tuned for the big reveal!</strong>
                </motion.p>

                {/* Feature hints */}
                <motion.div
                  className="grid grid-cols-2 gap-4 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {[
                    { icon: Zap, text: "AI-Powered" },
                    { icon: Heart, text: "Personalized" },
                    { icon: Crown, text: "Premium" },
                    { icon: Sparkles, text: "Innovative" }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-2 text-purple-200/80"
                      animate={{
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    >
                      <feature.icon className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm">{feature.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Animated stars */}
                <motion.div
                  className="flex justify-center space-x-2 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 1, 0.6],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    >
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <motion.button
                    onClick={handleNotifyMe}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Bell className="w-5 h-5" />
                    <span>Notify Me</span>
                  </motion.button>

                  <motion.button
                    onClick={closeModal}
                    className="px-6 py-3 bg-white/10 text-purple-200 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 border border-purple-400/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Keep the Mystery ✨
                  </motion.button>
                </motion.div>
              </div>

              {/* Background particles in modal */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {Array.from({ length: 15 }, (_, i) => (
                  <motion.div
                    key={`modal-particle-${i}`}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [-10, 10, -10],
                      opacity: [0.2, 0.6, 0.2],
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "easeInOut"
                    }}
                  >
                    {i % 3 === 0 ? (
                      <Star className="w-2 h-2 text-purple-300/40 fill-current" />
                    ) : (
                      <div className="w-1 h-1 bg-purple-300/40 rounded-full" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Mystery;