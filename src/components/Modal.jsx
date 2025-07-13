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
  containerMain: {
    with:"100%"
  },
  modalWrapper: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1001,
    width: "80%", // largura responsiva no geral
    maxWidth: "100%", // limite máximo de largura
    minWidth: "320px", // limite mínimo para não ficar muito pequeno
    maxHeight: "95vh",
    minHeight: "450px", // um pouco maior pra não ficar pequeno demais
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: "8px",
    gap:"20px"
  
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "30px 20px 20px 20px",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
    height: "auto", // para crescer conforme conteúdo
    maxHeight: "100vh", // limitar para caber na tela
    overflowY: "auto", // scroll interno se ultrapassar maxHeight
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
    display: "grid", // usa grid ao invés de flex
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px 20px", // espaçamento entre linhas e colunas
  },
  inputItem: {
    flex: "1 1 45%",
    minWidth: "200px",
    boxSizing: "border-box",
  },
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // Reorganiza os children dentro de divs lado a lado automaticamente
  const contentWrapped = React.Children.map(children, (child) => (
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
