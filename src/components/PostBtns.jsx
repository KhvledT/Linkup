import { useMutation, useQueryClient } from '@tanstack/react-query';
import { togglePostLike, sharePost, togglePostBookmark } from '../Services/PostInteractionServices.js';
import { useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { AuthContext } from '../Contexts/AuthContext.jsx';

export default function PostBtns({ post, onCommentClick }) {
  const { themeColors } = useTheme();
  const { userID } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [likeAnimate, setLikeAnimate] = useState(false);
  const [shareAnimate, setShareAnimate] = useState(false);
  const [bookmarkAnimate, setBookmarkAnimate] = useState(false);

  const isLiked = post?.likes?.includes(userID);
  const isBookmarked = post?.bookmarked;

  const invalidateQueries = () => {
    queryClient.invalidateQueries(['posts']);
    queryClient.invalidateQueries(['postDetails', post._id]);
    queryClient.invalidateQueries(['userPosts']);
    queryClient.invalidateQueries(['userDetails']); 
  };

  const { mutate: handleLike } = useMutation({
    mutationFn: () => togglePostLike(post._id),
    onMutate: async () => {
      setLikeAnimate(true);
      setTimeout(() => setLikeAnimate(false), 300);
    },
    onSuccess: () => {
      invalidateQueries();
    },
    onError: () => toast.error("Failed to like post")
  });

  const { mutate: handleBookmark } = useMutation({
    mutationFn: () => togglePostBookmark(post._id),
    onMutate: () => {
      setBookmarkAnimate(true);
      setTimeout(() => setBookmarkAnimate(false), 300);
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success(isBookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
    },
    onError: () => toast.error("Failed to bookmark post")
  });

  const { mutate: handleShareAPI } = useMutation({
    mutationFn: () => sharePost(post._id),
    onSuccess: () => {
      invalidateQueries();
      toast.success("Post shared on your timeline!");
    },
    onError: () => toast.error("Failed to share post")
  });

  const handleShareClick = () => {
    setShareAnimate(true);
    setTimeout(() => setShareAnimate(false), 300);
    
    // Call the API to actually share it
    handleShareAPI();

    // Still copy the link to clipboard as a bonus
    const url = window.location.origin;
    const textToCopy = `${url}/post-details/${post._id}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";  
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-1">
      {/* Like */}
      <button 
        onClick={() => handleLike()}
        className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 btn-hover-theme"
        style={{ 
          color: isLiked ? themeColors.primary : themeColors.textSecondary,
          backgroundColor: isLiked ? themeColors.primary + '15' : themeColors.primary + '02'
        }}
      >
        <i 
          className={`fas fa-thumbs-up text-sm sm:text-base transition-transform duration-300 ${likeAnimate ? "-translate-y-[5px] -rotate-6" : ""}`} 
        ></i>
        <span className="hidden sm:inline">Like</span>
      </button>
      
      {/* Comment */}
      <button
        onClick={onCommentClick}
        className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 btn-hover-theme"
        style={{ 
          color: themeColors.textSecondary,
          backgroundColor: themeColors.primary + '02'
        }}
      >
        <i className="fas fa-comment text-sm sm:text-base" style={{ color: themeColors.primary }}></i>
        <span className="hidden sm:inline">Comment</span>
      </button>

      {/* Share */}
      <button 
        onClick={handleShareClick}
        className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 btn-hover-theme"
        style={{ 
          color: themeColors.textSecondary,
          backgroundColor: themeColors.primary + '02'
        }}
      >
        <i 
          className={`fas fa-share text-sm sm:text-base transition-transform duration-300 ${shareAnimate ? "-translate-y-[5px] -rotate-6" : ""}`} 
          style={{ color: themeColors.primary }}
        ></i>
        <span className="hidden sm:inline">Share</span>
      </button>
      
      {/* Bookmark */}
      <button 
        onClick={() => handleBookmark()}
        className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 btn-hover-theme"
        style={{ 
          color: isBookmarked ? themeColors.primary : themeColors.textSecondary,
          backgroundColor: isBookmarked ? themeColors.primary + '15' : themeColors.primary + '02'
        }}
      >
        <i 
          className={`fas ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark'} text-sm sm:text-base transition-transform duration-300 ${bookmarkAnimate ? "-translate-y-[5px] -rotate-6" : ""}`} 
        ></i>
        <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}
