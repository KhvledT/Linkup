import DropDown from './DropDown'
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function PostHeader({post , fakePost , userID , handleEditPost , handleDeletePost}) {
  const { themeColors } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate(`/user-page/${post?._id}`)}>
        <div className="relative">
          <img
            src={
              typeof post?.user?.photo === "string" &&
              post.user.photo.includes("undefined")
                ? fakePost.userAvatar
                : post?.user?.photo || fakePost.userAvatar
            }
            alt="User Avatar"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 object-cover"
            style={{ borderColor: themeColors.primary }}
          />
          {/* Online indicator */}
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2"
            style={{ 
              backgroundColor: '#10B981',
              borderColor: 'white'
            }}
          ></div>
        </div>
        <div>
          <p 
            className="font-semibold text-base sm:text-lg"
            style={{ color: themeColors.text }}
          >
            {post?.user?.name}
          </p>
          <div className="flex items-center gap-1 sm:gap-2">
            <p 
              className="text-xs sm:text-sm"
              style={{ color: themeColors.textSecondary }}
            >
              {post?.createdAt?.slice(0, 10) || ""}
            </p>
            <span 
              className="text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full"
              style={{ 
                backgroundColor: `${themeColors.primary}08`,
                color: themeColors.primary
              }}
            >
              <i className="fas fa-globe-americas mr-1"></i>
              Public
            </span>
          </div>
        </div>
      </div>
  
      {/* Three dots menu */}
      {(userID === post?.user?._id) && (
        <DropDown 
          postId={post?._id} 
          handleEditPost={handleEditPost} 
          handleDeletePost={handleDeletePost} 
          Type="post" 
        />
      )}
    </div>
  )
}
