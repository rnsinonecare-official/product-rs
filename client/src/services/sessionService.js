// Session Management Service with Analytics and Auto-logout
import { signOut } from 'firebase/auth';
import { doc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import storageService from './storageService';

class SessionService {
  constructor() {
    this.SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute
    this.WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before timeout

    this.sessionData = {
      userId: null,
      sessionStart: null,
      lastActivity: null,
      loginMethod: null,
      deviceInfo: null,
      pagesVisited: [],
      featuresUsed: [],
      isActive: false,
      warningShown: false
    };

    this.activityTimer = null;
    this.warningTimer = null;
    this.logoutTimer = null;

    this.init();
  }

  init() {
    // Listen for user activity events
    this.setupActivityListeners();

    // Session monitoring will start when user logs in via startSession()
  }

  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const updateActivity = () => {
      if (this.sessionData.isActive) {
        this.updateLastActivity();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Also listen for visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.sessionData.isActive) {
        this.updateLastActivity();
      }
    });
  }

  async startSession(user, loginMethod = 'email') {
    console.log('🚀 Starting user session for:', user.uid);

    this.sessionData = {
      userId: user.uid,
      sessionStart: Date.now(),
      lastActivity: Date.now(),
      loginMethod,
      deviceInfo: this.getDeviceInfo(),
      pagesVisited: [window.location.pathname],
      featuresUsed: [],
      isActive: true,
      warningShown: false
    };

    // Save session start to Firestore
    await this.saveSessionStart();

    // Start monitoring
    this.startActivityMonitoring();

    // Track page navigation
    this.trackPageNavigation();

    console.log('✅ Session started successfully');
  }

  endSession() {
    console.log('🛑 Ending user session');

    if (this.sessionData.userId) {
      // Save session end data
      this.saveSessionEnd();

      // Clear timers
      this.clearTimers();

      // Reset session data
      this.sessionData = {
        userId: null,
        sessionStart: null,
        lastActivity: null,
        loginMethod: null,
        deviceInfo: null,
        pagesVisited: [],
        featuresUsed: [],
        isActive: false,
        warningShown: false
      };
    }
  }

  startActivityMonitoring() {
    // Clear any existing timers
    this.clearTimers();

    // Set warning timer (13 minutes from now)
    this.warningTimer = setTimeout(() => {
      this.showInactivityWarning();
    }, this.SESSION_TIMEOUT - this.WARNING_TIME);

    // Set logout timer (15 minutes from now)
    this.logoutTimer = setTimeout(() => {
      this.autoLogout();
    }, this.SESSION_TIMEOUT);

    // Set activity check timer
    this.activityTimer = setInterval(() => {
      this.checkActivity();
    }, this.ACTIVITY_CHECK_INTERVAL);
  }

  clearTimers() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  updateLastActivity() {
    if (this.sessionData.isActive) {
      this.sessionData.lastActivity = Date.now();

      // Reset timers if user becomes active again
      if (this.sessionData.warningShown) {
        this.sessionData.warningShown = false;
        this.startActivityMonitoring(); // Restart timers
        this.hideInactivityWarning();
      }
    }
  }

  checkActivity() {
    if (!this.sessionData.isActive) return;

    const now = Date.now();
    const timeSinceActivity = now - this.sessionData.lastActivity;

    // Update session duration in analytics
    this.updateSessionAnalytics();

    if (timeSinceActivity >= this.SESSION_TIMEOUT) {
      this.autoLogout();
    }
  }

  showInactivityWarning() {
    if (this.sessionData.warningShown) return;

    this.sessionData.warningShown = true;

    // Create and show warning modal
    const warningModal = document.createElement('div');
    warningModal.id = 'inactivity-warning';
    warningModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 420px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      text-align: center;
      position: relative;
      animation: modalSlideIn 0.3s ease-out;
    `;

    modalContent.innerHTML = `
      <div style="font-size: 3.5rem; margin-bottom: 1rem;">⏰</div>
      <h3 style="margin: 0 0 1rem 0; color: #111827; font-size: 1.5rem; font-weight: 700; line-height: 1.2;">
        Session Timeout Warning
      </h3>
      <p style="margin: 0 0 2rem 0; color: #6b7280; font-size: 1rem; line-height: 1.5;">
        You will be automatically logged out in 2 minutes due to inactivity.<br>
        Click "Stay Logged In" to continue your session.
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <button id="stay-logged-in" style="
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 0.875rem 2rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          min-width: 140px;
        ">Stay Logged In</button>
        <button id="logout-now" style="
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 0.875rem 2rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          min-width: 140px;
        ">Logout Now</button>
      </div>
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      #stay-logged-in:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
      }
      #logout-now:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
      }
    `;
    document.head.appendChild(style);

    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    warningModal.appendChild(modalContent);
    document.body.appendChild(warningModal);

    // Add event listeners with proper cleanup
    const stayButton = document.getElementById('stay-logged-in');
    const logoutButton = document.getElementById('logout-now');

    const handleStayLoggedIn = () => {
      this.updateLastActivity();
      this.hideInactivityWarning();
      style.remove();
    };

    const handleLogoutNow = () => {
      this.manualLogout();
      style.remove();
    };

    stayButton.addEventListener('click', handleStayLoggedIn);
    logoutButton.addEventListener('click', handleLogoutNow);

    // Store references for cleanup
    warningModal._cleanup = () => {
      stayButton.removeEventListener('click', handleStayLoggedIn);
      logoutButton.removeEventListener('click', handleLogoutNow);
      style.remove();
    };
  }

  hideInactivityWarning() {
    const warningModal = document.getElementById('inactivity-warning');
    if (warningModal) {
      // Run cleanup function if it exists
      if (warningModal._cleanup) {
        warningModal._cleanup();
      }
      // Remove modal from DOM
      warningModal.remove();
    }

    // Restore body scrolling
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    this.sessionData.warningShown = false;
  }

  async autoLogout() {
    console.log('🚪 Auto-logging out due to inactivity');

    // Track logout analytics
    await this.trackLogout('auto_inactivity');

    // Clear session
    this.endSession();

    // Sign out from Firebase
    try {
      await signOut(auth);
      console.log('✅ Auto-logout successful');

      // Show logout message
      this.showLogoutMessage('You have been automatically logged out due to inactivity.');
    } catch (error) {
      console.error('❌ Auto-logout error:', error);
    }
  }

  async manualLogout() {
    console.log('👋 Manual logout requested');

    // Track logout analytics
    await this.trackLogout('manual');

    // Clear session
    this.endSession();

    // Sign out from Firebase
    try {
      await signOut(auth);
      console.log('✅ Manual logout successful');
    } catch (error) {
      console.error('❌ Manual logout error:', error);
    }
  }

  showLogoutMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.id = 'logout-message';
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);
      z-index: 10002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 320px;
      animation: slideInRight 0.3s ease-out;
    `;

    messageDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="font-size: 1.25rem;">✅</div>
        <p style="margin: 0; font-weight: 500; font-size: 0.95rem; line-height: 1.4;">${message}</p>
      </div>
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);

    // Prevent body scrolling when message is shown
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    document.body.appendChild(messageDiv);

    // Auto-remove after 5 seconds with fade out
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove();
            style.remove();
            // Restore body scrolling
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
          }
        }, 300);
      }
    }, 5000);

    // Add slideOutRight animation
    setTimeout(() => {
      const slideOutStyle = document.createElement('style');
      slideOutStyle.textContent = `
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `;
      document.head.appendChild(slideOutStyle);
    }, 4500);
  }

  trackPageNavigation() {
    let currentPage = window.location.pathname;

    const trackPage = () => {
      const newPage = window.location.pathname;
      if (newPage !== currentPage && this.sessionData.isActive) {
        currentPage = newPage;
        this.sessionData.pagesVisited.push({
          page: newPage,
          timestamp: Date.now()
        });

        // Keep only last 20 pages to avoid memory issues
        if (this.sessionData.pagesVisited.length > 20) {
          this.sessionData.pagesVisited = this.sessionData.pagesVisited.slice(-20);
        }

        // Track page visit in analytics
        this.trackFeatureUsage('page_visit', { page: newPage });
      }
    };

    // Listen for navigation events
    window.addEventListener('popstate', trackPage);

    // Also track programmatic navigation (for SPAs)
    // eslint-disable-next-line no-restricted-globals
    const originalPushState = history.pushState;
    // eslint-disable-next-line no-restricted-globals
    history.pushState = function(state, title, url) {
      originalPushState.apply(this, arguments);
      setTimeout(trackPage, 0); // Small delay to ensure URL has changed
    };
  }

  trackFeatureUsage(feature, data = {}) {
    if (!this.sessionData.isActive) return;

    const usage = {
      feature,
      timestamp: Date.now(),
      data
    };

    this.sessionData.featuresUsed.push(usage);

    // Keep only last 50 feature usages
    if (this.sessionData.featuresUsed.length > 50) {
      this.sessionData.featuresUsed = this.sessionData.featuresUsed.slice(-50);
    }
  }

  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      // eslint-disable-next-line no-restricted-globals
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      isTablet: /Tablet|iPad/i.test(navigator.userAgent),
      browser: this.getBrowserInfo()
    };
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  async saveSessionStart() {
    try {
      const sessionDoc = {
        userId: this.sessionData.userId,
        sessionStart: new Date(this.sessionData.sessionStart),
        loginMethod: this.sessionData.loginMethod,
        deviceInfo: this.sessionData.deviceInfo,
        isActive: true,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'userSessions'), sessionDoc);
      this.sessionData.sessionId = docRef.id;

      console.log('✅ Session start saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving session start:', error);
    }
  }

  async saveSessionEnd() {
    try {
      if (!this.sessionData.sessionId) return;

      const sessionEnd = Date.now();
      const duration = sessionEnd - this.sessionData.sessionStart;

      const updateData = {
        sessionEnd: new Date(sessionEnd),
        duration: duration,
        pagesVisited: this.sessionData.pagesVisited,
        featuresUsed: this.sessionData.featuresUsed,
        isActive: false,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'userSessions', this.sessionData.sessionId), updateData);

      console.log('✅ Session end saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving session end:', error);
    }
  }

  async updateSessionAnalytics() {
    try {
      if (!this.sessionData.sessionId) return;

      const currentDuration = Date.now() - this.sessionData.sessionStart;

      await updateDoc(doc(db, 'userSessions', this.sessionData.sessionId), {
        currentDuration: currentDuration,
        lastActivity: new Date(this.sessionData.lastActivity),
        pagesVisited: this.sessionData.pagesVisited,
        featuresUsed: this.sessionData.featuresUsed,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error updating session analytics:', error);
    }
  }

  async trackLogout(logoutType) {
    try {
      const logoutData = {
        userId: this.sessionData.userId,
        sessionId: this.sessionData.sessionId,
        logoutType: logoutType, // 'manual', 'auto_inactivity', 'browser_close'
        timestamp: serverTimestamp(),
        sessionDuration: Date.now() - this.sessionData.sessionStart,
        deviceInfo: this.sessionData.deviceInfo
      };

      await addDoc(collection(db, 'userLogouts'), logoutData);
      console.log('✅ Logout tracked:', logoutType);
    } catch (error) {
      console.error('❌ Error tracking logout:', error);
    }
  }

  // Public methods for external use
  getSessionInfo() {
    return {
      isActive: this.sessionData.isActive,
      sessionStart: this.sessionData.sessionStart,
      lastActivity: this.sessionData.lastActivity,
      timeRemaining: this.sessionData.isActive ?
        Math.max(0, this.SESSION_TIMEOUT - (Date.now() - this.sessionData.lastActivity)) : 0,
      warningShown: this.sessionData.warningShown
    };
  }

  extendSession() {
    if (this.sessionData.isActive) {
      this.updateLastActivity();
      console.log('⏰ Session extended due to user activity');
    }
  }

  forceLogout() {
    this.manualLogout();
  }
}

// Create and export singleton instance
const sessionService = new SessionService();
export default sessionService;