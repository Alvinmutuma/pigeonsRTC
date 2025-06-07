import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FORUM_POST_DETAILS } from '../graphql/queries';
import { 
  DELETE_FORUM_POST, 
  UPVOTE_FORUM_POST,
  UPVOTE_FORUM_COMMENT,
  DELETE_FORUM_COMMENT
} from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import './PostDetailPage.css'; 
import CommentListItem from '../components/CommentListItem';
import CommentForm from '../components/CommentForm';
import SEO from '../components/SEO';

const COMMENTS_PER_PAGE = 5;

// Helper function to strip HTML and truncate text
const createMetaDescription = (htmlContent, maxLength = 160) => {
  if (!htmlContent) return 'Read this discussion on the PigeonRTC community forum.';
  
  const strippedText = htmlContent
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace ampersand entity
    .replace(/&lt;/g, '<') // Replace less than entity
    .replace(/&gt;/g, '>') // Replace greater than entity
    .replace(/&quot;/g, '"') // Replace quote entity
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  if (strippedText.length <= maxLength) {
    return strippedText;
  }
  
  const lastSpace = strippedText.lastIndexOf(' ', maxLength - 3);
  const truncateAt = lastSpace > maxLength / 2 ? lastSpace : maxLength - 3;
  
  return strippedText.substring(0, truncateAt) + '...';
};

const PostDetailPage = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  
  // Data fetching query
  const { data, loading, error: queryError } = useQuery(GET_FORUM_POST_DETAILS, {
    variables: { 
      postId, 
      commentsLimit: COMMENTS_PER_PAGE,
      commentsOffset: (currentCommentPage - 1) * COMMENTS_PER_PAGE,
    },
    fetchPolicy: 'cache-and-network',
  });

  // Generate JSON-LD structured data for the blog post
  const createPostStructuredData = (post, postUrl) => {
    if (!post) return null;
    
    const postData = {
      '@context': 'https://schema.org',
      '@type': 'DiscussionForumPosting',
      'headline': post.title,
      'description': createMetaDescription(post.content, 200),
      'url': postUrl,
      'datePublished': post.createdAt,
      'dateModified': post.updatedAt || post.createdAt,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': postUrl
      }
    };
    
    if (post.author) {
      postData.author = {
        '@type': 'Person',
        'name': post.author.username || 'Anonymous'
      };
    }
    
    if (post.featuredImage) {
      postData.image = post.featuredImage;
    }
    
    if (post.commentCount > 0) {
      postData.commentCount = post.commentCount;
    }
    
    return postData;
  };
  
  // Post mutations
  const [deleteForumPost, { loading: deleteLoading, error: deleteError }] = useMutation(DELETE_FORUM_POST, {
    onCompleted: (mutationData) => {
      const categoryId = mutationData?.deleteForumPost?.category?.id;
      if (categoryId) {
        navigate(`/forum/category/${categoryId}`);
      } else {
        navigate('/community');
      }
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
    },
  });

  const [upvoteForumPost, { loading: upvoteLoading, error: upvoteError }] = useMutation(UPVOTE_FORUM_POST, {
    update(cache, { data: { upvoteForumPost: updatedPost } }) {
      if (!updatedPost) return;
      
      const existingPostData = cache.readQuery({
        query: GET_FORUM_POST_DETAILS,
        variables: { 
          postId, 
          commentsLimit: COMMENTS_PER_PAGE, 
          commentsOffset: (currentCommentPage - 1) * COMMENTS_PER_PAGE 
        },
      });

      if (existingPostData?.forumPost) {
        cache.writeQuery({
          query: GET_FORUM_POST_DETAILS,
          variables: { 
            postId, 
            commentsLimit: COMMENTS_PER_PAGE, 
            commentsOffset: (currentCommentPage - 1) * COMMENTS_PER_PAGE 
          },
          data: {
            forumPost: {
              ...existingPostData.forumPost,
              upvotes: updatedPost.upvotes,
            },
          },
        });
      }
    },
    onError: (error) => {
      console.error('Error upvoting post:', error.message);
    }
  });

  const [deleteForumComment, { loading: deleteCommentLoading, error: deleteCommentError }] = useMutation(DELETE_FORUM_COMMENT, {
    update(cache, { data: { deleteForumComment } }) {
      if (!deleteForumComment) return;

      const existingPostData = cache.readQuery({
        query: GET_FORUM_POST_DETAILS,
        variables: { 
          postId, 
          commentsLimit: COMMENTS_PER_PAGE, 
          commentsOffset: (currentCommentPage - 1) * COMMENTS_PER_PAGE 
        },
      });

      if (existingPostData?.forumPost?.comments) {
        const newComments = existingPostData.forumPost.comments.comments.filter(
          comment => comment.id !== deleteForumComment.id
        );

        cache.writeQuery({
          query: GET_FORUM_POST_DETAILS,
          variables: { 
            postId, 
            commentsLimit: COMMENTS_PER_PAGE, 
            commentsOffset: (currentCommentPage - 1) * COMMENTS_PER_PAGE 
          },
          data: {
            forumPost: {
              ...existingPostData.forumPost,
              comments: {
                ...existingPostData.forumPost.comments,
                comments: newComments,
                totalCount: existingPostData.forumPost.comments.totalCount - 1
              },
              commentCount: (existingPostData.forumPost.commentCount || 0) - 1
            },
          },
        });
      }
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
    },
  });

  const [upvoteForumComment, { loading: commentUpvoteLoading, error: commentUpvoteError }] = useMutation(UPVOTE_FORUM_COMMENT, {
    update(cache, { data: { upvoteForumComment: updatedComment } }) {
      if (!updatedComment) return;

      const existingPostData = cache.readQuery({
        query: GET_FORUM_POST_DETAILS,
        variables: { 
          postId, 
          commentsLimit: COMMENTS_PER_PAGE, 
          commentsOffset: (currentCommentPage - 1) * COMMENTS_PER_PAGE 
        },
      });

      if (existingPostData?.forumPost?.comments) {
        const newComments = existingPostData.forumPost.comments.comments.map(comment => 
          comment.id === updatedComment.id ? { ...comment, upvotes: updatedComment.upvotes } : comment
        );

        cache.writeQuery({
          query: GET_FORUM_POST_DETAILS,
          variables: { 
            postId, 
            commentsLimit: COMMENTS_PER_PAGE, 
            commentsOffset: (currentCommentPage - 1) * COMMENTS_PER_PAGE 
          },
          data: {
            forumPost: {
              ...existingPostData.forumPost,
              comments: {
                ...existingPostData.forumPost.comments,
                comments: newComments,
              },
            },
          },
        });
      }
    },
    onError: (error) => {
      console.error('Error upvoting comment:', error.message);
    }
  });

  // Handler functions
  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post and all its comments? This action cannot be undone.')) {
      try {
        await deleteForumPost({ variables: { id: postId } });
      } catch (e) {
        console.error('Error during post deletion:', e);
      }
    }
  };

  const handlePostUpvote = async () => {
    if (!user) {
      alert('Please log in to upvote this post.');
      return;
    }
    if (upvoteLoading) return;
    try {
      await upvoteForumPost({ variables: { id: postId } });
    } catch (err) {
      // Error is handled by onError in useMutation
    }
  };

  const handleCommentUpvote = async (commentId) => {
    if (!user) {
      alert('Please log in to upvote comments.');
      return;
    }
    if (commentUpvoteLoading) return;
    try {
      await upvoteForumComment({ variables: { id: commentId } });
    } catch (err) {
      // Error handled by onError
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteForumComment({ variables: { id: commentId } });
    } catch (err) {
      // Error handled by onError callback
    }
  };

  // Early returns for loading and error states
  if (loading) return <p>Loading post details...</p>;
  if (queryError) return <p>Error loading post: {queryError.message}</p>;

  // Extract data from query response
  const post = data?.forumPost;
  if (!post) return <p>Post not found.</p>;

  const commentsData = post?.comments; // Get the comments connection object
  const commentsList = commentsData?.comments; // Actual list of comments
  const totalComments = commentsData?.totalCount || 0; // Total count of comments for pagination

  // Build SEO metadata
  let metaDescription = "Loading post...";
  let pageTitle = "Forum Post | PigeonRTC Community";

  // Generate the full URL for the current post
  const baseUrl = "https://pigeonrtc.com";
  const postUrl = `${baseUrl}/community/post/${postId}`;

  // Create structured data for the post
  const structuredData = createPostStructuredData(post, postUrl);

  // Enhanced SEO metadata
  if (post) {
    pageTitle = `${post.title} | PigeonRTC Community`;
    metaDescription = createMetaDescription(post.content);
    
    // Add the category name to the meta description if available
    if (post.category && !metaDescription.includes(post.category.name)) {
      metaDescription = `${post.category.name}: ${metaDescription}`;
    }
  }

  const pagePath = `/community/post/${postId}`;

  // Derived data
  const canManagePost = user && (user.id === post.author?.id || user.role === 'admin');
  const postDate = new Date(post.createdAt).toLocaleDateString();
  const updatedDate = post.updatedAt && new Date(post.updatedAt).toLocaleDateString();

  return (
    <div className="post-detail-page">
      <SEO title={pageTitle} description={metaDescription} path={pagePath} />
      
      {/* Add JSON-LD structured data */}
      {structuredData && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      <header className="post-detail-header">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>By: <Link to={`/user/${post.author?.username || 'unknown'}`}>{post.author?.username || 'Unknown User'}</Link></span>
          {post.category && <span>In: <Link to={`/community/category/${post.category.id}`}>{post.category.name}</Link></span>}
          <span>On: {postDate}</span>
          {post.updatedAt && post.updatedAt !== post.createdAt && <span>(Edited: {updatedDate})</span>}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            Tags: {post.tags.map(tag => (
              <Link key={tag} to={`/community/tags/${tag}`} className="tag">{tag}</Link>
            ))}
          </div>
        )}
        {canManagePost && (
          <div className="post-management-actions">
            <Link to={`/community/post/${postId}/edit`} className="btn btn-primary btn-edit-post">
              Edit Post
            </Link>
            <button 
              onClick={handleDeletePost} 
              className="btn btn-danger btn-delete-post" 
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Post'}
            </button>
          </div>
        )}
        {deleteError && <p className="error-message">Error deleting post: {deleteError.message}</p>}
      </header>

      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

      <section className="post-stats">
        <button 
          onClick={handlePostUpvote} 
          disabled={!user || upvoteLoading} 
          className="btn-upvote post-detail-upvote"
        >
          <span role="img" aria-label="upvote">👍</span> Upvote
        </button>
        <span>Upvotes: {post.upvotes || 0}</span>
        <span>Views: {post.views || 0}</span>
        <span>Comments: {totalComments || post.commentCount || 0}</span>
        {upvoteError && <p className="error-message">Error upvoting: {upvoteError.message}</p>}
      </section>

      <section className="comments-section">
        <h2>Comments ({totalComments || post.commentCount || 0})</h2>
        {user ? (
          <CommentForm postId={postId} currentUserId={user.id} />
        ) : (
          <p className="login-prompt">Please <Link to="/login">login</Link> to comment.</p>
        )}
        {commentUpvoteError && <p className="error-message comment-upvote-error">Error upvoting comment: {commentUpvoteError.message}</p>}
        {deleteCommentError && <p className="error-message comment-delete-error">Error deleting comment: {deleteCommentError.message}</p>}

        {commentsList && commentsList.length > 0 ? (
          <ul className="comment-list">
            {commentsList.map(comment => (
              <CommentListItem 
                key={comment.id} 
                comment={comment} 
                onUpvoteComment={handleCommentUpvote}
                onDeleteComment={handleDeleteComment} 
                postAuthorId={post?.author?.id}
                isUpvoting={commentUpvoteLoading}
                isDeleting={deleteCommentLoading}
              />
            ))}
          </ul>
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}

        {/* Comment Pagination Controls */}
        {totalComments > COMMENTS_PER_PAGE && (
          <div className="comment-pagination-controls">
            <button 
              onClick={() => setCurrentCommentPage(prev => Math.max(1, prev - 1))}
              disabled={currentCommentPage === 1}
            >
              Previous Comments
            </button>
            <span>
              Page {currentCommentPage} of {Math.ceil(totalComments / COMMENTS_PER_PAGE)}
            </span>
            <button 
              onClick={() => setCurrentCommentPage(prev => Math.min(Math.ceil(totalComments / COMMENTS_PER_PAGE), prev + 1))}
              disabled={currentCommentPage === Math.ceil(totalComments / COMMENTS_PER_PAGE)}
            >
              Next Comments
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default PostDetailPage;
