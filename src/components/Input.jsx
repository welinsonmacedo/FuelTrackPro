export default function Input({ label, type = "text", value, onChange, error, ...props }) {
  return (
    <div style={{ marginBottom: '0.3rem', width: '100%', maxWidth: '300px' }}>
      {label && <label style={{ display: 'block', marginBottom: '0.3rem' }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '0.6rem 0.8rem',
          border: error ? '2px solid #dc2626' : '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '1rem',
          outline: 'none',
          boxShadow: error ? '0 0 5px rgba(220, 38, 38, 0.5)' : 'none',
          transition: 'border-color 0.3s ease',
        }}
        {...props}
      />
      {error && <p style={{ color: '#dc2626', marginTop: '0.3rem', fontWeight: '600' }}>{error}</p>}
    </div>
  );
}
