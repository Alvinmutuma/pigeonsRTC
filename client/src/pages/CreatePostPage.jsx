import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useMutation } from '@apollo/client'; // No longer used here
import PostForm from '../components/PostForm.js';
// import { CREATE_FORUM_POST } from '../graphql/mutations'; // No longer used here
// import { GET_FORUM_POSTS_BY_CATEGORY, GET_FORUM_CATEGORY_DETAILS } from '../graphql/queries'; // No longer used here, PostForm handles its cache updates
import './CreatePostPage.css'; // We'll create this for styling

const CreatePostPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  // Define a stable initialData object for PostForm
  // This includes the categoryId needed by PostForm for its internal mutation logic and cache updates
  const initialPostFormData = React.useMemo(() => ({
    title: '',
    content: '',
    tags: '', // PostForm expects a string for tagsString initially
    categoryId: categoryId 
  }), [categoryId]);

  // PostForm now handles its own loading and error states internally via its useMutation hook.
  // CreatePostPage primarily provides the category context and navigation for cancel.

  // TODO: Fetch category name to display "In category: {categoryName}"
  // For now, we just show the ID.
  // const { data: categoryData, loading: categoryLoading, error: categoryError } = useQuery(GET_FORUM_CATEGORY_DETAILS, {
  //   variables: { id: categoryId },
  //   skip: !categoryId,
  // });

  // if (categoryLoading) return <p className="page-message">Loading category details...</p>;
  // if (categoryError) return <p className="page-message page-message-error">Error loading category: {categoryError.message}</p>;
  // const categoryName = categoryData?.forumCategoryDetails?.name || categoryId;

  return (
    <div className="create-post-page-container">
      <h1 className="create-post-title">Create New Post</h1>
      <p className="create-post-category-info">
        In category: {categoryId /* Replace with categoryName once fetched */}
      </p>
      <PostForm 
        initialData={initialPostFormData} 
        // PostForm handles its own submission, loading, and error states.
        // It will also handle navigation on successful post creation.
        onCancel={() => navigate(`/forum/category/${categoryId}`)} // Provide a way to cancel and go back
      />
    </div>
  );
};

export default CreatePostPage;
