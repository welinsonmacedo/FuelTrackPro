import React from 'react';

export const LoadingOverlay = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  }}>
    <div style={{ background: '#fff', padding: '20px', borderRadius: '6px' }}>Carregando...</div>
  </div>
);