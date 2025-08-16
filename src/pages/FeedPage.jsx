import  { useContext, useEffect } from 'react'
import Post from '../components/Post'
import { getAllPosts } from '../Services/FeedServices'
import CreatePost from '../components/CreatePost';
import LoadingPage from './LoadingPage';
import { getUserDetails } from '../Services/UserDetailsServices';
import { AuthContext } from '../Contexts/AuthContext';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { useQuery } from '@tanstack/react-query';
import { Button, Spinner } from '@heroui/react';
import FetchingIcon from '../components/FetchingIcon';
import Sidebar from '../components/Sidebar';

export default function FeedPage() { 
  const { setUserID } = useContext(AuthContext);
  const { themeColors } = useTheme();

  const { data, isLoading, refetch, isFetching ,error ,isError } = useQuery({
    queryKey: ['posts'],
    queryFn: getAllPosts,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 2,
    staleTime : 15000
  })

   async function getUserID(){
      if (localStorage.getItem('userID')) {
        setUserID(localStorage.getItem('userID'));
      } else {
          const userID = await getUserDetails();
          if (userID.data.user._id) {
              setUserID(userID.data.user._id);
              localStorage.setItem('userID', userID.data.user._id);
              
          }
      }
  }
  useEffect(() => {
    getUserID();
  }, []);

  return (
    <div className="w-full">
      {/* Create Post Section */}
      <div className="mb-8">
        <CreatePost getPosts={refetch} />
      </div>

      {/* Posts Feed */}
      <div className="space-y-8">
        {(isFetching && !isLoading) && <FetchingIcon />}
        
        {isLoading ? (
          <LoadingPage />
        ) : isError ? (
          <div 
            className="flex flex-col gap-4 justify-center items-center p-10 rounded-2xl bg-white border border-gray-200 shadow-lg"
          >
            <h1 
              className="text-3xl font-bold"
              style={{ color: themeColors.primary }}
            >
              {error.message}
            </h1>
            <Button 
              onPress={refetch}
              className="px-8 py-3 rounded-xl font-semibold text-lg"
              style={{ 
                backgroundColor: themeColors.primary,
                color: "white"
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          data?.data.posts.map(post => (
            <Post 
              key={post?._id} 
              post={post} 
              postId={post?._id} 
              commentLimit={1} 
              getPosts={refetch} 
              from={"feedPage"}
            />
          ))
        )}
      </div>
    </div>
  );
}