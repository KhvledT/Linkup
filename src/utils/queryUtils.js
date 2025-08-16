import { queryClient } from '../App';

/**
 * Standardized function to invalidate queries and trigger refetch
 * @param {Object} options - Options for invalidation and refetch
 * @param {boolean} options.invalidatePosts - Whether to invalidate posts query
 * @param {boolean} options.invalidatePostDetails - Whether to invalidate post details query
 * @param {boolean} options.invalidateUserDetails - Whether to invalidate user details query
 * @param {boolean} options.invalidateUserPosts - Whether to invalidate user posts query
 * @param {Function} options.getPosts - Function to refetch posts
 * @param {Function} options.getPostDetails - Function to refetch post details
 * @param {Function} options.getUserPosts - Function to refetch user posts
 * @param {string} options.from - Context ('feedPage', 'PostDetailsPage', or 'userProfilePage')
 * @param {string} options.postId - Post ID for post details refetch
 */
export const invalidateAndRefetch = ({
  invalidatePosts = true,
  invalidatePostDetails = true,
  invalidateUserDetails = true,
  invalidateUserPosts = true,
  getPosts = null,
  getPostDetails = null,
  getUserPosts = null,
  from = null,
  postId = null
}) => {
  // Invalidate queries first
  if (invalidatePosts) {
    queryClient.invalidateQueries(['posts']);
  }
  if (invalidatePostDetails) {
    queryClient.invalidateQueries(['postDetails']);
  }
  if (invalidateUserDetails) {
    queryClient.invalidateQueries(['userDetails']);
  }
  if (invalidateUserPosts) {
    queryClient.invalidateQueries(['userPosts']);
  }

  // Then call appropriate refetch functions
  if (from === 'feedPage' && getPosts) {
    getPosts();
  } else if (from === 'PostDetailsPage' && getPostDetails) {
    if (postId) {
      getPostDetails(postId);
    } else {
      getPostDetails();
    }
  } else if (from === 'userProfilePage' && getUserPosts) {
    getUserPosts();
  }
};

/**
 * Quick invalidation for common operations
 */
export const invalidateAll = () => {
  queryClient.invalidateQueries(['posts']);
  queryClient.invalidateQueries(['postDetails']);
  queryClient.invalidateQueries(['userDetails']);
  queryClient.invalidateQueries(['userPosts']);
};

/**
 * Invalidate only posts
 */
export const invalidatePosts = () => {
  queryClient.invalidateQueries(['posts']);
};

/**
 * Invalidate only post details
 */
export const invalidatePostDetails = () => {
  queryClient.invalidateQueries(['postDetails']);
};
