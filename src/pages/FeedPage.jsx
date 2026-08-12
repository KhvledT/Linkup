import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import LoadingPage from './LoadingPage';
import ErrorMessage from '../components/ErrorMessage.jsx';
import FetchingIcon from '../components/FetchingIcon';
import { getFeed, getAllPosts } from '../Services/FeedServices';
import { getUserDetails } from '../Services/UserDetailsServices';
import { AuthContext } from '../Contexts/AuthContext';
import { useTheme } from '../Contexts/ThemeContext';

export default function FeedPage() {
  const { setUserID } = useContext(AuthContext);
  const { themeColors } = useTheme();
  const loadMoreRef = useRef(null);
  const location = useLocation();
  const [feedMode, setFeedMode] = useState('exploring'); // following, all, me, exploring
  const [hasImage, setHasImage] = useState(false);

  // When feedMode === 'exploring', it will use the old /posts endpoint. Otherwise /posts/feed?only=
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
    queryKey: ['posts', feedMode, hasImage],
    queryFn: ({ pageParam = 1 }) => {
      if (feedMode === 'exploring') {
        return getAllPosts(pageParam);
      }
      return getFeed({ only: feedMode, hasImage: hasImage ? true : undefined, page: pageParam });
    },
    getNextPageParam: (lastPage, allPages) => {
      const posts = lastPage?.data?.data?.posts || [];
      return posts.length < 50 ? undefined : allPages.length + 1;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    staleTime: 15000,
  });

  const pages = data?.pages ?? [];

  const getUserID = useCallback(async () => {
    if (localStorage.getItem('userID')) {
      setUserID(localStorage.getItem('userID'));
      return;
    }
    try {
      const res = await getUserDetails();
      const id = res?.data?.data?.user?._id;
      if (id) {
        setUserID(id);
        localStorage.setItem('userID', id);
      }
    } catch (err) {
      console.error('Failed to bootstrap userID:', err);
    }
  }, [setUserID]);

  useEffect(() => {
    getUserID();
  }, [getUserID]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '2000px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadMoreRef, hasNextPage, fetchNextPage]);
  
  useEffect(() => {
    if (location.pathname === '/') {
      refetch();
    }
  }, [location.pathname, refetch]);

  const TabButton = ({ value, label }) => (
    <button
      onClick={() => setFeedMode(value)}
      className={`px-4 py-2 font-semibold transition-all duration-300 border-b-2`}
      style={{
        color: feedMode === value ? themeColors.primary : themeColors.textSecondary,
        borderColor: feedMode === value ? themeColors.primary : 'transparent'
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full">
      <div className="mb-8">
        <CreatePost />
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm" style={{ backgroundColor: themeColors.surface }}>
        <div className="flex gap-2">
          <TabButton value="following" label="Following" />
          <TabButton value="all" label="All" />
          <TabButton value="me" label="Me" />
          <TabButton value="exploring" label="Explore" />
        </div>
        <div className="mt-4 sm:mt-0 px-2 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="hasImageCheck" 
            checked={hasImage}
            onChange={(e) => setHasImage(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="hasImageCheck" className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>
            Image Only
          </label>
        </div>
      </div>

      <div className="space-y-8">
        {isFetching && !isLoading && !isFetchingNextPage && <FetchingIcon />}
        {isLoading ? (
          <LoadingPage />
        ) : isError ? (
          <ErrorMessage error={error} refetch={refetch} />
        ) : (
          <>
            {pages.map((page, i) => (
              <div key={i} className="space-y-3">
                {(page?.data?.data?.posts ?? []).map((post) => (
                  <Post
                    key={post?._id}
                    post={post}
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
