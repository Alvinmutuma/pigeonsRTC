import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { UPVOTE_FORUM_POST } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import './PostListItem.css';

// Helper function to create a plain text snippet from HTML
const createSnippet = (htmlContent, maxLength = 150) => {
  if (!htmlContent) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const PostListItem = ({ post }) => {
  // Hooks must be called at the top level
  const { user } = useAuth();
  const [upvoteForumPost, { loading: upvoteLoading, error: upvoteError }] = useMutation(UPVOTE_FORUM_POST, {
    update(cache, { data: { upvoteForumPost: updatedPost } }) {
      if (!updatedPost) return;
      const normalizedId = cache.identify({ id: updatedPost.id, __typename: 'ForumPost' });
      if (normalizedId) {
        cache.modify({
          id: normalizedId,
          fields: {
            upvotes() {
              return updatedPost.upvotes;
            },
          },
        });
      }
    },
    onError: (error) => {
      console.error('Error upvoting post:', error.message);
    }
  });

  if (!post) return null;

  const handleUpvote = async () => {
    if (!user) {
      alert('Please log in to upvote.');
      return;
    }
    if (upvoteLoading) return;

    try {
      await upvoteForumPost({ variables: { id: post.id } });
    } catch (err) {
      // Error is handled by onError in useMutation
    }
  };

  const snippet = createSnippet(post.content);
  const postDate = new Date(post.createdAt).toLocaleDateString();

  return (
    <div className="post-list-item">
      <h3 className="post-list-item-title">
        <Link to={`/community/post/${post.id}`}>{post.title}</Link>
      </h3>
      <div className="post-list-item-meta">
        <span className="author">By: <Link to={`/user/${post.author?.username || 'unknown'}`}>{post.author?.username || 'Unknown User'}</Link></span>
        {post.category && (
          <span className="category">In: <Link to={`/community/category/${post.category.id}`}>{post.category.name}</Link></span>
        )}
        <span className="date">On: {postDate}</span>
      </div>
      {post.tags && post.tags.length > 0 && (
        <div className="post-list-item-tags">
          {post.tags.map((tag, index) => (
            <Link key={index} to={`/community/tags/${encodeURIComponent(tag)}`} className="tag-badge">{tag}</Link>
          ))}
        </div>
      )}
      <p className="post-list-item-snippet">{snippet}</p>
      <div className="post-list-item-stats">
        <button 
          onClick={handleUpvote} 
          disabled={!user || upvoteLoading} 
          className="btn-upvote"
        >
          <span role="img" aria-label="upvote">👍</span> Upvote
        </button>
        <span>Upvotes: {post.upvotes || 0}</span>
        <span>Comments: {post.commentCount || 0}</span>
        {upvoteError && <span className="error-message">Error upvoting</span>}
      </div>
      <Link to={`/community/post/${post.id}`} className="btn-read-more">Read More</Link>
    </div>
  );
};

export default PostListItem;
