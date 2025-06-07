import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { GET_AGENTS_FOR_DISPLAY } from '../graphql/queries';
import './AgentListingsPage.css';

const AgentCard = ({ agent }) => {
  const price = agent.pricing?.amount || 0;
  const currency = agent.pricing?.currency || 'USD';
  const status = agent.status?.toLowerCase() || 'active';
  const statusEmoji = status === 'active' ? '🟢' : status === 'pending' ? '🟡' : '🔴';
  
  return (
    <div className="agent-card">
      <div className="agent-card-header">
        <h3 className="agent-name">
          <Link to={`/agent/${agent.id}`} className="agent-name-link">{agent.name}</Link>
        </h3>
        <span className={`agent-status agent-status-${status}`} title={status}>
          {statusEmoji} {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      
      {agent.category && (
        <div className="agent-category">
          {agent.category.toUpperCase()}
        </div>
      )}
      
      <p className="agent-description">
        {agent.description || 'No description available.'}
      </p>
      
      <div className="agent-card-footer">
        <div className="agent-price">
          {price > 0 ? `💰 ${currency} ${parseFloat(price).toFixed(2)}` : 'Free'}
        </div>
        
        {agent.tags?.length > 0 && (
          <div className="agent-tags">
            {agent.tags.map((tag, index) => (
              <span key={index} className="agent-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AgentListingsPage = () => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  // Map UI status values to AgentStatus enum values (all lowercase)
  const getStatusValue = (status) => {
    if (!status) return null;
    return status.toLowerCase();
  };

  const { loading, error, data } = useQuery(GET_AGENTS_FOR_DISPLAY, {
    variables: {
      searchTerm: filters.searchTerm || null,
      category: filters.category || null,
      status: getStatusValue(filters.status),
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
      tags: filters.tags.length > 0 ? filters.tags : null
    },
    fetchPolicy: 'cache-and-network'
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!filters.tags.includes(tagInput.trim().toLowerCase())) {
        setFilters(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim().toLowerCase()]
        }));
      }
      setTagInput('');
      e.preventDefault();
    }
  };

  const removeTag = (tagToRemove) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      tags: []
    });
    setTagInput('');
  };

  const agents = data?.agents || [];
  const agentStatuses = ['active', 'pending_approval', 'inactive', 'rejected'];

  if (loading && !data) return <div className="loading">Loading agents...</div>;
  if (error) return <div className="error">Error fetching agents: {error.message}</div>;

  return (
    <div className="agent-listings-page">
      <div className="page-header">
        <h1>Browse AI Agents</h1>
        <p>Find the perfect AI agent for your needs</p>
      </div>
      
      <div className="filters-container">
        <div className="filters">
          <div className="filter-group">
            <label>Search</label>
            <div className="search-input">
              <FaSearch className="search-icon" />
              <input
                type="text"
                name="searchTerm"
                placeholder="Search agents..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          <div className="filter-group">
            <label>Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="Productivity">Productivity</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Business">Business</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              {agentStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'pending_approval' ? 'Pending Approval' : 
                   status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="price-range">
            <div className="filter-group">
              <label>Min Price</label>
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                min="0"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-group">
              <label>Max Price</label>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                min={filters.minPrice || '0'}
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          <div className="filter-group">
            <label>Tags</label>
            <input
              type="text"
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleAddTag}
            />
            
            {filters.tags.length > 0 && (
              <div className="tags-container">
                {filters.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button 
                      type="button" 
                      className="remove-tag"
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {(filters.searchTerm || filters.category || filters.status || filters.minPrice || filters.maxPrice || filters.tags.length > 0) && (
            <div className="clear-filters-container">
              <button 
                type="button"
                onClick={clearFilters}
                className="clear-filters"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      {loading && !data ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading agents...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <div className="error-icon">×</div>
          <p>Error loading agents: {error.message}</p>
        </div>
      ) : (
        <>
          {agents.length > 0 ? (
            <div className="agents-grid">
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3>No agents found</h3>
              <p>We couldn't find any agents matching your search criteria.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="clear-filters"
              >
                Clear all filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AgentListingsPage;
