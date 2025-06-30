import React from 'react';

export const Form = ({ children, onSubmit, style }) => {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        maxWidth: '400px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        ...style,
      }}
    >
      {children}
    </form>
  );
};
