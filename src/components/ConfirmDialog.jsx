import React from 'react';

const backdropStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const containerStyle = {
  padding: '20px',
  borderRadius: '8px',
  background: '#fff',
  maxWidth: '400px',
  width: '90%',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  textAlign: 'center',
};

const titleStyle = {
  marginBottom: '10px',
  fontSize: '20px',
  color: '#333',
};

const messageStyle = {
  marginBottom: '20px',
  fontSize: '16px',
  color: '#666',
};

const buttonStyle = {
  padding: '10px',
  margin: '0 10px',
  fontSize: '14px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
 
};

const confirmStyle = {
  ...buttonStyle,
  backgroundColor: '#27ae60',
  color: '#fff',
};

const cancelStyle = {
  ...buttonStyle,
  backgroundColor: '#e74c3c',
  color: '#fff',
};

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null; // Não renderiza nada se não estiver aberto

  return (
    <div style={backdropStyle}>
      <div style={containerStyle}>
        <h2 style={titleStyle}>{title}</h2>
        <p style={messageStyle}>{message}</p>
        <div>
          <button onClick={onCancel} style={cancelStyle}>Cancelar</button>
          <button onClick={onConfirm} style={confirmStyle}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

