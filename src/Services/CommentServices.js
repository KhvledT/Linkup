import axios from "axios";
const BASE_URL = "https://linked-posts.routemisr.com/";


export const createComment = (data) => {
  axios.post(`${BASE_URL}comments`, data, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })
}

export const deleteComment = (id) => {
  return axios.delete(`${BASE_URL}comments/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })
}

export const updateComment = (commentId, data) => {
  return axios.put(`${BASE_URL}comments/${commentId}`,data, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })
}