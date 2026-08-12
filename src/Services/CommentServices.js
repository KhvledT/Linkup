import axios from "axios";
import { getAuthHeaders } from "./authHeaders.js";
const BASE_URL = "https://route-posts.routemisr.com/";

export const getPostComments = (postId, page = 1, limit = 50) => {
  return axios.get(`${BASE_URL}posts/${postId}/comments`, {
    headers: getAuthHeaders(),
    params: { page, limit },
  });
};

export const createComment = (postId, data) => {
  const formData = new FormData();
  if (data?.content) formData.append("content", data.content);
  if (data?.image) formData.append("image", data.image);
  return axios.post(`${BASE_URL}posts/${postId}/comments`, formData, {
    headers: getAuthHeaders(),
  });
};

export const deleteComment = (postId, commentId) => {
  return axios.delete(`${BASE_URL}posts/${postId}/comments/${commentId}`, {
    headers: getAuthHeaders(),
  });
};

export const updateComment = (postId, commentId, data) => {
  const formData = new FormData();
  if (data?.content) formData.append("content", data.content);
  if (data?.image) formData.append("image", data.image);
  return axios.put(`${BASE_URL}posts/${postId}/comments/${commentId}`, formData, {
    headers: getAuthHeaders(),
  });
};

/**
 * Get replies for a comment
 * GET /posts/:postId/comments/:commentId/replies?page=&limit=
 */
export const getCommentReplies = (postId, commentId, page = 1, limit = 50) => {
  return axios.get(`${BASE_URL}posts/${postId}/comments/${commentId}/replies`, {
    headers: getAuthHeaders(),
    params: { page, limit },
  });
};

/**
 * Create a reply to a comment
 * POST /posts/:postId/comments/:commentId/replies
 */
export const createCommentReply = (postId, commentId, data) => {
  const formData = new FormData();
  if (data?.content) formData.append("content", data.content);
  if (data?.image) formData.append("image", data.image);
  return axios.post(`${BASE_URL}posts/${postId}/comments/${commentId}/replies`, formData, {
    headers: getAuthHeaders(),
  });
};

/**
 * Toggle like on a comment
 * PUT /posts/:postId/comments/:commentId/like
 */
export const toggleCommentLike = (postId, commentId) => {
  return axios.put(`${BASE_URL}posts/${postId}/comments/${commentId}/like`, {}, {
    headers: getAuthHeaders(),
  });
};