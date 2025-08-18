import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { postDetails, updatePost } from '../Services/FeedServices';
import LoadingPage from './LoadingPage';
import { useMutation } from '@tanstack/react-query';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function EditPostPage () {
  const { themeColors } = useTheme();
  const navigator = useNavigate();
  const { id } = useParams();

  const [originalBody, setOriginalBody] = useState('');
  const [originalImage, setOriginalImage] = useState(null);
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const { mutate: getPostDetails } = useMutation({
    mutationFn: (id) => postDetails(id),
    onSuccess: (data) => {
      setLoading(true);
      setBody(data.data.post.body);
      setOriginalBody(data.data.post.body);
      setImagePreview(data.data.post.image);
      setOriginalImage(data.data.post.image);
    },
    onError: (error) => {
      console.error("Error fetching post details:", error);
    },
  });

  const { mutate: handleSubmit, isPending: isUpdating } = useMutation({
    mutationFn: () => {
      if (!body?.trim() && !image) return;
      const formData = new FormData();
      if (body?.trim()) formData.append("body", body);
      if (image) formData.append("image", image);
      return updatePost(formData, id);
    },
    onSuccess: () => navigator(`/post-details/${id}`),
    onError: (error) => console.error("Error updating post:", error),
  });

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    document.getElementById('imageInput').value = null;
  };

  const handleCancel = () => {
    setImage(null);
    setBody('');
    navigator('/');
  };

  const handleSubmitReload = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  const isDisabled = isUpdating ||
    (originalBody?.trim() === body?.trim() && originalImage === imagePreview) ||
    (!body?.trim() && !imagePreview);

  useEffect(() => {
    getPostDetails(id);
  }, [id]);

  return (
    <>
      {loading ? (
        <div 
          className="max-w-2xl mx-auto shadow rounded-xl p-6 my-8 border"
          style={{ backgroundColor: themeColors.surface, borderColor: themeColors.primary + '20' }}
        >
          {/* Header with Mobile Back Button */}
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-2">
              {/* Mobile Back Button */}
              <button
                onClick={() => navigator(`/post-details/${id}`)}
                className="sm:hidden p-2 rounded-lg transition-colors"
                style={{ 
                  color: themeColors.primary,
                  backgroundColor: themeColors.primary + '10'
                }}
              >
                <i className="fas fa-arrow-left text-lg"></i>
              </button>
              
              <h1 className="text-xl font-bold" style={{ color: themeColors.text }}>
                Edit Post
              </h1>
            </div>
            <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
              Edit the text and image of your post.
            </p>
          </div>

          <form className="space-y-6">
            {/* Caption */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                Caption
              </label>
              <div className="relative">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your changes here..."
                  rows="4"
                  className="w-full rounded-lg border px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  style={{
                    borderColor: themeColors.primary + '30',
                    backgroundColor: themeColors.surface,
                    color: themeColors.text,
                  }}
                />
                <div className="absolute bottom-2 right-3 text-xs" style={{ color: themeColors.textSecondary }}>
                  0 / 500
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                Image
              </label>

              <div className="rounded-lg overflow-hidden border" style={{ borderColor: themeColors.primary + '20', backgroundColor: themeColors.primary + '05' }}>
                {imagePreview && (
                  <div className="aspect-[16/9] flex items-center justify-center" style={{ backgroundColor: themeColors.primary + '10' }}>
                    <img src={imagePreview} alt="Current" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs"
                      style={{ backgroundColor: themeColors.primary + '20', color: themeColors.textSecondary }}>
                      JPG • 800×450
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition"
                      style={{ borderColor: themeColors.primary + '30', color: themeColors.textSecondary, backgroundColor: themeColors.primary + '10' }}>
                      <input type="file" accept="image/*" className="hidden" id="imageInput" onChange={handleImageChange} />
                      <span>Change Image</span>
                    </label>

                    <button type="button" onClick={handleRemoveImage} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition"
                      style={{ borderColor: themeColors.primary + '30', color: themeColors.primary, backgroundColor: themeColors.primary + '10' }}>
                      Remove Image
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <button type="button" onClick={handleCancel} className="px-4 py-3 sm:py-2 rounded-lg border transition order-2 sm:order-1"
                style={{ borderColor: themeColors.primary + '30', color: themeColors.textSecondary, backgroundColor: themeColors.primary + '10' }}>
                <i className="fas fa-times mr-2 sm:hidden"></i>
                Cancel
              </button>

              <button type="submit" onClick={handleSubmitReload} disabled={isDisabled} className="px-5 py-3 sm:py-2 rounded-lg text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center order-1 sm:order-2"
                style={{ backgroundColor: themeColors.primary }}>
                {isUpdating ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Posting...</span>
                  </span>
                ) : (
                  <>
                    <i className="fas fa-save mr-2 sm:hidden"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : <LoadingPage />}
    </>
  )
}
