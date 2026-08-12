import axios from "axios";
import { getAuthHeaders } from "./authHeaders.js";

const BASE_URL = "https://route-posts.routemisr.com/";

/**
 * Toggle like on a post
 * PUT /posts/:postId/like
 */
export const togglePostLike = (postId) => {
  return axios.put(`${BASE_URL}posts/${postId}/like`, {}, {
    headers: getAuthHeaders(),
  });
};

/**
 * Get users who liked a post
 * GET /posts/:postId/likes?page=&limit=
 */
export const getPostLikes = (postId, page = 1, limit = 20) => {
  return axios.get(`${BASE_URL}posts/${postId}/likes`, {
    headers: getAuthHeaders(),
    params: { page, limit },
  });
};

/**
 * Toggle bookmark on a post
 * PUT /posts/:postId/bookmark
 */
export const togglePostBookmark = (postId) => {
  return axios.put(`${BASE_URL}posts/${postId}/bookmark`, {}, {
    headers: getAuthHeaders(),
  });
};

/**
 * Share a post
 * POST /posts/:postId/share
 * Body: { description?: string, mentions?: string[] }
 */
export const sharePost = (postId, data = {}) => {
  return axios.post(`${BASE_URL}posts/${postId}/share`, data, {
    headers: getAuthHeaders(),
  });
};

/**
 * Get user's bookmarked posts
 * GET /users/bookmarks?page=&limit=
 */
export const getUserBookmarks = (page = 1, limit = 50) => {
  return axios.get(`${BASE_URL}users/bookmarks`, {
    headers: getAuthHeaders(),
    params: { page, limit },
  });
};