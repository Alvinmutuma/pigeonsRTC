import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import PostForm from '../components/PostForm';
import { GET_FORUM_POST_DETAILS } from '../graphql/queries'; 
import './EditPostPage.css';

const EditPostPage = () => {
  const { postId } = useParams();
  const { user, loading: authLoading } = useAuth();

  const {
    data: postData,
    loading: postLoading,
    error: postError,
  } = useQuery(GET_FORUM_POST_DETAILS, {
    variables: { postId },
    skip: !postId, 
  });

  if (authLoading || postLoading) {
    return <p>Loading...</p>;
  }

  const post = postData?.forumPost;

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.isBanned) {
    return (
      <div className="edit-post-container auth-required-message">
        <h2>Edit Post</h2>
        <p className="error-message">You are currently banned and cannot edit posts.</p>
        <Link to={`/forum/post/${postId}`} className="btn btn-secondary">Back to Post</Link>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="edit-post-container error-page">
        <h2>Edit Post</h2>
        <p>Error loading post details: {postError.message}</p>
        <Link to="/community" className="btn btn-secondary">Back to Forum</Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="edit-post-container error-page">
        <h2>Edit Post</h2>
        <p>Post not found.</p>
        <Link to="/community" className="btn btn-secondary">Back to Forum</Link>
      </div>
    );
  }

  const canEdit = user && (user.id === post.author?.id || user.role === 'admin');

  if (!canEdit) {
    return (
      <div className="edit-post-container auth-required-message">
        <h2>Edit Post</h2>
        <p className="error-message">You are not authorized to edit this post.</p>
        <Link to={`/forum/post/${postId}`} className="btn btn-secondary">Back to Post</Link>
      </div>
    );
  }

  const initialData = {
    title: post.title,
    content: post.content,
    tags: post.tags, 
    categoryId: post.category?.id, 
  };

  return (
    <div className="edit-post-container">
      <header className="edit-post-header">
        <h2>Edit Post</h2>
        <p className="post-context">Editing post: <strong>{post.title}</strong></p>
      </header>
      <PostForm 
        postId={postId} 
        initialData={initialData}
      />
    </div>
  );
};

export default EditPostPage;
