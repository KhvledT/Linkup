import React, { useRef, useState } from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { useMutation } from '@tanstack/react-query';
import { UploadUserImage } from '../Services/UserDetailsServices.js';
import { queryClient } from '../App.jsx';
import toast from 'react-hot-toast';

export default function ChangeProfilePictureModal({ isOpen, onClose, currentImageUrl }) {
  const { themeColors } = useTheme();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
   const imgRef = useRef(null);

  const { mutate: uploadImage, isPending } = useMutation({
    mutationFn: (formData) => UploadUserImage(formData),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['userDetails'] });
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['userPosts'] });
      }, 1000);

      resetForm();
      onClose?.();
      toast.success('Profile photo updated');
    },
    onError: () => toast.error('Failed to update profile photo'),
  });

  if (!isOpen) return null;

  const resetForm = () => {
    if (previewUrl) {
      try { URL.revokeObjectURL(previewUrl); } catch {}
    }
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    imgRef.current = null;
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleChooseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleChangeClick = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('photo', selectedFile);
    uploadImage(formData);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-md sm:max-w-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
          style={{ color: themeColors.text }}
        >
          <i className="fas fa-times text-sm"></i>
        </button>

        {/* Container */}
        <div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          style={{ backgroundColor: themeColors.surface }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <h2 
              className="text-lg font-semibold"
              style={{ color: themeColors.text }}
            >
              Update Profile Picture
            </h2>
          </div>

          {/* Image Preview */}
          <div className="p-4">
            <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
              {previewUrl ? (
                <img src={previewUrl} ref={imgRef} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No image selected
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 pt-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleChooseClick}
                className="flex-1 p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:bg-gray-50"
                style={{ color: themeColors.text }}
                disabled={isPending}
              >
                <i className="fas fa-image mr-2" style={{ color: themeColors.primary }}></i>
                Choose image
              </button>

              <button 
                onClick={handleChangeClick}
                className="flex-1 p-2.5 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: themeColors.primary, color: 'white' }}
                disabled={!selectedFile || isPending}
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Changing...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <i className="fas fa-check"></i>
                    Change
                  </span>
                )}
              </button>

              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


