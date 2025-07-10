import React, { useState, useMemo } from "react";
import { useRelatoriosFinanceiros } from "../hooks/useRelatoriosFinanceiros";
import Card from "../components/Card";
import { formatCurrency } from "../utils/data";

import { gerarRelatorioFinanceiro } from "../services/relatorioFinanceiro";

export default function RelatoriosFinanceirosPage() {
  const { relatorios = [], loading, refetch } = useRelatoriosFinanceiros();
  const [mesFiltro, setMesFiltro] = useState("");
  const [gerando, setGerando] = useState(false);

  const relatoriosFiltrados = useMemo(() => {
    if (!mesFiltro) return relatorios;
    return relatorios.filter((r) => r.mesReferencia === mesFiltro);
  }, [relatorios, mesFiltro]);

  const handleGerarRelatorio = async () => {
    setGerando(true);
    try {
      await gerarRelatorioFinanceiro(); // Gera ou atualiza os relatórios no backend/db
      if (refetch) await refetch(); // Atualiza os dados do hook (se existir)
    } catch (error) {
      alert("Erro ao gerar relatório: " + error.message);
    } finally {
      setGerando(false);
    }
  };

  if (loading) return <p>Carregando relatórios...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📑 Relatórios Financeiros Mensais</h2>

      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: "1rem" }}>
        <label style={{ fontWeight: "bold" }}>
          Filtrar mês:
          <input
            type="month"
            value={mesFiltro}
            onChange={(e) => setMesFiltro(e.target.value)}
            style={{
              marginLeft: 10,
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 14,
            }}
          />
        </label>
        {mesFiltro && (
          <button
            onClick={() => setMesFiltro("")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#e74c3c",
              color: "white",
              cursor: "pointer",
            }}
            title="Limpar filtro"
          >
            Limpar
          </button>
        )}
        <button
          onClick={handleGerarRelatorio}
          disabled={gerando}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            border: "none",
            backgroundColor: gerando ? "#999" : "#2ecc71",
            color: "white",
            cursor: gerando ? "not-allowed" : "pointer",
            marginLeft: "auto",
          }}
          title="Gerar relatório financeiro"
        >
          {gerando ? "Gerando..." : "Gerar Relatório"}
        </button>
      </div>

      {relatoriosFiltrados.length === 0 ? (
        <p>Nenhum relatório encontrado para este período.</p>
      ) : (
        relatoriosFiltrados.map((relatorio) => (
          <Card key={relatorio.id} title={`📆 ${relatorio.mesReferencia}`}>
            <p>
              <strong>Total Geral:</strong> {formatCurrency(relatorio.totalGasto)}
            </p>
            <p>
              <strong>Manutenção:</strong> {formatCurrency(relatorio.totalManutencao)}
            </p>
            <p>
              <strong>Pedágios:</strong> {formatCurrency(relatorio.totalPedagio)}
            </p>
            <p>
              <strong>Diárias:</strong> {formatCurrency(relatorio.totalDiarias)}
            </p>
            <p>
              <strong>Outras Despesas:</strong> {formatCurrency(relatorio.totalOutrasDespesas)}
            </p>
            <details style={{ marginTop: 10 }}>
              <summary>Detalhar por veículo</summary>
              <ul>
                {relatorio.veiculos.map((v) => (
                  <li key={v.placa}>
                    🚛 {v.placa} — Total: {formatCurrency(v.total)}
                  </li>
                ))}
              </ul>
            </details>
          </Card>
        ))
      )}
    </div>
  );
}
