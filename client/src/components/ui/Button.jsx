import React from 'react';

// Basic placeholder Button component
const Button = ({ children, onClick, className, variant = 'default', size = 'md' }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${className || ''}
      ${variant === 'destructive' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}
      ${size === 'sm' ? 'text-sm' : ''}
      ${size === 'lg' ? 'text-lg' : ''}
    `}
  >
    {children}
  </button>
);

export default Button;
