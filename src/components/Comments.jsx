import React, { useContext, useState } from 'react';
import fakeCommentPhoto from '../../public/FakeProfileImage.png';
import DropDown from './DropDown';
import { AuthContext } from '../Contexts/AuthContext';
import { deleteComment, updateComment, getPostComments } from '../Services/CommentServices';
import CommentHeader from './CommentHeader';
import CommentEditBox from './CommentEditBox';
import CommentItem from './CommentItem';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { queryClient } from '../App.jsx';
import DeleteCommentConfirmModal from './DeleteCommentConfirmModal.jsx';

export default function Comments({ post, commentLimit }) {
  const { themeColors } = useTheme();
  useContext(AuthContext);
  const [editComment, setEditComment] = useState(null); 
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);
  const postId = post?._id;

  // Fetch comments for this post from the API
  const { data: commentsData } = useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => getPostComments(postId),
    enabled: !!postId,
    refetchOnWindowFocus: false,
  });
  const comments = commentsData?.data?.data?.comments || [];

  // Delete comment mutation
  const { mutate: performDeleteComment, isPending: isDeletingComment } = useMutation({
    mutationFn: (commentId) => deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['postComments', postId]);
      queryClient.invalidateQueries(['posts']);
      if (postId) queryClient.invalidateQueries(['postDetails', postId]);
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['userPosts'] });
      }, 500);
      setIsDeleteModalOpen(false);
      setCommentIdToDelete(null);
      toast.success('Comment deleted');
    },
    onError: () => toast.error('Failed to delete comment'),
  });

  function openDeleteConfirm(commentId) {
    setCommentIdToDelete(commentId);
    setIsDeleteModalOpen(true);
  }

  // Edit comment mutation
  const { mutate: handleEditComment } = useMutation({
    mutationFn: ({ commentId, content }) => updateComment(postId, commentId, { content }),
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['postComments', postId]);
      queryClient.invalidateQueries(['posts']); // Refetch feed بعد تعديل الكومنت
      if (postId) queryClient.invalidateQueries(['postDetails', postId]);
      setIsSubmitting(false);
      setEditComment(null);
      setCommentText('');
      toast.success('Comment updated');
    },
    onError: () => {
      setIsSubmitting(false);
      toast.error('Failed to update comment');
    },
  });

  return (
    <>
      {comments.length > 0 && (
        <div
          className="max-w-2xl mx-auto rounded-xl p-2 border"
          style={{ backgroundColor: themeColors.surface, borderColor: themeColors.primary + '20' }}
        >
          <h2
            className="text-lg font-bold mb-4 border-b pb-2"
            style={{ color: themeColors.text, borderColor: themeColors.primary + '20' }}
          >
            Comments
          </h2>

          {comments
            .slice(0, commentLimit)
            .reverse()
            .map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                post={post}
                fakeCommentPhoto={fakeCommentPhoto}
                openDeleteConfirm={openDeleteConfirm}
                editComment={editComment}
                setEditComment={setEditComment}
                commentText={commentText}
                setCommentText={setCommentText}
                isSubmitting={isSubmitting}
                handleEditComment={handleEditComment}
              />
            ))}
        </div>
      )}

      {/* Delete Comment Confirmation Modal */}
      <DeleteCommentConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (commentIdToDelete) performDeleteComment(commentIdToDelete);
        }}
        isDeleting={isDeletingComment}
      />
    </>
  );
}
