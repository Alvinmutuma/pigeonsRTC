import React from 'react';

// Basic placeholder Badge component
const Badge = ({ children, className, variant = 'default' }) => (
  <span 
    className={`px-2 py-1 text-xs font-semibold rounded-full ${className || ''}
      ${variant === 'destructive' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
    `}
  >
    {children}
  </span>
);

export default Badge;
