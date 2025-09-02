// Import React hooks for context and state management
import { useContext, useState } from "react";

// Import React Router hooks for navigation and URL parameters
import { useNavigate, useParams } from "react-router-dom";

// Import component dependencies
import Comments from "./Comments";
import CreateComment from "./CreateComment";
import PostHeader from "./PostHeader";
import PostStatistics from "./PostStatistics";
import PostBtns from "./PostBtns";
import PostImageModal from "./PostImageModal";
import DeletePostConfirmModal from './DeletePostConfirmModal.jsx';

// Import context providers for authentication and theming
import { AuthContext } from "../Contexts/AuthContext";
import { useTheme } from '../Contexts/ThemeContext.jsx';

// Import API services and utilities
import { deletePost } from "../Services/FeedServices";
import { useMutation } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { invalidateAndRefetch } from "../utils/queryUtils";

// Import fallback profile image for users without profile pictures
import fakeProfilePhoto from "../../public/FakeProfileImage.png";

// Fallback data for posts that don't have complete information
// Provides default values for user avatar, likes, and shares
const fakePost = {
  userAvatar: fakeProfilePhoto,
  likes: 0,
  shares: 0,
};

// Main Post component that displays individual posts
// Handles post rendering, interactions, and state management
export default function Post({ 
  post,                    // Post data object
  commentLimit = 1000,     // Maximum number of comments to display
  getPostDetails,          // Function to fetch post details
  getPosts,                // Function to fetch posts list
  getUserPosts,            // Function to fetch user posts
  postId,                  // Post ID for identification
  from                     // Source page identifier for navigation logic
}) {
  // Get user ID from authentication context
  const { userID } = useContext(AuthContext);
  
  // Get theme colors for dynamic styling
  const { themeColors } = useTheme();
  
  // Navigation function for routing
  const navigator = useNavigate();
  
  // Local state for comment field visibility
  const [showCommentField, setShowCommentField] = useState(false);
  
  // Local state for image modal visibility
  const [showImageModal, setShowImageModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // Extract post ID from URL parameters if viewing post details
  if (getPostDetails) {
    const { id } = useParams();
    postId = id;
  }
  
  // React Query mutation for post deletion
  // Handles API calls, success/error handling, and cache invalidation
  const { mutate: performDeletePost, isPending: isDeletingPost } = useMutation({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: () => {
      // Invalidate and refetch relevant data after successful deletion
      invalidateAndRefetch({ from, getPosts, getPostDetails });

      // Navigate based on the source page context
      if (from === "PostDetailsPage") navigator('/');
      else if (from === "userProfilePage") getUserPosts(userID);
      toast.success('Post deleted');
      setIsDeleteModalOpen(false);
      setPendingDeleteId(null);
    },
    onError: () => {
      toast.error('Failed to delete post');
    }
  });

  // Open confirm modal for delete
  const handleDeletePost = (postId) => {
    setPendingDeleteId(postId);
    setIsDeleteModalOpen(true);
  };

  // Navigate to edit post page for the specified post
  const handleEditPost = (postId) => {
    navigator(`/edit-post/${postId}`);
  };

  // Toggle comment field visibility
  const handleCommentClick = () => setShowCommentField(!showCommentField);

  // Handle post click for navigation to post details
  // Only navigate from feed or user profile pages
  const handlePostClick = () => {
    if (from === "feedPage" || from === "userProfilePage") {
      navigator(`/post-details/${post?._id}`);
    }
  };

  return (
    <>
    {/* Main post container with rounded corners, shadows, and hover effects */}
    <div
      className="rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border"
      style={{
        backgroundColor: themeColors.surface,
        borderColor: themeColors.primary + '20'
      }}
    >
      {/* Post Header Section */}
      {/* Contains user info, post metadata, and action buttons */}
      <div
        className="p-3 sm:p-4 lg:p-5 border-b"
        style={{ borderColor: themeColors.primary + '10' }}
      >
        <PostHeader
          post={post}
          fakePost={fakePost}
          userID={userID}
          handleEditPost={handleEditPost}
          handleDeletePost={handleDeletePost}
        />
      </div>

      {/* Post Content Section */}
      {/* Displays post text content with clickable area for navigation */}
      {post?.body && (
        <div
          className="p-3 sm:p-4 lg:p-5 cursor-pointer transition-colors duration-200 post-content-hover"
          style={{ backgroundColor: themeColors.primary + '02' }}
          onClick={handlePostClick}
        >
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: themeColors.text }}
          >
            {post.body}
          </p>
        </div>
      )}

      {/* Post Image Section */}
      {/* Displays post image with click-to-expand functionality */}
      {post?.image && (
        <>
          {/* Clickable image container with hover effects */}
          <div
            className="relative cursor-pointer hover:opacity-95 transition-opacity duration-200"
            onClick={() => setShowImageModal(true)}
          >
            <img
              src={post.image}
              alt="Post"
              className="w-full h-auto object-cover max-h-[400px]"
            />
          </div>

          {/* Image Modal for full-size viewing */}
          <PostImageModal
            isOpen={showImageModal}
            onClose={() => setShowImageModal(false)}
            imageUrl={post.image}
          />
        </>
      )}

      {/* Post Statistics Section */}
      {/* Displays post metrics like likes, comments, and shares */}
      <div
        className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 border-b"
        style={{ borderColor: themeColors.primary + '10' }}
      >
        <PostStatistics post={post} fakePost={fakePost} handlePostClick={handlePostClick} />
      </div>

      {/* Post Action Buttons Section */}
      {/* Contains like, comment, and share buttons */}
      <div className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3">
        <PostBtns from={from} post={post} onCommentClick={handleCommentClick} />
      </div>

      {/* Create Comment Section - Feed Page */}
      {/* Comment creation interface shown only on feed page when toggled */}
      {from === "feedPage" && showCommentField && (
        <div
          className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 border-b"
          style={{ borderColor: themeColors.primary + '10' }}
        >
          <CreateComment postId={post?._id} getPostDetails={getPostDetails} getPosts={getPosts} getUserPosts={getUserPosts} from={from} />
        </div>
      )}

      {/* Create Comment Section - Post Details / Profile */}
      {/* Comment creation interface for post details and user profile pages */}
      {(from === "PostDetailsPage" || (from === "userProfilePage" && showCommentField)) && (
        <div
          className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 border-b"
          style={{ borderColor: themeColors.primary + '10' }}
        >
          <CreateComment postId={post?._id} getPostDetails={getPostDetails} getPosts={getPosts} getUserPosts={getUserPosts} from={from} />
        </div>
      )}

      {/* Comments Display Section */}
      {/* Shows all comments for the post with pagination */}
      <div className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3">
        <Comments
          post={post}
          commentLimit={commentLimit}
          getPostDetails={getPostDetails}
          getPosts={getPosts}
          getUserPosts={getUserPosts}
          from={from}
        />
      </div>
    </div>
    {/* Delete Post Confirmation Modal */}
      <DeletePostConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (pendingDeleteId) performDeletePost(pendingDeleteId);
        }}
        isDeleting={isDeletingPost}
      />
    </>
  );
}
