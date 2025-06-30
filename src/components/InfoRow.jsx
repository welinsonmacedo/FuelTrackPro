import React from 'react';

export const InfoRow = ({ label, value }) => (
  <div style={{ marginBottom: '6px' }}>
    <strong>{label}:</strong> {value}
  </div>
);
