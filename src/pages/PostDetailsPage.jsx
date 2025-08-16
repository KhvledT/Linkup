import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { postDetails} from '../Services/FeedServices';
import Post from '../components/Post'
import { useQuery } from '@tanstack/react-query';
import LoadingPage from './LoadingPage';
import ErrorMessage from '../components/ErrorMessage';
import FetchingIcon from '../components/FetchingIcon';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import Sidebar from '../components/Sidebar';

export default function PostDetailsPage() {

  const {id} = useParams();
  const { themeColors } = useTheme();

  const { data, refetch, isFetching ,isLoading ,error ,isError } = useQuery({
    queryKey: ['postDetails', id],
    queryFn: () => postDetails(id),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 2,
    staleTime : 15000
  })
  

  return (
    <div className="w-full">
      {(isFetching && !isLoading) && <FetchingIcon />}
      {
        isLoading 
        ?
        <LoadingPage />
        :
        isError
        ?
        
        <ErrorMessage error={error} refetch={refetch} />
        :
        <Post post={data?.data.post} getPostDetails={refetch} commentLimit={data?.data.post.comments.length} id={id} from={'PostDetailsPage'} />
        }
    </div>
  )
}
