import { Button, Input } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schema/LoginSchama';
import { loginUser } from "../Services/AuthService";
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthContext.jsx';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { useMutation } from '@tanstack/react-query';
export default function LoginPage() {
  const navigator = useNavigate();
  const { setIsloggedIn } = useContext(AuthContext);
  const { themeColors } = useTheme();
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); 

  const { handleSubmit, register, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema)
  });

  const { mutate: handleloginUser, isPending, isError } = useMutation({
    mutationFn: (data) => loginUser(data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.data.token);
      setIsloggedIn(true);
      navigator('/');
    },
    onError: (error) => {
      setLoginErrorMessage(error.response?.data?.message || error.message);
      setIsloggedIn(false);
      localStorage.removeItem('token');
    }
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8 relative">
     
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-8 blur-sm"
           style={{ backgroundColor: themeColors.primary }}></div>
      <div className="absolute top-20 right-16 w-16 h-16 transform rotate-45 opacity-6"
           style={{ backgroundColor: themeColors.secondary }}></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full opacity-5 blur-sm"
           style={{ backgroundColor: themeColors.primary }}></div>
      
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding Section */}
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
              <div 
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-8 sm:h-8 rounded-full opacity-60"
                style={{ backgroundColor: themeColors.secondary }}
              ></div>
              <div 
                className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-3 h-3 sm:w-6 sm:h-6 transform rotate-45 opacity-60"
                style={{ backgroundColor: themeColors.primary }}
              ></div>
            </div>
            
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

          <div className="relative">
            <div 
              className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-200"
            >
              <div 
                className="absolute -top-4 -right-4 w-8 h-8 rounded-full opacity-40"
                style={{ backgroundColor: themeColors.primary }}
              ></div>
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
