import { useState } from "react";

export default function InputPassword({ label, value, onChange, error, placeholder, ...props }) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  return (
    <div style={{ marginBottom: "1rem", width: "100%", maxWidth: "300px", position: "relative" }}>
      {label && <label style={{ display: "block", marginBottom: "0.3rem" }}>{label}</label>}
      <input
        type={mostrarSenha ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "0.6rem 2.5rem 0.6rem 0.8rem", // espaço para o ícone
          border: error ? "2px solid #dc2626" : "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "1rem",
          outline: "none",
          boxShadow: error ? "0 0 5px rgba(220, 38, 38, 0.5)" : "none",
          transition: "border-color 0.3s ease",
        }}
        {...props}
      />
      <span
        onClick={toggleMostrarSenha}
        style={{
          position: "absolute",
          right: "10px",
          top: "30%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          userSelect: "none",
          color: "#555",
          fontSize: "1.2rem",
          fontWeight: "bold",
          opacity: 0.7,
        }}
        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggleMostrarSenha();
        }}
      >
        {mostrarSenha ? "🙈" : "👁️"}
      </span>
    </div>
  );
}
