import React from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function ProfilePictureModal({ isOpen, onClose, imageUrl, userName }) {
  const { themeColors } = useTheme();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl max-h-[90vh] p-4"
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

        {/* Image Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Image */}
          <div className="relative">
            <img
              src={imageUrl}
              alt={`${userName}'s profile picture`}
              className="w-full h-auto object-cover"
            />
            
            {/* Image Overlay with User Info */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6"
            >
              <h2 
                className="text-xl font-bold text-white mb-1"
              >
                {userName}
              </h2>
              <p className="text-white/80 text-sm">
                Profile Picture
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
