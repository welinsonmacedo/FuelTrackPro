import React from 'react';

export const ListItem = ({ title, subtitle, onEdit, onDelete, actions = [] }) => (
  <div
    style={{
      border: '1px solid #ccc',
      borderRadius: '6px',
      padding: '10px',
      marginBottom: '10px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '900px',
    }}
  >
    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{title}</h3>
    <p
  style={{ margin: '0 0 12px 0', color: '#555', fontSize: '14px' }}
  // Se quiser aceitar JSX e manter o estilo, use:
>
  {typeof subtitle === 'string' ? subtitle : subtitle}
</p>
    <div
      style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap', // permite os botões quebrarem linha em telas pequenas
      }}
    >
      <button
        onClick={onEdit}
        style={{
          flex: '1 1 120px',
          padding: '10px',
          fontSize: '14px',
          cursor: 'pointer',
          borderRadius: '6px',
          border: '1px solid #3498db',
          backgroundColor: '#3498db',
          color: '#fff',
          transition: 'background-color 0.3s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2980b9')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#3498db')}
      >
        Editar
      </button>

      <button
        onClick={onDelete}
        style={{
          flex: '1 1 120px',
          padding: '10px',
          fontSize: '14px',
          cursor: 'pointer',
          borderRadius: '6px',
          border: '1px solid #e74c3c',
          backgroundColor: '#e74c3c',
          color: '#fff',
          transition: 'background-color 0.3s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#c0392b')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e74c3c')}
      >
        Excluir
      </button>

      {actions.map(({ label, onClick, style }, idx) => (
        <button
          key={idx}
          onClick={onClick}
          style={{
            flex: '1 1 140px',
            padding: '10px',
            fontSize: '14px',
            cursor: 'pointer',
            borderRadius: '6px',
            border: '1px solid #555',
            backgroundColor: '#555',
            color: '#fff',
            transition: 'background-color 0.3s',
            ...style,
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#333')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = style?.backgroundColor || '#555')}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);
