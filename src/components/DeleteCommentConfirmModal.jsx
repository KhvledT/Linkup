import React from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function DeleteCommentConfirmModal({ isOpen, onClose, onConfirm, isDeleting }) {
  const { themeColors } = useTheme();

  if (!isOpen) return null;

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
              <i className="fas fa-trash text-white"></i>
            </div>
            <h2
              className="text-xl font-bold"
              style={{ color: themeColors.text }}
            >
              Delete comment?
            </h2>
          </div>

          <p
            className="text-sm mb-6"
            style={{ color: themeColors.textSecondary }}
          >
            Are you sure you want to delete this comment?
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              style={{ color: themeColors.text }}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
              style={{ backgroundColor: themeColors.primary, color: 'white' }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


