import React from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function SettingsModal({ isOpen, onClose }) {
  const { themeColors, isDarkMode, toggleDarkMode } = useTheme();

  if (!isOpen) return null;

  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  const handleChangePassword = () => {
    // TODO: Implement change password functionality
    console.log('Change password clicked - functionality coming soon!');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
          style={{ color: themeColors.text }}
        >
          <i className="fas fa-times text-sm"></i>
        </button>

        {/* Settings Container */}
        <div className="bg-white rounded-2xl shadow-xl p-6" style={{ backgroundColor: themeColors.surface }}>
          {/* Header */}
          <div className="text-center mb-6">
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: themeColors.text }}
            >
              Settings
            </h2>
            <p 
              className="text-sm"
              style={{ color: themeColors.textSecondary }}
            >
              Manage your account preferences
            </p>
          </div>

          {/* Settings Options */}
          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div 
              className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 cursor-pointer"
              style={{ 
                backgroundColor: `${themeColors.primary}03`,
                borderColor: isDarkMode ? themeColors.primary + '30' : undefined
              }}
              onClick={handleDarkModeToggle}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: themeColors.primary }}
                  >
                    <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-white`}></i>
                  </div>
                  <div>
                    <h3 
                      className="font-semibold text-sm"
                      style={{ color: themeColors.text }}
                    >
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </h3>
                    <p 
                      className="text-xs"
                      style={{ color: themeColors.textSecondary }}
                    >
                      {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Toggle Switch */}
                  <div 
                    className="relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer"
                    style={{ 
                      backgroundColor: isDarkMode ? themeColors.primary : '#D1D5DB'
                    }}
                  >
                    <div 
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm"
                      style={{
                        transform: isDarkMode ? 'translateX(1.5rem)' : 'translateX(0)'
                      }}
                    ></div>
                  </div>
                  <i 
                    className="fas fa-chevron-right text-sm"
                    style={{ color: themeColors.textSecondary }}
                  ></i>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div 
              className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 cursor-pointer"
              style={{ 
                backgroundColor: `${themeColors.primary}03`,
                borderColor: isDarkMode ? themeColors.primary + '30' : undefined
              }}
              onClick={handleChangePassword}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: themeColors.primary }}
                  >
                    <i className="fas fa-lock text-white"></i>
                  </div>
                  <div>
                    <h3 
                      className="font-semibold text-sm"
                      style={{ color: themeColors.text }}
                    >
                      Change Password
                    </h3>
                    <p 
                      className="text-xs"
                      style={{ color: themeColors.textSecondary }}
                    >
                      Update your password
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: themeColors.primary,
                      color: 'white'
                    }}
                  >
                    Coming Soon
                  </span>
                  <i 
                    className="fas fa-chevron-right text-sm"
                    style={{ color: themeColors.textSecondary }}
                  ></i>
                </div>
              </div>
            </div>

            {/* Additional Settings (Placeholder) */}
            <div 
              className="p-4 rounded-xl border border-gray-100 opacity-50"
              style={{ 
                backgroundColor: `${themeColors.primary}02`,
                borderColor: isDarkMode ? themeColors.primary + '20' : undefined
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300"
                  >
                    <i className="fas fa-bell text-gray-500"></i>
                  </div>
                  <div>
                    <h3 
                      className="font-semibold text-sm text-gray-500"
                    >
                      Notifications
                    </h3>
                    <p className="text-xs text-gray-400">
                      Manage notification preferences
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-300 text-gray-500">
                  Soon
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p 
              className="text-xs"
              style={{ color: themeColors.textSecondary }}
            >
              More settings coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
