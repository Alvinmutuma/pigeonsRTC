import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CREATE_FORUM_POST, UPDATE_FORUM_POST } from '../graphql/mutations';
import { GET_FORUM_POSTS_BY_CATEGORY, GET_FORUM_CATEGORIES } from '../graphql/queries';
import RichTextEditor from './RichTextEditor';
import LegalNotice from './community/LegalNotice';
import './PostForm.css';

const PostForm = ({ postId, initialData = { title: '', content: '', tags: '', categoryId: null }, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsString, setTagsString] = useState(''); // Tags as a comma-separated string for the input field
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [formError, setFormError] = useState(null);
  
  const navigate = useNavigate();

  const isEditMode = !!postId;

  useEffect(() => {
    setTitle(initialData.title || '');
    setContent(initialData.content || '');
    // If initialData.tags is an array (from edit mode), join it. Otherwise, use it as is (string from create mode).
    setTagsString(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''));
  }, [initialData]);

  const [createForumPost, { loading: createLoading, error: createError }] = useMutation(CREATE_FORUM_POST, {
    onCompleted: (data) => {
      if (data.createForumPost) {
        navigate(`/community/post/${data.createForumPost.id}`);
      }
    },
    onError: (err) => {
      console.error('Error creating post:', err);
      setFormError(err.message || 'Could not create post.');
    },
    update: (cache, { data: { createForumPost: newPost } }) => {
      if (!newPost || !initialData.categoryId) return;

      // Update GET_FORUM_POSTS_BY_CATEGORY cache
      try {
        const postsQueryOptions = {
          query: GET_FORUM_POSTS_BY_CATEGORY,
          variables: { categoryId: initialData.categoryId, limit: 10, offset: 0 }, // Assuming default limit/offset for first page
        };
        const existingPostsData = cache.readQuery(postsQueryOptions);

        if (existingPostsData && existingPostsData.forumPostsByCategory) {
          cache.writeQuery({
            ...postsQueryOptions,
            data: {
              forumPostsByCategory: {
                ...existingPostsData.forumPostsByCategory,
                posts: [newPost, ...existingPostsData.forumPostsByCategory.posts],
                totalPosts: existingPostsData.forumPostsByCategory.totalPosts + 1,
              },
            },
          });
        }
      } catch (e) {
        console.warn('Failed to update GET_FORUM_POSTS_BY_CATEGORY cache:', e);
      }

      // Update GET_FORUM_CATEGORIES cache (postCount)
      try {
        const categoriesQueryOptions = { query: GET_FORUM_CATEGORIES };
        const existingCategoriesData = cache.readQuery(categoriesQueryOptions);

        if (existingCategoriesData && existingCategoriesData.forumCategories) {
          cache.writeQuery({
            ...categoriesQueryOptions,
            data: {
              forumCategories: existingCategoriesData.forumCategories.map(category =>
                category.id === initialData.categoryId
                  ? { ...category, postCount: (category.postCount || 0) + 1 }
                  : category
              ),
            },
          });
        }
      } catch (e) {
        console.warn('Failed to update GET_FORUM_CATEGORIES cache:', e);
      }
    },
  });

  const [updateForumPost, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_FORUM_POST, {
    onCompleted: (data) => {
      if (data.updateForumPost) {
        navigate(`/community/post/${data.updateForumPost.id}`);
      }
    },
    onError: (err) => {
      console.error('Error updating post:', err);
      setFormError(err.message || 'Could not update post.');
    },
    // Optionally, refetch the post details or update cache if needed, though navigating usually handles it.
  });

  const isLoading = createLoading || updateLoading;
  const currentError = formError || createError?.message || updateError?.message;
  const [loadingDots, setLoadingDots] = useState('.');
  const baseText = isEditMode ? 'Update Post' : 'Create Post';
  const loadingBaseText = isEditMode ? 'Updating' : 'Creating';
  const submitButtonText = isLoading ? `${loadingBaseText}${loadingDots}` : baseText;
  
  // Animate loading dots when form is being submitted
  useEffect(() => {
    let intervalId;
    if (isLoading) {
      intervalId = setInterval(() => {
        setLoadingDots(prev => prev.length >= 3 ? '.' : prev + '.');
      }, 400);
    }
    return () => clearInterval(intervalId);
  }, [isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors

    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!content || content.trim() === '' || content === '<p><br></p>') {
      setFormError('Content is required.');
      return;
    }
    if (!termsAgreed) {
      setFormError('You must agree to the terms and policies before posting.');
      return;
    }

    const processedTags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const postInput = { title, content, tags: processedTags };

    if (isEditMode) {
      updateForumPost({ variables: { id: postId, input: postInput } });
    } else {
      // Ensure categoryId is present and not an empty string
      if (!initialData.categoryId || initialData.categoryId.trim() === '') { 
        setFormError('Category ID is missing or invalid. Cannot create post.');
        return;
      }
      createForumPost({ variables: { input: { ...postInput, categoryId: initialData.categoryId } } });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-form-reusable">
      {currentError && <p className="error-message form-error">{currentError}</p>}
      
      <div className="form-group">
        <label htmlFor="post-title">Title</label>
        <input
          type="text"
          id="post-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="post-content">Content</label>
        <RichTextEditor
          value={content}
          onChange={setContent} 
          placeholder="Elaborate on your post..."
          readOnly={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="post-tags">Tags (comma-separated)</label>
        <input
          type="text"
          id="post-tags"
          value={tagsString}
          onChange={(e) => setTagsString(e.target.value)}
          disabled={isLoading}
          placeholder="e.g., javascript, react, graphql"
        />
      </div>
      
      {/* Legal Notice - Shows terms agreement notice */}
      <div className="form-legal-notice">
        <LegalNotice variant="compact" />
      </div>

      {/* Terms agreement checkbox */}
      <div className="form-checkbox-group">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={termsAgreed} 
            onChange={(e) => setTermsAgreed(e.target.checked)}
            disabled={isLoading}
          />
          <span>I agree to the PigeonRTC <a href="/legal/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a>, <a href="/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>, and <a href="/legal/cookie-policy" target="_blank" rel="noopener noreferrer">Cookie Policy</a>.</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              <span>{submitButtonText}</span>
            </>
          ) : (
            <>
              <span className="btn-icon">{isEditMode ? '✏️' : '✨'}</span>
              <span>{submitButtonText}</span>
            </>
          )}
        </button>
        {onCancel && (
          <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
            <span className="btn-icon">✖️</span>
            <span>Cancel</span>
          </button>
        )}
      </div>
    </form>
  );
};

export default PostForm;
