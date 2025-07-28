import React from "react";

export function ModalRemocaoPneu({
  aberto,
  pneu,
  placa,
  recapagens,
  acaoRemover,
  setAcaoRemover,
  recapSelecionada,
  setRecapSelecionada,
  kmDesinstalacao,      // <== ADICIONE AQUI
  setKmDesinstalacao,   // <== ADICIONE AQUI
  onFechar,
  onConfirmar,
}) {
  if (!aberto) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        transition: "opacity 0.3s ease",
      }}
      onClick={onFechar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: 10,
          padding: 25,
          width: 360,
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h3 style={{ marginBottom: 16 }}>
          Remover Pneu: {pneu?.posicao || ""}
        </h3>

        <p>
          Escolha a ação para o pneu <strong>{pneu?.posicao}</strong> do veículo{" "}
          <strong>{placa}</strong>:
        </p>

        <select
          value={acaoRemover}
          onChange={(e) => setAcaoRemover(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            fontSize: 16,
            borderRadius: 6,
            border: "1.5px solid #d1d5db",
            marginBottom: 20,
            outline: "none",
          }}
        >
          <option value="">Selecione a ação</option>
          <option value="estoque">Voltar para Estoque</option>
          <option value="recap">Enviar para Recapagem</option>
          <option value="descarte">Descarte</option>
        </select>

        {acaoRemover === "recap" && (
          <>
            <label
              htmlFor="recapSelecionada"
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Selecionar Recapagem:
            </label>
            <select
              id="recapSelecionada"
              value={recapSelecionada}
              onChange={(e) => setRecapSelecionada(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                fontSize: 16,
                borderRadius: 6,
                border: "1.5px solid #d1d5db",
                marginBottom: 20,
                outline: "none",
              }}
            >
              <option value="">Selecione</option>
              {recapagens.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </select>
          </>
        )}

        <label style={{ display: "block", marginTop: 12, fontWeight: "600" }}>
          KM da Remoção:
        </label>
        <input
          type="number"
          min="0"
          value={kmDesinstalacao}
          onChange={(e) => setKmDesinstalacao(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 4,
            border: "1px solid #ccc",
            fontSize: 16,
            marginTop: 4,
            marginBottom: 10,
          }}
          placeholder="Informe o KM da Remoção"
        />

        <div style={{ textAlign: "right" }}>
          <button
            onClick={onFechar}
            style={{
              marginRight: 12,
              backgroundColor: "#ccc",
              borderRadius: 6,
              padding: "8px 14px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            style={{
              backgroundColor: "#e74c3c",
              color: "white",
              borderRadius: 6,
              padding: "8px 14px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
