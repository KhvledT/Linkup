import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { postDetails } from "../Services/FeedServices";
import { useTheme } from "../Contexts/ThemeContext.jsx";
import ProfilePictureModal from "../components/ProfilePictureModal.jsx";
import LoadingPage from "./LoadingPage.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { useNavigate, useParams } from "react-router-dom";
import FetchingIcon from "../components/FetchingIcon.jsx";

export default function UserPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // postId
  const [previewImage, setPreviewImage] = useState(false);
  const { themeColors } = useTheme();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["postDetails", id],
    queryFn: () => postDetails(id),
    refetchOnWindowFocus: false,
  });

  const user = data?.data?.post?.user;

  const handlePreviewImage = () => setPreviewImage(true);

  if (isFetching && !isLoading) return <FetchingIcon />;
  if (isLoading) return <LoadingPage />;
  if (isError) return <ErrorMessage error="حدث خطأ" refetch={refetch} />;

  return (
    <div className="h-fit bg-white rounded-2xl shadow-lg border border-gray-100 w-full pt-10 pb-20 px-4 sm:px-6">
      {/* back button */}
      <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mb-6 rounded-lg p-2 transition-all sm:hidden"
            style={{ color: themeColors.primary, backgroundColor: themeColors.primary + "10" }}
            >
            <i className="fas fa-arrow-left"></i>
            Back
        </button>

      {/* User Card */}
      <div
        className="w-full  p-6 flex flex-col items-center transition-all"
        style={{ borderColor: themeColors.primary + "20" }}
      >
        {/* Profile Image */}
        <div className="relative">
          <img
            src={user?.photo}
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
        <h2 className="text-2xl sm:text-3xl font-bold mt-4 flex items-center gap-2" style={{ color: themeColors.text }}>
          <i className="fas fa-user text-xl sm:text-2xl" style={{ color: themeColors.primary }}></i>
          {user?.name}
        </h2>

        {/* Optional Bio or Info Card */}
        <div
          className="mt-6 w-full bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-2 hover:bg-gray-100 transition-all duration-300"
          style={{ borderColor: themeColors.primary + "20" }}
        >
          <p className="text-sm sm:text-base" style={{ color: themeColors.textSecondary }}>
            Bio: Passionate about technology and creativity. Loves to explore new ideas, build projects, and connect with like-minded people.
        </p>
          <p className="text-sm sm:text-base" style={{ color: themeColors.textSecondary }}>
            Joined: 2023-01-15
          </p>
        </div>
      </div>
    </div>
  );
}
