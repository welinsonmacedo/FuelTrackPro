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
    <p style={{ margin: '0 0 12px 0', color: '#555', fontSize: '14px' }}>
      {typeof subtitle === 'string' ? subtitle : subtitle}
    </p>

    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {onEdit && (
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
          }}
        >
          Editar
        </button>
      )}

      {onDelete && (
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
          }}
        >
          Excluir
        </button>
      )}

      {actions.map(({ label, onClick, style = {}, disabled = false }, idx) => {
        const isDisabled = !!disabled;
        return (
          <button
            key={idx}
            onClick={!isDisabled ? onClick : undefined}
            disabled={isDisabled}
            style={{
              flex: '1 1 140px',
              padding: '10px',
              fontSize: '14px',
              borderRadius: '6px',
              backgroundColor: isDisabled
                ? '#d3d3d3'
                : style.backgroundColor || '#555',
              border: isDisabled
                ? '1px solid #999'
                : style.border || '1px solid #555',
              color: isDisabled ? '#777' : style.color || '#fff',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.6 : 1,
              transition: '0.3s ease all',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  </div>
);
