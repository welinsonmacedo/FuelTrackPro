import React from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  modalWrapper: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1001,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '30px 20px 20px 20px',
    borderRadius: '8px',
    maxWidth: '400px',
    width: '100vh',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    boxSizing: 'border-box',
    height: '90vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#999',
 
  },
  closeButtonHover: {
    color: '#333',
  },
  title: {
    marginTop: 0,
    marginBottom: '10px',
    paddingRight: '40px',
  },
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.container}>
      <div style={styles.overlay} onClick={onClose} />

      <div role="dialog" aria-modal="true" style={styles.modalWrapper} onClick={e => e.stopPropagation()}>
        <div style={styles.modalContent}>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            style={styles.closeButton}
            onMouseEnter={e => (e.currentTarget.style.color = styles.closeButtonHover.color)}
            onMouseLeave={e => (e.currentTarget.style.color = styles.closeButton.color)}
          >
            ×
          </button>

          <h3 style={styles.title}>{title}</h3>

          {children}
        </div>
      </div>
    </div>
  );
};
