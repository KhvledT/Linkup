import React, { useState } from 'react';
import { createPost } from '../Services/FeedServices';
import { addToast } from '@heroui/react';
import { useMutation } from '@tanstack/react-query';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { queryClient } from '../App.jsx';

export default function CreatePost() {
  const { themeColors } = useTheme();
  const [body, setBody] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [image, setImage] = useState(null);

  const handleRemoveImage = () => {
    setImagePreview('');
    setImage(null);
    document.getElementById('imageInput').value = null;
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const { mutate: handleSubmit, isPending } = useMutation({
    mutationFn: () => {
      if (!body.trim() && !image) return;
      const formData = new FormData();
      if (body) formData.append('body', body);
      if (image) formData.append('image', image);
      return createPost(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']); // Refetch feed تلقائي
      setShowForm(false);
      setBody('');
      handleRemoveImage();
      addToast({ title: 'Post Created', timeout: 3000, color: 'success' });
    },
    onError: () => {
      addToast({ title: 'Error Creating Post', timeout: 3000, color: 'danger' });
    },
  });

  const handleReload = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div
      className="rounded-2xl shadow-sm border p-6 mb-8"
      style={{ backgroundColor: themeColors.surface, borderColor: themeColors.primary + '20' }}
    >
      {showForm ? (
        <form className="space-y-4" onSubmit={handleReload}>
          <textarea
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-opacity-50 focus:border-transparent resize-none transition-all duration-300"
            style={{
              borderColor: themeColors.primary + '30',
              backgroundColor: themeColors.surface,
              color: themeColors.text,
              focusRingColor: themeColors.primary,
            }}
            rows="3"
          />

          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
              <button
                onClick={handleRemoveImage}
                type="button"
                className="absolute top-3 right-3 text-white rounded-full p-2 transition duration-200 shadow-lg"
                style={{ backgroundColor: themeColors.primary }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center sm:items-stretch sm:justify-between gap-3">
            <div className="flex items-center justify-center sm:justify-start order-2 sm:order-1">
              <label className="cursor-pointer transition duration-200 hover:scale-105">
                <input onChange={handleImageChange} id="imageInput" type="file" accept="image/*" className="hidden" />
                <div
                  className="flex items-center justify-center space-x-2 px-3 py-2 sm:p-2 rounded-lg transition duration-200"
                  style={{ color: themeColors.textSecondary, backgroundColor: themeColors.primary + '10' }}
                >
                  <i className="fas fa-image w-4 h-4 sm:w-5 sm:h-5"></i>
                  <span className="text-xs sm:text-sm font-medium">Add Photo</span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-center gap-2 order-1 sm:order-2">
              <button
                type="button"
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition duration-200 font-medium text-sm"
                style={{ color: themeColors.textSecondary, backgroundColor: themeColors.primary + '10' }}
                onClick={() => setShowForm(false)}
              >
                <i className="fas fa-times mr-1 sm:mr-2 text-xs sm:text-sm sm:hidden"></i>
                Cancel
              </button>
              <button
                disabled={isPending || (body.trim() === '' && !image)}
                type="submit"
                className="px-4 py-1.5 sm:px-6 sm:py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: themeColors.primary, color: 'white' }}
              >
                {isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Posting...</span>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2 sm:hidden"></i>
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full cursor-pointer text-left p-4 rounded-xl border transition-all duration-300"
          style={{ color: themeColors.textSecondary, borderColor: themeColors.primary + '20', backgroundColor: themeColors.primary + '05' }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColors.primary }}>
              <i className="fas fa-user text-white"></i>
            </div>
            <span className="font-medium">What's on your mind? Share a post...</span>
          </div>
        </button>
      )}
    </div>
  );
}
