import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { OsModal } from "../components/OsModal";

export function NotasPage() {
  const [osList, setOsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedOS, setSelectedOS] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);

  // Buscar OS com status aberto ou concluída
  const fetchOs = async () => {
    setLoading(true);
    setError(null);
    try {
      const ref = collection(db, "checklists");
      const q = query(ref, where("statusOS", "in", ["aberta", "concluida"]));
      const snap = await getDocs(q);
      const lista = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((os) => !os.notaCriada || os.statusOS === "concluida");
      setOsList(lista);
    } catch (e) {
      console.error("Erro ao buscar OS:", e);
      setError("Erro ao carregar Ordens de Serviço.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOs();
  }, []);

  const abrirModalNota = (os) => {
    setSelectedOS(os);
    setModoVisualizacao(false); // modo edição
    setIsModalOpen(true);
  };

  const abrirModalVisualizacao = (os) => {
    setSelectedOS(os);
    setModoVisualizacao(true); // modo só leitura
    setIsModalOpen(true);
  };

  const handleNotaSalva = () => {
    setIsModalOpen(false);
    setSelectedOS(null);
    fetchOs();
  };

  // Função para imprimir a nota da OS
const imprimirNota = (os) => {
  const total = os.osDetalhes?.totalGeral ?? 0;
  const desconto = os.osDetalhes?.desconto ?? 0;
  const valorComDesconto = total - desconto;

  // Formatar data no formato dd/mm/yyyy
  const formatarData = (dataStr) => {
    if (!dataStr) return "-";
    const d = new Date(dataStr);
    return d.toLocaleDateString("pt-BR");
  };

  const html = `
    <html>
      <head>
        <title>Nota OS ${os.id}</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            padding: 30px;
            max-width: 800px;
            margin: auto;
            color: #333;
            background: #fff;
          }
          h1, h2 {
            text-align: center;
            margin-bottom: 10px;
          }
          h1 {
            font-size: 28px;
            letter-spacing: 2px;
            border-bottom: 2px solid #444;
            padding-bottom: 10px;
          }
          p {
            font-size: 16px;
            margin: 4px 0;
          }
          .header-info, .footer-info {
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .header-info div, .footer-info div {
            margin-bottom: 6px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 10px;
            font-size: 16px;
          }
          th, td {
            border: 1px solid #444;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
          }
          tfoot td {
            font-weight: bold;
          }
          .right {
            text-align: right;
          }
          .total-container {
            margin-top: 30px;
            float: right;
            width: 300px;
            font-size: 18px;
            border: 1px solid #444;
            padding: 15px;
            background-color: #fafafa;
          }
          .total-container div {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
          }
          .btn-print {
            display: block;
            margin: 50px auto 0;
            padding: 12px 30px;
            font-size: 18px;
            background-color: #2196f3;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            width: 180px;
            text-align: center;
          }
          .btn-print:hover {
            background-color: #1976d2;
          }
             @media print {
            .btn-print {
              display: none !important;
            }
          }
          /* Defeitos list */
          .defeitos-list {
            margin-top: 10px;
            font-size: 15px;
          }
          .defeitos-list li {
            margin-bottom: 4px;
          }
        </style>
      </head>
      <body>
        <h1>Nota  - OS</h1>

        <div class="header-info">
          <div><strong>Placa:</strong> ${os.placa || "-"}</div>
          <div><strong>Status:</strong> ${os.statusOS || "-"}</div>
          <div><strong>Oficina / Fornecedor:</strong> ${os.osDetalhes?.oficina || "-"}</div>
          <div><strong>Data Agendada:</strong> ${formatarData(os.osDetalhes?.dataAgendada)}</div>
          <div><strong>Horário:</strong> ${os.osDetalhes?.horario || "-"}</div>
        </div>

        <h2>Itens Usados</h2>
        ${
          os.osDetalhes?.itensUsados && os.osDetalhes.itensUsados.length > 0
            ? `<table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantidade</th>
                    <th>Valor Unitário (R$)</th>
                    <th>Total (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  ${os.osDetalhes.itensUsados
                    .map(
                      (item) => `
                    <tr>
                      <td>${item.nome || "-"}</td>
                      <td class="right">${item.valorUnitario?.toFixed(2) ?? "-"}</td>
                      <td>${item.quantidade ?? "-"}</td>
                      <td class="right">${
                        item.valorUnitario && item.quantidade
                          ? (item.valorUnitario * item.quantidade).toFixed(2)
                          : "-"
                      }</td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>`
            : "<p>Não há itens usados.</p>"
        }

        <h2>Defeitos Relatados</h2>
        ${
          os.osDetalhes?.defeitosSelecionados && os.osDetalhes.defeitosSelecionados.length > 0
            ? `<ul class="defeitos-list">
                ${os.osDetalhes.defeitosSelecionados
                  .map(
                    (d) =>
                      `<li><strong>${d.item}</strong>${d.observacao ? ` - ${d.observacao}` : ""}</li>`
                  )
                  .join("")}
              </ul>`
            : "<p>Não há defeitos relatados.</p>"
        }

        <div class="total-container">
          <div><span>Subtotal:</span> <span>R$ ${total.toFixed(2)}</span></div>
          <div><span>Desconto:</span> <span>- R$ ${desconto.toFixed(2)}</span></div>
          <div style="border-top:1px solid #444; padding-top: 10px;">Total Geral: <strong>R$ ${valorComDesconto.toFixed(2)}</strong></div>
        </div>

        <button class="btn-print" onclick="window.print()">Imprimir Nota</button>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
};


  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: "0 10px" }}>
      <h1>Gerar Notas / OS</h1>

      {error && (
        <div style={{ color: "red", marginBottom: 15 }}>
          <strong>{error}</strong>
        </div>
      )}

      {loading ? (
        <p>Carregando Ordens de Serviço...</p>
      ) : osList.length === 0 ? (
        <p>Nenhuma OS disponível para gerar nota.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Placa</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Status OS</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Valor Nota</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {osList.map((os) => (
              <tr key={os.id}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{os.placa || "-"}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{os.statusOS}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {os.osDetalhes?.totalGeral != null
                    ? `R$ ${os.osDetalhes.totalGeral.toFixed(2)}`
                    : "-"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {os.statusOS === "concluida" ? (
                    <>
                      <button
                        onClick={() => abrirModalVisualizacao(os)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#4caf50",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          marginRight: 8,
                        }}
                      >
                        Visualizar
                      </button>

                      <button
                        onClick={() => abrirModalNota(os)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#2196f3",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          marginRight: 8,
                        }}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => imprimirNota(os)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ff9800",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Imprimir
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => abrirModalNota(os)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#2196f3",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Preencher Nota
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de OS (modo nota ou visualização) */}
      {selectedOS?.osDetalhes && (
        <OsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOS(null);
          }}
          checklistId={selectedOS.id}
          placa={selectedOS.placa}
          fornecedores={
            Array.isArray(selectedOS.osDetalhes.fornecedores)
              ? selectedOS.osDetalhes.fornecedores
              : []
          }
          defeitosParaExibir={selectedOS.osDetalhes.defeitosParaExibir || []}
          defeitosDisponiveis={selectedOS.osDetalhes.defeitosDisponiveis   || []}
          itensUsados={selectedOS.osDetalhes.itensUsados || []}
          totalGeral={selectedOS.osDetalhes.totalGeral || 0}
          modoNota={true}
          modoVisualizacao={modoVisualizacao}
          onSaved={handleNotaSalva}
        />
      )}
    </div>
  );
}
