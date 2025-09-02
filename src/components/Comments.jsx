import React, { useContext, useState } from 'react';
import fakeCommentPhoto from '../../public/FakeProfileImage.png';
import DropDown from './DropDown';
import { AuthContext } from '../Contexts/AuthContext';
import { deleteComment, updateComment } from '../Services/CommentServices';
import CommentHeader from './CommentHeader';
import CommentEditBox from './CommentEditBox';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { queryClient } from '../App.jsx';
import DeleteCommentConfirmModal from './DeleteCommentConfirmModal.jsx';

export default function Comments({ post, commentLimit }) {
  const { themeColors } = useTheme();
  const { userID } = useContext(AuthContext);
  const [editComment, setEditComment] = useState(null); 
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);

  // Delete comment mutation
  const { mutate: performDeleteComment, isPending: isDeletingComment } = useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
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
    mutationFn: ({ commentId, content }) => updateComment(commentId, { content }),
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']); // Refetch feed بعد تعديل الكومنت
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

  function editCommentPreview(commentId, content) {
    setCommentText(content);
    setEditComment((prev) => (prev === commentId ? null : commentId));
  }

  return (
    <>
      {post?.comments?.length > 0 && (
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

          {post.comments
            .slice(0, commentLimit)
            .reverse()
            .map((comment, index) => (
              <div key={index} className="mb-4 pb-3 border-b last:border-b-0" style={{ borderColor: themeColors.primary + '10' }}>
                <div className="flex items-start justify-between space-x-3 rtl:space-x-reverse">
                  <CommentHeader comment={comment} fakeCommentPhoto={fakeCommentPhoto} />

                  {comment.commentCreator._id === userID && (
                    <DropDown
                      commentId={comment._id}
                      handleDeleteComment={openDeleteConfirm}
                      editCommentPreview={() => editCommentPreview(comment._id, comment.content)}
                      Type="comment"
                    />
                  )}
                </div>

                {editComment === comment._id && (
                  <CommentEditBox
                    comment={comment}
                    setEditComment={setEditComment}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    isSubmitting={isSubmitting}
                    handleEditComment={() =>
                      handleEditComment({ commentId: comment._id, content: commentText })
                    }
                  />
                )}
              </div>
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
