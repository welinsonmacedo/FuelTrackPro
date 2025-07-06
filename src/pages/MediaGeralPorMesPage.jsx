import React, { useState, useMemo } from "react";
import { useMedias } from "../hooks/useMedias";

// Função para formatar mês/ano em português, ex: "julho/2025"
function formatMesAno(date) {
  if (!(date instanceof Date)) return "";
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  return `${meses[date.getMonth()]}/${date.getFullYear()}`;
}

export default function MediaGeralPorMesPage() {
  const [filtroMotorista, setFiltroMotorista] = useState("");
  const { abastecimentos } = useMedias();

  // Filtra por motorista
  const abastecimentosFiltrados = useMemo(() => {
    return abastecimentos.filter((a) =>
      filtroMotorista
        ? a.motorista?.toLowerCase().includes(filtroMotorista.toLowerCase())
        : true
    );
  }, [abastecimentos, filtroMotorista]);

  // Calcula médias por mês e motorista, considerando pares consecutivos
  const mediasPorMesMotorista = useMemo(() => {
    const grupos = {};

    function getMesAno(date) {
      if (!date) return null;
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d)) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    abastecimentosFiltrados.forEach((a) => {
      const dataRaw = a.data || a.criadoEm;
      const dataObj = dataRaw?.toDate ? dataRaw.toDate() : new Date(dataRaw);
      const mesAno = getMesAno(dataObj);
      if (!mesAno) return;

      const motorista = a.motorista || "Não informado";
      const key = mesAno + "|" + motorista;

      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(a);
    });

    const resultado = [];

    Object.entries(grupos).forEach(([key, abastecimentosDoGrupo]) => {
      const ordenados = abastecimentosDoGrupo
        .filter(a => a.km && a.litros && a.km > 0 && a.litros > 0)
        .sort((a, b) => a.km - b.km);

      let kmTotal = 0;
      let litrosTotal = 0;

      for (let i = 1; i < ordenados.length; i++) {
        const anterior = ordenados[i - 1];
        const atual = ordenados[i];

        const kmRodado = atual.km - anterior.km;
        const litrosConsumidos = atual.litros;

        if (kmRodado > 0 && litrosConsumidos > 0) {
          kmTotal += kmRodado;
          litrosTotal += litrosConsumidos;
        }
      }

      const [mes, motorista] = key.split("|");
      const media = litrosTotal > 0 && kmTotal > 0 ? kmTotal / litrosTotal : 0;

      resultado.push({ mes, motorista, media });
    });

    // Ordena por mês decrescente e motorista crescente
    resultado.sort((a, b) => {
      if (a.mes < b.mes) return 1;
      if (a.mes > b.mes) return -1;
      if (a.motorista < b.motorista) return -1;
      if (a.motorista > b.motorista) return 1;
      return 0;
    });

    return resultado;
  }, [abastecimentosFiltrados]);

  // Média geral
  const mediaGeral = useMemo(() => {
    if (mediasPorMesMotorista.length === 0) return "-";
    const somaMedias = mediasPorMesMotorista.reduce((acc, m) => acc + m.media, 0);
    return (somaMedias / mediasPorMesMotorista.length).toFixed(2);
  }, [mediasPorMesMotorista]);

  // Função para imprimir relatório em PDF via nova aba
  function gerarPDF() {
    const novaJanela = window.open("", "_blank", "width=800,height=600");
    if (!novaJanela) return alert("Permita pop-ups para gerar o PDF.");

    const titulo = "Relatório de Média de Consumo por Mês e Motorista";
    const filtro = filtroMotorista ? filtroMotorista : "Todos";

    const estilo = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1, h2 { color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; position: sticky; top: 0; }
      </style>
    `;

    let tabelaHtml = `
      <table>
        <thead>
          <tr>
            <th>Mês/Ano</th>
            <th>Motorista</th>
            <th>Média (km/l)</th>
          </tr>
        </thead>
        <tbody>
          ${mediasPorMesMotorista
            .map(
              (item) => `
            <tr>
              <td>${formatMesAno(new Date(item.mes + "-01"))}</td>
              <td>${item.motorista}</td>
              <td>${item.media.toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const html = `
      <html>
        <head>
          <title>${titulo}</title>
          ${estilo}
        </head>
        <body>
          <h1>${titulo}</h1>
          <p><strong>Filtro Motorista:</strong> ${filtro}</p>
          <p><strong>Média Geral:</strong> ${mediaGeral} km/l</p>
          ${tabelaHtml}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    novaJanela.document.write(html);
    novaJanela.document.close();
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", color: "#2c3e50" }}>
      <h1>Média Geral de Consumo por Mês e Motorista</h1>

      <div style={{ marginTop: 10, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <input
          placeholder="Filtrar por motorista"
          value={filtroMotorista}
          onChange={(e) => setFiltroMotorista(e.target.value)}
          style={{
            padding: "8px 12px",
            width: 300,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        />
        <button
          onClick={gerarPDF}
          style={{
            padding: "10px 18px",
            backgroundColor: "#2c3e50",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
            boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1b2838")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#2c3e50")}
        >
          Imprimir PDF
        </button>
      </div>

      <div>
        <strong>Média Geral:</strong> {mediaGeral} km/l
      </div>

      <div
        style={{
          marginTop: 30,
          maxHeight: "400px",
          overflowY: "auto",
          overflowX: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        {mediasPorMesMotorista.length === 0 ? (
          <p style={{ padding: 20 }}>Nenhum dado encontrado para o filtro aplicado.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 600,
            }}
          >
            <thead style={{ position: "sticky", top: 0, backgroundColor: "#f9f9f9", zIndex: 1 }}>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: 12, textAlign: "left" }}>Mês</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 12, textAlign: "left" }}>Motorista</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 12, textAlign: "left" }}>Média (km/l)</th>
              </tr>
            </thead>
            <tbody>
              {mediasPorMesMotorista.map(({ mes, motorista, media }) => (
                <tr key={mes + motorista} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 12 }}>{formatMesAno(new Date(mes + "-01"))}</td>
                  <td style={{ padding: 12 }}>{motorista}</td>
                  <td style={{ padding: 12 }}>{media.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
