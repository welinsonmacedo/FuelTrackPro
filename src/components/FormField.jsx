import React from "react";

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
  inputStyle,
  ...rest
}) => {
  const commonStyle = {
    padding: "8px",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "4px",
    border: "1px solid #011468",
    fontSize: "14px",
    height: "38px",
  };

  // Combina o estilo padrão com o estilo passado via props
  const combinedStyle = { ...commonStyle, ...inputStyle };

  const registered = register ? register(name) : {};

  // Remove duplicatas de options com base no valor
  const uniqueOptions = options
    ? options.filter(
        (opt, index, self) =>
          index === self.findIndex((o) => o.value === opt.value)
      )
    : [];

  return (
    <div style={{ marginBottom: "15px", width: "300px" }}>
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
          style={combinedStyle}
          list={listId}
        >
          {children ||
            uniqueOptions.map((opt, i) => (
              <option key={`${name}-${opt.value}-${i}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
      ) : as === "textarea" ? (
        <textarea
          id={name}
          {...registered}
          {...rest}
          style={{ ...combinedStyle, height: "auto", minHeight: "80px" }}
          list={listId}
        />
      ) : (
        <input
          id={name}
          type={type}
          {...registered}
          {...rest}
          style={combinedStyle}
          list={listId}
        />
      )}

      {error && (
        <span style={{ color: "red", fontSize: "12px" }}>{error.message}</span>
      )}

      {uniqueOptions.length > 0 && listId && (
        <datalist id={listId}>
          {uniqueOptions.map((opt, i) => (
            <option
              key={`${name}-datalist-${opt.value}-${i}`}
              value={opt.value}
            />
          ))}
        </datalist>
      )}
    </div>
  );
};
