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
      {path: `*`, element: <NotFoundPage/>},
    ]
  }
]
)

export default function App() {
  return (
    <>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools/>
      <RouterProvider router={router} />
    </QueryClientProvider>
    </>
  )
}
