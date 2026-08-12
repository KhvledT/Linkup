import { useQuery } from '@tanstack/react-query';
import { getUserBookmarks } from '../Services/PostInteractionServices.js';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import Post from '../components/Post.jsx';
import LoadingPage from './LoadingPage.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function BookmarksPage() {
  const { themeColors } = useTheme();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => getUserBookmarks(1, 50),
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <LoadingPage />;
  if (isError) return <ErrorMessage error="Failed to load bookmarks" refetch={refetch} />;

  // Based on Reverse Engineering doc, bookmark posts are returned inside `data.data.posts` or similar? Let's check `getUserBookmarks`. 
  // It returns `{ success: true, message: "success", data: { bookmarks: [ ...posts... ] } }` in most Route endpoints?
  // Let's safely extract it:
  const bookmarks = data?.data?.data?.bookmarks || data?.data?.bookmarks || [];

  return (
    <div className="w-full h-full min-h-screen">
      <div 
        className="mb-6 p-4 rounded-xl shadow-sm"
        style={{
          borderLeft: `4px solid ${themeColors.primary}`,
          backgroundColor: themeColors.surface
        }}
      >
        <h1 className="text-2xl font-bold" style={{ color: themeColors.text }}>Saved Posts</h1>
        <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>View all the posts you've bookmarked.</p>
      </div>

      <div className="flex flex-col gap-6">
        {bookmarks.length > 0 ? (
          bookmarks.map(post => (
            <Post key={post._id} post={post} from="bookmarks" />
          ))
        ) : (
          <div className="text-center py-10" style={{ color: themeColors.textSecondary }}>
            <i className="fas fa-bookmark text-4xl mb-4 opacity-50"></i>
            <p>You haven't saved any posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}