import axios from "axios";

const BASE_URL = "https://linked-posts.routemisr.com/users/";
export const registerUser = (userData) => {
  return axios.post(`${BASE_URL}signup`, userData);
}

export const loginUser = (userData) => {
  return axios.post(`${BASE_URL}signin`, userData);
}