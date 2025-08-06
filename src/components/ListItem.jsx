import React from "react";

export const ListItem = ({
  title,
  subtitle,
  onEdit,
  onDelete,
  actions = [],
  isDeleting = false,
  style = {},
}) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete && !isDeleting) {
      onDelete();
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "6px",
        padding: "10px",
        marginBottom: "10px",
        boxSizing: "border-box",
        width: "50%",
        maxWidth: "900px",
       
        ...style,
      }}
    >
      <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>{title}</h3>
      <p style={{ margin: "0 0 12px 0", color: "#050404", fontSize: "17px" }}>
        {subtitle}
      </p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {onEdit && (
          <button
            onClick={handleEdit}
            disabled={isDeleting}
            style={{
              flex: "1 1 120px",
              padding: "10px",
              fontSize: "14px",
              cursor: isDeleting ? "not-allowed" : "pointer",
              borderRadius: "6px",
              border: "1px solid #3498db",
              backgroundColor: isDeleting ? "#95a5a6" : "#3498db",
              color: "#fff",
              opacity: isDeleting ? 0.7 : 1,
            }}
          >
            Editar
          </button>
        )}

        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              flex: "1 1 120px",
              padding: "10px",
              fontSize: "14px",
              cursor: isDeleting ? "not-allowed" : "pointer",
              borderRadius: "6px",
              border: "1px solid #e74c3c",
              backgroundColor: isDeleting ? "#95a5a6" : "#e74c3c",
              color: "#fff",
              opacity: isDeleting ? 0.7 : 1,
            }}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </button>
        )}

        {actions.map(
          ({ label, onClick, style = {}, disabled = false }, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled && onClick) onClick();
              }}
              disabled={disabled || isDeleting}
              style={{
                flex: "1 1 140px",
                padding: "10px",
                fontSize: "14px",
                borderRadius: "6px",
                backgroundColor:
                  disabled || isDeleting
                    ? "#d3d3d3"
                    : style.backgroundColor || "#555",
                border:
                  disabled || isDeleting
                    ? "1px solid #999"
                    : style.border || "1px solid #555",
                color: disabled || isDeleting ? "#777" : style.color || "#fff",
                cursor: disabled || isDeleting ? "not-allowed" : "pointer",
                opacity: disabled || isDeleting ? 0.6 : 1,
                transition: "0.3s ease all",
              }}
            >
              {label}
            </button>
          )
        )}
      </div>
    </div>
  );
};
