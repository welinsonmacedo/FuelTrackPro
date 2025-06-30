import React, { forwardRef } from "react";

const ManutencaoImpressao = forwardRef(({ manutencao }, ref) => {
  return (
    <div ref={ref} style={{ padding: "20px", backgroundColor: "white" }}>
      <h2>Ficha de Manutenção - {manutencao.placa}</h2>
      <p>Tipo: {manutencao.tipoManutencao}</p>
      <p>Fornecedor: {manutencao.fornecedor}</p>
      <p>KM: {manutencao.km}</p>
      <p>Observação: {manutencao.observacao}</p>
      {/* Coloque os demais campos que precisar */}
    </div>
  );
});

export default ManutencaoImpressao;
