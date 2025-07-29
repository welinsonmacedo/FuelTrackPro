import React from "react";

export function ModalRemocaoPneu({
  aberto,
  pneu,
  placa,
  recapagens = [],
  acaoRemover,
  setAcaoRemover,
  recapSelecionada,
  setRecapSelecionada,
  kmDesinstalacao,
  setKmDesinstalacao,
  onFechar,
  onConfirmar,
}) {
  if (!aberto) return null;

  const acoesOptions = [
    "",
    "Removido do veículo",
    "Troca por desgaste",
    "Enviado para recapagem",
    "Reparo",
    "Outro",
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1001,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
      onClick={onFechar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 6,
          maxWidth: 400,
          width: "100%",
        }}
      >
        <h3>Remover Pneu {pneu ? pneu.posicao : ""}</h3>
        <p>
          Pneu: {pneu ? `${pneu.marca} ${pneu.modelo}` : "Nenhum pneu selecionado"}
        </p>
        <p>Placa do veículo: {placa}</p>

        <label>
          Ação:
          <select
            value={acaoRemover || ""}
            onChange={(e) => setAcaoRemover(e.target.value)}
            style={{ width: "100%", marginBottom: 10, padding: 6 }}
          >
            {acoesOptions.map((acao, idx) => (
              <option key={idx} value={acao}>
                {acao === "" ? "-- Selecione --" : acao}
              </option>
            ))}
          </select>
        </label>

        <label>
          Recapagem:
          <select
            value={recapSelecionada || ""}
            onChange={(e) => setRecapSelecionada(e.target.value)}
            style={{ width: "100%", marginBottom: 10, padding: 6 }}
          >
            <option value="">-- Selecione --</option>
            {recapagens.map((r) => (
              <option key={r.id} value={r.nome}>
                {r.nome}
              </option>
            ))}
          </select>
        </label>

        <label>
          Km da desinstalação:
          <input
            type="number"
            min="0"
            value={kmDesinstalacao || ""}
            onChange={(e) => setKmDesinstalacao(e.target.value)}
            placeholder="Km desinstalação"
            style={{ width: "100%", marginBottom: 10, padding: 6 }}
          />
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onFechar}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ccc",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            style={{
              padding: "8px 16px",
              backgroundColor: "#d9534f",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
            disabled={!acaoRemover} // só habilita confirmar se ação for escolhida
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
