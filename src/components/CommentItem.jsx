import React, { useContext, useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toggleCommentLike, createCommentReply, getCommentReplies } from '../Services/CommentServices';
import { AuthContext } from '../Contexts/AuthContext';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import CommentHeader from './CommentHeader';
import DropDown from './DropDown';
import CommentEditBox from './CommentEditBox';
import toast from 'react-hot-toast';
import { Input, Button } from '@heroui/react';
import FetchingIcon from './FetchingIcon';

export default function CommentItem({ 
  comment, 
  post, 
  fakeCommentPhoto, 
  isReply = false,
  openDeleteConfirm,
  editComment,
  setEditComment,
  commentText,
  setCommentText,
  isSubmitting,
  handleEditComment 
}) {
  const { themeColors } = useTheme();
  const { userID } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const postId = post?._id;

  const [isLiking, setIsLiking] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');

  const isLiked = comment?.likes?.some(user => (user._id || user) === userID);

  const { mutate: handleLike } = useMutation({
    mutationFn: () => toggleCommentLike(postId, comment._id),
    onMutate: () => setIsLiking(true),
    onSuccess: () => {
      if (isReply) { queryClient.invalidateQueries(['commentReplies', postId, comment.parentComment || comment._id]); } else { queryClient.invalidateQueries(['postComments', postId]); }
      setIsLiking(false);
    },
    onError: () => {
      setIsLiking(false);
      toast.error("Failed to like comment");
    }
  });

  const { mutate: handleSubmitReply, isPending: isSubmittingReply } = useMutation({
    mutationFn: () => createCommentReply(postId, comment._id, { content: replyText }),
    onSuccess: () => {
      queryClient.invalidateQueries(['postComments', postId]);
      queryClient.invalidateQueries(['commentReplies', postId, comment._id]);
      setReplyText('');
      setShowReplyBox(false);
      setShowReplies(true);
      toast.success("Reply added");
    },
    onError: () => toast.error("Failed to reply")
  });

  // Fetch replies
  const { data: repliesData, isFetching: isFetchingReplies } = useQuery({
    queryKey: ['commentReplies', postId, comment._id],
    queryFn: () => getCommentReplies(postId, comment._id),
    enabled: !!postId && !!comment._id && showReplies,
  });

  const replies = repliesData?.data?.data?.replies || repliesData?.data?.replies || [];
  const repliesCount = comment?.repliesCount || 0;

  return (
    <div className={`mb-4 pb-3 ${isReply ? 'ml-8 border-l-2 pl-4' : 'border-b last:border-b-0'}`} style={{ borderColor: themeColors.primary + '20' }}>
      <div className="flex items-start justify-between space-x-3 rtl:space-x-reverse">
        <CommentHeader comment={comment} fakeCommentPhoto={fakeCommentPhoto} />

        {comment.commentCreator?._id === userID && !isReply && openDeleteConfirm && (
          <DropDown
            commentId={comment._id}
            handleDeleteComment={openDeleteConfirm}
            editCommentPreview={() => {
              setCommentText(comment.content);
              setEditComment(comment._id);
            }}
            Type="comment"
          />
        )}
      </div>

      {editComment === comment._id && !isReply ? (
        <CommentEditBox
          comment={comment}
          setEditComment={setEditComment}
          commentText={commentText}
          setCommentText={setCommentText}
          isSubmitting={isSubmitting}
          handleEditComment={() => handleEditComment({ commentId: comment._id, content: commentText })}
        />
      ) : (
        <div className="flex items-center gap-4 mt-2 ml-12 text-sm">
          <button 
            onClick={() => handleLike()}
            disabled={isLiking}
            className="font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
            style={{ color: isLiked ? themeColors.primary : themeColors.textSecondary }}
          >
            <i className={`${isLiked ? 'fas' : 'far'} fa-thumbs-up`}></i>
            {comment.likes?.length || comment.likesCount || 0} Like 
          </button>
          
          {!isReply && (
            <button 
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="font-medium hover:opacity-80 transition-opacity"
              style={{ color: themeColors.textSecondary }}
            >
              Reply
            </button>
          )}
        </div>
      )}

      {showReplyBox && !isReply && (
        <div className="mt-3 ml-12 pr-4 flex gap-2">
          <Input 
            size="sm"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1"
          />
          <Button 
            size="sm"
            onPress={() => replyText.trim() && handleSubmitReply()}
            isLoading={isSubmittingReply}
            style={{ backgroundColor: themeColors.primary, color: 'white' }}
          >
            Reply
          </Button>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && !isReply && (
        <div className="mt-4">
          {comment.replies.map(reply => (
             <CommentItem 
               key={reply._id}
               comment={reply}
               post={post}
               fakeCommentPhoto={fakeCommentPhoto}
               isReply={true}
             />
          ))}
        </div>
      )}

      {showReplyBox && !isReply && (
        <div className="mt-3 ml-12 pr-4 flex gap-2">
          <Input
            size="sm"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1"
          />
          <Button
            size="sm"
            onPress={() => replyText.trim() && handleSubmitReply()}
            isLoading={isSubmittingReply}
            style={{ backgroundColor: themeColors.primary, color: 'white' }}
          >
            Reply
          </Button>
        </div>
      )}

      {/* Show Replies button */}
      {!isReply && repliesCount > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-left font-medium ml-12 mt-2 hover:opacity-80 transition-opacity"
            style={{ color: themeColors.primary }}
          >
            {showReplies ? 'Hide' : 'View'} {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
          </button>
      )}

      {/* Replies List */}
      {showReplies && !isReply && (
        <div className="mt-4">
          {isFetchingReplies && <div className="ml-8"><FetchingIcon /></div>}
          {replies.map(reply => (
            <CommentItem 
              key={reply._id}
              comment={reply}
              post={post}
              fakeCommentPhoto={fakeCommentPhoto}
              isReply={true}
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
    </div>
  );
}