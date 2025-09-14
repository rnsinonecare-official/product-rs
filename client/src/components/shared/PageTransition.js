import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.5,
        ease: "easeInOut"
      }}
      className="relative"
    >
      {/* Page transition overlay */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        exit={{ scaleX: 1 }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
        className="fixed inset-0 bg-gradient-to-r from-sage to-light-green z-50 origin-left"
      />
      
      {/* Content with stagger animation */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.3
            }
          }
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PageTransition;