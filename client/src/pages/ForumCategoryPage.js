import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { useQuery } from '@apollo/client';
import { GET_FORUM_POSTS_CONNECTION, GET_FORUM_CATEGORY_INFO } from '../graphql/queries';
import PostListItem from '../components/PostListItem'; 
import { useAuth } from '../contexts/AuthContext';
import './ForumCategoryPage.css';

const POSTS_PER_PAGE = 10;

const ForumCategoryPage = () => {
  const { categoryId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  // Query for category details
  const { 
    data: categoryData,
    loading: categoryLoading,
    error: categoryError 
  } = useQuery(GET_FORUM_CATEGORY_INFO, {
    variables: { identifier: categoryId },
    fetchPolicy: 'cache-and-network',
  });

  // Query for posts in the category
  const { 
    data: postsData,
    loading: postsLoading,
    error: postsError 
  } = useQuery(GET_FORUM_POSTS_CONNECTION, {
    variables: {
      categoryId,
      limit: POSTS_PER_PAGE,
      offset: (currentPage - 1) * POSTS_PER_PAGE,
    },
    fetchPolicy: 'cache-and-network',
  });

  if (categoryLoading || postsLoading) return <p>Loading category information...</p>;
  if (categoryError) return <p>Error loading category details: {categoryError.message}</p>;
  // If category is not found, postsError might not be relevant yet, or handle it as preferred
  if (!categoryData?.forumCategory) return <p>Category not found.</p>; 
  if (postsError) return <p>Error loading posts: {postsError.message}</p>;

  const { posts, totalCount } = postsData?.forumPosts || { posts: [], totalCount: 0 };
  const category = categoryData.forumCategory;

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="forum-category-page">
      <header className="category-header">
        <h1>{category.name}</h1>
        {category.description && <p className="category-description">{category.description}</p>}
        <p className="category-post-count">Total Posts: {category.postCount !== undefined ? category.postCount : totalCount}</p>
        {user && (
          <Link to={`/community/category/${categoryId}/new-post`} className="btn btn-primary btn-create-post">
            Create New Post
          </Link>
        )}
      </header>

      {posts.length > 0 ? (
        <ul className="post-list">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </ul>
      ) : (
        <p>No posts found in this category yet.</p>
      )}

      {totalCount > POSTS_PER_PAGE && (
        <div className="pagination-controls">
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ForumCategoryPage;
