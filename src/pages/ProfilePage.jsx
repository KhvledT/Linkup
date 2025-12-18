import React, { useContext, useRef, useState } from "react";
import { getUserDetails } from "../Services/UserDetailsServices";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import LoadingPage from "./LoadingPage";
import ErrorMessage from "../components/ErrorMessage";
import FetchingIcon from "../components/FetchingIcon";
import ProfilePictureModal from "../components/ProfilePictureModal";
import ChangeProfilePictureModal from "../components/ChangeProfilePictureModal.jsx";
import SettingsModal from "../components/SettingsModal";
import { useTheme } from '../Contexts/ThemeContext.jsx';
import UserPosts from "../components/UserPosts.jsx";
import { AuthContext } from "../Contexts/AuthContext.jsx";

export default function ProfilePage() {
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChangeProfilePictureModalOpen, setIsChangeProfilePictureModalOpen] = useState(false);
  const { userID } = useContext(AuthContext);
  

  const { data, isLoading, refetch , isFetching, error, isError } = useQuery({
    queryKey: ["userDetails"],
    queryFn: getUserDetails,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 2,
    staleTime: 30000,
  });

  // Direct upload flow removed; handled inside ChangeProfilePictureModal

  const handleProfilePictureClick = () => {
    setIsProfilePictureModalOpen(true);
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCameraClick = () => {
    setIsChangeProfilePictureModalOpen(true);
  };

  return (
    <div className="w-full">
      {/* Mobile Back Button */}
      <div className="sm:hidden mb-4 px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 p-2 rounded-lg transition-colors"
          style={{ 
            color: themeColors.primary,
            backgroundColor: themeColors.primary + '10'
          }}
        >
          <i className="fas fa-arrow-left text-lg"></i>
          <span className="font-medium">Back to Feed</span>
        </button>
      </div>

      {isFetching && !isLoading && <FetchingIcon />}
      {isLoading 
      ?
      <LoadingPage />
      :
      isError 
      ?
      <ErrorMessage error={error} refetch={refetch} />
      :
       <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 sm:p-6">
         {/* Profile Header */}
         <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
           {/* Profile Image */}
           <div className="relative">
             <img
               src={data?.data.user.photo}
               alt="Profile"
               className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 shadow-sm cursor-pointer hover:opacity-90 transition-opacity duration-200"
               style={{ borderColor: themeColors.primary }}
               onClick={handleProfilePictureClick}
             />
             {/* Edit Icon */}
             <button
               onClick={handleCameraClick}
               className="absolute -bottom-1 -right-1 p-2.5 rounded-full shadow-md transition-all duration-300 hover:scale-110"
               style={{ 
                 backgroundColor: themeColors.primary,
                 color: "white"
               }}
               
             >
               <i className="fas fa-camera text-sm"></i>
             </button>
           </div>

           {/* Name & Email */}
           <div className="text-center sm:text-left">
             <h1 
               className="text-2xl font-bold flex items-center justify-center sm:justify-start gap-2.5 mb-1.5"
               style={{ color: themeColors.text }}
             >
               <i className="fas fa-user text-lg" style={{ color: themeColors.primary }}></i> 
               {data?.data.user.name}
             </h1>
             <p 
               className="flex items-center justify-center sm:justify-start gap-2.5 text-sm"
               style={{ color: themeColors.textSecondary }}
             >
               <i className="fas fa-envelope text-sm" style={{ color: themeColors.primary }}></i> 
               {data?.data.user.email}
             </p>
           </div>
         </div>

         {/* Details Section */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
           <div 
             className="p-3 sm:p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300"
             style={{ backgroundColor: `${themeColors.primary}03` }}
           >
             <div className="flex items-center justify-between">
               <span 
                 className="font-medium flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm"
                 style={{ color: themeColors.text }}
               >
                 <i className="fas fa-birthday-cake text-base sm:text-lg" style={{ color: themeColors.primary }}></i> 
                 <span className="hidden sm:inline">Date of Birth</span>
                 <span className="sm:hidden">DOB</span>
               </span>
               <span 
                 className="font-medium text-xs sm:text-sm"
                 style={{ color: themeColors.textSecondary }}
               >
                 {data?.data.user.dateOfBirth.slice(0, 10)}
               </span>
             </div>
           </div>

           <div 
             className="p-3 sm:p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300"
             style={{ backgroundColor: `${themeColors.primary}03` }}
           >
             <div className="flex items-center justify-between">
               <span 
                 className="font-medium flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm"
                 style={{ color: themeColors.textSecondary }}
               >
                 <i className="fas fa-venus-mars text-base sm:text-lg" style={{ color: themeColors.primary }}></i> 
                 Gender
               </span>
               <span 
                 className="font-medium text-xs sm:text-sm capitalize"
                 style={{ color: themeColors.textSecondary }}
               >
                 {data?.data.user.gender}
               </span>
             </div>
           </div>
         </div>

         {/* Settings Button */}
         <div className="pt-3 sm:pt-4 border-t border-gray-100">
           <div className="flex justify-center">
             <button 
               onClick={handleSettingsClick}
               className="flex items-center justify-center gap-2 sm:gap-2.5 p-2 sm:p-3 px-4 sm:px-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:bg-gray-50 hover:scale-105 text-sm sm:text-base"
               style={{ color: themeColors.text }}
             >
               <i className="fas fa-cog text-sm sm:text-base" style={{ color: themeColors.primary }}></i>
               <span className="font-medium">Settings</span>
             </button>
           </div>
         </div>
       </div>}

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        imageUrl={data?.data.user.photo}
        userName={data?.data.user.name}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Change Profile Picture Modal */}
      <ChangeProfilePictureModal 
        isOpen={isChangeProfilePictureModalOpen}
        onClose={() => setIsChangeProfilePictureModalOpen(false)}
        currentImageUrl={data?.data.user.photo}
      />

      {/* User Posts */}
      <div className="mt-6 sm:mt-8 lg:mt-10">
        <UserPosts userID={userID} />
        </div>
    </div>
  );
}
