import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Comments from "./Comments";
import CreateComment from "./CreateComment";
import { AuthContext } from "../Contexts/AuthContext";
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { deletePost } from "../Services/FeedServices";
import PostHeader from "./PostHeader";
import PostStatistics from "./PostStatistics";
import fakeProfilePhoto from "../../public/FakeProfileImage.png";
import PostBtns from "./PostBtns";
import { useMutation } from "@tanstack/react-query";
import { invalidateAndRefetch } from "../utils/queryUtils";
import PostImageModal from "./PostImageModal"; // <--- استدعاء الكومبوننت الجديد

const fakePost = {
  userAvatar: fakeProfilePhoto,
  likes: 0,
  shares: 0,
};

export default function Post({ post, commentLimit = 1000, getPostDetails, getPosts, getUserPosts, postId, from }) {
  const { userID } = useContext(AuthContext);
  const { themeColors } = useTheme();
  const navigator = useNavigate();
  const [showCommentField, setShowCommentField] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false); // <--- حالة فتح المودال

  if (getPostDetails) {
    const { id } = useParams();
    postId = id;
  }
  
  const { mutate: handleDeletePost } = useMutation({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: () => {
      invalidateAndRefetch({ from, getPosts, getPostDetails });

      if (from === "PostDetailsPage") navigator('/');
      else if (from === "userProfilePage") getUserPosts(userID);
    },
    onError: (error) => console.log(error)
  });

  const handleEditPost = (postId) => {
    navigator(`/edit-post/${postId}`);
  };

  const handleCommentClick = () => setShowCommentField(!showCommentField);

  const handlePostClick = () => {
    if (from === "feedPage" || from === "userProfilePage") {
      navigator(`/post-details/${post?._id}`);
    }
  };

  return (
    <div
      className="rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border"
      style={{
        backgroundColor: themeColors.surface,
        borderColor: themeColors.primary + '20'
      }}
    >
      {/* Post Header */}
      <div
        className="p-3 sm:p-4 lg:p-5 border-b"
        style={{ borderColor: themeColors.primary + '10' }}
      >
        <PostHeader
          post={post}
          fakePost={fakePost}
          userID={userID}
          handleEditPost={handleEditPost}
          handleDeletePost={handleDeletePost}
        />
      </div>

      {/* Post Content */}
      {post?.body && (
        <div
          className="p-3 sm:p-4 lg:p-5 cursor-pointer transition-colors duration-200 post-content-hover"
          style={{ backgroundColor: themeColors.primary + '02' }}
          onClick={handlePostClick}
        >
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: themeColors.text }}
          >
            {post.body}
          </p>
        </div>
      )}

      {/* Post Image */}
      {post?.image && (
        <>
          <div
            className="relative cursor-pointer hover:opacity-95 transition-opacity duration-200"
            onClick={() => setShowImageModal(true)}
          >
            <img
              src={post.image}
              alt="Post"
              className="w-full h-auto object-cover max-h-[400px]"
            />
          </div>

          {/* Image Modal */}
          <PostImageModal
            isOpen={showImageModal}
            onClose={() => setShowImageModal(false)}
            imageUrl={post.image}
          />
        </>
      )}

      {/* Post Statistics */}
      <div
        className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 border-b"
        style={{ borderColor: themeColors.primary + '10' }}
      >
        <PostStatistics post={post} fakePost={fakePost} handlePostClick={handlePostClick} />
      </div>

      {/* Post Action Buttons */}
      <div className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3">
        <PostBtns from={from} post={post} onCommentClick={handleCommentClick} />
      </div>

      {/* Create Comment - feed page */}
      {from === "feedPage" && showCommentField && (
        <div
          className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 border-b"
          style={{ borderColor: themeColors.primary + '10' }}
        >
          <CreateComment postId={post?._id} getPostDetails={getPostDetails} getPosts={getPosts} getUserPosts={getUserPosts} from={from} />
        </div>
      )}

      {/* Create Comment - post details / profile */}
      {(from === "PostDetailsPage" || (from === "userProfilePage" && showCommentField)) && (
        <div
          className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 border-b"
          style={{ borderColor: themeColors.primary + '10' }}
        >
          <CreateComment postId={post?._id} getPostDetails={getPostDetails} getPosts={getPosts} getUserPosts={getUserPosts} from={from} />
        </div>
      )}

      {/* Comments Section */}
      <div className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3">
        <Comments
          post={post}
          commentLimit={commentLimit}
          getPostDetails={getPostDetails}
          getPosts={getPosts}
          getUserPosts={getUserPosts}
          from={from}
        />
      </div>
    </div>
  );
}
