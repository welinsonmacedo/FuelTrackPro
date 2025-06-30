import React from 'react';

export function Select({ label, options, value, onChange, error, name, ...rest }) {
  return (
    <div style={{ margin: '12px', maxWidth: '400px' }}>
      {label && (
        <label
          htmlFor={name}
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          border: error ? '1px solid red' : '1px solid #ccc',
          fontSize: '14px',
          height: '38px',
          boxSizing: 'border-box',
          margin:'10px'
        }}
        {...rest}
      >
        <option value="">Selecione...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p style={{ color: 'red', marginTop: '4px', fontSize: '12px' }}>{error.message}</p>
      )}
    </div>
  );
}
