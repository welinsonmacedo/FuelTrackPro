export const FormField = ({
  label,
  name,
  error,
  type = "text",
  as = "input",
  children,
  options,
  listId,
  register,
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

  const registered = register ? register(name) : {};

  return (
    <div style={{ minWidth: "300px", marginBottom: "15px" }}>
      {label && (
        <label
          htmlFor={name}
          style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}
        >
          {label}
        </label>
      )}

      {as === "select" ? (
        <select
          id={name}
          {...registered}
          {...rest}
          style={commonStyle}
          list={listId}
        >
          {children ||
            options?.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
        </select>
      ) : as === "textarea" ? (
        <textarea
          id={name}
          {...registered}
          {...rest}
          style={{ ...commonStyle, height: "auto", minHeight: "80px" }}
          list={listId}
        />
      ) : (
        <input
          id={name}
          type={type}
          {...registered}
          {...rest}
          style={commonStyle}
          list={listId}
        />
      )}

      {error && (
        <span style={{ color: "red", fontSize: "12px" }}>{error.message}</span>
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
