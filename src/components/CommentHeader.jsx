import React from 'react'
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function CommentHeader({comment , fakeCommentPhoto}) {
  const { themeColors } = useTheme();

  return (
    <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
      {/* BackEnd Problem */}
          <img
            src={
              typeof comment.commentCreator?.photo === 'string' ||
              comment.commentCreator.photo.includes('undefined')
                ? fakeCommentPhoto
                : comment.commentCreator?.photo || fakeCommentPhoto
            }
            alt="User Avatar"
            className="w-10 h-10 rounded-full border"
            style={{ borderColor: themeColors.primary + '30' }}
          />
          <div 
            className="flex-1 rounded-lg p-3 shadow-sm"
            style={{ 
              backgroundColor: themeColors.primary + '05',
              borderColor: themeColors.primary + '20'
            }}
          >
            <p 
              className="font-semibold"
              style={{ color: themeColors.text }}
            >
              {comment.commentCreator?.name || 'Unknown User'}
            </p>
            <p 
              className="text-sm mt-1"
              style={{ color: themeColors.textSecondary }}
            >
              {comment.content}
            </p>
            <p 
              className="text-xs mt-2"
              style={{ color: themeColors.textSecondary }}
            >
              {comment.createdAt.slice(0, 10)}
            </p>
          </div>
    </div>
  )
}
