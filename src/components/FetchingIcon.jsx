import React from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function FetchingIcon() {
  const { themeColors } = useTheme();

  return (
    <div 
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md shadow-lg border border-gray-200 rounded-2xl px-6 py-4 flex items-center gap-3"
      style={{ 
        backgroundColor: `${themeColors.surface}E6`,
        borderColor: `${themeColors.primary}20`
      }}
    >
      {/* Simple Spinner */}
      <div className="relative">
        <div 
          className="w-6 h-6 border-2 border-gray-200 rounded-full animate-spin"
          style={{ borderTopColor: themeColors.primary }}
        ></div>
      </div>

      {/* Loading Text */}
      <div className="flex items-center gap-2">
        <span 
          className="font-medium text-sm"
          style={{ color: themeColors.text }}
        >
          Updating
        </span>
        
        {/* Simple Dots */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                backgroundColor: themeColors.primary,
                animationDelay: `${index * 0.2}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Simple Progress Bar */}
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full bg-gray-300 animate-pulse"
          style={{ 
            backgroundColor: themeColors.primary
          }}
        ></div>
      </div>
    </div>
  );
}
