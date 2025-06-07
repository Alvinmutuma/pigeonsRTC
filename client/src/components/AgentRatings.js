import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaUser, FaThumbsUp, FaFilter, FaSort } from 'react-icons/fa';
import { useMutation, useQuery } from '@apollo/client';
import { GET_AGENT_REVIEWS, GET_USER_REVIEW_FOR_AGENT } from '../graphql/queries/reviewQueries';
import { CREATE_REVIEW, UPDATE_REVIEW, DELETE_REVIEW, MARK_REVIEW_HELPFUL } from '../graphql/mutations/reviewMutations';
import { useAuth } from '../contexts/AuthContext';
import './AgentRatings.css';

const AgentRatings = ({ agent }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reviews');
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    content: '',
    pros: [],
    cons: [],
    verifiedPurchase: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState(null);

  // GraphQL queries and mutations
  const { loading: reviewsLoading, data: reviewsData, refetch: refetchReviews } = useQuery(GET_AGENT_REVIEWS, {
    variables: {
      agentId: agent.id,
      sortBy: sortBy === 'newest' ? 'NEWEST' : 
             sortBy === 'highest' ? 'HIGHEST_RATING' : 
             sortBy === 'lowest' ? 'LOWEST_RATING' : 
             sortBy === 'mostHelpful' ? 'HELPFUL' : 'NEWEST'
    },
    fetchPolicy: 'network-only'
  });

  const { loading: userReviewLoading, data: userReviewData, refetch: refetchUserReview } = useQuery(GET_USER_REVIEW_FOR_AGENT, {
    variables: { agentId: agent.id },
    skip: !user,
    fetchPolicy: 'network-only'
  });

  // Define state for submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Using Apollo Client's mutation with the standardized authentication token handling
  // We're using the loading state but will implement the mutation with fetch
  const [createReview, { loading: createLoading }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      console.log('Review submitted successfully!');
      refetchReviews();
      refetchUserReview();
      setNewReview({
        rating: 0,
        title: '',
        content: '',
        pros: [],
        cons: [],
        verifiedPurchase: false
      });
      setActiveTab('reviews');
    },
    onError: (error) => {
      console.error('Error creating review:', error);
      if (error.networkError) {
        console.log('Network error details:', error.networkError);
      }
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach(err => console.log('GraphQL error:', err));
      }
      alert(`Error submitting review: ${error.message}`);
    }
  });

  const [updateReview, { loading: updateLoading }] = useMutation(UPDATE_REVIEW, {
    onCompleted: () => {
      refetchReviews();
      refetchUserReview();
      setIsEditing(false);
      setReviewToEdit(null);
      setActiveTab('reviews');
    },
    onError: (error) => {
      console.error('Error updating review:', error);
      alert(`Error updating review: ${error.message}`);
    }
  });

  const [deleteReview] = useMutation(DELETE_REVIEW, {
    onCompleted: () => {
      refetchReviews();
      refetchUserReview();
    }
  });

  const [markReviewHelpful] = useMutation(MARK_REVIEW_HELPFUL);

  // Initialize edit form when user has a review
  useEffect(() => {
    if (userReviewData?.userReviewForAgent && activeTab === 'write') {
      const userReview = userReviewData.userReviewForAgent;
      setIsEditing(true);
      setReviewToEdit(userReview);
      setNewReview({
        rating: userReview.rating,
        title: userReview.title,
        content: userReview.content,
        pros: userReview.pros || [],
        cons: userReview.cons || [],
        verifiedPurchase: userReview.verifiedPurchase || false
      });
    }
  }, [userReviewData, activeTab]);

  // Reset form when switching to write tab
  useEffect(() => {
    if (activeTab === 'write' && !isEditing) {
      setNewReview({
        rating: 0,
        title: '',
        content: '',
        pros: [],
        cons: [],
        verifiedPurchase: false
      });
    }
  }, [activeTab, isEditing]);

  // Get reviews from data
  const reviews = reviewsData?.agentReviews?.reviews || [];
  
  // Fallback data for when there are no reviews yet
  const hasReviews = reviews && reviews.length > 0;

  // Calculate average rating - now using agent.reviewStats.averageRating from backend
  const calculateAverage = (reviews) => {
    if (agent.reviewStats?.averageRating !== undefined) return agent.reviewStats.averageRating;
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };

  // Get filtered and sorted reviews - now handled by backend
  const getFilteredAndSortedReviews = () => {
    // The filtering and sorting is now handled by the GraphQL query
    // We just return the reviews from the query result
    return reviews || [];
  };

  // Render stars for ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star empty" />);
      }
    }
    
    return stars;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Handle marking a review as helpful or not helpful
  const handleHelpfulVote = (reviewId, isHelpful) => {
    if (!user) {
      alert('You must be logged in to vote on reviews');
      return;
    }
    
    markReviewHelpful({
      variables: {
        id: reviewId,
        helpful: isHelpful
      },
      onCompleted: () => refetchReviews()
    });
  };

  // Handle deleting a review
  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReview({
        variables: { id: reviewId },
        onCompleted: () => {
          refetchReviews();
          refetchUserReview();
        }
      });
    }
  };

  // Check if a review belongs to the current user
  const isUserReview = (review) => {
    return user && review.author && review.author.id === user.id;
  };

  // Handle review submission (create or update)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (newReview.rating === 0) {
        alert('Please select a rating.');
        return;
      }
      
      if (!newReview.title || newReview.title.trim() === '') {
        alert('Please provide a review title.');
        return;
      }
      
      if (!newReview.content || newReview.content.trim() === '') {
        alert('Please provide review content.');
        return;
      }
      
      // Set loading state manually since we're bypassing Apollo
      // Log submission state for debugging
      console.log('Setting submission state:', true);
      setIsSubmitting(true);
      
      if (isEditing && reviewToEdit) {
        // Handle update with Apollo as before
        try {
          await updateReview({
            variables: {
              id: reviewToEdit.id,
              input: {
                agentId: agent.id,
                rating: parseInt(newReview.rating),
                title: newReview.title.trim(),
                content: newReview.content.trim(),
                pros: Array.isArray(newReview.pros) ? newReview.pros.filter(p => p && p.trim() !== '') : [],
                cons: Array.isArray(newReview.cons) ? newReview.cons.filter(c => c && c.trim() !== '') : [],
                verifiedPurchase: Boolean(newReview.verifiedPurchase)
              }
            }
          });
          alert('Review updated successfully!');
        } catch (error) {
          console.error('Update review error:', error);
          alert(`Error updating review: ${error.message}`);
        }
      } else {
        // Use direct fetch for creating new reviews to bypass Apollo issues
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You must be logged in to submit a review');
          setIsSubmitting(false);
          return;
        }
        
        const reviewInput = {
          agentId: agent.id,
          rating: parseInt(newReview.rating),
          title: newReview.title.trim(),
          content: newReview.content.trim(),
          pros: Array.isArray(newReview.pros) ? newReview.pros.filter(p => p && p.trim() !== '') : [],
          cons: Array.isArray(newReview.cons) ? newReview.cons.filter(c => c && c.trim() !== '') : [],
          verifiedPurchase: Boolean(newReview.verifiedPurchase)
        };

        try {
          await createReview({ variables: { input: reviewInput } });
          alert('Review submitted successfully!');
          refetchReviews();
          refetchUserReview();
          setNewReview({
            rating: 0,
            title: '',
            content: '',
            pros: [],
            cons: [],
            verifiedPurchase: false
          });
          setActiveTab('reviews');
        } catch (error) {
          console.error('Error submitting review:', error);
          alert(`Error submitting review: ${error.message}`);
        }
      }
    } catch (err) {
      console.error('Review submission error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false); // Always reset loading state
    }
  };

  // Handle star rating selection
  const handleStarClick = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  const filteredReviews = getFilteredAndSortedReviews();

  return (
    <div className="agent-ratings">
      <div className="review-disclaimer">
        <p><strong>Please Note:</strong> The review system is in its early stages. Meaningful reviews will become more prevalent as more AI agents are actively used on the platform. Your feedback is valuable as we grow!</p>
      </div>
      <div className="ratings-header">
        <h2>Ratings & Reviews</h2>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
          <button 
            className={`tab ${activeTab === 'write' ? 'active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            Write a Review
          </button>
        </div>
      </div>

      {activeTab === 'reviews' && (
        <div className="reviews-container">
          <div className="ratings-summary">
            <div className="average-rating">
              <div className="rating-number">{calculateAverage(reviews).toFixed(1)}</div>
              <div className="rating-stars">{renderStars(calculateAverage(reviews))}</div>
              <div className="rating-count">{agent.reviewStats?.count || reviews.length} reviews</div>
            </div>
            
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((stars, index) => (
                <div key={stars} className="rating-bar">
                  <div className="stars-label">{stars} stars</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${reviews.length > 0 ? (reviews.filter(review => review.rating === stars).length / reviews.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <div className="count">{reviews.filter(review => review.rating === stars).length}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="reviews-controls">
            <button 
              className="filter-button" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filter
            </button>
            
            <div className="sort-control">
              <FaSort />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="mostHelpful">Most Helpful</option>
              </select>
            </div>
          </div>
          
          {showFilters && (
            <div className="filters-panel">
              <div className="rating-filters">
                <div className="filter-label">Filter by rating:</div>
                <div className="star-filters">
                  <button 
                    className={`star-filter ${filterRating === 0 ? 'active' : ''}`}
                    onClick={() => setFilterRating(0)}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map(stars => (
                    <button 
                      key={stars}
                      className={`star-filter ${filterRating === stars ? 'active' : ''}`}
                      onClick={() => setFilterRating(stars)}
                    >
                      {stars} <FaStar />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="reviews-list">
            {reviewsLoading ? (
              <div className="loading">Loading reviews...</div>
            ) : hasReviews && filteredReviews.length > 0 ? (
              filteredReviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        <FaUser />
                      </div>
                      <div className="reviewer-name">{review.author?.username || 'Anonymous'}</div>
                      {review.verifiedPurchase && <span className="verified-badge">Verified Purchase</span>}
                    </div>
                    <div className="review-date">{review.formattedDate || formatDate(review.createdAt)}</div>
                  </div>
                  
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                  
                  <h3 className="review-title">{review.title}</h3>
                  <p className="review-content">{review.content}</p>
                  
                  {review.pros && review.pros.length > 0 && (
                    <div className="review-pros">
                      <h4>Pros:</h4>
                      <ul>
                        {review.pros.map((pro, idx) => (
                          <li key={`pro-${idx}`}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {review.cons && review.cons.length > 0 && (
                    <div className="review-cons">
                      <h4>Cons:</h4>
                      <ul>
                        {review.cons.map((con, idx) => (
                          <li key={`con-${idx}`}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="review-footer">
                    <div className="helpful-controls">
                      <span>Was this review helpful?</span>
                      <button 
                        className="helpful-button" 
                        onClick={() => handleHelpfulVote(review.id, true)}
                        disabled={!user}
                      >
                        <FaThumbsUp /> <span>{review.helpfulVotes || 0}</span>
                      </button>
                    </div>
                    
                    {isUserReview(review) && (
                      <div className="user-review-controls">
                        <button 
                          className="edit-review-button"
                          onClick={() => {
                            setReviewToEdit(review);
                            setIsEditing(true);
                            setNewReview({
                              rating: review.rating,
                              title: review.title,
                              content: review.content,
                              pros: review.pros || [],
                              cons: review.cons || [],
                              verifiedPurchase: review.verifiedPurchase || false
                            });
                            setActiveTab('write');
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-review-button"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>No reviews match your current filters.</p>
                {filterRating > 0 && (
                  <button 
                    className="clear-filters"
                    onClick={() => setFilterRating(0)}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'write' && (
        <div className="write-review">
          {!user ? (
            <div className="login-prompt">
              <p>You must be logged in to write a review.</p>
            </div>
          ) : userReviewLoading ? (
            <div className="loading">Loading...</div>
          ) : (
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Your Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star}
                      className={`rating-star ${newReview.rating >= star ? 'selected' : ''}`}
                      onClick={() => handleStarClick(star)}
                    >
                      {newReview.rating >= star ? <FaStar /> : <FaRegStar />}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="title">Review Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newReview.title}
                  onChange={handleInputChange}
                  placeholder="Summarize your experience"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="content">Your Review</label>
                <textarea
                  id="content"
                  name="content"
                  value={newReview.content}
                  onChange={handleInputChange}
                  placeholder="Share your experience with this agent. What worked well? What could be improved?"
                  rows="5"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Pros</label>
                <textarea
                  id="pros"
                  name="pros"
                  value={newReview.pros.join('\n')}
                  onChange={(e) => {
                    const prosArray = e.target.value.split('\n').filter(item => item.trim() !== '');
                    setNewReview({...newReview, pros: prosArray});
                  }}
                  placeholder="Enter each pro on a new line"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Cons</label>
                <textarea
                  id="cons"
                  name="cons"
                  value={newReview.cons.join('\n')}
                  onChange={(e) => {
                    const consArray = e.target.value.split('\n').filter(item => item.trim() !== '');
                    setNewReview({...newReview, cons: consArray});
                  }}
                  placeholder="Enter each con on a new line"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="verifiedPurchase"
                    checked={newReview.verifiedPurchase}
                    onChange={(e) => setNewReview({...newReview, verifiedPurchase: e.target.checked})}
                  />
                  I have used this agent (verified purchase)
                </label>
              </div>
              
              <button 
                type="submit" 
                className="submit-review-btn"
                disabled={createLoading || updateLoading || isSubmitting}
              >
                {createLoading || updateLoading || isSubmitting ? 'Submitting...' : (isEditing ? 'Update Review' : 'Submit Review')}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  className="cancel-edit"
                  onClick={() => {
                    setIsEditing(false);
                    setReviewToEdit(null);
                    setNewReview({
                      rating: 0,
                      title: '',
                      content: '',
                      pros: [],
                      cons: [],
                      verifiedPurchase: false
                    });
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentRatings;
