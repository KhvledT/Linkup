import axios from "axios";
import { getAuthHeaders } from "./authHeaders.js";
const BASE_URL = "https://route-posts.routemisr.com/";

export const getUserDetails = () => {
  return axios.get(`${BASE_URL}users/profile-data`, {
    headers: getAuthHeaders(),
  });
};

export const UploadUserImage = (data) => {
  return axios.put(`${BASE_URL}users/upload-photo`, data, {
    headers: getAuthHeaders(),
  });
};

export const UploadUserCover = (data) => {
  return axios.put(`${BASE_URL}users/upload-cover`, data, {
    headers: getAuthHeaders(),
  });
};

export const getUserPosts = (id) => {
  return axios.get(`${BASE_URL}users/${id}/posts?limit=50`, {
    headers: getAuthHeaders(),
  });
};

export const changeUserPassword = (body) => {
  return axios.patch(`${BASE_URL}users/change-password`, body, {
    headers: getAuthHeaders(),
  });
};

