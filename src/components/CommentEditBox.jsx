import React from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function CommentEditBox({ comment, setEditComment, commentText, setCommentText, isSubmitting, handleEditComment }) {
  const { themeColors } = useTheme();

  return (
    <div
      className="mt-3 ml-12 p-3 rounded-lg border"
      style={{ backgroundColor: themeColors.primary + '05', borderColor: themeColors.primary + '20' }}
    >
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
        style={{
          borderColor: themeColors.primary + '30',
          backgroundColor: themeColors.surface,
          color: themeColors.text,
          focusRingColor: themeColors.primary,
        }}
        rows="3"
      />

      <div className="flex justify-end space-x-2 mt-2">
        <button
          onClick={() => {
            setEditComment(null);
            setCommentText('');
          }}
          className="px-3 py-1 rounded-lg transition"
          style={{ backgroundColor: themeColors.primary + '20', color: themeColors.textSecondary }}
        >
          Cancel
        </button>

        <button
          disabled={isSubmitting || commentText.trim() === '' || commentText === comment.content}
          onClick={handleEditComment}
          className="text-white px-6 py-2 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: themeColors.primary }}
        >
          {isSubmitting ? (
            <span className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Posting...
            </span>
          ) : (
            'Edit'
          )}
        </button>
      </div>
    </div>
  );
}
