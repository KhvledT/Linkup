import React from 'react'
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function PostStatistics({ post, handlePostClick }) {
  const { themeColors } = useTheme();

  return (
    <div 
    className="flex justify-center items-center px-2 sm:px-4 py-1 sm:py-2 cursor-pointer"
    onClick={handlePostClick}
    >
      <div className="flex items-center justify-between w-full max-w-md">
        <div className="flex items-center gap-1 sm:gap-2">
          <div 
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: themeColors.primary }}
          >
            <i className="fas fa-thumbs-up text-white text-xs"></i>
          </div>
          <span
            className="text-xs sm:text-sm font-medium"
            style={{ color: themeColors.textSecondary }}
          >
            {post?.likes?.length ?? post?.likesCount ?? 0}
          </span>
        </div>

        <span
          className="text-xs sm:text-sm font-medium"
          style={{ color: themeColors.textSecondary }}
        >
          {post?.comments?.length ?? post?.commentsCount ?? 0} Comments
        </span>

        <span
          className="text-xs sm:text-sm font-medium"
          style={{ color: themeColors.textSecondary }}
        >
          {post?.shares?.length ?? post?.sharesCount ?? 0} Shares
        </span>
      </div>
    </div>
  )
}