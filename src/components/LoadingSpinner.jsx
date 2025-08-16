import React from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function LoadingSpinner({ size = 'md', text = 'Loading...', showText = true }) {
  const { themeColors } = useTheme();

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Spinner */}
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} border-gray-200 rounded-full animate-spin`}
          style={{ borderTopColor: themeColors.primary }}
        ></div>
        
        {/* Center dot for larger sizes */}
        {(size === 'lg' || size === 'xl') && (
          <div 
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ 
              backgroundColor: themeColors.primary,
              transform: 'translate(-50%, -50%)'
            }}
          ></div>
        )}
      </div>

      {/* Loading text */}
      {showText && (
        <span 
          className={`font-medium ${textSizes[size]}`}
          style={{ color: themeColors.textSecondary }}
        >
          {text}
        </span>
      )}
    </div>
  );
}
