import React from 'react';

const AnimatedSection = ({ 
  children, 
  className = '',
  ...props 
}) => {
  // Simplified - just return a regular div without animations
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;