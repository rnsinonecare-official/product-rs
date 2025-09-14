import React from 'react';
import rainscareLogo from '../../images/RAINSCARE WOB.png';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-green via-cream to-powder-blue flex items-center justify-center">
      <div className="text-center">
        {/* Rainscare Logo */}
        <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl mb-8 p-3">
          <img 
            src={rainscareLogo} 
            alt="Rainscare Logo" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* App Name */}
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
          Rainscare
        </h1>

        {/* Tagline */}
        <p className="text-lg text-gray-600 mb-8">
          Your Personal Health & Nutrition Companion
        </p>

        {/* Simple Loading Spinner */}
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
        </div>

        {/* Loading Text */}
        <p className="text-sm text-gray-500 mt-4">
          Loading your personalized experience...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;