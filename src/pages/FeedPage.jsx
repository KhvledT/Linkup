import { useContext, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import LoadingPage from './LoadingPage';
import ErrorMessage from '../components/ErrorMessage.jsx';
import FetchingIcon from '../components/FetchingIcon';
import { getAllPosts } from '../Services/FeedServices';
import { getUserDetails } from '../Services/UserDetailsServices';
import { AuthContext } from '../Contexts/AuthContext';

export default function FeedPage() {
  const { setUserID } = useContext(AuthContext);
  const loadMoreRef = useRef(null);
  const location = useLocation();

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) => getAllPosts(pageParam),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.posts.length < 50 ? undefined : allPages.length + 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    staleTime: 15000,
  });

  async function getUserID() {
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

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '10000px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadMoreRef, hasNextPage, fetchNextPage]);
  

  // Refetch when location changes to FeedPage
  useEffect(() => {
    if (location.pathname === '/feed') {
      refetch();
    }
  }, [location.pathname, refetch]);

  return (
    <div className="w-full">
      <div className="mb-8">
        <CreatePost />
      </div>

      <div className="space-y-8">
        {isFetching && !isLoading && <FetchingIcon />}
        {isLoading ? (
          <LoadingPage />
        ) : isError ? (
          <ErrorMessage error={error} refetch={refetch} />
        ) : (
          <>
            {data.pages.map((page, i) => (
              <div key={i} className="space-y-3">
                {page.data.posts.map((post) => (
                  <Post
                    key={post?._id}
                    post={post}
                    postId={post?._id}
                    commentLimit={1}
                    from={'feedPage'}
                  />
                ))}
              </div>
            ))}
          </>
        )}
        <div ref={loadMoreRef} />
        {isFetchingNextPage && <FetchingIcon />}
      </div>
    </div>
  );
}
