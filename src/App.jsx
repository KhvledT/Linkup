import './App.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import AuthLayout from './Layout/AuthLayout'
import MainLayout from './Layout/MainLayout'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import PostDetailsPage from './pages/PostDetailsPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import EditPostPage from './pages/EditPostPage'
import UserPage from './pages/UserPage'

import ProtactedRoute from './ProtectedRoutes/ProtactedRoute'
import ProtectedAuthRoute from './ProtectedRoutes/ProtectedAuthRoute'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { Toaster } from 'react-hot-toast'
import { useTheme } from './Contexts/ThemeContext.jsx'

// Create a new QueryClient instance for React Query
export const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    // Authentication routes - wrapped in AuthLayout
    path: ``,
    element: <AuthLayout/>,
    children: [
      {path: `login`, element: <ProtectedAuthRoute><LoginPage/></ProtectedAuthRoute>},
      {path: `register`, element: <ProtectedAuthRoute><RegisterPage/></ProtectedAuthRoute>},
    ]
  },
  {
    // Main application routes - wrapped in MainLayout
    path: ``,
    element: <MainLayout/>,
    children: [
      {index: true, element: <ProtactedRoute><FeedPage/></ProtactedRoute>},
      {path: `post-details/:id`, element: <ProtactedRoute><PostDetailsPage/></ProtactedRoute>},
      {path: `profile`, element: <ProtactedRoute><ProfilePage/></ProtactedRoute>},
      {path: `edit-post/:id`, element: <ProtactedRoute><EditPostPage/></ProtactedRoute>},
      {path: `user-page/:id`, element: <ProtactedRoute><UserPage/></ProtactedRoute>},
      {path: `*`, element: <NotFoundPage/>},
    ]
  }
])
export default function App() {
  const { themeColors } = useTheme();
  return (
    // Wrap the app with QueryClientProvider for React Query functionality
    <QueryClientProvider client={queryClient}>
      {/* React Query DevTools for development debugging */}
      <ReactQueryDevtools/>
      
      <RouterProvider router={router} />
      
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: '16px',
            background: themeColors.surface,
            color: themeColors.text,
            padding: '12px 16px',
            fontWeight: 500,
            fontSize: '14px',
            border: `1px solid ${themeColors.primary}20`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          },
          success: {
            style: {
              borderLeft: `4px solid ${themeColors.primary}`,
            },
            iconTheme: {
              primary: themeColors.primary,
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              borderLeft: `4px solid ${themeColors.secondary}`,
            },
            iconTheme: {
              primary: themeColors.secondary,
              secondary: '#ffffff',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
}
