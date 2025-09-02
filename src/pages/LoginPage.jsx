// Import HeroUI components for consistent UI design
import { Button, Input } from '@heroui/react';

// Import React Hook Form for form state management
import { useForm } from 'react-hook-form';

// Import Zod resolver for form validation
import { zodResolver } from '@hookform/resolvers/zod';

// Import login validation schema
import { loginSchema } from '../schema/LoginSchama';

// Import authentication service for API calls
import { loginUser } from "../Services/AuthService";

// Import React hooks for context and state management
import { useContext, useState } from 'react';

// Import React Router components for navigation
import { Link, useNavigate } from 'react-router-dom';

// Import context providers for authentication and theming
import { AuthContext } from '../Contexts/AuthContext.jsx';
import { useTheme } from '../Contexts/ThemeContext.jsx';

// Import React Query for server state management
import { useMutation } from '@tanstack/react-query';

// Login page component for user authentication
// Features a beautiful design with form validation and error handling
export default function LoginPage() {
  // Navigation function for routing after successful login
  const navigator = useNavigate();
  
  // Authentication context for managing login state
  const { setIsloggedIn } = useContext(AuthContext);
  
  // Theme context for dynamic styling
  const { themeColors } = useTheme();
  
  // Local state for displaying login error messages
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  
  // Local state for password visibility toggle
  const [showPassword, setShowPassword] = useState(false); 

  // React Hook Form setup with Zod validation
  // Provides form state management and validation
  const { handleSubmit, register, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema)
  });

  // React Query mutation for user login
  // Handles API calls, loading states, and success/error handling
  const { mutate: handleloginUser, isPending, isError } = useMutation({
    mutationFn: (data) => loginUser(data),
    onSuccess: (data) => {
      // Store authentication token in localStorage
      localStorage.setItem('token', data.data.token);
      // Update global authentication state
      setIsloggedIn(true);
      // Navigate to home page after successful login
      navigator('/');
    },
    onError: (error) => {
      // Handle login error and display user-friendly message
      setLoginErrorMessage(error.response?.data?.message || error.message);
      // Reset authentication state on error
      setIsloggedIn(false);
      // Remove invalid token from localStorage
      localStorage.removeItem('token');
    }
  });

  return (
    // Main container with full-screen height and centered content
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8 relative">
      {/* Decorative Background Elements */}
      {/* Floating shapes that add visual interest to the background */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-8 blur-sm"
           style={{ backgroundColor: themeColors.primary }}></div>
      <div className="absolute top-20 right-16 w-16 h-16 transform rotate-45 opacity-6"
           style={{ backgroundColor: themeColors.secondary }}></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full opacity-5 blur-sm"
           style={{ backgroundColor: themeColors.primary }}></div>
      
      {/* Main Content Container */}
      {/* Wrapper for the main content with proper z-index layering */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Two-column grid layout for branding and form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding Section */}
          {/* Company branding with logo, tagline, and decorative elements */}
          <div className="text-center lg:text-left space-y-4 sm:space-y-6">
            {/* Logo container with decorative accent elements */}
            <div className="relative">
              {/* Main company logo and name */}
              <h1 
                className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-2 sm:mb-4 tracking-tight"
                style={{ color: themeColors.primary }}
              >
                <i className="fa-solid fa-link pe-12 text-4xl sm:text-6xl lg:text-6xl "></i> 
                Linkup
              </h1>
              {/* Top-right decorative accent */}
              <div 
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-8 sm:h-8 rounded-full opacity-60"
                style={{ backgroundColor: themeColors.secondary }}
              ></div>
              {/* Bottom-left decorative accent */}
              <div 
                className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-3 h-3 sm:w-6 sm:h-6 transform rotate-45 opacity-60"
                style={{ backgroundColor: themeColors.primary }}
              ></div>
            </div>
            
            {/* Company tagline */}
            <p 
              className="text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed max-w-lg"
              style={{ color: themeColors.text }}
            >
              Connect with friends and the world around you in a warm, vibrant community.
            </p>
            
            {/* Decorative accent dots */}
            {/* Small circular elements that add visual interest */}
            <div className="flex justify-center lg:justify-start space-x-2 mt-4 sm:mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i}
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full opacity-60"
                  style={{ backgroundColor: themeColors.secondary }}
                ></div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form Section */}
          {/* User authentication form with decorative elements */}
          <div className="relative">
            {/* Form container with white background and shadow */}
            <div 
              className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-200"
            >
              {/* Form decorative accent elements */}
              {/* Top-right circular accent */}
              <div 
                className="absolute -top-4 -right-4 w-8 h-8 rounded-full opacity-40"
                style={{ backgroundColor: themeColors.primary }}
              ></div>
              {/* Bottom-left square accent */}
              <div 
                className="absolute -bottom-4 -left-4 w-6 h-6 transform rotate-45 opacity-40"
                style={{ backgroundColor: themeColors.secondary }}
              ></div>
              
              {/* Form title */}
              <h2 
                className="text-3xl font-bold text-center mb-8"
                style={{ color: themeColors.primary }}
              >
                Welcome Back
              </h2>

              {/* Login form with validation and error handling */}
              <form onSubmit={handleSubmit(handleloginUser)} className="space-y-6">
                {/* Email input field */}
                <div className="relative">
                  <Input
                    size="lg"
                    isInvalid={Boolean(errors.email?.message)}
                    errorMessage={errors.email?.message}
                    label="Email"
                    type="email"
                    classNames={{
                      input: "custom-input",
                      inputWrapper: `custom-input-wrapper ${Boolean(errors.email?.message) ? 'is-invalid' : ''}`,
                      label: "text-gray-300",
                      errorMessage: "text-red-500"
                    }}
                    {...register('email')}
                  />
                  {/* Decorative accent dot on email field */}
                  <div 
                    className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-60"
                    style={{ backgroundColor: themeColors.primary }}
                  ></div>
                </div>

                {/* Password input field with visibility toggle */}
                <div className="relative">
                  <Input
                    size="lg"
                    isInvalid={Boolean(errors.password?.message)}
                    errorMessage={errors.password?.message}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    classNames={{
                      input: "custom-input",
                      inputWrapper: `custom-input-wrapper ${Boolean(errors.password?.message) ? 'is-invalid' : ''}`,
                      label: "text-gray-300",
                      errorMessage: "text-red-500"
                    }}
                    {...register('password')}
                  />
                  
                  {/* Password visibility toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-5  -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <i className="fa-solid fa-eye-slash"></i>
                    ) : (
                      <i className="fa-solid fa-eye"></i>
                    )}
                  </button>
                </div>

                {/* Submit button for form submission */}
                <Button
                  size="lg"
                  type="submit"
                  isDisabled={isPending}
                  className="w-full text-lg font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: themeColors.primary,
                    color: "white"
                  }}
                >
                  {isPending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    'Log In'
                  )}
                </Button>

                {/* Error message display */}
                {/* Shows when login credentials are incorrect */}
                {isError && (
                  <div 
                    className="p-4 rounded-xl text-center font-semibold text-lg border-2"
                    style={{ 
                      backgroundColor: `${themeColors.primary}10`,
                      borderColor: themeColors.primary,
                      color: themeColors.primary
                    }}
                  >
                    Email or password is incorrect, please try again.
                  </div>
                )}

                {/* Registration link for new users */}
                <div className="text-center pt-4">
                  <Link 
                    to="/register" 
                    className="text-lg font-medium transition-all duration-300 hover:scale-105"
                    style={{ color: themeColors.primary }}
                  >
                    Create new account
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
