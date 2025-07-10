import React, { useState, useMemo } from "react";
import { useFinanceiro } from "../hooks/useFinanceiro";
import Card from "../components/Card";
import { formatCurrency, formatData } from "../utils/data";

const tipos = ["Combustível", "Manutenção", "Pedágio", "Diária", "Outros"];

const FinanceiroPage = () => {
  const { despesas = [], loading } = useFinanceiro();
  const [tipo, setTipo] = useState("");
  const [placa, setPlaca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const despesasFiltradas = useMemo(() => {
    return despesas.filter((d) => {
      if (tipo && d.tipo !== tipo) return false;
      if (placa && !d.placa.toUpperCase().includes(placa.toUpperCase())) return false;

      let data = d.data;
      if (data?.seconds) data = new Date(data.seconds * 1000);
      else if (typeof data === "string") data = new Date(data);

      if (dataInicio && new Date(data) < new Date(dataInicio)) return false;
      if (dataFim && new Date(data) > new Date(dataFim)) return false;

      return true;
    });
  }, [despesas, tipo, placa, dataInicio, dataFim]);

  const total = useMemo(
    () => despesasFiltradas.reduce((acc, d) => acc + (d.valor || 0), 0),
    [despesasFiltradas]
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: 20, textAlign: "center" }}>💰 Controle Financeiro da Frota</h2>

      {/* Filtros */}
      <div
        style={{
          display: "flex",
          gap: 15,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 25,
          fontSize: 14,
        }}
      >
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: "1px solid #ccc", minWidth: 140 }}
        >
          <option value="">Todos os Tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filtrar por placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
          style={{ padding: 8, borderRadius: 5, border: "1px solid #ccc", minWidth: 140 }}
        />

        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: "1px solid #ccc", minWidth: 140 }}
          aria-label="Data Início"
        />
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: "1px solid #ccc", minWidth: 140 }}
          aria-label="Data Fim"
        />
      </div>

      {/* Total */}
      <Card title="Total Filtrado" style={{ maxWidth: 300, margin: "0 auto 30px" }}>
        <p style={{ fontSize: 22, fontWeight: "bold", margin: 0 }}>{formatCurrency(total)}</p>
      </Card>

      {/* Lista de despesas */}
      <h3 style={{ marginBottom: 10, textAlign: "center" }}>📋 Despesas</h3>
      {loading ? (
        <p style={{ textAlign: "center" }}>Carregando despesas...</p>
      ) : despesasFiltradas.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>Nenhuma despesa encontrada.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
            boxShadow: "0 0 5px rgba(0,0,0,0.1)",
          }}
        >
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>Tipo</th>
              <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>Placa</th>
              <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>Data</th>
              <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "right" }}>Valor</th>
              <th style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {despesasFiltradas.map((d) => (
              <tr key={d.id}>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{d.tipo}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{d.placa}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{formatData(d.data)}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee", textAlign: "right" }}>
                  {formatCurrency(d.valor)}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{d.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FinanceiroPage;
