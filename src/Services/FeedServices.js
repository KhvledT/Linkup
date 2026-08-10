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
