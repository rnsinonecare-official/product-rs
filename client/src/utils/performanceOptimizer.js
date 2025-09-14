// Performance optimization utilities for the entire app

/**
 * Optimize React DevTools in production
 */
export const optimizeReactDevTools = () => {
  if (process.env.NODE_ENV === 'production') {
    // Disable React DevTools in production
    if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
      for (let [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === 'function' ? () => {} : null;
      }
    }
  }
};

/**
 * Optimize console logs in production
 */
export const optimizeConsole = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    // Keep console.error for debugging
  }
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  ];

  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
};

/**
 * Optimize images by adding loading="lazy" to all images
 */
export const optimizeImages = () => {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
};

/**
 * Clean up unused event listeners
 */
export const cleanupEventListeners = () => {
  // Remove any orphaned event listeners
  const events = ['resize', 'scroll', 'mousemove', 'touchmove'];
  events.forEach(event => {
    const listeners = window.getEventListeners?.(window)?.[event] || [];
    listeners.forEach(listener => {
      if (listener.useCapture === undefined) {
        window.removeEventListener(event, listener.listener);
      }
    });
  });
};

/**
 * Optimize localStorage usage
 */
export const optimizeLocalStorage = () => {
  try {
    // Clean up old localStorage entries
    const keysToCheck = ['cardViews', 'dailySteps', 'rainscare_admin_settings'];
    
    keysToCheck.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 1000) {
            // Keep only the last 500 items
            const trimmed = parsed.slice(-500);
            localStorage.setItem(key, JSON.stringify(trimmed));
          }
        } catch (e) {
          // If parsing fails, remove the corrupted data
          localStorage.removeItem(key);
        }
      }
    });

    // Check localStorage size and clean if necessary
    const totalSize = Object.keys(localStorage).reduce((total, key) => {
      return total + localStorage.getItem(key).length;
    }, 0);

    // If localStorage is getting too large (>5MB), clean old data
    if (totalSize > 5 * 1024 * 1024) {
      const oldKeys = Object.keys(localStorage).filter(key => 
        key.includes('_old') || key.includes('_backup')
      );
      oldKeys.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('Error optimizing localStorage:', error);
  }
};

/**
 * Debounce resize events
 */
export const optimizeResizeEvents = () => {
  let resizeTimeout;
  const originalAddEventListener = window.addEventListener;
  
  window.addEventListener = function(type, listener, options) {
    if (type === 'resize') {
      const debouncedListener = function(event) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => listener(event), 100);
      };
      return originalAddEventListener.call(this, type, debouncedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
};

/**
 * Optimize scroll events
 */
export const optimizeScrollEvents = () => {
  let scrollTimeout;
  const originalAddEventListener = window.addEventListener;
  
  window.addEventListener = function(type, listener, options) {
    if (type === 'scroll') {
      let ticking = false;
      const optimizedListener = function(event) {
        if (!ticking) {
          requestAnimationFrame(() => {
            listener(event);
            ticking = false;
          });
          ticking = true;
        }
      };
      return originalAddEventListener.call(this, type, optimizedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
};

/**
 * Monitor performance metrics
 */
export const monitorPerformance = () => {
  if ('performance' in window) {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          console.log('Page Load Performance:', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            totalTime: perfData.loadEventEnd - perfData.fetchStart
          });
        }
      }, 0);
    });

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              console.warn('Long task detected:', entry.duration + 'ms');
            }
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // PerformanceObserver not supported
      }
    }
  }
};

/**
 * Initialize all performance optimizations
 */
export const initializePerformanceOptimizations = () => {
  // Run immediately
  optimizeReactDevTools();
  optimizeConsole();
  preloadCriticalResources();
  optimizeResizeEvents();
  optimizeScrollEvents();
  
  // Run after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImages();
      optimizeLocalStorage();
    });
  } else {
    optimizeImages();
    optimizeLocalStorage();
  }
  
  // Run after page is fully loaded
  window.addEventListener('load', () => {
    monitorPerformance();
    
    // Clean up after 5 seconds
    setTimeout(() => {
      cleanupEventListeners();
    }, 5000);
  });
  
  // Clean up localStorage periodically
  setInterval(optimizeLocalStorage, 5 * 60 * 1000); // Every 5 minutes
};

/**
 * Bundle size optimization tips
 */
export const bundleOptimizationTips = {
  // Use dynamic imports for large components
  loadComponentDynamically: (componentPath) => {
    return React.lazy(() => import(componentPath));
  },
  
  // Tree shake unused lodash functions
  optimizeLodash: () => {
    console.warn('Use specific lodash imports: import debounce from "lodash/debounce" instead of import { debounce } from "lodash"');
  },
  
  // Optimize moment.js
  optimizeMoment: () => {
    console.warn('Consider replacing moment.js with date-fns or dayjs for smaller bundle size');
  }
};