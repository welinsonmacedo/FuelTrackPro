import React from "react";

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  modalWrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 1001,
    backgroundColor: "#fff",
    overflowY: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 20px",
    boxSizing: "border-box",
  },
  modalContent: {
    width: "100%",
    maxWidth: "1000px",
    height:"auto",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
    position: "relative",
  },
 
  closeButton: {
    position: "absolute",
    top: "12px",
    right: "20px",
    background: "transparent",
    border: "none",
    fontSize: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#999",
  },
  closeButtonHover: {
    color: "#333",
  },
  title: {
    marginTop: 0,
    marginBottom: "20px",
    paddingRight: "40px",
  },
  formLayout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", // Máximo 3 colunas
    gap: "20px",
  },
  inputItem: {
    boxSizing: "border-box",
  },
};


export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const isForm =
    React.Children.count(children) === 1 &&
    (children.type === "form" || children.type?.name === "Form");

  const contentWrapped = isForm
    ? children
    : React.Children.map(children, (child) => (
        <div style={styles.inputItem}>{child}</div>
      ));

  return (
    <div style={styles.containerMain}>
      <div style={styles.overlay} onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        style={styles.modalWrapper}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalContent}>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            style={styles.closeButton}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = styles.closeButtonHover.color)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = styles.closeButton.color)
            }
          >
            ×
          </button>

          <h3 style={styles.title}>{title}</h3>

          <div style={styles.formLayout}>{contentWrapped}</div>
        </div>
      </div>
    </div>
  );
};
