import React from 'react';

const FloatingBackground = () => {
  // Minimal static background - no animations for better performance
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Simple static gradient overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(144, 238, 144, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(135, 206, 235, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(221, 160, 221, 0.03) 0%, transparent 50%)
          `
        }}
      />
    </div>
  );
};

export default FloatingBackground;