import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function PostBtns({ post, onCommentClick, from }) {
  const { themeColors } = useTheme();
  const [likeAnimate, setLikeAnimate] = useState(false);
  const [shareAnimate, setShareAnimate] = useState(false);

  const handleShareClick = () => {
    const url = window.location.href;
    let textToCopy;

    if (from === "feedPage") {
      textToCopy = url + "post-details/" + post._id;
    } else if (from === "userProfilePage") {
      textToCopy = url.replace("/profile", "") + "/post-details/" + post._id;
    } else if (from === "PostDetailsPage") {
      textToCopy = url;
    } else {
      textToCopy = url;
    }

    const showToast = (message, type = "success") => {
      if (type === "success") {
        toast.success(message, { duration: 3000 });
      } else {
        toast.error(message, { duration: 3000 });
      }
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => showToast("Link copied to clipboard!"))
        .catch(() => showToast("Failed to copy link ", "error"));
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
        showToast("Link copied to clipboard!");
      } catch {
        showToast("Failed to copy link ", "error");
      }
      document.body.removeChild(textArea);
    }

    // Trigger share icon animation
    setShareAnimate(true);
    setTimeout(() => setShareAnimate(false), 300);
  };

  const handleLikeClick = () => {
    setLikeAnimate(true);
    setTimeout(() => setLikeAnimate(false), 300);
  };

  return (
    <div className="grid grid-cols-3 gap-1">
      {/* Like */}
      <button 
        onClick={handleLikeClick}
        className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 btn-hover-theme"
        style={{ 
          color: themeColors.textSecondary,
          backgroundColor: themeColors.primary + '02'
        }}
      >
        <i 
          className={`fas fa-thumbs-up text-base sm:text-lg transition-transform duration-300 ${likeAnimate ? "-translate-y-[5px] -rotate-6" : ""}`} 
          style={{ color: themeColors.primary }}
        ></i>
        <span>Like</span>
      </button>
      
      {/* Comment */}
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
      
      {/* Share */}
      <button 
        onClick={handleShareClick}
        className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 btn-hover-theme"
        style={{ 
          color: themeColors.textSecondary,
          backgroundColor: themeColors.primary + '02'
        }}
      >
        <i 
          className={`fas fa-share text-base sm:text-lg transition-transform duration-300 ${shareAnimate ? "-translate-y-[5px] -rotate-6" : ""}`} 
          style={{ color: themeColors.primary }}
        ></i>
        <span>Share</span>
      </button>
    </div>
  );
}