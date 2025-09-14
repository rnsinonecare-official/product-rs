import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AnimatedButton = ({ 
  children, 
  onClick, 
  to, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  className = '',
  icon: Icon,
  loading = false,
  ...props 
}) => {
  const baseClasses = "relative inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-2xl overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-sage to-light-green text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white text-sage border-2 border-sage hover:bg-sage hover:text-white",
    outline: "border-2 border-gray-300 text-gray-700 hover:border-sage hover:text-sage",
    ghost: "text-sage hover:bg-sage/10",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700",
    success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700",
    info: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
  };

  const sizes = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg"
  };

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  }`;

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95 }
  };

  const rippleVariants = {
    initial: { scale: 0, opacity: 0.5 },
    animate: { scale: 4, opacity: 0 },
  };

  const ButtonContent = ({ isLoading = false }) => (
    <>
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white rounded-2xl"
        variants={rippleVariants}
        initial="initial"
        whileTap="animate"
        transition={{ duration: 0.4 }}
      />
      
      {/* Button content */}
      <div className="relative z-10 flex items-center space-x-2">
        {isLoading && (
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {Icon && !isLoading && (
          <motion.div
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        )}
        <span>{children}</span>
      </div>
    </>
  );

  const button = (
    <motion.button
      className={buttonClasses}
      variants={buttonVariants}
      initial="initial"
      whileHover={disabled ? "initial" : "hover"}
      whileTap={disabled ? "initial" : "tap"}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      <ButtonContent isLoading={loading} />
    </motion.button>
  );

  const linkButton = (
    <motion.div
      variants={buttonVariants}
      initial="initial"
      whileHover={disabled ? "initial" : "hover"}
      whileTap={disabled ? "initial" : "tap"}
    >
      <Link to={to} className={buttonClasses}>
        <ButtonContent isLoading={loading} />
      </Link>
    </motion.div>
  );

  return to ? linkButton : button;
};

export default AnimatedButton;