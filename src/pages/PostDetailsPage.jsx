import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate();

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
      {/* Mobile Back Button */}
      <div className="sm:hidden mb-4 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 p-2 rounded-lg transition-colors"
          style={{ 
            color: themeColors.primary,
            backgroundColor: themeColors.primary + '10'
          }}
        >
          <i className="fas fa-arrow-left text-lg"></i>
          <span className="font-medium">Back</span>
        </button>
      </div>

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
