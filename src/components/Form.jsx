// components/Form.jsx
export const Form = ({ children, ...props }) => {
  return (
    <form
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "flex-start",
        justifyContent: "space-between",
        ...(props.style || {}), // ← garante que não dê erro se for undefined
      }}
    >
      {children}
    </form>
  );
};
