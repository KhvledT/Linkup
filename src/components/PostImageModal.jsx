import React from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function PostImageModal({ isOpen, onClose, imageUrl }) {
  const { themeColors } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl max-h-[90vh] w-full p-4 transform scale-100 transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
          style={{ color: themeColors.text }}
        >
          <i className="fas fa-times text-lg"></i>
        </button>

        {/* Image Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center relative">
          <img
            src={imageUrl}
            alt="Post"
            className="w-full max-h-[80vh] object-contain transition-transform duration-300"
          />

        </div>
      </div>
    </div>
  );
}
