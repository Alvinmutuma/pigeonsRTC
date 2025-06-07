import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FORUM_CATEGORIES } from '../graphql/queries'; // Assuming this query fetches id, name, description
import { CREATE_FORUM_CATEGORY } from '../graphql/mutations'; // We'll ensure this mutation is defined next
import './AdminCategoryManagementPage.css';

const AdminCategoryManagementPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data, loading: queryLoading, error: queryError, refetch } = useQuery(GET_FORUM_CATEGORIES);

  const [createForumCategory, { loading: mutationLoading, error: mutationError }] = useMutation(CREATE_FORUM_CATEGORY, {
    onCompleted: () => {
      setName('');
      setDescription('');
      refetch(); // Refetch categories after successful creation
    },
    onError: (err) => {
      // Handle mutation error (e.g., display a message to the user)
      console.error("Error creating category:", err.message);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Category name cannot be empty.'); // Basic validation
      return;
    }
    try {
      await createForumCategory({ variables: { input: { name, description } } });
    } catch (err) {
      // Error is handled by onError in useMutation, but good to have a catch block
      console.error("Submission error:", err.message);
    }
  };

  return (
    <div className="admin-category-management-page">
      <h2>Manage Forum Categories</h2>

      <form onSubmit={handleSubmit} className="category-form">
        <h3>Create New Category</h3>
        <div className="form-group">
          <label htmlFor="categoryName">Name:</label>
          <input
            type="text"
            id="categoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="categoryDescription">Description (Optional):</label>
          <textarea
            id="categoryDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" disabled={mutationLoading} className="btn btn-primary">
          {mutationLoading ? 'Creating...' : 'Create Category'}
        </button>
        {mutationError && <p className="error-message">Error creating category: {mutationError.message}</p>}
      </form>

      <h3>Existing Categories</h3>
      {queryLoading && <p>Loading categories...</p>}
      {queryError && <p className="error-message">Error loading categories: {queryError.message}</p>}
      {!queryLoading && !queryError && data && (
        <ul className="category-list-admin">
          {data.forumCategories.length === 0 && <p>No categories found.</p>}
          {data.forumCategories.map(category => (
            <li key={category.id} className="category-item-admin">
              <h4>{category.name}</h4>
              <p>{category.description || 'No description'}</p>
              {/* TODO: Add Edit/Delete buttons here */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminCategoryManagementPage;
