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

  const { handleSubmit, register, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema)
  });

  const { mutate: handleloginUser, isLoading, isError } = useMutation({
    mutationFn: (data) => loginUser(data),
    onSuccess: (data) => {
        localStorage.setItem('token', data.data.token);
        setIsloggedIn(true);
        navigator('/');
    },
    onError: (error) => {
        console.log(error);
        setLoginErrorMessage(error.response?.data?.message || error.message);
        setIsloggedIn(false);
        localStorage.removeItem('token');
    }
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8 relative">
      
      {/* Mobile Back Button */}
      <div className="sm:hidden absolute top-4 left-4 z-20">
        <button
          onClick={() => navigator(-1)}
          className="flex items-center gap-2 p-3 rounded-lg transition-colors"
          style={{ 
            color: themeColors.primary,
            backgroundColor: themeColors.background + 'CC'
          }}
        >
          <i className="fas fa-arrow-left text-lg"></i>
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-8 blur-sm"
           style={{ backgroundColor: themeColors.primary }}></div>
      <div className="absolute top-20 right-16 w-16 h-16 transform rotate-45 opacity-6"
           style={{ backgroundColor: themeColors.secondary }}></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full opacity-5 blur-sm"
           style={{ backgroundColor: themeColors.primary }}></div>
      
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left space-y-6">
            <div className="relative">
              <h1 
                className="text-7xl font-bold mb-4 tracking-tight"
                style={{ color: themeColors.primary }}
              >
                Linkup
              </h1>
              <div 
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-60"
                style={{ backgroundColor: themeColors.secondary }}
              ></div>
              <div 
                className="absolute -bottom-2 -left-2 w-6 h-6 transform rotate-45 opacity-60"
                style={{ backgroundColor: themeColors.primary }}
              ></div>
            </div>
            
            <p 
              className="text-2xl font-medium leading-relaxed max-w-lg"
              style={{ color: themeColors.text }}
            >
              Connect with friends and the world around you in a warm, vibrant community.
            </p>
            
            {/* Decorative dots */}
            <div className="flex justify-center lg:justify-start space-x-2 mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i}
                  className="w-3 h-3 rounded-full opacity-60"
                  style={{ backgroundColor: themeColors.secondary }}
                ></div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="relative">
            <div 
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
            >
              {/* Form decorative elements */}
              <div 
                className="absolute -top-4 -right-4 w-8 h-8 rounded-full opacity-40"
                style={{ backgroundColor: themeColors.primary }}
              ></div>
              <div 
                className="absolute -bottom-4 -left-4 w-6 h-6 transform rotate-45 opacity-40"
                style={{ backgroundColor: themeColors.secondary }}
              ></div>
              
              <h2 
                className="text-3xl font-bold text-center mb-8"
                style={{ color: themeColors.primary }}
              >
                Welcome Back
              </h2>

              <form onSubmit={handleSubmit(handleloginUser)} className="space-y-6">
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
                      label: "text-gray-700",
                      errorMessage: "text-red-500"
                    }}
                    {...register('email')}
                  />
                  <div 
                    className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-60"
                    style={{ backgroundColor: themeColors.primary }}
                  ></div>
                </div>

                <div className="relative">
                  <Input
                    size="lg"
                    isInvalid={Boolean(errors.password?.message)}
                    errorMessage={errors.password?.message}
                    label="Password"
                    type="password"
                    classNames={{
                      input: "custom-input",
                      inputWrapper: `custom-input-wrapper ${Boolean(errors.password?.message) ? 'is-invalid' : ''}`,
                      label: "text-gray-700",
                      errorMessage: "text-red-500"
                    }}
                    {...register('password')}
                  />
                  <div 
                    className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-60"
                    style={{ backgroundColor: themeColors.primary }}
                  ></div>
                </div>

                <Button
                  loading={isLoading}
                  size="lg"
                  type="submit"
                  className="w-full text-lg font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{ 
                    backgroundColor: themeColors.primary,
                    color: "white"
                  }}
                >
                  Log In
                </Button>

                {isError && (
                  <div 
                    className="p-4 rounded-xl text-center font-semibold text-lg border-2"
                    style={{ 
                      backgroundColor: `${themeColors.primary}10`,
                      borderColor: themeColors.primary,
                      color: themeColors.primary
                    }}
                  >
                    {loginErrorMessage}
                  </div>
                )}

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
