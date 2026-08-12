import axios from "axios";
import { getAuthHeaders } from "./authHeaders.js";
const BASE_URL = "https://route-posts.routemisr.com/";

export const getAllPosts = (page = 1) => {
  return axios.get(`${BASE_URL}posts`, {
    headers: getAuthHeaders(),
    params: {
      limit: 50,
      page,
      sort: "-createdAt",
    },
  });
};

/**
 * Get feed timeline with filtering options
 * GET /posts/feed?only=following|me|all&hasImage=&page=&limit=&cursor=
 * 
 * @param {Object} params - Feed parameters
 * @param {string} params.only - Feed mode: 'following' (default), 'me', 'all'
 * @param {boolean} params.hasImage - Filter posts with images only
 * @param {number} params.page - Page number (offset pagination)
 * @param {number} params.limit - Items per page
 * @param {string} params.cursor - Cursor for cursor-based pagination
 */
export const getFeed = ({ only = "following", hasImage, page = 1, limit = 50, cursor } = {}) => {
  const params = { only, page, limit };
  if (hasImage !== undefined) params.hasImage = hasImage;
  if (cursor) params.cursor = cursor;

  return axios.get(`${BASE_URL}posts/feed`, {
    headers: getAuthHeaders(),
    params,
  });
};

export const postDetails = (id) => {
  return axios.get(`${BASE_URL}posts/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const createPost = (data) => {
  return axios.post(`${BASE_URL}posts`, data, {
    headers: getAuthHeaders(),
  });
};

export const deletePost = (id) => {
  return axios.delete(`${BASE_URL}posts/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const updatePost = (data, id) => {
  return axios.put(`${BASE_URL}posts/${id}`, data, {
    headers: getAuthHeaders(),
  });
};
