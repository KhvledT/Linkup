import React, { useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../Contexts/ThemeContext.jsx";
import { AuthContext } from "../Contexts/AuthContext.jsx";
import {
  getUserSuggestions,
  toggleFollow,
  getUserProfile,
} from "../Services/FollowServices.js";
import { getUserDetails } from "../Services/UserDetailsServices.js";
import fakeProfilePhoto from "../../public/FakeProfileImage.png";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ position = "left" }) {
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  const { isloggedIn, userID } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: suggestionsData, isLoading, isFetching } = useQuery({
    queryKey: ["suggestions", debouncedSearchTerm],
    queryFn: () => getUserSuggestions(1, 50, debouncedSearchTerm),
    enabled: isloggedIn,
  });

  const { data: myProfileData } = useQuery({
    queryKey: ["userProfile", userID],
    queryFn: () => getUserProfile(userID),
    enabled: isloggedIn && !!userID && (position === "right" || position === "mobile"),
  });

  const myFriends = myProfileData?.data?.data?.user?.following || myProfileData?.data?.user?.following || [];

  const { mutate: handleFollow } = useMutation({
    mutationFn: (userId) => toggleFollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["suggestions"]);
      queryClient.invalidateQueries(["userDetails"]);
      queryClient.invalidateQueries(["userProfile"]);
      queryClient.invalidateQueries(["posts"]);
      toast.success("Follow status updated");
    },
    onError: () => {
      toast.error("Failed to update follow status");
    },
  });

  const suggestions =
    suggestionsData?.data?.data?.users ||
    suggestionsData?.data?.data?.suggestions ||
    [];

  const isSyncingSearch = searchTerm !== debouncedSearchTerm;

  const filteredSuggestions = searchTerm.trim()
    ? (isSyncingSearch 
        ? suggestions.filter((u) => 
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : suggestions)
    : suggestions.slice(0, 5);

  const quickLinks = [
    {
      id: 1,
      title: "My Profile",
      icon: "fas fa-user-circle",
      bgColor: themeColors.primary,
      path: "/profile",
    },
    {
      id: 2,
      title: "Bookmarks",
      icon: "fas fa-bookmark",
      bgColor: themeColors.secondary,
      path: "/bookmarks",
    },
  ];

  const leftSidebarContent = (
    <div className={`rounded-2xl p-4 lg:p-6 shadow-lg bg-white border border-gray-200 ${position !== 'mobile' ? 'sticky top-24' : ''}`}>
      <h3
        className="text-base lg:text-xl font-bold mb-6"
        style={{ color: themeColors.primary }}
      >
        Quick Actions
      </h3>
      <div className="space-y-4 mb-8">
        {quickLinks.map((story) => (
          <div
            onClick={() => story.path && navigate(story.path)}
            key={story.id}
            className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover-theme-light"
            style={{ backgroundColor: themeColors.primary + "02" }}
          >
            <div
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: story.bgColor }}
            >
              <i className={`${story.icon} text-white text-base lg:text-lg`}></i>
            </div>
            <span
              className="font-semibold text-sm lg:text-lg"
              style={{ color: themeColors.text }}
            >
              {story.title}
            </span>
          </div>
        ))}
      </div>

      {/* Search People */}
      <div>
        <h4
          className="text-base lg:text-lg font-bold mb-4"
          style={{ color: themeColors.primary }}
        >
          Search People
        </h4>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded-xl outline-none"
          style={{
            backgroundColor: themeColors.primary + "10",
            color: themeColors.text,
          }}
        />
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {searchTerm.trim() &&
            filteredSuggestions.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-xl"
                onClick={() => navigate(`/user/${friend._id}`)}
              >
                <div className="relative">
                  <img
                    src={friend.photo || fakeProfilePhoto}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <span
                  className="font-medium truncate max-w-[120px]"
                  style={{ color: themeColors.text }}
                >
                  {friend.name}
                </span>
              </div>
            ))}
          {(isFetching || isSyncingSearch) && searchTerm.trim() && (
            <p
              className="text-sm text-center"
              style={{ color: themeColors.textSecondary }}
            >
              Searching...
            </p>
          )}
          {searchTerm.trim() && filteredSuggestions.length === 0 && !isFetching && !isSyncingSearch && (
            <p
              className="text-sm text-center"
              style={{ color: themeColors.textSecondary }}
            >
              No match found.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const rightSidebarContent = (
    <div className={`space-y-6 ${position !== 'mobile' ? 'sticky top-24' : ''}`}>
      <div
        className="rounded-2xl p-4 lg:p-6 shadow-lg border"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.primary + "20",
        }}
      >
        {isloggedIn && (
          <div>
            <h4
              className="text-base lg:text-lg font-bold mb-4"
              style={{ color: themeColors.primary }}
            >
              Suggested Friends
            </h4>
            {isLoading ? (
              <p
                className="text-sm"
                style={{ color: themeColors.textSecondary }}
              >
                Loading suggestions...
              </p>
            ) : suggestions.length === 0 ? (
              <p
                className="text-sm"
                style={{ color: themeColors.textSecondary }}
              >
                No suggestions available.
              </p>
            ) : (
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {filteredSuggestions.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => {
                        if (friend._id === userID) {
                          navigate("/profile");
                        } else {
                          navigate(`/user/${friend._id}`);
                        }
                      }}
                    >
                      <img
                        src={friend.photo || fakeProfilePhoto}
                        alt={friend.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p
                          className="font-semibold text-sm max-w-[120px] truncate hover:underline"
                          title={friend.name}
                          style={{ color: themeColors.text }}
                        >
                          {friend.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(friend._id)}
                      className="px-3 py-1.5 text-sm rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: themeColors.primary,
                        color: "white",
                      }}
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isloggedIn && (
        <div
          className="rounded-2xl p-4 lg:p-6 shadow-lg border"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.primary + "20",
          }}
        >
          <h4
            className="text-base lg:text-lg font-bold mb-4"
            style={{ color: themeColors.primary }}
          >
            Friends
          </h4>
          {!myFriends || myFriends.length === 0 ? (
            <p
              className="text-sm text-center py-2"
              style={{ color: themeColors.textSecondary }}
            >
              You aren't following anyone.
            </p>
          ) : (
            <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
              {myFriends.map((friend) => (
                <div
                  key={friend._id || Math.random()}
                  className="flex items-center justify-between"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                      const fId = friend._id || friend;
                      if (fId === userID) {
                        navigate("/profile");
                      } else {
                        navigate(`/user/${fId}`);
                      }
                    }}
                  >
                    <img
                      src={friend.photo || fakeProfilePhoto}
                      alt={friend.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p
                        className="font-semibold text-sm max-w-[150px] truncate hover:underline"
                        title={friend.name || "Unknown"}
                        style={{ color: themeColors.text }}
                      >
                        {friend.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
  if (position === "mobile") {
    return (
      <div className="flex flex-col gap-6 w-full pb-8">
        {leftSidebarContent}
        {rightSidebarContent}
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 xl:col-span-3 hidden lg:block">
      {position === "left" ? leftSidebarContent : rightSidebarContent}
    </div>
  );
}
