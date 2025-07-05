import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div style={{
        backgroundColor: "#fff",
        padding: 30,
        borderRadius: 10,
        maxWidth: 500,
        width: "auto",
        height:"300px",
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        position: "relative"
      }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <div>{children}</div>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: -0,
            background: "transparent",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
            
          }}
          aria-label="Fechar modal"
        >
          ✖
        </button>
      </div>
    </div>
  );
}
