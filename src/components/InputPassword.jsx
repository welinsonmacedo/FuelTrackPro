import React, { useState } from "react";

export default function InputPassword({ label, error, id = "password", ...props }) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Estilos
  const containerStyle = {
    position: "relative",
    width: "100%",
    marginBottom: error ? 28 : 16, // espaço extra para erro
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 40px 10px 12px", // espaço para o botão à direita
    borderRadius: 6,
    border: error ? "2px solid #e74c3c" : "1px solid #ccc",
    fontSize: 16,
    outline: "none",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
  };

  const toggleButtonStyle = {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    color: "#666",
    padding: 4,
    userSelect: "none",
  };

  const errorStyle = {
    color: "#e74c3c",
    fontSize: 14,
    marginTop: 4,
    display: "block",
    position: "absolute",
    bottom: -20,
    left: 0,
  };

  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontWeight: "bold",
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={mostrarSenha ? "text" : "password"}
        {...props}
        style={inputStyle}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <button
        type="button"
        onClick={() => setMostrarSenha(!mostrarSenha)}
        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
        style={toggleButtonStyle}
      >
        {mostrarSenha ? "🙈" : "👁️"}
      </button>
      {error && (
        <span id={`${id}-error`} role="alert" style={errorStyle}>
          {typeof error === "string" ? error : "Campo inválido"}
        </span>
      )}
    </div>
  );
}
