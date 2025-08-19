// Import CSS styles for the application
import './App.css'

// Import React Router components for client-side routing
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Import layout components that wrap different sections of the app
import AuthLayout from './Layout/AuthLayout'
import MainLayout from './Layout/MainLayout'

// Import page components for different routes
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import PostDetailsPage from './pages/PostDetailsPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import EditPostPage from './pages/EditPostPage'
import UserPage from './pages/UserPage'

// Import route protection components
import ProtactedRoute from './ProtectedRoutes/ProtactedRoute'
import ProtectedAuthRoute from './ProtectedRoutes/ProtectedAuthRoute'

// Import React Query for server state management
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Import toast notification component
import { Toaster } from 'react-hot-toast'

// Create a new QueryClient instance for React Query
// This manages server state, caching, and data synchronization
export const queryClient = new QueryClient();

// Define the application routing structure using React Router
// The router handles navigation between different pages and layouts
const router = createBrowserRouter([
  {
    // Authentication routes - wrapped in AuthLayout
    path: ``,
    element: <AuthLayout/>,
    children: [
      // Login page - protected from authenticated users
      {path: `login`, element: <ProtectedAuthRoute><LoginPage/></ProtectedAuthRoute>},
      // Register page - protected from authenticated users
      {path: `register`, element: <ProtectedAuthRoute><RegisterPage/></ProtectedAuthRoute>},
    ]
  },
  {
    // Main application routes - wrapped in MainLayout
    path: ``,
    element: <MainLayout/>,
    children: [
      // Default route - shows the main feed page
      {index: true, element: <ProtactedRoute><FeedPage/></ProtactedRoute>},
      // Post details page - shows individual post with comments
      {path: `post-details/:id`, element: <ProtactedRoute><PostDetailsPage/></ProtactedRoute>},
      // User profile page - shows current user's profile
      {path: `profile`, element: <ProtactedRoute><ProfilePage/></ProtactedRoute>},
      // Edit post page - allows users to edit their posts
      {path: `edit-post/:id`, element: <ProtactedRoute><EditPostPage/></ProtactedRoute>},
      // User page - shows other users' profiles
      {path: `user-page/:id`, element: <ProtactedRoute><UserPage/></ProtactedRoute>},
      // Catch-all route for 404 errors
      {path: `*`, element: <NotFoundPage/>},
    ]
  }
])

// Main App component that wraps the entire application
// Provides React Query context, routing, and global toast notifications
export default function App() {
  return (
    // Wrap the app with QueryClientProvider for React Query functionality
    <QueryClientProvider client={queryClient}>
      {/* React Query DevTools for development debugging */}
      <ReactQueryDevtools/>
      
      {/* Router provider for client-side navigation */}
      <RouterProvider router={router} />
      
      {/* Global toast notification system */}
      {/* Configured with custom styling and positioning */}
      <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            // Custom styling for all toast notifications
            style: {
              borderRadius: '12px',
              background: '#1f2937', // Dark background
              color: '#fff',          // White text
              padding: '16px 24px',
              fontWeight: 500,
              fontSize: '14px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              backdropFilter: 'blur(6px)',
            },
            // Success toast styling
            success: {
              style: {
                background: '#10b981', // Green for success
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            // Error toast styling
            error: {
              style: {
                background: '#ef4444', // Red for errors
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
        />
    </QueryClientProvider>
  )
}
