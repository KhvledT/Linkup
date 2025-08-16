import React from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function LoadingPage() {
  const { themeColors } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl shadow-xl border border-gray-200 p-12">
      {/* Main Loading Animation */}
      <div className="relative mb-8">
        {/* Outer Ring */}
        <div 
          className="w-24 h-24 border-4 border-gray-200 rounded-full animate-spin"
          style={{ borderTopColor: themeColors.primary }}
        ></div>
        
        {/* Inner Ring */}
        <div 
          className="absolute top-2 left-2 w-20 h-20 border-4 border-gray-100 rounded-full animate-spin"
          style={{ 
            borderTopColor: themeColors.secondary,
            animationDirection: 'reverse',
            animationDuration: '1.5s'
          }}
        ></div>
        
        {/* Center Dot */}
        <div 
          className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full animate-pulse"
          style={{ 
            backgroundColor: themeColors.primary,
            transform: 'translate(-50%, -50%)'
          }}
        ></div>
      </div>

      {/* Loading Text */}
      <div className="text-center mb-6">
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: themeColors.text }}
        >
          Loading...
        </h2>
        <p 
          className="text-lg"
          style={{ color: themeColors.textSecondary }}
        >
          Please wait while we prepare your content
        </p>
      </div>

      {/* Animated Dots */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-3 h-3 rounded-full animate-bounce"
            style={{
              backgroundColor: themeColors.primary,
              animationDelay: `${index * 0.1}s`,
              animationDuration: '1s'
            }}
          ></div>
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 opacity-20">
        <div 
          className="w-16 h-16 rounded-full animate-pulse"
          style={{ backgroundColor: themeColors.primary }}
        ></div>
      </div>
      
      <div className="absolute bottom-4 left-4 opacity-20">
        <div 
          className="w-12 h-12 rounded-full animate-pulse"
          style={{ 
            backgroundColor: themeColors.secondary,
            animationDelay: '0.5s'
          }}
        ></div>
      </div>
    </div>
  );
}
