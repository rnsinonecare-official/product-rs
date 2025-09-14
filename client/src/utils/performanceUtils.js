// Performance optimization utilities

/**
 * Throttle function - limits the rate at which a function can fire
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} - The throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

/**
 * Debounce function - delays the execution of a function until after a specified delay
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return function() {
    const args = arguments;
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(context, args), delay);
  }
};

/**
 * Optimized interval that only runs when the tab is visible
 * @param {Function} callback - The function to call
 * @param {number} interval - The interval in milliseconds
 * @returns {Function} - Cleanup function
 */
export const createOptimizedInterval = (callback, interval) => {
  let intervalId;
  let isVisible = !document.hidden;

  const startInterval = () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(callback, interval);
  };

  const stopInterval = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const handleVisibilityChange = () => {
    isVisible = !document.hidden;
    if (isVisible) {
      startInterval();
    } else {
      stopInterval();
    }
  };

  // Start the interval if the page is visible
  if (isVisible) {
    startInterval();
  }

  // Listen for visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    stopInterval();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

/**
 * Batch API calls to reduce server load
 * @param {Array} requests - Array of request functions
 * @param {number} batchSize - Number of requests per batch
 * @param {number} delay - Delay between batches in milliseconds
 * @returns {Promise} - Promise that resolves when all batches are complete
 */
export const batchRequests = async (requests, batchSize = 5, delay = 100) => {
  const results = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(request => request()));
    results.push(...batchResults);
    
    // Add delay between batches to prevent overwhelming the server
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
};

/**
 * Memoization utility for expensive calculations
 * @param {Function} fn - The function to memoize
 * @param {Function} keyGenerator - Function to generate cache key (optional)
 * @returns {Function} - The memoized function
 */
export const memoize = (fn, keyGenerator = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return function(...args) {
    const key = keyGenerator(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

/**
 * Lazy loading utility for components
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} fallback - Fallback component while loading
 * @returns {React.Component} - Lazy loaded component
 */
export const createLazyComponent = (importFunc, fallback = null) => {
  const React = require('react');
  const LazyComponent = React.lazy(importFunc);
  
  return (props) => (
    <React.Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startTimer(name) {
    this.metrics.set(name, performance.now());
  }

  endTimer(name) {
    const startTime = this.metrics.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      console.log(`${name} took ${duration.toFixed(2)}ms`);
      this.metrics.delete(name);
      return duration;
    }
    return null;
  }

  measureFunction(fn, name) {
    return (...args) => {
      this.startTimer(name);
      const result = fn(...args);
      this.endTimer(name);
      return result;
    };
  }

  measureAsyncFunction(fn, name) {
    return async (...args) => {
      this.startTimer(name);
      const result = await fn(...args);
      this.endTimer(name);
      return result;
    };
  }
}

// Create a global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();