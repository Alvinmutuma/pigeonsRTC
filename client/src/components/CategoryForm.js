import React, { useState, useEffect } from 'react';
import './CategoryForm.css';

const CategoryForm = ({ initialData, onSubmit, onCancel, isLoading, submitButtonText = 'Submit', error }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Category name is required.');
      return;
    }
    onSubmit({ name, description });
  };

  return (
    <form onSubmit={handleSubmit} className="category-form-reusable">
      <div className="form-group">
        <label htmlFor="category-form-name">Name</label>
        <input
          type="text"
          id="category-form-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="category-form-description">Description</label>
        <textarea
          id="category-form-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          disabled={isLoading}
        />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={isLoading} className="btn-submit">
          {isLoading ? 'Processing...' : submitButtonText}
        </button>
        <button type="button" onClick={onCancel} disabled={isLoading} className="btn-cancel">
          Cancel
        </button>
      </div>
      {error && <p className="error-message">{error.message || 'An error occurred.'}</p>}
    </form>
  );
};

export default CategoryForm;
