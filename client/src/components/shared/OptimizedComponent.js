import React, { memo, useMemo, useCallback } from 'react';

/**
 * Higher-order component for performance optimization
 * Wraps components with React.memo and provides optimization utilities
 */
export const withPerformanceOptimization = (Component, customComparison = null) => {
  const OptimizedComponent = memo(Component, customComparison);
  OptimizedComponent.displayName = `Optimized(${Component.displayName || Component.name})`;
  return OptimizedComponent;
};

/**
 * Custom hook for memoizing expensive calculations
 */
export const useOptimizedMemo = (factory, deps) => {
  return useMemo(factory, deps);
};

/**
 * Custom hook for memoizing callback functions
 */
export const useOptimizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

/**
 * Component for lazy loading images with intersection observer
 */
export const LazyImage = memo(({ src, alt, className, placeholder, ...props }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <>
          {!isLoaded && placeholder && (
            <div className="animate-pulse bg-gray-200 w-full h-full rounded" />
          )}
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            style={{ display: isLoaded ? 'block' : 'none' }}
            {...props}
          />
        </>
      )}
    </div>
  );
});

/**
 * Virtualized list component for large datasets
 */
export const VirtualizedList = memo(({ 
  items, 
  renderItem, 
  itemHeight = 50, 
  containerHeight = 400,
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef();

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + overscan,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={visibleStart + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

/**
 * Debounced input component
 */
export const DebouncedInput = memo(({ 
  value, 
  onChange, 
  delay = 300, 
  ...props 
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const timeoutRef = React.useRef();

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  }, [onChange, delay]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      {...props}
      value={localValue}
      onChange={handleChange}
    />
  );
});

/**
 * Performance monitoring component
 */
export const PerformanceMonitor = ({ children, name }) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`${name} render time: ${(endTime - startTime).toFixed(2)}ms`);
    };
  });

  return children;
};

/**
 * Error boundary for performance isolation
 */
export class PerformanceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Performance Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Something went wrong</h3>
          <p className="text-red-600 text-sm">This component failed to load properly.</p>
        </div>
      );
    }

    return this.props.children;
  }
}