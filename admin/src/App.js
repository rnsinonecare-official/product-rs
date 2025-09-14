import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Announcements from './pages/Announcements';
import Updates from './pages/Updates';
import HealthTips from './pages/HealthTips';
import SuccessStories from './pages/SuccessStories';
import Doctors from './pages/Doctors';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen admin-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-900">
        <Sidebar isOpen={sidebarOpen} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onLogout={handleLogout}
          />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/updates" element={<Updates />} />
              <Route path="/health-tips" element={<HealthTips />} />
              <Route path="/success-stories" element={<SuccessStories />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/users" element={<Users />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </Router>
  );
}

export default App;