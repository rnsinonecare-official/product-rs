import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Auth from './components/Auth/Auth';
import Onboarding from './components/Onboarding/Onboarding';
import Dashboard from './components/Dashboard/Dashboard';
import AboutUs from './components/AboutUs/AboutUs';

import FoodAnalysis from './components/FoodAnalysis/FoodAnalysis';
import RecipeGenerator from './components/RecipeGenerator/RecipeGenerator';
import ProgressTracker from './components/ProgressTracker/ProgressTracker';
import Community from './components/Community/Community';
import Navigation from './components/Navigation/Navigation';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
// import FoodAnalysisRecipe from './components/FoodAnalysisRecipe/FoodAnalysisRecipe';
import Doctors from './components/Nutritionist/Nutritionist';
import NewsUpdates from './components/NewsUpdates/NewsUpdates';
import Chatbot from './components/Chatbot/Chatbot';
import TermsConditions from './components/TermsConditions/TermsConditions';
import ProfileSettings from './components/Profile/ProfileSettings';
import Settings from './pages/Settings';
import AdminPanel from './components/Admin/AdminPanel';
import Mystery from './components/Mystery/Mystery';
import ErrorBoundary from './components/shared/ErrorBoundary';
import FloatingBackground from './components/shared/FloatingBackground';
import NetworkStatus from './components/shared/NetworkStatus';

import WelcomeBack from './components/shared/WelcomeBack';
import Footer from './components/shared/Footer';

// Context
import { UserProvider, useUser } from './context/UserContext';
import { HealthDataProvider } from './context/HealthDataContext';

// Services
import sessionService from './services/sessionService';

// Import Firebase instances
import { auth, db } from './firebase/config';

// Export Firebase instances for other components
export { auth, db };

console.log('App starting with Firebase authentication');

// Main App Component that uses contexts
function AppContent() {
  const [currentPage, setCurrentPage] = useState('auth');
  const { user, userProfile, loading, isAuthenticated } = useUser();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Start session tracking for authenticated users
        if (user.uid) {
          sessionService.startSession(user, 'email');
        }
        
        // Check if we have a user profile
        if (userProfile) {
          if (userProfile.isProfileComplete) {
            setCurrentPage('dashboard');
          } else {
            setCurrentPage('onboarding');
          }
        }
      } else if (!isAuthenticated) {
        // End session when user logs out
        sessionService.endSession();
        setCurrentPage('auth');
      }
    }
  }, [user, userProfile, loading, isAuthenticated]);

  // Cleanup session on component unmount
  useEffect(() => {
    return () => {
      sessionService.endSession();
    };
  }, []);

  const handleAuthSuccess = async (authResult) => {
    // authResult has { user, profile } structure
    
    // Start user session tracking
    try {
      if (authResult.user && authResult.user.uid) {
        await sessionService.startSession(authResult.user, 'email');
        console.log('User session started for:', authResult.user.uid);
      }
    } catch (error) {
      console.error('Failed to start user session:', error);
      // Don't block login if session tracking fails
    }
    
    if (!authResult.profile || !authResult.profile.isProfileComplete) {
      setCurrentPage('onboarding');
    } else {
      setCurrentPage('dashboard');
    }
  };



  const handleOnboardingComplete = () => {
    // For authenticated users, the useEffect will handle navigation
    // based on userProfile.isProfileComplete
    
    // Fallback: Force navigation after 3 seconds if profile doesn't update
    setTimeout(() => {
      setCurrentPage('dashboard');
    }, 3000);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-pastel-green via-cream to-powder-blue relative">
        <FloatingBackground />
        
        <div style={{ zIndex: 10003 }}>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        </div>
        
        <Routes>
          {/* User app routes */}
          <Route path="/*" element={
            <>
              {currentPage === 'auth' ? (
                <Auth onAuthSuccess={handleAuthSuccess} />
              ) : currentPage === 'onboarding' ? (
                <Onboarding onComplete={handleOnboardingComplete} />
              ) : (
                <>
                  <Navigation />
                  <main className="pt-16 sm:pt-20 pb-6 sm:pb-8 relative z-10">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/food-analysis" element={<FoodAnalysis />} />
                      <Route path="/recipes" element={<RecipeGenerator />} />
                      <Route path="/doctors" element={<Doctors />} />
                      <Route path="/news" element={<NewsUpdates />} />
                      <Route path="/progress" element={<ProgressTracker />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/profile" element={<ProfileSettings />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/admin" element={<AdminPanel />} />
                      <Route path="/mystery" element={<Mystery />} />
                      <Route path="/unrevealed" element={<Mystery />} />
                      <Route path="/terms" element={<TermsConditions />} />
                    </Routes>
                  </main>
                  <Footer />
                  <Chatbot />
                </>
              )}
            </>
          } />
        </Routes>
        
        {/* Welcome back message for returning users */}
        <WelcomeBack />
        
        {/* Network status indicator */}
        <NetworkStatus />

      </div>
    </Router>
  );
}

// Main App wrapper with providers
function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <HealthDataProvider>
          <AppContent />
        </HealthDataProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;