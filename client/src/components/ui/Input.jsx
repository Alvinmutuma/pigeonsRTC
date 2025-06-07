import React from 'react';

// Basic placeholder Input component
const Input = ({ type = 'text', placeholder, value, onChange, className }) => (
  <input 
    type={type} 
    placeholder={placeholder} 
    value={value} 
    onChange={onChange} 
    className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
  />
);

export default Input;
