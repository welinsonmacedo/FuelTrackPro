import React, { useState, useEffect } from "react";

export function ModalHistoricoPneu({ aberto, pneu, onFechar }) {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    if (!aberto || !pneu) return;

    async function fetchHistorico() {
      try {
        // TODO: substituir pelo fetch real do backend / Firestore
        // const dados = await buscarHistoricoDoPneu(pneu.id);
        // setHistorico(dados);

        // Mock para teste
        setHistorico([
          { data: "2025-01-01", acao: "Instalado no veículo ABC123", km: 10000 },
          { data: "2025-05-15", acao: "Removido para recapagem", km: 25000 },
          { data: "2025-06-10", acao: "Reinstalado no veículo XYZ789", km: 26000 },
        ]);
      } catch (err) {
        console.error(err);
      }
    }

    fetchHistorico();
  }, [aberto, pneu]);

  if (!aberto) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1002,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
      onClick={onFechar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 6,
          maxWidth: 500,
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onFechar}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "transparent",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
          }}
          aria-label="Fechar modal"
        >
          &times;
        </button>

        <h3>
          Histórico do Pneu {pneu?.marca} {pneu?.modelo}
        </h3>

        {historico.length === 0 ? (
          <p>Nenhum histórico encontrado.</p>
        ) : (
          <ul>
            {historico.map((item, idx) => (
              <li key={idx}>
                <strong>{item.data}</strong> - {item.acao} (Km: {item.km})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
