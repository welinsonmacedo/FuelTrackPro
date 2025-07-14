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
      if (placa && !d.placa.toUpperCase().includes(placa.toUpperCase()))
        return false;

      let data = d.data;
      if (data?.seconds) data = new Date(data.seconds * 1000);
      else if (typeof data === "string") data = new Date(data);

      if (dataInicio && new Date(data) < new Date(dataInicio)) return false;
      if (dataFim && new Date(data) > new Date(dataFim)) return false;

      return true;
    });
  }, [despesas, tipo, placa, dataInicio, dataFim]);

  const total = useMemo(() => {
    return despesasFiltradas.reduce((acc, d) => {
      const valor = d.valor ?? d.total ?? 0;
      return acc + valor;
    }, 0);
  }, [despesasFiltradas]);
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    // Monta o conteúdo HTML com o estilo básico
    const html = `
    <html>
      <head>
        <title>Imprimir Despesas</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
          td.valor { text-align: right; }
          h2 { text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h2>Despesas Filtradas</h2>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Placa</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            ${despesasFiltradas
              .map((d) => {
                const valor = d.valor ?? d.total ?? 0;
                const descricao =
                  d.descricao ||
                  (Array.isArray(d.itens) && d.itens.length > 0
                    ? d.itens.map((i) => i.descricao).join(", ")
                    : "-");
                const placas =
                  d.placa ||
                  (Array.isArray(d.itens) && d.itens.length > 0
                    ? d.itens.map((i) => i.placa).join(", ")
                    : "-");
                const tipo =
                  d.tipo ||
                  (Array.isArray(d.itens) && d.itens.length > 0
                    ? d.itens.map((i) => i.tipo).join(", ")
                    : "-");
                const dataFormatada = formatData(d.data);

                return `
                  <tr>
                    <td>${tipo}</td>
                    <td>${placas}</td>
                    <td>${dataFormatada}</td>
                    <td class="valor">${formatCurrency(valor)}</td>
                    <td>${descricao}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Espera o conteúdo carregar para disparar a impressão
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // printWindow.close(); // Opcional: fecha após imprimir
    };
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 20, textAlign: "center" }}>
        💰 Controle Financeiro da Frota
      </h2>

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
          style={{
            padding: 8,
            borderRadius: 5,
            border: "1px solid #ccc",
            minWidth: 140,
          }}
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
          style={{
            padding: 8,
            borderRadius: 5,
            border: "1px solid #ccc",
            minWidth: 140,
          }}
        />

        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 5,
            border: "1px solid #ccc",
            minWidth: 140,
          }}
          aria-label="Data Início"
        />
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 5,
            border: "1px solid #ccc",
            minWidth: 140,
          }}
          aria-label="Data Fim"
        />
       
          <button
            onClick={handlePrint}
            style={{
              padding: "8px 16px",
              fontSize: 14,
              borderRadius: 5,
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            🖨️
          </button>
       
      </div>

      {/* Total */}
      <Card
        title="Total Filtrado"
        style={{ maxWidth: 300, margin: "0 auto 30px" }}
      >
        <p style={{ fontSize: 22, fontWeight: "bold", margin: 0 }}>
          {formatCurrency(total)}
        </p>
      </Card>

      {/* Lista de despesas */}
      <h3 style={{ marginBottom: 10, textAlign: "center" }}>📋 Despesas</h3>
      {loading ? (
        <p style={{ textAlign: "center" }}>Carregando despesas...</p>
      ) : despesasFiltradas.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>
          Nenhuma despesa encontrada.
        </p>
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
              <th
                style={{
                  padding: 10,
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Tipo
              </th>
              <th
                style={{
                  padding: 10,
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Placa
              </th>
              <th
                style={{
                  padding: 10,
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Data
              </th>
              <th
                style={{
                  padding: 10,
                  border: "1px solid #ddd",
                  textAlign: "right",
                }}
              >
                Valor
              </th>
              <th
                style={{
                  padding: 10,
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Descrição
              </th>
            </tr>
          </thead>
          <tbody>
            {despesasFiltradas.map((d) => {
              const valor = d.valor ?? d.total ?? 0;
              const descricao =
                d.descricao ||
                (Array.isArray(d.itens) && d.itens.length > 0
                  ? d.itens.map((i) => i.descricao).join(", ")
                  : "-");
              const placas =
                d.placa ||
                (Array.isArray(d.itens) && d.itens.length > 0
                  ? d.itens.map((i) => i.placa).join(", ")
                  : "-");
              const placa =  d.itens?.[0]?.placa?.trim() || "—";
              const tipo =
                d.tipo ||
                (Array.isArray(d.itens) && d.itens.length > 0
                  ? d.itens.map((i) => i.tipo).join(", ")
                  : "-");

              return (
                <tr key={d.id}>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                    {tipo}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                    {placas ||placa}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                    {formatData(d.data)}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      borderBottom: "1px solid #eee",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(valor)}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                    {descricao}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FinanceiroPage;
