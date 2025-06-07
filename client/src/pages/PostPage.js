import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FORUM_POST_DETAILS } from '../graphql/queries';
import { 
  CREATE_FORUM_COMMENT, 
  UPVOTE_FORUM_POST, 
  UPVOTE_FORUM_COMMENT, 
  DELETE_FORUM_POST, 
  DELETE_FORUM_COMMENT 
} from '../graphql/mutations'; 
import { useAuth } from '../contexts/AuthContext';
import CommentForm from '../components/CommentForm';
import CommentListItem from '../components/CommentListItem'; 
import Pagination from '../components/Pagination'; 
import './PostPage.css';

const COMMENTS_PER_PAGE = 10;

const PostPage = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const [currentCommentPage, setCurrentCommentPage] = useState(1);

  const { data, loading, error, refetch } = useQuery(GET_FORUM_POST_DETAILS, {
    variables: { 
      postId, 
      commentsLimit: COMMENTS_PER_PAGE, 
      commentsOffset: (currentCommentPage - 1) * COMMENTS_PER_PAGE 
    },
    fetchPolicy: 'cache-and-network',
  });

  const [createComment, { loading: commentLoading, error: commentError }] = useMutation(CREATE_FORUM_COMMENT, {
    onCompleted: () => {
      refetch(); 
    },
    onError: (err) => {
      // Error is passed to CommentForm
    }
  });

  const [upvotePost, { loading: upvotePostLoading }] = useMutation(UPVOTE_FORUM_POST, {
    onCompleted: () => refetch(),
    onError: (err) => alert(`Error upvoting post: ${err.message}`),
  });

  const [upvoteComment, { loading: upvoteCommentLoading }] = useMutation(UPVOTE_FORUM_COMMENT, {
    onCompleted: () => refetch(), 
    onError: (err) => alert(`Error upvoting comment: ${err.message}`),
  });

  const [deletePost, { loading: deletePostLoading }] = useMutation(DELETE_FORUM_POST, {
    onCompleted: () => {
      alert('Post deleted successfully.');
    },
    onError: (err) => alert(`Error deleting post: ${err.message}`),
  });
  
  const [deleteCommentMutation, { loading: deleteCommentLoading }] = useMutation(DELETE_FORUM_COMMENT, {
    onCompleted: () => {
      alert('Comment deleted successfully.');
      refetch(); 
    },
    onError: (err) => alert(`Error deleting comment: ${err.message}`),
  });


  const handleCommentSubmit = (content) => { 
    if (!user) {
      alert('You must be logged in to comment.');
      return;
    }
    createComment({ variables: { postId, content } }); 
  };

  const handleUpvotePost = () => {
    if (!user) {
      alert('You must be logged in to upvote.');
      return;
    }
    upvotePost({ variables: { postId } });
  };

  const handleUpvoteComment = (commentId) => { 
    if (!user) {
      alert('You must be logged in to upvote.');
      return;
    }
    upvoteComment({ variables: { commentId } });
  };

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost({ variables: { id: postId } });
    }
  };

  const handleDeleteComment = (commentId) => { 
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation({ variables: { id: commentId } });
    }
  };
  
  const handleCommentPageChange = (page) => {
    setCurrentCommentPage(page);
  };

  if (loading) return <p>Loading post...</p>;
  if (error) return <p>Error loading post: {error.message}</p>;

  const post = data?.forumPost;
  if (!post) return <p>Post not found.</p>;

  const comments = post.comments?.comments || [];
  const totalComments = post.comments?.totalComments || 0;
  const totalCommentPages = Math.ceil(totalComments / COMMENTS_PER_PAGE);

  const canEditOrDeletePost = user && (user.id === post.author?.id || user.isAdmin);

  return (
    <div className="post-page">
      <article className="post-full-content">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="author">By: <Link to={`/user/${post.author?.username || 'unknown'}`}>{post.author?.username || 'Unknown User'}</Link></span>
            <span className="date">On: {new Date(post.createdAt).toLocaleDateString()}</span>
            {post.category && <span className="category">In: <Link to={`/forum/category/${post.category.id}`}>{post.category.name}</Link></span>}
            <div className="post-stats">
              <span>Upvotes: {post.upvotes}</span>
              <span>Comments: {totalComments}</span> 
            </div>
          </div>
          {canEditOrDeletePost && (
            <div className="post-actions-owner">
              <Link to={`/forum/post/${post.id}/edit`} className="btn btn-edit-post">Edit Post</Link>
              <button onClick={handleDeletePost} disabled={deletePostLoading} className="btn btn-delete-post">
                {deletePostLoading ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          )}
          {!user?.isBanned && user && (
             <button onClick={handleUpvotePost} disabled={upvotePostLoading || !user} className="btn btn-upvote-post">
                {upvotePostLoading ? 'Upvoting...' : `Upvote Post (${post.upvotes})`}
            </button>
          )}
        </header>
        
        <div className="post-content ql-editor" dangerouslySetInnerHTML={{ __html: post.content }}></div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            <strong>Tags:</strong> {post.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </article>

      <section className="comments-section">
        <h2>Comments ({totalComments})</h2>
        {user && !user.isBanned && (
          <CommentForm 
            onSubmit={handleCommentSubmit}
            isLoading={commentLoading}
            formError={commentError}
          />
        )}
        {!user && <p>Please <Link to="/login">log in</Link> to post a comment.</p>}
        {user?.isBanned && <p className="error-message">You are currently banned and cannot post comments.</p>}

        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentListItem 
                key={comment.id} 
                comment={comment} 
                onUpvoteComment={handleUpvoteComment}
                onDeleteComment={handleDeleteComment}
                postAuthorId={post.author?.id}
                isUpvoting={upvoteCommentLoading}
                isDeleting={deleteCommentLoading}
              />
            ))
          ) : (
            <p>No comments yet. Be the first to comment!</p>
          )}
        </div>

        {totalComments > 0 && totalCommentPages > 1 && (
          <Pagination 
            currentPage={currentCommentPage}
            totalPages={totalCommentPages}
            onPageChange={handleCommentPageChange}
          />
        )}
      </section>
    </div>
  );
};

export default PostPage;
