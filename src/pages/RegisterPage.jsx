import { Button, Input, Select, SelectItem } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../schema/RegisterSchema';
import { registerUser } from "../Services/AuthService";
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthContext.jsx';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function RegisterPage() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigator = useNavigate();
  const { setIsloggedIn } = useContext(AuthContext);
  const { themeColors } = useTheme();

  const { handleSubmit, register, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      rePassword: '',
      dateOfBirth: '',
      gender: '',
    },
    resolver: zodResolver(registerSchema)
  });

  const watchedGender = watch('gender');

  const {mutate : handleRegister, isLoading  } = useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: (data) => {
      setSuccess("Account created successfully!");
      setError('');
      setTimeout(() => {
        navigator('/login');
      }, 2000);
    },
    onError: (error) => {
      setSuccess('');
      setError(error.response.data.error);
      setIsloggedIn(false);
      localStorage.removeItem('token');
    }
  })

  return (
    <div className="relative">
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      
      {/* Decorative Elements */}
      <div className="absolute top-16 left-16 w-24 h-24 rounded-full opacity-8 blur-sm"
           style={{ backgroundColor: themeColors.primary }}></div>
      <div className="absolute top-32 right-24 w-20 h-20 transform rotate-45 opacity-6"
           style={{ backgroundColor: themeColors.secondary }}></div>
      <div className="absolute bottom-24 left-32 w-28 h-28 rounded-full opacity-5 blur-sm"
           style={{ backgroundColor: themeColors.primary }}></div>
      <div className="absolute bottom-40 right-16 w-16 h-16 transform rotate-12 opacity-6"
           style={{ backgroundColor: themeColors.primary }}></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-2xl">
        <div 
          className="bg-white rounded-3xl p-4 sm:p-6 lg:p-10 shadow-xl border border-gray-200 relative"
        >
          {/* Decorative corner elements */}
          <div 
            className="absolute -top-6 -right-6 w-12 h-12 rounded-full opacity-40"
            style={{ backgroundColor: themeColors.primary }}
          ></div>
          <div 
            className="absolute -bottom-6 -left-6 w-10 h-10 transform rotate-45 opacity-40"
            style={{ backgroundColor: themeColors.secondary }}
          ></div>
          <div 
            className="absolute top-8 -right-3 w-6 h-6 rounded-full opacity-60"
            style={{ backgroundColor: themeColors.primary }}
          ></div>
          <div 
            className="absolute -bottom-3 right-8 w-4 h-4 transform rotate-45 opacity-60"
            style={{ backgroundColor: themeColors.primary }}
          ></div>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10 relative">
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4"
              style={{ color: themeColors.primary }}
            >
              Join SocialHub
            </h1>
            <p 
              className="text-lg sm:text-xl font-medium"
              style={{ color: themeColors.text }}
            >
              Start your journey with us
            </p>
            
            {/* Decorative line */}
            <div className="flex justify-center items-center mt-3 sm:mt-4 lg:mt-6 space-x-2">
              <div 
                className="w-8 h-1 rounded-full"
                style={{ backgroundColor: themeColors.primary }}
              ></div>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: themeColors.secondary }}
              ></div>
              <div 
                className="w-8 h-1 rounded-full"
                style={{ backgroundColor: themeColors.primary }}
              ></div>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  size="lg"
                  isInvalid={Boolean(errors.name?.message)}
                  errorMessage={errors.name?.message}
                  label="Full Name"
                  type="text"
                  classNames={{
                    input: "custom-input",
                    inputWrapper: `custom-input-wrapper ${Boolean(errors.name?.message) ? 'is-invalid' : ''}`,
                    label: "text-gray-700",
                    errorMessage: "text-red-500"
                  }}
                  {...register('name')}
                />
                <div 
                  className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-60"
                  style={{ backgroundColor: themeColors.primary }}
                ></div>
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="relative">
                <Input
                  size="lg"
                  isInvalid={Boolean(errors.rePassword?.message)}
                  errorMessage={errors.rePassword?.message}
                  label="Confirm Password"
                  type="password"
                  classNames={{
                    input: "custom-input",
                    inputWrapper: `custom-input-wrapper ${Boolean(errors.rePassword?.message) ? 'is-invalid' : ''}`,
                    label: "text-gray-700",
                    errorMessage: "text-red-500"
                  }}
                  {...register('rePassword')}
                />
                <div 
                  className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-60"
                  style={{ backgroundColor: themeColors.primary }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  size="lg"
                  isInvalid={Boolean(errors.dateOfBirth?.message)}
                  errorMessage={errors.dateOfBirth?.message}
                  label="Date of Birth"
                  type="date"
                  classNames={{
                    input: "custom-input",
                    inputWrapper: `custom-input-wrapper ${Boolean(errors.dateOfBirth?.message) ? 'is-invalid' : ''}`,
                    label: "text-gray-700",
                    errorMessage: "text-red-500"
                  }}
                  {...register('dateOfBirth')}
                />
                <div 
                  className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-60"
                  style={{ backgroundColor: themeColors.primary }}
                ></div>
              </div>

              <div className="relative">
                <Select
                  size="lg"
                  isInvalid={Boolean(errors.gender?.message)}
                  errorMessage={errors.gender?.message}
                  label="Gender"
                  placeholder="Select gender"
                  selectedKeys={watchedGender ? [watchedGender] : []}
                  classNames={{
                    trigger: `custom-select-trigger ${Boolean(errors.gender?.message) ? 'is-invalid' : ''}`,
                    label: "text-gray-700",
                    errorMessage: "text-red-500",
                    listbox: "custom-select-listbox",
                    listboxWrapper: "custom-select-listbox"
                  }}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    if (selectedKey) {
                      // Update the form value
                      const event = { target: { name: 'gender', value: selectedKey } };
                      register('gender').onChange(event);
                    }
                  }}
                >
                  <SelectItem key="male" className="custom-select-item">Male</SelectItem>
                  <SelectItem key="female" className="custom-select-item">Female</SelectItem>
                </Select>
                <div 
                  className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-60"
                  style={{ backgroundColor: themeColors.primary }}
                ></div>
              </div>
            </div>

            <Button
              loading={isLoading}
              size="lg"
              type="submit"
              className="w-full text-lg font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105 mt-8"
              style={{ 
                backgroundColor: themeColors.primary,
                color: "white"
              }}
            >
              Create Account
            </Button>

            {success && (
              <div 
                className="p-4 rounded-xl text-center font-semibold text-lg border-2"
                style={{ 
                  backgroundColor: `${themeColors.primary}10`,
                  borderColor: themeColors.primary,
                  color: themeColors.primary
                }}
              >
                {success}
              </div>
            )}
            
            {error && (
              <div 
                className="p-4 rounded-xl text-center font-semibold text-lg border-2"
                style={{ 
                  backgroundColor: `${themeColors.primary}10`,
                  borderColor: themeColors.primary,
                  color: themeColors.primary
                }}
              >
                {error}
              </div>
            )}

            <div className="text-center pt-6">
              <p 
                className="text-lg"
                style={{ color: themeColors.text }}
              >
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="font-semibold transition-all duration-300 hover:scale-105"
                  style={{ color: themeColors.primary }}
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
