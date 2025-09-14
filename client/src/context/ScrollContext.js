import React, { createContext, useContext } from 'react';

const ScrollContext = createContext();

export const useScroll = () => {
  // Return static values to avoid performance issues
  return {
    scrollY: 0,
    scrollProgress: 0,
    getDarknessLevel: () => 0,
    getScrollOverlayStyle: () => ({ display: 'none' })
  };
};

export const ScrollProvider = ({ children }) => {
  // Simplified provider without scroll listeners
  const value = {
    scrollY: 0,
    scrollProgress: 0,
    getDarknessLevel: () => 0,
    getScrollOverlayStyle: () => ({ display: 'none' })
  };

  return (
    <ScrollContext.Provider value={value}>
      {children}
    </ScrollContext.Provider>
  );
};

export default ScrollContext;