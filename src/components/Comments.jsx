import React, { useContext, useState } from 'react';
import fakeCommentPhoto from '../../public/FakeProfileImage.png';
import DropDown from './DropDown';
import { AuthContext } from '../Contexts/AuthContext';
import { deleteComment, updateComment } from '../Services/CommentServices';
import CommentHeader from './CommentHeader';
import CommentEditBox from './CommentEditBox';
import { useMutation } from '@tanstack/react-query';
import { invalidateAndRefetch } from '../utils/queryUtils';
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function Comments({ post, commentLimit, from, getPostDetails, getPosts, getUserPosts }) {
  const { themeColors } = useTheme();
  const { userID } = useContext(AuthContext);
  const [editComment, setEditComment] = useState(null); 
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setisSubmitting] = useState(false);

  // Delete comment mutation
  const { mutate: handleDeleteComment } = useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => {
      // Use standardized invalidation and refetch
      invalidateAndRefetch({
        from,
        getPosts,
        getPostDetails,
        getUserPosts,
        postId: post._id
      });
    },
  });

  // Edit comment mutation
  const { mutate: handleEditComment } = useMutation({
    mutationFn: ({ commentId, content }) => updateComment(commentId, { content }),
    onSuccess: (_, variables) => {
      // Use standardized invalidation and refetch
      invalidateAndRefetch({
        from,
        getPosts,
        getPostDetails,
        getUserPosts,
        postId: post._id
      });
      
      setisSubmitting(false);
      setEditComment((prev) =>
        prev === variables.commentId ? null : variables.commentId
      );
    },
  });

  function editCommentPreview(commentId, content) {
    setCommentText(content); // يملأ الـ input بالمحتوى الحالي
    setEditComment((prev) => (prev === commentId ? null : commentId));
  }

  return (
    <>
      {post.comments?.length > 0 && (
        <div 
          className="max-w-2xl mx-auto rounded-xl p-2 border"
          style={{ 
            backgroundColor: themeColors.surface,
            borderColor: themeColors.primary + '20'
          }}
        >
          <h2 
            className="text-lg font-bold mb-4 border-b pb-2"
            style={{ 
              color: themeColors.text,
              borderColor: themeColors.primary + '20'
            }}
          >
            Comments
          </h2>

          {post.comments
            .slice(0, commentLimit)
            .reverse()
            .map((comment, index) => (
              <div 
                key={index} 
                className="mb-4 pb-3 border-b last:border-b-0"
                style={{ borderColor: themeColors.primary + '10' }}
              >
                <div className="flex items-start justify-between space-x-3 rtl:space-x-reverse">
                  {/* صورة + بيانات */}
                  <CommentHeader comment={comment} fakeCommentPhoto={fakeCommentPhoto} />

                  {/* زر القائمة */}
                  {comment.commentCreator._id === userID && (
                    <DropDown
                      commentId={comment._id}
                      handleDeleteComment={handleDeleteComment}
                      editCommentPreview={() =>
                        editCommentPreview(comment._id, comment.content)
                      }
                      Type="comment"
                    />
                  )}
                </div>

                {/* Edit Box */}
                {editComment === comment._id && (
                  <CommentEditBox
                    comment={comment}
                    setEditComment={setEditComment}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    isSubmitting={isSubmitting}
                    handleEditComment={() =>
                      handleEditComment({
                        commentId: comment._id,
                        content: commentText,
                      })
                    }
                  />
                )}
              </div>
            ))}
        </div>
      )}
    </>
  );
}
