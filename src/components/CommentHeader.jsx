import React from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function CommentHeader({comment, fakeCommentPhoto}) {
  const { themeColors } = useTheme();
  const navigate = useNavigate();

  const handleUserClick = (e) => {
    e.stopPropagation();
    if (comment.commentCreator?._id) {
      navigate(`/user/${comment.commentCreator._id}`);
    }
  };

  return (
    <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
      <img
        onClick={handleUserClick}
        src={
          typeof comment.commentCreator?.photo === 'string' &&
          !comment.commentCreator.photo.includes('undefined')
            ? comment.commentCreator.photo
            : fakeCommentPhoto
        }
        alt="User Avatar"
        className="w-10 h-10 rounded-full border cursor-pointer hover:opacity-80 transition-opacity"
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
          onClick={handleUserClick}
          className="font-semibold cursor-pointer hover:underline"
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
          {comment.createdAt ? comment.createdAt.slice(0, 10) : ''}
        </p>
      </div>
    </div>
  );
}
