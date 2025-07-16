import React, { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { useAbastecimentos } from "../hooks/useAbastecimentos";

const VariaPrecoPage = () => {
  const { abastecimentos = [], loading } = useAbastecimentos();
  const [combustivel, setCombustivel] = useState("Diesel S10");

  const chartData = useMemo(() => {
    const dadosFiltrados = abastecimentos.filter(
      (a) => a.tipoCombustivel === combustivel && a.data
    );

    const agrupados = {};
    dadosFiltrados.forEach((a) => {
      const dataFormatada = a.data.toDate().toISOString().split("T")[0]; // yyyy-mm-dd
      const chave = `${a.fornecedor}_${dataFormatada}`;
      if (!agrupados[chave]) {
        agrupados[chave] = {
          fornecedor: a.fornecedor,
          data: dataFormatada,
          soma: 0,
          qtd: 0,
        };
      }
      agrupados[chave].soma += a.valorLitro;
      agrupados[chave].qtd++;
    });

    const seriesPorFornecedor = {};
    Object.values(agrupados).forEach(({ fornecedor, data, soma, qtd }) => {
      if (!seriesPorFornecedor[fornecedor]) {
        seriesPorFornecedor[fornecedor] = [];
      }
      seriesPorFornecedor[fornecedor].push({
        x: data,
        y: parseFloat((soma / qtd).toFixed(2)),
      });
    });

    return {
      datasets: Object.entries(seriesPorFornecedor).map(
        ([fornecedor, dados]) => ({
          label: fornecedor,
          data: dados.sort((a, b) => new Date(a.x) - new Date(b.x)),
          fill: false,
          borderColor: "#" + Math.floor(Math.random() * 16777215).toString(16),
          tension: 0.1,
        })
      ),
    };
  }, [abastecimentos, combustivel]);

  return (
    <div style={{ padding: 20 }}>
      <h2>📈 Variação de Preço por Combustivel</h2>

     <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
  Tipo de Combustível:
</label>
<select
  value={combustivel}
  onChange={(e) => setCombustivel(e.target.value)}
  style={{
    padding: "10px 14px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    outline: "none",
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#333",
    cursor: "pointer",
    maxWidth: "300px",
  }}
>
  <option>Diesel S10</option>
  <option>Gasolina</option>
  <option>Etanol</option>
</select>


      <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
        {loading ? <p>Carregando...</p> : <Line data={chartData} />}
      </div>
    </div>
  );
};

export default VariaPrecoPage;
