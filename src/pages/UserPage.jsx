import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, toggleFollow } from "../Services/FollowServices";
import { useTheme } from "../Contexts/ThemeContext.jsx";
import ProfilePictureModal from "../components/ProfilePictureModal.jsx";
import LoadingPage from "./LoadingPage.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { useNavigate, useParams } from "react-router-dom";
import FetchingIcon from "../components/FetchingIcon.jsx";
import UserPosts from "../components/UserPosts.jsx";
import FollowersModal from "../components/FollowersModal.jsx";
import toast from "react-hot-toast";

export default function UserPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [previewImage, setPreviewImage] = useState(false);
  const [followersModalType, setFollowersModalType] = useState(null);
  const { themeColors } = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["userProfile", id],
    queryFn: () => getUserProfile(id),
    refetchOnWindowFocus: false,
  });

  const { mutate: handleFollow } = useMutation({
    mutationFn: () => toggleFollow(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile", id]);
      queryClient.invalidateQueries(["userProfile"]); // to update the logged in user's profile state in Sidebar
      queryClient.invalidateQueries(["userDetails"]);
      queryClient.invalidateQueries(["suggestions"]);
      toast.success("Follow status updated");
    },
    onError: () => {
      toast.error("Failed to update follow status");
    }
  });

  const user = data?.data?.data?.user || data?.data?.user;
  const isFollowing = data?.data?.data?.isFollowing || data?.data?.isFollowing;

  const handlePreviewImage = () => setPreviewImage(true);

  if (isFetching && !isLoading) return <FetchingIcon />;
  if (isLoading) return <LoadingPage />;
  if (isError) return <ErrorMessage error="Failed to load user profile" refetch={refetch} />;

  return (
    <div
      className="h-fit rounded-2xl shadow-lg w-full pt-10 pb-20 px-4 sm:px-6 transition-all"
      style={{
        backgroundColor: themeColors.surface,
        border: `1px solid ${themeColors.primary}20`,
      }}
    >
      {/* back button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mb-6 rounded-lg p-2 transition-all sm:hidden"
        style={{
          color: themeColors.primary,
          backgroundColor: themeColors.primary + "20",
        }}
      >
        <i className="fas fa-arrow-left"></i>
        Back
      </button>

      {/* User Card */}
      <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border mb-6" style={{ borderColor: themeColors.primary + "20" }}>
        {/* Cover Photo */}
        <div className="h-32 sm:h-48 w-full bg-gray-200 relative">
          {user?.cover ? (
            <img 
              src={user.cover} 
              alt="Cover" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(45deg, ${themeColors.primary}40, ${themeColors.secondary}40)` }}></div>
          )}
        </div>
      <div
        className="w-full p-6 -mt-12 sm:-mt-16 relative z-10 flex flex-col items-center transition-all bg-transparent"
      >
        {/* Profile Image */}
        <div className="relative">
          <img
            src={user?.photo || "../../public/FakeProfileImage.png"}
            alt={user?.name}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 shadow-md cursor-pointer hover:opacity-90 transition-opacity duration-300"
            style={{ borderColor: themeColors.primary }}
            onClick={handlePreviewImage}
          />
        </div>

        {previewImage && (
          <ProfilePictureModal
            isOpen={previewImage}
            onClose={() => setPreviewImage(false)}
            imageUrl={user?.photo}
            userName={user?.name}
          />
        )}

        {/* Name */}
        <h2
          className="text-2xl sm:text-3xl font-bold mt-4 flex items-center gap-2"
          style={{ color: themeColors.text }}
        >
          {user?.name}
        </h2>
        
        <p className="text-sm mt-1 mb-2" style={{ color: themeColors.textSecondary }}>
          {user?.email}
        </p>

        {/* Extra Data */}
        <div className="flex gap-4 mt-2 mb-2">
          {user?.dateOfBirth && (
            <div className="flex items-center gap-2 text-sm" style={{ color: themeColors.textSecondary }}>
              <i className="fas fa-birthday-cake" style={{ color: themeColors.primary }}></i>
              {user.dateOfBirth.slice(0, 10)}
            </div>
          )}
          {user?.gender && (
            <div className="flex items-center gap-2 text-sm capitalize" style={{ color: themeColors.textSecondary }}>
              <i className="fas fa-venus-mars" style={{ color: themeColors.primary }}></i>
              {user.gender}
            </div>
          )}
        </div>

        {/* Follow Button */}
        <button
          onClick={handleFollow}
          className="mt-4 px-6 py-2 rounded-full font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0"
          style={{
            backgroundColor: isFollowing ? 'transparent' : themeColors.primary,
            color: isFollowing ? themeColors.primary : '#fff',
            border: `2px solid ${themeColors.primary}`,
          }}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>

        {/* Info Card */}
        <div
          className="mt-6 w-full rounded-2xl p-6 border shadow-sm transition-all duration-300 grid grid-cols-2 text-center"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.primary + "30",
          }}
        >
          <div className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setFollowersModalType('followers')}>
            <span className="text-xl font-bold" style={{ color: themeColors.text }}>
              {user?.followersCount || 0}
            </span>
            <span className="text-sm" style={{ color: themeColors.textSecondary }}>
              Followers
            </span>
          </div>
          <div className="flex flex-col border-l border-gray-100 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setFollowersModalType('following')}>
            <span className="text-xl font-bold" style={{ color: themeColors.text }}>
              {user?.followingCount || 0}
            </span>
            <span className="text-sm" style={{ color: themeColors.textSecondary }}>
              Following
            </span>
          </div>
        </div>
      </div>
      </div>

      <FollowersModal
        isOpen={!!followersModalType}
        onClose={() => setFollowersModalType(null)}
        title={followersModalType === 'followers' ? 'Followers' : 'Following'}
        users={followersModalType === 'followers' ? user?.followers : user?.following}
      />

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 px-2" style={{ color: themeColors.text }}>
          Posts by {user?.name?.split(' ')[0] || "User"}
        </h3>
        <UserPosts userID={id} />
      </div>
    </div>
  );
}
