export const SearchInput = ({ value, onChange, ...props }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)} // ⬅️ Corrigido aqui!
      {...props}
      style={{
        margin: "20px",
        padding: "8px",
        width: "100%",
        maxWidth: "400px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        boxSizing: "border-box",
        ...props.style,
      }}
    />
  );
};
