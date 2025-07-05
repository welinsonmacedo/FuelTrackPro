import React, { useState } from "react";

export default function ChecklistModal({ viagem, onClose }) {
  // Exemplo simples de checklist com itens padrão
  const [checklist, setChecklist] = useState({
    pneus: false,
    nivelOleo: false,
    freios: false,
    luzes: false,
  });

  // Atualiza item do checklist
  function toggleItem(item) {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  // Salvar checklist - aqui você pode integrar com o Firebase ou backend
  function salvarChecklist() {
    console.log("Checklist salvo:", checklist, "para viagem:", viagem);
    alert("Checklist salvo!");
    onClose();
  }

  if (!viagem) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Checklist da Viagem: {viagem.destino || viagem.id}</h2>

        <form>
          {Object.entries(checklist).map(([key, value]) => (
            <label key={key} style={styles.label}>
              <input
                type="checkbox"
                checked={value}
                onChange={() => toggleItem(key)}
              />
              {key}
            </label>
          ))}
        </form>

        <div style={styles.buttons}>
          <button onClick={salvarChecklist} style={styles.button}>
            Salvar
          </button>
          <button onClick={onClose} style={styles.buttonCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    minWidth: "300px",
    maxWidth: "90vw",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    textTransform: "capitalize",
  },
  buttons: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#2c3e50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  buttonCancel: {
    padding: "8px 16px",
    backgroundColor: "#aaa",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
