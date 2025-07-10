import React, { useState } from "react";
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
  const [expandido, setExpandido] = useState([]);
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

  const toggleExpandido = (id) => {
    setExpandido((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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

    const atrasoKm =
      m.proximaRevisaoKm !== undefined && ultimoKm > m.proximaRevisaoKm;

    return alertaData || alertaKm || atrasoKm;
  });

  return (
    <div style={{ maxWidth: "auto", margin: "0 auto" }}>
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

          const estaAtrasadoKm =
            m.proximaRevisaoKm !== undefined && kmAtual > m.proximaRevisaoKm;

          const estiloAlerta = {
            borderRadius: "8px",
            padding: "0.5rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            cursor: "pointer",
            border: estaAtrasadoKm
              ? "1.5px solid #e74c3c"
              : "1px solid #f39c12",
            backgroundColor: estaAtrasadoKm ? "#fdecea" : "#fffaf3",
          };

          const isExpanded = expandido.includes(m.id);

          return (
            <div
              key={m.id}
              style={estiloAlerta}
              onClick={() => toggleExpandido(m.id)}
              title="Clique para expandir ou recolher"
            >
              <h3
                style={{
                  marginBottom: "0.5rem",
                  color: estaAtrasadoKm ? "#e74c3c" : "inherit",
                }}
              >
                🚗 {m.placa} - {tipoCompleto?.nome || "Tipo não informado"}
                {estaAtrasadoKm && " (ATRAZADO)"}
              </h3>

              {isExpanded && (
                <div>
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

                  <button
                    style={{
                      marginTop: "0.5rem",
                      background: "#3498db",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor:"pointer"
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/manutencoes");
                    }}
                  >
                    Ver todas as manutenções
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Notificacoes;
