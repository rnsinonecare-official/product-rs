import React, { useState } from 'react';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDemoMode] = useState(false); // demo disabled by UI

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Admin ID is required';
    } else if (formData.email.includes('@')) {
      // We use a strict admin ID; avoid email validation pattern
      newErrors.email = 'Use Admin ID, not an email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let response;

      if (isDemoMode) {
        // Demo mode - simulate successful login
        response = {
          token: 'demo-admin-token-' + Date.now(),
          user: { email: formData.email, role: 'admin' }
        };
        toast.success('Demo login successful!');
      } else {
        // Production mode - authenticate with backend using strict admin ID
        const payload = { username: formData.email, password: formData.password };
        response = await adminService.login(payload);
        toast.success('Login successful!');
      }

      onLogin(response.token);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      setErrors({
        general: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Demo helpers disabled for production-only auth
  const handleDemoLogin = () => {};
  const handleProductionLogin = () => {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      {/* Simple background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Portal
            </h1>

            <p className="text-gray-300">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Mode Toggle (disabled: production only) */}
          <div className="hidden">
            <button onClick={handleProductionLogin}>Production</button>
            <button onClick={handleDemoLogin}>Demo</button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 text-sm">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-gray-200 text-sm font-semibold">
                Admin ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-white/15 backdrop-blur-sm border-2 ${
                    errors.email ? 'border-red-400 bg-red-500/10' : 'border-white/30 hover:border-white/50 focus:border-blue-400'
                  } rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300`}
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-red-300 text-sm">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-gray-200 text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-white/15 backdrop-blur-sm border-2 ${
                    errors.password ? 'border-red-400 bg-red-500/10' : 'border-white/30 hover:border-white/50 focus:border-blue-400'
                  } rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-200 p-1 rounded-md hover:bg-white/10"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-300 text-sm">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              © 2024 Rainscare Admin Portal. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;