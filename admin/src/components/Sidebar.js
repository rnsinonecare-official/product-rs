import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  Zap,
  Heart,
  Trophy,
  UserCheck,
  Users,
  BarChart3,
  Settings,
  Activity
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/announcements', icon: Megaphone, label: 'Announcements' },
    { path: '/updates', icon: Zap, label: 'Updates' },
    { path: '/health-tips', icon: Heart, label: 'Health Tips' },
    { path: '/success-stories', icon: Trophy, label: 'Success Stories' },
    { path: '/doctors', icon: UserCheck, label: 'Doctors' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`bg-gray-800 shadow-lg transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 admin-gradient rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold text-white">Rainscare</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-900/50 text-blue-300 border-r-2 border-blue-400'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-400 text-center">
              Rainscare Admin v1.0.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;