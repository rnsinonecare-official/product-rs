import React from 'react';
import { Menu, Bell, User, LogOut, Search } from 'lucide-react';

const Header = ({ onToggleSidebar, onLogout }) => {
  return (
    <header className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-300" />
          </button>
          
          <div className="relative">
            <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <Bell className="w-5 h-5 text-gray-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Admin Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-red-400"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;