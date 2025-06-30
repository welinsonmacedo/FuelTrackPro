import React from 'react';

export const SearchInput = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder || "Buscar..."}
    style={{
      padding: '10px 12px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      width: '100%',
      maxWidth: '400px',
      boxSizing: 'border-box',
      fontSize: '16px',
      transition: 'border-color 0.3s',
      margin:"10px"
    }}
    onFocus={e => (e.target.style.borderColor = '#3498db')}
    onBlur={e => (e.target.style.borderColor = '#ccc')}
  />
);
