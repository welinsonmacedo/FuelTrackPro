export default function Button({ children, disabled, onClick, type = "button" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        backgroundColor: disabled ? '#a5b4fc' : '#2563eb',
        color: 'white',
        border: 'none',
        padding: '0.6rem 1.2rem',
        fontSize: '1rem',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        maxWidth: '300px',
        transition: 'background-color 0.3s ease',
        margin:"0"
      }}
      onMouseEnter={e => {
        if (!disabled) e.currentTarget.style.backgroundColor = '#1e40af';
      }}
      onMouseLeave={e => {
        if (!disabled) e.currentTarget.style.backgroundColor = '#2563eb';
      }}
    >
      {children}
    </button>
  );
}
