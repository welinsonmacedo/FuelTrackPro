import React, { useState } from "react";
import { useMediasCalculadas } from "../hooks/useMediasCalculadas";
import { formatData } from "../utils/data";
import { exportarParaCSV } from "../utils/exportCsv";
import { SearchInput } from "../components/SearchInput";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

const inputStyle = {
  width: "auto",
  padding: "8px 10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box",
};

const labelStyle = {
  marginBottom: 2,
  fontWeight: "600",
  color: "#444",
  display: "block",
};

const gridStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "16px",
  marginBottom: "20px",
  alignItems: "center",
};

const containerStyle = {
  maxWidth: "100%",
  margin: "30px auto",
  padding: "20px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

export default function MediasCalculadasPage() {
  const [placa, setPlaca] = useState("");
  const [motorista, setMotorista] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const inicioDate = inicio ? new Date(inicio) : null;
  const fimDate = fim ? new Date(fim) : null;

  const { medias, loading } = useMediasCalculadas({
    placa,
    motorista,
    inicio: inicioDate,
    fim: fimDate,
  });

  const exportar = () => {
    exportarParaCSV(
      medias,
      ["data", "placa", "motorista", "kmInicial", "kmFinal", "litros", "media"],
      "medias_filtradas"
    );
  };

  const imprimirPDF = () => {
    const conteudo = `
      <html>
        <head>
          <title>Relatório de Médias Calculadas</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h1 {
              color: #1E90FF;
              border-bottom: 1px solid #0d1b29e1;
              padding-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f0f4f8;
            }
          </style>
        </head>
        <body>
          <h1>Relatório de Médias Calculadas</h1>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Placa</th>
                <th>Motorista</th>
                <th>KM Inicial</th>
                <th>KM Final</th>
                <th>Litros</th>
                <th>Média (km/l)</th>
              </tr>
            </thead>
            <tbody>
              ${medias
                .map(
                  (m) => `
                <tr>
                  <td>${formatData(m.data)}</td>
                  <td>${m.placa}</td>
                  <td>${m.motorista}</td>
                  <td>${m.kmInicial}</td>
                  <td>${m.kmFinal}</td>
                  <td>${m.litros}</td>
                  <td>${m.media}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const w = window.open("", "_blank");
    w.document.write(conteudo);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: 24, marginBottom: 20 }}>Médias Calculadas</h2>

      <div style={gridStyle}>
        <div>
          <label htmlFor="motorista" style={labelStyle}>
            Motorista
          </label>
          <Input
            id="motorista"
            placeholder="Motorista"
            value={motorista}
            onChange={(e) => setMotorista(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="placa" style={labelStyle}>
            Placa
          </label>
          <Input
            id="placa"
            placeholder="Placa"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="inicio" style={labelStyle}>
            Data Início
          </label>
          <input
            id="inicio"
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="fim" style={labelStyle}>
            Data Fim
          </label>
          <input
            id="fim"
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            style={inputStyle}
          />
        </div>

        <Button onClick={exportar}>Exportar CSV</Button>
        <Button onClick={imprimirPDF} style={{ marginLeft: "10px" }}>
          Exportar PDF
        </Button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : medias.length === 0 ? (
        <p>Nenhuma média encontrada.</p>
      ) : (
        medias.map((m) => (
          <Card key={m.id} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: "700", fontSize: 16, marginBottom: 4 }}>
              {m.motorista} — {m.placa}
            </div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
              Data: {formatData(m.data)}
            </div>
            <div>
              <strong>Média:</strong> {m.media} km/l &nbsp;|&nbsp;
              <strong> KM:</strong> {m.kmInicial} → {m.kmFinal} &nbsp;|&nbsp;
              <strong> Litros:</strong> {m.litros}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
