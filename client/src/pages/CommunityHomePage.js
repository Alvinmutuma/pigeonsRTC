import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_FORUM_CATEGORIES } from '../graphql/queries';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import LegalNotice from '../components/community/LegalNotice';
import SEO from '../components/SEO';
import './CommunityHomePage.css';

const CommunityHomePage = () => {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(GET_FORUM_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  
  // Number of top categories to show initially
  const topCategoriesCount = 5;

  useEffect(() => {
    if (data?.forumCategories) {
      // Filter categories based on search term
      const filtered = data.forumCategories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [data, searchTerm]);

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p>Error loading categories: {error.message}</p>;
  
  // Sort categories by post count (descending)
  const sortedCategories = [...filteredCategories].sort((a, b) => 
    (b.postCount || 0) - (a.postCount || 0)
  );
  
  // Get top categories and remaining categories
  const topCategories = sortedCategories.slice(0, topCategoriesCount);
  const remainingCategories = sortedCategories.slice(topCategoriesCount);

  return (
    <div className="community-home-page">
      <SEO 
        title="PigeonRTC Community Forum - AI Agent Discussions"
        description="Join the PigeonRTC community forum to discuss AI agents, share insights, ask questions, and connect with developers and businesses. Explore categories and trending topics."
        path="/community"
      />
      <div className="community-header">
        <h1>Community Forum</h1>
        <p className="community-header-desc">Connect with other developers and businesses using PigeonRTC</p>
      </div>
      
      <div className="community-layout">
        {/* Left Sidebar - Categories */}
        <div className="community-left-sidebar">
          <div className="community-panel">
            <h2 className="panel-heading">Categories</h2>
            
            {/* Search box for categories */}
            <div className="category-search">
              <FaSearch className="search-icon" />
              <input
                type="search"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setSearchTerm('')}
                inputMode="search"
                aria-label="Search categories"
                className="category-search-input"
                autoComplete="off"
                spellCheck="false"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="clear-search-button"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            
            {filteredCategories.length > 0 ? (
              <div>
                {/* Top categories */}
                <ul className="category-list">
                  {topCategories.map(category => (
                    <li key={category.id} className="category-list-item">
                      <Link to={`/community/category/${category.id}`} className="category-link">
                        <h3 className="category-name">{category.name}</h3>
                        <span className="category-post-count">{category.postCount || 0} posts</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* Remaining categories */}
                {remainingCategories.length > 0 && (
                  <div className="more-categories">
                    <button 
                      className="show-more-button" 
                      onClick={() => setShowAllCategories(!showAllCategories)}
                    >
                      {showAllCategories ? (
                        <>
                          <span>Show less</span>
                          <FaChevronUp className="chevron-icon" />
                        </>
                      ) : (
                        <>
                          <span>Show {remainingCategories.length} more</span>
                          <FaChevronDown className="chevron-icon" />
                        </>
                      )}
                    </button>
                    
                    {showAllCategories && (
                      <ul className="category-list remaining-categories">
                        {remainingCategories.map(category => (
                          <li key={category.id} className="category-list-item">
                            <Link to={`/community/category/${category.id}`} className="category-link">
                              <h3 className="category-name">{category.name}</h3>
                              <span className="category-post-count">{category.postCount || 0} posts</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-categories-message">
                <p>No categories found matching your search.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Center Column - Post Feed or Main Content */}
        <div className="community-main-content">
          <div className="community-welcome">
            <h2>Welcome to the PigeonRTC Community</h2>
            <p>Join discussions about AI agents, share your experiences, and connect with other developers and businesses.</p>
          </div>
          
          <div className="community-actions">
            {user && (
              <Link to="/create-community" className="btn btn-primary">
                Create New Community
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/forum/categories" className="btn btn-secondary">
                Manage Categories
              </Link>
            )}
          </div>
          
          {/* Featured or Latest Posts would go here */}
          <div className="community-featured">
            <h3>Featured Discussions</h3>
            <p className="empty-state">New discussions will appear here. Check back soon or start a conversation!</p>
          </div>
        </div>
        
        {/* Right Sidebar - Create Post, Legal, Trending */}
        <div className="community-right-sidebar">
          {/* Create Post Button */}
          {user ? (
            <Link to="/community/create-post" className="create-post-button">
              Start a New Discussion
            </Link>
          ) : (
            <div className="login-prompt">
              <p>Sign in to participate in discussions</p>
              <Link to="/login" className="btn btn-outline">Sign In</Link>
            </div>
          )}
          
          {/* Trending Topics */}
          <div className="community-panel">
            <h3 className="panel-heading">Trending Topics</h3>
            <div className="trending-tags">
              <span className="tag">#AgentDevelopment</span>
              <span className="tag">#AIIntegration</span>
              <span className="tag">#BusinessUseCase</span>
              <span className="tag">#PigeonRTC</span>
            </div>
          </div>
          
          {/* Legal Notice */}
          <LegalNotice variant="sidebar" />
        </div>
      </div>
    </div>
  );
};

export default CommunityHomePage;
