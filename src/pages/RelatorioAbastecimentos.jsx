 
import React, { useState } from "react";
import { useAbastecimentos } from "../hooks/useAbastecimentos";
import { SearchInput } from "../components/SearchInput";
import Card from "../components/Card";
import { InfoRow } from "../components/InfoRow";
import { formatData } from "../utils/data";

const RelatorioAbastecimentos = () => {
  const [buscaPlaca, setBuscaPlaca] = useState("");
  const [buscaMotorista, setBuscaMotorista] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const { abastecimentos = [], loading } = useAbastecimentos();

  const filtrados = abastecimentos.filter((a) => {
    const placaMatch =
      !buscaPlaca ||
      (typeof a.placa === "string" &&
        a.placa.toLowerCase().includes(buscaPlaca.toLowerCase()));

    const motoristaMatch =
      !buscaMotorista ||
      (typeof a.motorista === "string" &&
        a.motorista.toLowerCase().includes(buscaMotorista.toLowerCase()));

    // Convertendo data do abastecimento
    const dataAbastecimento = a.data?.seconds
      ? new Date(a.data.seconds * 1000)
      : new Date(a.data);

    // Início com horário zerado
    const dataInicioValida = dataInicio
      ? dataAbastecimento >= new Date(`${dataInicio}T00:00:00`)
      : true;

    // Fim com horário final do dia
    const dataFimValida = dataFim
      ? dataAbastecimento <= new Date(`${dataFim}T23:59:59`)
      : true;

    return placaMatch && motoristaMatch && dataInicioValida && dataFimValida;
  });
const handlePrint = (lista) => {
  const html = `
  <html>
    <head>
      <title>Relatório de Abastecimentos</title>
      <style>
        @media print {
          body {
            margin: 0;
          }

          .page {
            page-break-after: always;
            padding: 20mm;
            box-sizing: border-box;
          }

          .header {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 80px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 20px;
          }

          .card {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }

        body {
          font-family: Arial, sans-serif;
          margin: 0;
        }

        .header {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 10px;
        }

        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          margin-bottom: 20px;
          padding: 15px;
        }

        .container {
          display: flex;
          gap: 30px;
          align-items: center;
        }

        .row {
          margin-bottom: 15px;
        }

        .label {
          font-weight: bold;
          margin-right: 6px;
        }
      </style>
    </head>
    <body>
      ${(() => {
        const groups = [];
        for (let i = 0; i < lista.length; i += 3) {
          const group = lista.slice(i, i + 4);
          groups.push(`
            <div class="page">
              <div class="header"> <h2>⛽ Relatório de Abastecimentos</h2></div>
              ${group
                .map(
                  (a) => `
                  <div class="card">
                    <div class="container"> 
                      <div class="header">🚛 ${a.placa || "-"}</div>
                      <div class="row"><span class="label">Posto:</span> ${a.fornecedor || "-"}</div>
                    </div>
                    <div class="container"> 
                      <div class="row"><span class="label">Data:</span> ${formatData(a.data)}</div>
                      <div class="row"><span class="label">Motorista:</span> ${a.motorista || "-"}</div>
                    </div>
                    <div class="container"> 
                      <div class="row"><span class="label">Litros:</span> ${a.litros || "-"}</div>
                      <div class="row"><span class="label">Valor Litro:</span> R$ ${a.valorLitro?.toFixed(2) || "-"}</div>
                    </div>
                    <div class="container"> 
                      <div class="row"><span class="label">Valor Total:</span> R$ ${
                        a.litros && a.valorLitro ? (a.litros * a.valorLitro).toFixed(2) : "-"
                      }</div>
                      <div class="row"><span class="label">KM:</span> ${a.km || "-"}</div>
                    </div>
                  </div>
                `
                )
                .join("")}
            </div>
          `);
        }
        return groups.join("");
      })()}
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
  </html>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(html);
  printWindow.document.close();
};



  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2rem",
        height: "85vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Cabeçalho fixo */}
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          paddingBottom: "1rem",
          zIndex: 10,
          borderBottom: "1px solid #ccc",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, flexBasis: "100%" }}>
          ⛽ Relatório de Abastecimentos
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center", // se quiser alinhar verticalmente também
            gap: "1rem", // opcional para espaçamento entre itens
          }}
        >
          <SearchInput
            placeholder="Buscar por placa..."
            value={buscaPlaca}
            onChange={(e) => setBuscaPlaca(e.target.value)}
            style={{ flex: "0 0 200px" }}
          />

          <SearchInput
            placeholder="Buscar por motorista..."
            value={buscaMotorista}
            onChange={(e) => setBuscaMotorista(e.target.value)}
            style={{ flex: "0 0 200px" }}
          />

          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            style={{
              flex: "0 0 200px",
              padding: "8px",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
            title="Data início"
          />
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            style={{
              flex: "0 0 150px",
              padding: "8px",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
            title="Data fim"
          />
        </div>
        <button
          onClick={() => handlePrint(filtrados)}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: "#f0f0f0",
            cursor: "pointer",
          }}
        >
          🖨️ Imprimir
        </button>
      </div>

      {/* Lista com scroll */}
      <div style={{ overflowY: "auto", marginTop: "1rem", flexGrow: 1 }}>
        {loading ? (
          <p>Carregando abastecimentos...</p>
        ) : filtrados.length === 0 ? (
          <p>Nenhum abastecimento encontrado.</p>
        ) : (
          filtrados.map((a) => (
            <Card key={a.id} style={{ marginBottom: "1rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>🚛 {a.placa || "-"}</h3>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <InfoRow label="Motorista" value={a.motorista || "-"} />
                <InfoRow label="Data" value={formatData(a.data)} />
                <InfoRow label="Litros" value={a.litros || "-"} />
                <InfoRow label="Valor Litro" value={a.valorLitro || "-"} />
                <InfoRow
                  label="Valor Total"
                  value={
                    a.litros && a.valorLitro
                      ? `R$ ${(a.litros * a.valorLitro).toFixed(2)}`
                      : "-"
                  }
                />
                <InfoRow label="Posto" value={a.fornecedor || "-"} />
                <InfoRow label="KM" value={a.km || "-"} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RelatorioAbastecimentos;
