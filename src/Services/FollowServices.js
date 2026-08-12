import axios from "axios";
import { getAuthHeaders } from "./authHeaders.js";

const BASE_URL = "https://route-posts.routemisr.com/";

/**
 * Follow or unfollow a user
 * PUT /users/:userId/follow
 */
export const toggleFollow = (userId) => {
  return axios.put(
    `${BASE_URL}users/${userId}/follow`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
};

/**
 * Get user suggestions or search users
 * GET /users/suggestions?page=&limit=
 * GET /users/search?q=&page=&limit=
 */
export const getUserSuggestions = (page = 1, limit = 10, search = "") => {
  const params = { page, limit };
  const isSearch = search.trim().length > 0;
  
  if (isSearch) {
    params.q = search.trim();
  }
  
  const endpoint = isSearch ? 'users/search' : 'users/suggestions';

  return axios.get(`${BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(),
    params,
  });
};

/**
 * Get user profile with isFollowing flag
 * GET /users/:userId/profile
 */
export const getUserProfile = (userId) => {
  return axios.get(`${BASE_URL}users/${userId}/profile`, {
    headers: getAuthHeaders(),
  });
};
