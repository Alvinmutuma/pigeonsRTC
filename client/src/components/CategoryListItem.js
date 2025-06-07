import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryListItem.css';

const CategoryListItem = ({ category }) => {
  if (!category) return null;

  return (
    <div className="category-list-item">
      <div className="category-list-item-header">
        <h3 className="category-list-item-title">
          <Link to={`/forum/category/${category.id}`}>{category.name}</Link>
        </h3>
      </div>
      {category.description && (
        <p className="category-list-item-description">{category.description}</p>
      )}
      <div className="category-list-item-footer">
        {/* Placeholder for stats like post count or last activity */} 
        {typeof category.postCount === 'number' && (
          <span className="category-stat">Posts: {category.postCount}</span>
        )}
        {/* <span className="category-stat">Threads: {category.threadCount || 0}</span> */} 
        <Link to={`/forum/category/${category.id}`} className="btn-view-category">
          View Category &rarr;
        </Link>
      </div>
    </div>
  );
};

export default CategoryListItem;
