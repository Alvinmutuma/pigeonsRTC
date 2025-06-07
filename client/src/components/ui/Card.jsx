import React from 'react';

// Basic placeholder Card component
export const Card = ({ children, className }) => (
  <div className={`border rounded-lg shadow-sm ${className || ''}`}>
    {children}
  </div>
);

// Basic placeholder CardContent component
export const CardContent = ({ children, className }) => (
  <div className={`p-4 ${className || ''}`}>
    {children}
  </div>
);

export default Card;
