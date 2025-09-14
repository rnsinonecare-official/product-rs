// Minimal animation utilities for better performance

// Simple fade in animation
export const fadeInUp = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
};

export const fadeInLeft = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
};

export const fadeInRight = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2 }
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const cardHover = {
  whileHover: { scale: 1.02 },
  transition: { duration: 0.2 }
};

export const tapScale = {
  whileTap: { scale: 0.98 }
};

// Remove heavy animations - just return empty objects
export const floatingAnimation = {};
export const pulseAnimation = {};
export const bounceIn = fadeInUp;
export const slideInFromLeft = fadeInLeft;
export const slideInFromRight = fadeInRight;
export const rotateIn = scaleIn;
export const zoomIn = scaleIn;