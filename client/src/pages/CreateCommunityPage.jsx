import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { CREATE_FORUM_CATEGORY } from '../graphql/mutations'; // We'll need to ensure this mutation is defined client-side
import { GET_FORUM_CATEGORIES } from '../graphql/queries'; // To refetch categories list
import './CreateCommunityPage.css'; // We'll create this for styling

const CreateCommunityPage = () => {
  console.log('--- CreateCommunityPage component mounted ---');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const [createForumCategory, { loading }] = useMutation(CREATE_FORUM_CATEGORY, {
    refetchQueries: [{ query: GET_FORUM_CATEGORIES }],
    onCompleted: (data) => {
      console.log('Community creation successful:', data);
      setErrorMessage('');
      
      // Navigate to the newly created community page using its slug or ID
      if (data.createForumCategory && data.createForumCategory.id) {
        if (data.createForumCategory.slug) {
          navigate(`/community/category/${data.createForumCategory.slug}`);
        } else {
          navigate(`/community/category/${data.createForumCategory.id}`);
        }
      } else {
        console.warn('Community created but missing ID/slug in response');
        navigate('/community'); // Fallback to community home
      }
    },
    onError: (err) => {
      console.error('Error creating community:', err);
      console.error('Error message:', err.message);
      if (err.graphQLErrors) {
        console.error('GraphQL errors:', err.graphQLErrors);
      }
      if (err.networkError) {
        console.error('Network error:', err.networkError);
      }
      setErrorMessage(err.message || 'Failed to create community. Please try again.');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear any previous errors
    
    if (!name.trim()) {
      setErrorMessage('Community name is required.');
      return;
    }
    
    console.log('Submitting community creation with:', { name, description });
    
    try {
      await createForumCategory({ 
        variables: { 
          input: { 
            name: name.trim(), 
            description: description.trim() || undefined 
          } 
        } 
      });
    } catch (err) {
      // Error already handled by onError
      console.log('Error caught in handleSubmit:', err);
    }
  };

  return (
    <div className="create-community-page-container">
      <h1>Create a New Community</h1>
      {errorMessage && (
        <div className="error-message" style={{ color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="create-community-form">
        <div className="form-group">
          <label htmlFor="community-name">Community Name</label>
          <input
            type="text"
            id="community-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., AI Art & Design"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="community-description">Description (Optional)</label>
          <textarea
            id="community-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this community about?"
            rows="4"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="btn-submit-community"
        >
          {loading ? 'Creating...' : 'Create Community'}
        </button>
      </form>
    </div>
  );
};

export default CreateCommunityPage;
