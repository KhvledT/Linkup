import { Button, Input } from '@heroui/react'
import { useState } from 'react'
import { createComment } from '../Services/CommentServices';
import { useMutation } from '@tanstack/react-query';
import { invalidateAndRefetch } from '../utils/queryUtils';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function CreateComment({postId, getPostDetails, getPosts, getUserPosts, from }){
    const { themeColors } = useTheme();
    const [content, setContent] = useState("")

    const { mutate : handleSubmit, isPending } = useMutation({
        mutationFn: (commentData) => {
            return createComment(commentData);
        },
        onSuccess: (data) => {
            setContent("");
            console.log("Comment created:", data);
            
            // Use standardized invalidation and refetch
            invalidateAndRefetch({
                getPosts,
                getPostDetails,
                getUserPosts,
                from
            });
        },
        onError: (error) => {
            console.error("Error creating comment:", error);
        }
    });

    const handleCommentSubmit = () => {
        if (content.trim() === "") {
            return;
        }
        
        const commentData = {
            content: content,
            post: postId,
        };
        
        handleSubmit(commentData);
    };
 
  return (
    <div className="flex items-center gap-3">
        <div className="flex-1">
            <Input 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Write a comment..." 
                size="md"
                classNames={{
                    input: "custom-input",
                    inputWrapper: "custom-input-wrapper h-12",
                    base: "w-full"
                }}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (content.trim()) {
                            handleCommentSubmit();
                        }
                    }
                }}
            />
        </div>
        <Button 
            onPress={handleCommentSubmit} 
            isLoading={isPending} 
            isDisabled={!content.trim()} 
            size="md"
            className="h-12 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            style={{ 
                backgroundColor: themeColors.primary,
                color: "white"
            }}
        >
            {isPending ? (
                <div className="flex items-center gap-2">
                    <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span>Posting...</span>
                </div>
            ) : (
                "Post"
            )}
        </Button>
    </div>
  )
}