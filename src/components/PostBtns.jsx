import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function PostBtns({post, onCommentClick}) {
  const { themeColors } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-1">
      <button 
        className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 btn-hover-theme"
        style={{ 
          color: themeColors.textSecondary,
          backgroundColor: themeColors.primary + '02'
        }}
      >
        <i className="fas fa-thumbs-up text-base sm:text-lg" style={{ color: themeColors.primary }}></i>
        <span>Like</span>
      </button>
      
      <button
        onClick={onCommentClick}
        className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 btn-hover-theme"
        style={{ 
          color: themeColors.textSecondary,
          backgroundColor: themeColors.primary + '02'
        }}
      >
        <i className="fas fa-comment text-base sm:text-lg" style={{ color: themeColors.primary }}></i>
        <span>Comment</span>
      </button>
      
      <button 
        className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 btn-hover-theme"
        style={{ 
          color: themeColors.textSecondary,
          backgroundColor: themeColors.primary + '02'
        }}
      >
        <i className="fas fa-share text-base sm:text-lg" style={{ color: themeColors.primary }}></i>
        <span>Share</span>
      </button>
    </div>
  )
}
