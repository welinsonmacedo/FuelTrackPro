import React from "react";

export function PneuBox({
  pos,
  pneu,
  abrirModalRemover,
  kmRodado,
}) {
  return (
    <div
      key={pos}
      style={{
        backgroundColor: "#3e4142",
        color: "#fff",
        width: 100,
        height: 150,
        borderRadius: 10,
        padding: 10,
        fontSize: 12,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 5 }}>{pos}</div>

      {pneu ? (
        <>
          <div
            style={{
              backgroundColor: "#fff",
              color: "#000",
              borderRadius: 6,
              padding: 6,
              width: "100%",
            }}
          >
            <div>
              <strong>Marca:</strong> {pneu.marca || "-"}
            </div>
            <div>
              <strong>Med:</strong> {pneu.medida || "-"}
            </div>
            <div>
               {kmRodado != null && (
              <p>
               <strong>  KM:</strong>{kmRodado.toLocaleString()} km
              </p>
            )}
            </div>
          
           
          </div>
          <button
            onClick={() => abrirModalRemover(pneu)}
            style={{
              marginTop: 6,
              backgroundColor: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Remover
          </button>
        </>
      ) : (
        <div style={{ fontStyle: "italic", color: "#ccc" }}>[Sem pneu]</div>
      )}
    </div>
  );
}
