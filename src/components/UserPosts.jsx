import { useQuery } from '@tanstack/react-query'
import Post from './Post'
import { getUserPosts } from '../Services/UserDetailsServices'
import { useEffect, useState } from 'react'
import LoadingPage from '../pages/LoadingPage'



export default function UserPosts({userID}) {

    const { data, isLoading, refetch, isFetching ,error ,isError } = useQuery({
        queryKey: ['userPosts'],
        queryFn: () => getUserPosts(userID),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        retry: 2,
        staleTime : 15000,
    })
    

  return (
  <>
    {isLoading ? (
      ''
    ) : isError ? (
      ''
    ) : (
      data.data.posts?.map((post) => (
        <div className='mb-4'>
            <Post
                key={post.id}               // مهم تحط key
                post={post}                 // استخدم post مباشرة
                getUserPosts={refetch}
                commentLimit={post.comments?.length || 0} // لو فيه comments
                from={'userProfilePage'}
            />
        </div>
      ))
    )}
  </>
);
}
