import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FORUM_CATEGORIES } from '../graphql/queries';
import { CREATE_FORUM_CATEGORY, UPDATE_FORUM_CATEGORY, DELETE_FORUM_CATEGORY } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CategoryForm from '../components/CategoryForm'; 
import './AdminForumCategoriesPage.css';

const AdminForumCategoriesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null); 

  const { loading, error, refetch } = useQuery(GET_FORUM_CATEGORIES, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (completedData) => {
      setCategories(completedData.forumCategories || []);
    }
  });

  const [createCategory, { loading: createLoading, error: createError }] = useMutation(CREATE_FORUM_CATEGORY, {
    onCompleted: () => {
      refetch();
      setShowForm(false);
    },
    onError: (err) => alert(`Error creating category: ${err.message}`)
  });

  const [updateCategory, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_FORUM_CATEGORY, {
    onCompleted: () => {
      refetch();
      setShowForm(false);
      setIsEditing(false);
      setCurrentCategory(null);
    },
    onError: (err) => alert(`Error updating category: ${err.message}`)
  });

  const [deleteCategory, { loading: deleteLoading, error: deleteError }] = useMutation(DELETE_FORUM_CATEGORY, {
    onCompleted: () => {
      refetch();
    },
    onError: (err) => alert(`Error deleting category: ${err.message}`),
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('Access denied. You must be an admin to view this page.');
      navigate('/');
    }
  }, [user, navigate]);

  const handleShowCreateForm = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setShowForm(true);
  };

  const handleShowEditForm = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentCategory(null);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCategory({ variables: { id: categoryId } });
    }
  };

  const handleFormSubmit = (formData) => {
    const input = { name: formData.name, description: formData.description };
    if (isEditing && currentCategory) {
      updateCategory({ variables: { id: currentCategory.id, input } });
    } else {
      createCategory({ variables: { input } });
    }
  };

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p>Error loading categories: {error.message}</p>;
  if (!user || user.role !== 'admin') return <p>Redirecting...</p>;

  return (
    <div className="admin-categories-page">
      <h1>Manage Forum Categories</h1>
      <button onClick={handleShowCreateForm} className="btn-create-new">
        Create New Category
      </button>

      {showForm && (
        <CategoryForm
          initialData={isEditing ? currentCategory : null}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          isLoading={createLoading || updateLoading}
          submitButtonText={isEditing ? 'Update Category' : 'Create Category'}
          error={createError || updateError}
        />
      )}

      <table className="categories-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Post Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.description || '-'}</td>
              <td>{category.postCount}</td>
              <td>
                <button onClick={() => handleShowEditForm(category)} className="btn-edit">Edit</button>
                <button onClick={() => handleDeleteCategory(category.id)} disabled={deleteLoading} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan="4">No categories found.</td>
            </tr>
          )}
        </tbody>
      </table>
      {deleteError && <p className="error-message">{deleteError.message}</p>}
    </div>
  );
};

export default AdminForumCategoriesPage;
