export const FormField = ({
  label,
  name,
  error,
  type = "text",
  as = "input",
  children,
  options,
  listId,
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
        <select id={name} {...rest} style={commonStyle} list={listId}>
          {children || options?.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea
          id={name}
          {...rest}
          style={{ ...commonStyle, height: "auto", minHeight: "80px" }}
          list={listId}
        />
      ) : (
        <input
          id={name}
          type={type}
          {...rest}
          style={commonStyle}
          list={listId}
        />
      )}
      {error && (
        <span style={{ color: "red", fontSize: "12px" }}>{error}</span>
      )}
      {options && listId && (
        <datalist id={listId}>
          {options.map((opt, i) => (
            <option key={i} value={opt} />
          ))}
        </datalist>
      )}
    </div>
  );
};
