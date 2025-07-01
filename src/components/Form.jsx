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
        ...props.style,
      }}
    >
      {children}
    </form>
  );
};
