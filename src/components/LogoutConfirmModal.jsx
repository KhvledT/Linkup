import React from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  const { themeColors } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm h-screen"
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

        {/* Modal Card */}
        <div
          className="bg-white rounded-2xl shadow-xl p-6"
          style={{ backgroundColor: themeColors.surface }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: themeColors.primary }}
            >
              <i className="fas fa-sign-out-alt text-white"></i>
            </div>
            <h2
              className="text-xl font-bold"
              style={{ color: themeColors.text }}
            >
              Confirm Logout
            </h2>
          </div>

          <p
            className="text-sm mb-6"
            style={{ color: themeColors.textSecondary }}
          >
            Are you sure you want to log out of your account?
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              style={{ color: themeColors.text }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: themeColors.primary, color: 'white' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


