import React, { useState, useContext } from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { useMutation } from '@tanstack/react-query';
import { changeUserPassword } from '../Services/UserDetailsServices.js';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthContext.jsx';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  const { setIsloggedIn } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { mutate: handleChangePassword, isLoading } = useMutation({
    mutationFn: (data) => {
      return changeUserPassword(data);
    },
    onSuccess: () => {
      setFormData({ password: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      setShowSuccessMessage(true);
      
      // Show success message for 3 seconds, then logout and redirect
      setTimeout(() => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userID');
        
        // Update auth context
        setIsloggedIn(false);
        
        // Close modal and redirect to login
        onClose();
        navigate('/login');
      }, 3000);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setErrors({ submit: errorMessage });
    }
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordSyntax = (password) => {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    // Current password validation
    if (!formData.password) {
      newErrors.password = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!validatePasswordSyntax(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (#?!@$%^&*-)';
    }

    // Password confirmation validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if new password is different from current
    if (formData.password && formData.newPassword && formData.password === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleChangePassword({
        password: formData.password,
        newPassword: formData.newPassword
      });
    }
  };

  const handleClose = () => {
    setFormData({ password: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setShowPasswords({ current: false, new: false, confirm: false });
    setShowSuccessMessage(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-md p-4"
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

        {/* Success Message Overlay */}
        {showSuccessMessage && (
          <div className="absolute inset-0 bg-white rounded-2xl shadow-xl flex items-center justify-center z-10" style={{ backgroundColor: themeColors.surface }}>
            <div className="text-center p-8">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: '#10B981' }}
              >
                <i className="fas fa-check text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                Password Changed Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                You will be logged out and redirected to login page...
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm text-gray-500">Redirecting...</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Container */}
        <div className="bg-white rounded-2xl shadow-xl p-6" style={{ backgroundColor: themeColors.surface }}>
          {/* Header */}
          <div className="text-center mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: themeColors.primary }}
            >
              <i className="fas fa-lock text-2xl text-white"></i>
            </div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: themeColors.text }}
            >
              Change Password
            </h2>
            <p 
              className="text-sm"
              style={{ color: themeColors.textSecondary }}
            >
              Enter your current password and choose a new one
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text }}
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all duration-300"
                  style={{ 
                    borderColor: errors.password ? '#EF4444' : undefined,
                    focusRingColor: themeColors.primary,
                    backgroundColor: themeColors.surface
                  }}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                  style={{ color: themeColors.textSecondary }}
                >
                  <i className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text }}
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full p-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all duration-300"
                  style={{ 
                    borderColor: errors.newPassword ? '#EF4444' : undefined,
                    focusRingColor: themeColors.primary,
                    backgroundColor: themeColors.surface
                  }}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                  style={{ color: themeColors.textSecondary }}
                >
                  <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text }}
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all duration-300"
                  style={{ 
                    borderColor: errors.confirmPassword ? '#EF4444' : undefined,
                    focusRingColor: themeColors.primary,
                    backgroundColor: themeColors.surface
                  }}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                  style={{ color: themeColors.textSecondary }}
                >
                  <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                style={{ color: themeColors.text }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 p-3 rounded-xl text-white font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: themeColors.primary }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Changing...
                  </div>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
