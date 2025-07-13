import React from 'react';

export const SubmitButton = ({ children, loading ,...props}) => (
  <button
    type="submit"
     disabled={loading || props.disabled}
    aria-busy={loading ? "true" : undefined}
    style={{
      width: '100%',
      display: "block",
      padding: '12px 0',
      backgroundColor: loading ? '#a3b0f7' : '#6a8af3',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s ease',
      boxSizing: 'border-box',
      marginTop: '10px',
      textAlign: 'center',
      ...(props.style || {}),
    }}
    {...props}
  >
    {loading ? 'Enviando...' : children}
  </button>
);
