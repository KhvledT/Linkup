import axios from "axios";
const BASE_URL = "https://linked-posts.routemisr.com/";

export const getAllPosts = () => {
  return axios.get(`${BASE_URL}posts?limit=50`, {
      headers: {
        token: localStorage.getItem("token"),
      },
      params: { 
        sort: "-createdAt",
      },
    })
}

export const postDetails = (id) => {
  return axios.get(`${BASE_URL}posts/${id}`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    })
}

export const createPost = (data) => {
  return axios.post(`${BASE_URL}posts`, data, {
        headers: {
          token: localStorage.getItem("token"),

        },
      })
}

export const deletePost = (id) => {
  return axios.delete(`${BASE_URL}posts/${id}`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    })
}

export const updatePost = (data , id) => {
   return axios.put(`${BASE_URL}posts/${id}`, data, {
        headers: {
          token: localStorage.getItem("token"),

        },
      })
}