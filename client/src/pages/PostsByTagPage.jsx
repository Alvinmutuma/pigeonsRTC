import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_FORUM_POSTS_CONNECTION } from '../graphql/queries'; // Assuming this query can filter by tag
import PostListItem from '../components/PostListItem';
import './PostsByTagPage.css'; // We'll create this CSS file later

const POSTS_PER_PAGE = 10;

const PostsByTagPage = () => {
  const { tagName: encodedTagName } = useParams();
  const tagName = decodeURIComponent(encodedTagName);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading, error } = useQuery(GET_FORUM_POSTS_CONNECTION, {
    variables: {
      tag: tagName,
      limit: POSTS_PER_PAGE,
      offset: (currentPage - 1) * POSTS_PER_PAGE,
    },
    fetchPolicy: 'cache-and-network',
  });

  if (loading) return <p>Loading posts for tag "{tagName}"...</p>;
  if (error) return <p>Error loading posts: {error.message}</p>;

  const posts = data?.forumPosts?.posts || [];
  const totalPosts = data?.forumPosts?.totalCount || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="posts-by-tag-page">
      <header className="page-header">
        <h1>Posts tagged with "{tagName}"</h1>
        <Link to="/community" className="back-link"> Back to Community</Link>
      </header>

      {posts.length > 0 ? (
        <div className="post-list">
          {posts.map(post => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p>No posts found with this tag.</p>
      )}

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostsByTagPage;
