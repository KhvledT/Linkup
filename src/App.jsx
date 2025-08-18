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
import ProtactedRoute from './ProtectedRoutes/ProtactedRoute'
import ProtectedAuthRoute from './ProtectedRoutes/ProtectedAuthRoute'
import EditPostPage from './pages/EditPostPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import UserPage from './pages/UserPage'

export const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: `` ,element: <AuthLayout/> ,children:[
      {path: `login`,element: <ProtectedAuthRoute><LoginPage/></ProtectedAuthRoute>},
      {path: `register`,element: <ProtectedAuthRoute><RegisterPage/></ProtectedAuthRoute>},
    ]
  },
  {
    path: `` ,element: <MainLayout/> ,children:[
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
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools/>
      <RouterProvider router={router} />
      {/* Toaster مركزي لكل التطبيق */}
      <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            // تخصيص الشكل لكل toast
            style: {
              borderRadius: '12px',
              background: '#1f2937', // خلفية داكنة
              color: '#fff',          // لون النص أبيض
              padding: '16px 24px',
              fontWeight: 500,
              fontSize: '14px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              backdropFilter: 'blur(6px)',
            },
            success: {
              style: {
                background: '#10b981', // أخضر للنجاح
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444', // أحمر للفشل
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
