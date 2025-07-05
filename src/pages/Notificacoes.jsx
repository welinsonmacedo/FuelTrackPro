import React from "react";
import { useManutencoes } from "../hooks/useManutencoes";
import { useAbastecimentos } from "../hooks/useAbastecimentos";
import { useTiposManutencao } from "../hooks/useTiposManutencao";
import { formatData } from "../utils/data";
import { useNavigate } from "react-router-dom";

const Notificacoes = () => {
  const { manutencoes } = useManutencoes();
  const { abastecimentos } = useAbastecimentos();
  const { tipos } = useTiposManutencao();

  const hoje = new Date();
  const navigate = useNavigate();

  function getUltimoKm(placa) {
    const doVeiculo = abastecimentos
      .filter((a) => a.placa === placa)
      .sort(
        (a, b) =>
          Number(b.kmAbastecimento || b.km || 0) -
          Number(a.kmAbastecimento || a.km || 0)
      );
    return Number(doVeiculo[0]?.kmAbastecimento || doVeiculo[0]?.km || 0);
  }

  function buscarTipoManutencao(nomeTipo) {
    if (!tipos) return null;
    return tipos.find((t) => t.nome === nomeTipo) || null;
  }

  // Filtra as manutenções que estão em alerta
  const alertas = manutencoes.filter((m) => {
    if (m.realizada) return false;

    const ultimoKm = getUltimoKm(m.placa);
    const tipoCompleto = buscarTipoManutencao(m.tipoManutencao);

    if (!tipoCompleto) return false;

    const diasAntecedencia = tipoCompleto.avisoDiasAntes || 0;
    const kmAntecedencia = tipoCompleto.avisoKmAntes || 0;

    let alertaData = false;
    let alertaKm = false;

    if (m.proximaRevisaoData) {
      const dataRevisao = m.proximaRevisaoData.toDate();
      const diffDias = Math.ceil((dataRevisao - hoje) / (1000 * 60 * 60 * 24));
      alertaData = diffDias <= diasAntecedencia && diffDias >= 0;
    }

    if (m.proximaRevisaoKm) {
      const diffKm = m.proximaRevisaoKm - ultimoKm;
      alertaKm = diffKm <= kmAntecedencia && diffKm >= 0;
    }

    // Também inclui quando já passou do km e manutenção não foi feita (atraso)
    const atrasoKm = m.proximaRevisaoKm !== undefined && ultimoKm > m.proximaRevisaoKm;

    return alertaData || alertaKm || atrasoKm;
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>🔔 Notificações de Manutenção</h2>

      {alertas.length === 0 ? (
        <p style={{ color: "#555" }}>Nenhuma notificação no momento.</p>
      ) : (
        alertas.map((m) => {
          const tipoCompleto = buscarTipoManutencao(m.tipoManutencao);
          const kmAtual = getUltimoKm(m.placa);
          const diffDias = m.proximaRevisaoData
            ? Math.ceil(
                (m.proximaRevisaoData.toDate() - hoje) / (1000 * 60 * 60 * 24)
              )
            : null;
          const diffKm = m.proximaRevisaoKm
            ? m.proximaRevisaoKm - kmAtual
            : null;

          // Verifica se está atrasado (KM atual > KM revisão)
          const estaAtrasadoKm = m.proximaRevisaoKm !== undefined && kmAtual > m.proximaRevisaoKm;

          // Estilo baseado no atraso
          const estiloAlerta = {
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            cursor: "pointer",
            border: estaAtrasadoKm ? "1.5px solid #e74c3c" : "1px solid #f39c12",
            backgroundColor: estaAtrasadoKm ? "#fdecea" : "#fffaf3",
          };

          return (
            <div
              key={m.id}
              style={estiloAlerta}
              onClick={() => navigate(`/manutencoes`)}
              title="Clique para ver detalhes da manutenção"
            >
              <h3 style={{ marginBottom: "0.5rem", color: estaAtrasadoKm ? "#e74c3c" : "inherit" }}>
                🚗 {m.placa} - {tipoCompleto?.nome || "Tipo não informado"}
                {estaAtrasadoKm && " (ATRAZADO)"}
              </h3>
              <p>
                <b>Fornecedor:</b> {m.fornecedor || "-"} <br />
                <b>Observação:</b> {m.observacao || "-"}
              </p>

              {m.proximaRevisaoData && (
                <p>
                  <b>Próxima Revisão (Data):</b>{" "}
                  {formatData(m.proximaRevisaoData)} <br />
                  <b>Faltam:</b> {diffDias} dia(s) <br />
                  <b>Antecedência Padrão:</b>{" "}
                  {tipoCompleto?.avisoDiasAntes ?? "-"} dias
                </p>
              )}

              {m.proximaRevisaoKm && (
                <p>
                  <b>Próxima Revisão (KM):</b> {m.proximaRevisaoKm} <br />
                  <b>KM Atual:</b> {kmAtual} <br />
                  <b>Faltam:</b> {diffKm} km <br />
                  <b>Antecedência Padrão:</b>{" "}
                  {tipoCompleto?.avisoKmAntes ?? "-"} km
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
