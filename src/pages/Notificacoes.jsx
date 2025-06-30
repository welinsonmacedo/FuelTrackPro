import React from "react";
import { useManutencoes } from "../hooks/useManutencoes";
import { useAbastecimentos } from "../hooks/useAbastecimentos";
import { formatData } from "../utils/data";

const Notificacoes = () => {
  const { manutencoes } = useManutencoes();
  const { abastecimentos } = useAbastecimentos();

  const hoje = new Date();

  // Pega o último KM de um veículo com base nos abastecimentos
  function getUltimoKm(placa) {
    const doVeiculo = abastecimentos
      .filter((a) => a.placa === placa)
      .sort((a, b) => b.kmAbastecimento - a.kmAbastecimento);
    return doVeiculo[0]?.kmAbastecimento || 0;
  }

  // Filtro para gerar alertas com base nos critérios de cada tipo de manutenção
  const alertas = manutencoes.filter((m) => {
    if (m.realizada) return false;

    const ultimoKm = getUltimoKm(m.placa);
    const tipo = m.tipoManutencao;

    if (!tipo) return false;

    const diasAntecedencia = tipo.diasAntecedencia || 0;
    const kmAntecedencia = tipo.kmAntecedencia || 0;

    let alertaData = false;
    let alertaKm = false;

    if (m.proximaRevisaoData) {
      const dataRevisao = new Date(m.proximaRevisaoData);
      const diffDias = Math.ceil((dataRevisao - hoje) / (1000 * 60 * 60 * 24));
      alertaData = diffDias <= diasAntecedencia && diffDias >= 0;
    }

    if (m.proximaRevisaoKm) {
      const diffKm = m.proximaRevisaoKm - ultimoKm;
      alertaKm = diffKm <= kmAntecedencia && diffKm >= 0;
    }

    return alertaData || alertaKm;
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>🔔 Notificações de Manutenção</h2>

      {alertas.length === 0 ? (
        <p style={{ color: "#555" }}>Nenhuma notificação no momento.</p>
      ) : (
        alertas.map((m) => {
          const tipo = m.tipoManutencao;
          const kmAtual = getUltimoKm(m.placa);
          const diffDias = m.proximaRevisaoData
            ? Math.ceil((new Date(m.proximaRevisaoData) - hoje) / (1000 * 60 * 60 * 24))
            : null;
          const diffKm = m.proximaRevisaoKm
            ? m.proximaRevisaoKm - kmAtual
            : null;

          return (
            <div
              key={m.id}
              style={{
                border: "1px solid #f39c12",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#fffaf3",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>
                🚗 {m.placa} - {tipo?.nome || "Tipo não informado"}
              </h3>
              <p>
                <b>Fornecedor:</b> {m.fornecedor} <br />
                <b>Observação:</b> {m.observacao || "-"}
              </p>

              {m.proximaRevisaoData && (
                <p>
                  <b>Próxima Revisão (Data):</b> {formatData(m.proximaRevisaoData)} <br />
                  <b>Faltam:</b> {diffDias} dia(s) <br />
                  <b>Antecedência Padrão:</b> {tipo?.diasAntecedencia || "-"} dias
                </p>
              )}

              {m.proximaRevisaoKm && (
                <p>
                  <b>Próxima Revisão (KM):</b> {m.proximaRevisaoKm} <br />
                  <b>KM Atual:</b> {kmAtual} <br />
                  <b>Faltam:</b> {diffKm} km <br />
                  <b>Antecedência Padrão:</b> {tipo?.kmAntecedencia || "-"} km
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Notificacoes;
