export const FormField = ({
  label,
  name,
  register,
  error,
  type = "text",
  as = "input",
  children,
  ...rest
}) => {
  const commonStyle = {
    padding: "8px",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    height: "38px",
    marginBottom:'15px'
  };

  return (
    <div style={{ minWidth: "300px" }}>
      {label && (
        <label
          htmlFor={name}
          style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}
        >
          {label}
        </label>
      )}
      {as === "select" ? (
        <select id={name} {...register(name)} {...rest} style={commonStyle}>
          {children}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          {...register(name)}
          {...rest}
          style={commonStyle}
        />
      )}
      {error && (
        <span style={{ color: "red", fontSize: "12px" }}>{error.message}</span>
      )}
    </div>
  );
};
