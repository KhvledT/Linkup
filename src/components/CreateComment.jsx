// Import HeroUI components for consistent UI design
import { Button, Input } from '@heroui/react';

// Import React hooks for state management
import { useState } from 'react';

// Import API service for comment creation
import { createComment } from '../Services/CommentServices';

// Import React Query for server state management
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Import theme context for dynamic styling
import { useTheme } from '../Contexts/ThemeContext.jsx';

// Import query client for cache invalidation
import { queryClient } from '../App.jsx';

// Component for creating new comments on posts
// Handles comment submission, form state, and API integration
export default function CreateComment({ postId }) {
  // Get theme colors for dynamic styling
  const { themeColors } = useTheme();
  
  // Local state for comment content
  const [content, setContent] = useState('');

  // React Query mutation for comment creation
  // Handles API calls, loading states, and success/error handling
  const { mutate: handleSubmit, isPending } = useMutation({
    mutationFn: (commentData) => createComment(commentData),
    onSuccess: () => {
      // Invalidate and refetch posts to show the new comment
      queryClient.invalidateQueries(['posts']);
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['userPosts'] });
      }, 500);
      // Clear the comment input after successful submission
      setContent('');
      toast.success('Comment posted');
    },
    onError: (error) => {
      toast.error('Failed to post comment');
    },
  });

  // Handle comment form submission
  // Validates content and submits comment data
  const handleCommentSubmit = () => {
    // Don't submit empty or whitespace-only comments
    if (!content.trim()) return;
    
    // Submit comment with content and post ID
    handleSubmit({ content: content.trim(), post: postId });
  };

  return (
    // Main container with flexbox layout for input and button
    <div className="flex items-center gap-3">
      {/* Input field container - takes up remaining space */}
      <div className="flex-1">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          size="md"
          classNames={{
            input: 'custom-input',
            inputWrapper: 'custom-input-wrapper h-12',
            base: 'w-full',
          }}
          // Handle Enter key press for quick comment submission
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleCommentSubmit();
            }
          }}
        />
      </div>
      {/* Submit button with loading state and dynamic styling */}
      <Button
        onPress={handleCommentSubmit}
        isDisabled={!content.trim() || isPending}
        size="md"
        className="h-12 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
        style={{ backgroundColor: themeColors.primary, color: 'white' }}
      >
        {isPending ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Commenting...</span>
          </div>
        ) : (
          'Comment'
        )}
      </Button>
    </div>
  );
}
