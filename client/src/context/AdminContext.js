import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const logoutTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Auto-logout settings
  const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before logout

  useEffect(() => {
    checkAdminSession();
    
    // Cleanup timers on unmount
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const checkAdminSession = () => {
    const adminSession = localStorage.getItem('rainscare_admin_session');
    const loginTime = localStorage.getItem('rainscare_admin_login_time');
    const adminUser = localStorage.getItem('rainscare_admin_user');
    
    // Enhanced security check - validate user identity
    if (adminSession === 'true' && loginTime && adminUser === 'rnsinone') {
      const currentTime = Date.now();
      const sessionTime = parseInt(loginTime);
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
      
      if (currentTime - sessionTime < sessionDuration) {
        setIsAdminAuthenticated(true);
        startAutoLogoutTimer();
      } else {
        // Session expired
        console.log('Admin session expired for user:', adminUser);
        clearAdminSession();
      }
    } else {
      // Invalid session or wrong user
      if (adminSession || loginTime || adminUser) {
        console.warn('Invalid admin session detected, clearing...');
        clearAdminSession();
      }
    }
    
    setIsLoading(false);
  };

  const startAutoLogoutTimer = () => {
    // Clear existing timers
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    // Set auto-logout timer
    logoutTimerRef.current = setTimeout(() => {
      console.log('Admin session auto-logout due to inactivity');
      logoutAdmin();
    }, AUTO_LOGOUT_TIME);

    // Set warning countdown timer
    setTimeout(() => {
      if (isAdminAuthenticated) {
        startCountdown();
      }
    }, AUTO_LOGOUT_TIME - WARNING_TIME);
  };

  const startCountdown = () => {
    let remainingTime = WARNING_TIME / 1000; // Convert to seconds
    setTimeRemaining(remainingTime);

    countdownTimerRef.current = setInterval(() => {
      remainingTime -= 1;
      setTimeRemaining(remainingTime);

      if (remainingTime <= 0) {
        clearInterval(countdownTimerRef.current);
        setTimeRemaining(null);
      }
    }, 1000);
  };

  const resetAutoLogoutTimer = () => {
    if (isAdminAuthenticated) {
      startAutoLogoutTimer();
      setTimeRemaining(null); // Clear any existing countdown
    }
  };

  const loginAdmin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('rainscare_admin_session', 'true');
    localStorage.setItem('rainscare_admin_login_time', Date.now().toString());
    localStorage.setItem('rainscare_admin_user', 'rnsinone');
    startAutoLogoutTimer();
  };

  const logoutAdmin = () => {
    // Clear timers
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    clearAdminSession();
    setIsAdminAuthenticated(false);
    setTimeRemaining(null);
  };

  const clearAdminSession = () => {
    localStorage.removeItem('rainscare_admin_session');
    localStorage.removeItem('rainscare_admin_login_time');
    localStorage.removeItem('rainscare_admin_user');
  };

  const value = {
    isAdminAuthenticated,
    isLoading,
    timeRemaining,
    loginAdmin,
    logoutAdmin,
    resetAutoLogoutTimer
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;