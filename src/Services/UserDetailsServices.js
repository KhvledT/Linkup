import axios from "axios";
const BASE_URL = "https://linked-posts.routemisr.com/";

export const getUserDetails = () => {
  return axios.get(`${BASE_URL}users/profile-data`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    })
}
export const UploadUserImage = (data) => {
  return axios.put(`${BASE_URL}users/upload-photo`,data, {
      headers: {
        token: localStorage.getItem("token"),
        "Content-Type": "multipart/form-data",
      },
    })
}

export const getUserPosts = (id) => {
  return axios.get(`${BASE_URL}users/${id}/posts?limit=50`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    })
}

