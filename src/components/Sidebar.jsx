import React from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function Sidebar({ position = 'left' }) {
  const { themeColors } = useTheme();

  const leftSidebarContent = (
    <div 
      className="sticky top-24 rounded-2xl p-4 lg:p-6 shadow-lg bg-white border border-gray-200"
    >
      <h3 
        className="text-xl font-bold mb-6"
        style={{ color: themeColors.primary }}
      >
        Quick Actions
      </h3>
      
      {/* Stories Section */}
      <div className="space-y-4 mb-8">
        <div 
          className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover-theme-light"
          style={{ 
            backgroundColor: themeColors.primary + '02'
          }}
        >
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: themeColors.primary }}
          >
            <i className="fas fa-plus text-white text-lg"></i>
          </div>
          <span 
            className="font-semibold text-lg"
            style={{ color: themeColors.text }}
          >
            Create Story
          </span>
        </div>
        
        <div 
          className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover-theme-light"
          style={{ 
            backgroundColor: themeColors.primary + '02'
          }}
        >
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: themeColors.secondary }}
          >
            <i className="fas fa-users text-white text-lg"></i>
          </div>
          <span 
            className="font-semibold text-lg"
            style={{ color: themeColors.text }}
          >
            Friends
          </span>
        </div>
        
        <div 
          className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover-theme-light"
          style={{ 
            backgroundColor: themeColors.primary + '02'
          }}
        >
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: themeColors.primary }}
          >
            <i className="fas fa-bookmark text-white text-lg"></i>
          </div>
          <span 
            className="font-semibold text-lg"
            style={{ color: themeColors.text }}
          >
            Saved
          </span>
        </div>
      </div>
      
      {/* Online Friends */}
      <div>
        <h4 
          className="text-lg font-bold mb-4"
          style={{ color: themeColors.primary }}
        >
          Online Friends
        </h4>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: themeColors.primary }}
                ></div>
                <div 
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                  style={{ 
                    backgroundColor: '#10B981',
                    borderColor: 'white'
                  }}
                ></div>
              </div>
              <span 
                className="font-medium"
                style={{ color: themeColors.text }}
              >
                Friend {i}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const rightSidebarContent = (
    <div 
    className="sticky top-24 rounded-2xl p-4 lg:p-6 shadow-lg border"
    style={{ 
      backgroundColor: themeColors.surface,
      borderColor: themeColors.primary + '20'
    }}
    >
      <h3 
        className="text-xl font-bold mb-6"
        style={{ color: themeColors.primary }}
      >
        Trending
      </h3>
      
      {/* Trending Topics */}
      <div className="space-y-4 mb-8">
        {[
          { topic: "Technology", posts: "2.5K posts" },
          { topic: "Design", posts: "1.8K posts" },
          { topic: "Development", posts: "3.2K posts" },
          { topic: "Innovation", posts: "1.1K posts" }
        ].map((item, index) => (
          <div 
            key={index}
            className="p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover-theme-light"
            style={{ 
              backgroundColor: themeColors.primary + '02'
            }}
          >
            <h4 
              className="font-bold text-lg"
              style={{ color: themeColors.primary }}
            >
              #{item.topic}
            </h4>
            <p 
              className="font-medium"
              style={{ color: themeColors.textSecondary }}
            >
              {item.posts}
            </p>
          </div>
        ))}
      </div>
      
      {/* Suggested Friends */}
      <div>
        <h4 
          className="text-lg font-bold mb-4"
          style={{ color: themeColors.primary }}
        >
          Suggested Friends
        </h4>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full"
                  style={{ backgroundColor: themeColors.primary }}
                ></div>
                <div>
                  <p 
                    className="font-semibold"
                    style={{ color: themeColors.text }}
                  >
                    Suggested Friend {i}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: themeColors.textSecondary }}
                  >
                    {Math.floor(Math.random() * 20) + 1} mutual friends
                  </p>
                </div>
              </div>
              <button 
                className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: themeColors.primary,
                  color: "white"
                }}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="lg:col-span-3 xl:col-span-3 hidden lg:block">
      {position === 'left' ? leftSidebarContent : rightSidebarContent}
    </div>
  );
}
