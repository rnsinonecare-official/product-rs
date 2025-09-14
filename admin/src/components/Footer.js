import React from 'react';
import { Heart, Github, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Brand and copyright */}
          <div className="flex items-center space-x-2 text-gray-400">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-sm">
              © {currentYear} Rainscare Admin Panel. Made with love for health and wellness.
            </span>
          </div>

          {/* Right side - Links and version */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <a
                href="mailto:support@rainscare.com"
                className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>Support</span>
              </a>

              <a
                href="https://github.com/rainscare"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Version info */}
            <div className="text-gray-500 text-xs">
              v1.0.0
            </div>
          </div>
        </div>

        {/* Bottom row - Additional info */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-gray-500 text-xs">
              Powered by Firebase & React • Last updated: {new Date().toLocaleDateString()}
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Documentation</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;