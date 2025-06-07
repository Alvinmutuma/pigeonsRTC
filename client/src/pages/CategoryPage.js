import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_FORUM_CATEGORY_DETAILS, GET_FORUM_POSTS_BY_CATEGORY } from '../graphql/queries';
import PostListItem from '../components/PostListItem';
import Pagination from '../components/Pagination'; 
import { useAuth } from '../contexts/AuthContext';
import './CategoryPage.css';

const POSTS_PER_PAGE = 10;

const CategoryPage = () => {
  const { categoryId } = useParams();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    data: categoryData, 
    loading: categoryLoading, 
    error: categoryError 
  } = useQuery(GET_FORUM_CATEGORY_DETAILS, {
    variables: { categoryId },
  });

  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
  } = useQuery(GET_FORUM_POSTS_BY_CATEGORY, {
    variables: {
      categoryId,
      limit: POSTS_PER_PAGE,
      offset: (currentPage - 1) * POSTS_PER_PAGE,
    },
    fetchPolicy: 'cache-and-network',
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (categoryLoading || postsLoading) return <p>Loading...</p>;
  if (categoryError) return <p>Error loading category: {categoryError.message}</p>;
  if (postsError && !postsData) return <p>Error loading posts: {postsError.message}</p>; 

  const category = categoryData?.forumCategory;
  const posts = postsData?.forumPostsByCategory?.posts || [];
  const totalPosts = postsData?.forumPostsByCategory?.totalPosts || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="category-page">
      {category && (
        <header className="category-header">
          <h1>{category.name}</h1>
          {category.description && <p className="category-description">{category.description}</p>}
          {user && (
            <Link to={`/forum/category/${categoryId}/new-post`} className="btn btn-primary btn-create-post">
              Create New Post in {category.name}
            </Link>
          )}
          {!user && <p>Please <Link to="/login">log in</Link> to create a post.</p>}
        </header>
      )}

      {postsError && <p className="error-message">Could not load posts: {postsError.message}</p>}

      <div className="post-list-container">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostListItem key={post.id} post={post} />
          ))
        ) : (
          !postsLoading && <p>No posts in this category yet. Be the first to create one!</p>
        )}
      </div>

      {totalPosts > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default CategoryPage;
