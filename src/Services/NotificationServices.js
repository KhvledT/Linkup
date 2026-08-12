import axios from "axios";
import { getAuthHeaders } from "./authHeaders.js";

const BASE_URL = "https://route-posts.routemisr.com/";

/**
 * Get notifications
 * GET /notifications?unread=&page=&limit=
 */
export const getNotifications = (page = 1, limit = 20, unread = false) => {
  return axios.get(`${BASE_URL}notifications`, {
    headers: getAuthHeaders(),
    params: { page, limit, unread },
  });
};

/**
 * Get unread notifications count
 * GET /notifications/unread-count
 */
export const getUnreadNotificationsCount = () => {
  return axios.get(`${BASE_URL}notifications/unread-count`, {
    headers: getAuthHeaders(),
  });
};

/**
 * Mark a notification as read
 * PATCH /notifications/:id/read
 */
export const markNotificationRead = (notificationId) => {
  return axios.patch(`${BASE_URL}notifications/${notificationId}/read`, {}, {
    headers: getAuthHeaders(),
  });
};

/**
 * Mark all notifications as read
 * PATCH /notifications/read-all
 */
export const markAllNotificationsRead = () => {
  return axios.patch(`${BASE_URL}notifications/read-all`, {}, {
    headers: getAuthHeaders(),
  });
};