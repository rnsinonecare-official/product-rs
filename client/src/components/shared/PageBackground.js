import React from 'react';
import { motion } from 'framer-motion';

const PageBackground = ({ variant = 'default' }) => {
  // Enhanced background variants
  const variants = {
    default: 'rgba(144, 238, 144, 0.05)',
    dashboard: 'rgba(144, 238, 144, 0.06)',
    food: 'rgba(255, 165, 0, 0.05)',
    community: 'rgba(135, 206, 235, 0.06)',
    progress: 'rgba(221, 160, 221, 0.05)',
    mystery: 'mystery' // Special case for mystery page
  };

  const color = variants[variant] || variants.default;

  // Special mystery background
  if (variant === 'mystery') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(219, 39, 119, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
              linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(88, 28, 135, 0.9) 50%, rgba(15, 23, 42, 0.95) 100%)
            `
          }}
          animate={{
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Moving gradient orbs */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              `radial-gradient(circle at 30% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 40%)`,
              `radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 40%)`,
              `radial-gradient(circle at 30% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 40%)`
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Simple static gradient overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${color} 0%, transparent 60%)`
        }}
      />
    </div>
  );
};

export default PageBackground;