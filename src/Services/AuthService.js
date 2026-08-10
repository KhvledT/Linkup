import axios from "axios";

const BASE_URL = "https://route-posts.routemisr.com/";

export const registerUser = (userData) => {
  return axios.post(`${BASE_URL}users/signup`, userData);
}

export const loginUser = (userData) => {
  return axios.post(`${BASE_URL}users/signin`, userData);
}