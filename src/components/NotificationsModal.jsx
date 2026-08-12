import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markAllNotificationsRead,
} from "../Services/NotificationServices.js";
import { useTheme } from "../Contexts/ThemeContext.jsx";
import FetchingIcon from "./FetchingIcon.jsx";

export default function NotificationsModal({ isOpen, onClose }) {
  const { themeColors } = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    enabled: isOpen,
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["unreadNotificationsCount"]);
    },
  });

  if (!isOpen) return null;

  const notifications = data?.data?.data?.notifications || [];

  return (
    <div
      className="fixed h-[100vh] inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
          style={{ color: themeColors.text }}
        >
          <i className="fas fa-times text-sm"></i>
        </button>

        <div
          className="bg-white rounded-2xl shadow-xl flex flex-col h-full overflow-hidden flex-1"
          style={{ backgroundColor: themeColors.surface }}
        >
          <div
            className="p-4 border-b flex justify-between items-center"
            style={{ borderColor: themeColors.primary + "20" }}
          >
            <h2
              className="text-xl font-bold"
              style={{ color: themeColors.text }}
            >
              Notifications
            </h2>
            <button
              onClick={() => markAllRead()}
              className="text-sm font-medium hover:underline"
              style={{ color: themeColors.primary }}
            >
              Mark all as read
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
            {isLoading ? (
              <FetchingIcon />
            ) : notifications.length === 0 ? (
              <p
                className="text-center text-sm py-8"
                style={{ color: themeColors.textSecondary }}
              >
                No notifications yet.
              </p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3 rounded-lg flex items-start gap-3 border ${notif.isRead ? "opacity-70" : "bg-gray-50"}`}
                  style={{
                    borderColor: themeColors.primary + "20",
                    backgroundColor: notif.isRead
                      ? themeColors.surface
                      : themeColors.primary + "05",
                  }}
                >
                  <i
                    className="fas fa-bell mt-1"
                    style={{ color: themeColors.primary }}
                  ></i>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: themeColors.text }}
                    >
                      {notif.content || "You have a new interaction"}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: themeColors.textSecondary }}
                    >
                      {notif.createdAt ? notif.createdAt.slice(0, 10) : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
