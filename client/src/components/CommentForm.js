import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_FORUM_COMMENT } from '../graphql/mutations'; 
import { GET_FORUM_POST_DETAILS } from '../graphql/queries'; 
import './CommentForm.css';

const CommentForm = ({ postId, currentUserId }) => {
  console.log('CommentForm mounted with postId:', postId, 'and currentUserId:', currentUserId);
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [createComment, { loading }] = useMutation(CREATE_FORUM_COMMENT, {
    refetchQueries: [
      {
        query: GET_FORUM_POST_DETAILS,
        variables: { postId },
      },
    ],
    onError: (error) => {
      setErrorMessage(error.message || 'Could not submit comment. Please try again.');
      console.error('Error creating comment:', error);
    },
    onCompleted: () => {
      setContent(''); 
      setErrorMessage('');
    },
  });

  const handleSubmit = async (e) => {
    console.log('CommentForm handleSubmit triggered.');
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('Comment cannot be empty.');
      console.log('CommentForm: Content is empty.');
      return;
    }
    if (!currentUserId) {
        setErrorMessage('You must be logged in to comment.');
        console.log('CommentForm: currentUserId is missing.');
        return;
    }

    setErrorMessage('');
    console.log('CommentForm: Attempting to call createComment mutation...');
    try {
      console.log('Submitting comment for postId:', postId); 
      await createComment({
        variables: {
          input: {
            postId,
            content,
          }
        },
      });
      console.log('CommentForm: createComment mutation call finished.');
    } catch (err) {
      console.error('CommentForm: Error caught during createComment call (should be handled by onError):', err);
      // Error is handled by onError callback of useMutation
    }
  };

  if (!currentUserId) {
    return <p className="login-prompt">Please <a href="/login">login</a> to comment.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <h3>Leave a Comment</h3>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment here..."
        rows="4"
        disabled={loading}
        required
      />
      <button type="submit" disabled={loading || !content.trim()}>
        {loading ? 'Submitting...' : 'Submit Comment'}
      </button>
    </form>
  );
};

export default CommentForm;
