import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
} from "firebase/firestore";
import { formatData } from "../utils/data";

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState([]);
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroMotorista, setFiltroMotorista] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal OS
  const [modalOSAberto, setModalOSAberto] = useState(false);
  const [osChecklistId, setOsChecklistId] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [osDados, setOsDados] = useState({
    oficina: "",
    dataAgendada: "",
    horario: "",
    defeitosSelecionados: [],
  });

  // Carrega fornecedores para modal OS
  const carregarFornecedores = async () => {
    try {
      const q = query(collection(db, "fornecedores"));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFornecedores(lista);
    } catch (error) {
      console.error("Erro ao carregar fornecedores", error);
      alert("Erro ao carregar fornecedores");
    }
  };

  // Carrega checklists com filtros
  const carregarChecklists = async () => {
    setLoading(true);
    try {
      let q = collection(db, "checklists");
      let snapshots = await getDocs(q);
      let dados = snapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (filtroPlaca.trim() !== "") {
        dados = dados.filter((ch) =>
          ch.placa?.toLowerCase().includes(filtroPlaca.toLowerCase())
        );
      }
      if (filtroMotorista.trim() !== "") {
        dados = dados.filter((ch) =>
          ch.motorista?.toLowerCase().includes(filtroMotorista.toLowerCase())
        );
      }
      setChecklists(dados);
    } catch (error) {
      console.error("Erro ao carregar checklists", error);
      alert("Erro ao carregar checklists");
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarChecklists();
    carregarFornecedores();
  }, []);

  // Abrir modal para criar/editar OS e definir checklistId
  const abrirModalOS = (checklist) => {
    if (checklist.osCriada && checklist.osDetalhes) {
      setOsDados({
        oficina: checklist.osDetalhes.oficina || "",
        dataAgendada: checklist.osDetalhes.dataAgendada || "",
        horario: checklist.osDetalhes.horario || "",
        defeitosSelecionados: checklist.osDetalhes.defeitos || [],
      });
    } else {
      setOsDados({
        oficina: "",
        dataAgendada: "",
        horario: "",
        defeitosSelecionados: [],
      });
    }
    setOsChecklistId(checklist.id);
    setModalOSAberto(true);
  };

  // Fechar modal
  const fecharModalOS = () => {
    setModalOSAberto(false);
    setOsChecklistId(null);
  };

  // Salvar OS no checklist (criar ou atualizar)
  const salvarOS = async () => {
    if (!osDados.oficina || !osDados.dataAgendada || !osDados.horario) {
      alert(
        "Por favor, preencha todos os campos obrigatórios (Oficina, Data e Horário)."
      );
      return;
    }
    if (!osDados.defeitosSelecionados || osDados.defeitosSelecionados.length === 0) {
      alert("Por favor, selecione ao menos um defeito relatado.");
      return;
    }
    try {
      const checklistRef = doc(db, "checklists", osChecklistId);

      // Pega o documento atual para preservar dados importantes
      const docSnap = await getDoc(checklistRef);
      let dadosAtuais = {};
      if (docSnap.exists()) {
        dadosAtuais = docSnap.data();
      }

      await updateDoc(checklistRef, {
        osCriada: true,
        statusOS: dadosAtuais.statusOS === "concluida" ? "concluida" : "aberta",
        dataOSCriada: dadosAtuais.dataOSCriada || new Date(),
        osDetalhes: {
          oficina: osDados.oficina,
          dataAgendada: osDados.dataAgendada,
          horario: osDados.horario,
          defeitos: osDados.defeitosSelecionados,
        },
      });
      alert("OS salva com sucesso!");
      carregarChecklists();
      fecharModalOS();
    } catch (error) {
      console.error("Erro ao salvar OS", error);
      alert("Erro ao salvar OS");
    }
  };

  // Dar baixa na OS e checklist como concluído
  const darBaixaOS = async (checklistId) => {
    try {
      const checklistRef = doc(db, "checklists", checklistId);
      await updateDoc(checklistRef, {
        statusOS: "concluida",
        checklistConcluido: true,
        dataConclusao: new Date(),
      });
      alert("OS e checklist concluídos!");
      carregarChecklists();
    } catch (error) {
      console.error("Erro ao concluir OS", error);
      alert("Erro ao concluir OS");
    }
  };

  // Imprimir checklist (sem alterações)
  const imprimirChecklist = (checklist) => {
    const janela = window.open("", "_blank");
    const html = `
      <html>
      <head>
        <title>Checklist - ${checklist.placa}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 30px;
          }
          h2, h3 {
            color: #2c3e50;
            margin-bottom: 10px;
          }
          h2 {
            border-bottom: 2px solid #27ae60;
            padding-bottom: 8px;
            font-weight: 700;
            text-align: center;
          }
          .container {
            background: white;
            padding: 20px 30px;
            border-radius: 8px;
            box-shadow: 0 0 12px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 0 auto;
          }
          p {
            font-size: 16px;
            line-height: 1.5;
            margin: 6px 0;
          }
          strong {
            color: #27ae60;
            width: 140px;
            display: inline-block;
          }
          ul {
            list-style-type: none;
            padding-left: 0;
            margin-top: 0;
          }
          li {
            margin-bottom: 8px;
            font-size: 15px;
          }
          em {
            color: #555;
            font-style: italic;
            font-size: 14px;
            display: block;
            margin-top: 4px;
          }
          hr {
            margin: 20px 0;
            border: none;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Checklist - Viagem ${checklist.rota || ""}</h2>

          <p><strong>Placa:</strong> ${checklist.placa || "N/A"}</p>
          <p><strong>Motorista:</strong> ${checklist.motorista || "N/A"}</p>
          <p><strong>Tipo:</strong> ${checklist.tipo || "N/A"}</p>
          <p><strong>Data:</strong> ${formatData(checklist.dataRegistro)}</p>
          <hr/>
          <h3>Respostas:</h3>
          <ul>
            ${Object.entries(checklist.respostas || {})
              .map(([item, resposta]) => {
                const status =
                  resposta.status === "ok"
                    ? "OK"
                    : resposta.status === "defeito"
                    ? "Com defeito"
                    : "Não verificado";
                const obs = resposta.observacao
                  ? `<em>Obs: ${resposta.observacao}</em>`
                  : "";
                return `<li><strong>${item}:</strong> ${status} ${obs}</li>`;
              })
              .join("")}
          </ul>
          <hr/>
          <h3>Observações Gerais:</h3>
          <p>${checklist.observacoesGerais || "Nenhuma"}</p>
        </div>
      </body>
      </html>
    `;
    janela.document.write(html);
    janela.document.close();
  };

  // Imprimir OS (mostra dados da OS incluindo defeitos selecionados)
  const imprimirOS = (checklist) => {
    if (!checklist.osCriada) {
      alert("Esta checklist ainda não tem OS criada.");
      return;
    }


    const os = checklist.osDetalhes || {};

    const dataAgendadaStr = os.dataAgendada
      ? new Date(os.dataAgendada).toLocaleDateString()
      : "N/A";

    const defeitosList = Array.isArray(os.defeitos) && os.defeitos.length > 0
      ? `<ul>${os.defeitos.map((d) => `<li>${d}</li>`).join("")}</ul>`
      : "<p>Nenhum defeito selecionado.</p>";

    const html = `
      <html>
      <head>
        <title>Ordem de Serviço - ${checklist.placa}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 30px;
          }
          h2 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 10px;
            border-bottom: 2px solid #2980b9;
            padding-bottom: 8px;
            font-weight: 700;
          }
          .container {
            background: white;
            padding: 20px 30px;
            border-radius: 8px;
            box-shadow: 0 0 12px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 0 auto;
          }
          p {
            font-size: 16px;
            line-height: 1.5;
            margin: 8px 0;
          }
          strong {
            color: #2980b9;
            width: 140px;
            display: inline-block;
          }
          ul {
            margin: 0;
            padding-left: 18px;
          }
          li {
            margin-bottom: 4px;
          }
          hr {
            margin: 20px 0;
            border: none;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Ordem de Serviço </h2>
          <p><strong>Placa:</strong> ${checklist.placa || "N/A"}</p>
          <p><strong>Status OS:</strong> ${checklist.statusOS || "Não definida"}</p>
          <p><strong>Data Criação OS:</strong> ${
            checklist.dataOSCriada
              ? new Date(checklist.dataOSCriada.seconds * 1000).toLocaleString()
              : "N/A"
          }</p>
          <hr/>
          <p><strong>Oficina:</strong> ${os.oficina || "N/A"}</p>
          <p><strong>Data Agendada:</strong> ${dataAgendadaStr}</p>
          <p><strong>Horário:</strong> ${os.horario || "N/A"}</p>
          <p><strong>Serviços:</strong></p>
          ${defeitosList}
        </div>
      </body>
      </html>
    `;

    const janela = window.open("", "_blank");
    janela.document.write(html);
    janela.document.close();
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "20px auto",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 8,
      }}
    >
      <h1>Lista de Checklists</h1>

      <div
        style={{
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Filtrar por placa"
          value={filtroPlaca}
          onChange={(e) => setFiltroPlaca(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", flexGrow: 1 }}
        />
        <input
          type="text"
          placeholder="Filtrar por motorista"
          value={filtroMotorista}
          onChange={(e) => setFiltroMotorista(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", flexGrow: 1 }}
        />
        <button
          onClick={carregarChecklists}
          style={{
          padding: "12px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#4df55b",
          color: "#1e1f3b",
          fontWeight:"900",
          width: "100%",
          maxWidth: "400px",
          boxSizing: "border-box"}}
        >
          Aplicar Filtros
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : checklists.length === 0 ? (
        <p>Nenhum checklist encontrado.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#eee" }}>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Placa</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Motorista</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Tipo</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Data</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>OS Criada</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Status OS</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {checklists.map((ch) => (
              <tr key={ch.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={{ padding: 8 }}>{ch.placa || "-"}</td>
                <td style={{ padding: 8 }}>{ch.motorista || "-"}</td>
                <td style={{ padding: 8 }}>{ch.tipo}</td>
                <td style={{ padding: 8 }}>{formatData(ch.dataRegistro)}</td>
                <td style={{ padding: 8 }}>{ch.osCriada ? "Sim" : "Não"}</td>
                <td style={{ padding: 8 }}>{ch.statusOS || "-"}</td>
                <td
                  style={{
                    padding: 8,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {!ch.osCriada && (
                    <button
                      onClick={() => abrirModalOS(ch)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Criar OS
                    </button>
                  )}
                  <button
                    onClick={() => imprimirChecklist(ch)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Imprimir Checklist
                  </button>
                  {ch.osCriada && (
                    <>
                      <button
                        onClick={() => abrirModalOS(ch)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ffc107",
                          color: "#000",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Editar OS
                      </button>
                      <button
                        onClick={() => imprimirOS(ch)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#17a2b8",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        Imprimir OS
                      </button>
                      {ch.statusOS !== "concluida" && (
                        <button
                          onClick={() => darBaixaOS(ch.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          Dar Baixa OS
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal OS */}
      {modalOSAberto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={fecharModalOS}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 24,
              maxWidth: 500,
              width: "100%",
              boxShadow: "0 0 15px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 20, color: "#007bff" }}>
              {osChecklistId && checklists.find(ch => ch.id === osChecklistId)?.osCriada
                ? "Editar Ordem de Serviço"
                : "Criar Ordem de Serviço"}
            </h2>

            <label style={{ display: "block", marginBottom: 12 }}>
              Oficina <span style={{ color: "red" }}>*</span>
              <select
                value={osDados.oficina}
                onChange={(e) => setOsDados({ ...osDados, oficina: e.target.value })}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 6,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Selecione uma oficina</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.nome}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginBottom: 12 }}>
              Data Agendada <span style={{ color: "red" }}>*</span>
              <input
                type="date"
                value={osDados.dataAgendada}
                onChange={(e) => setOsDados({ ...osDados, dataAgendada: e.target.value })}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 6,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 12 }}>
              Horário <span style={{ color: "red" }}>*</span>
              <input
                type="time"
                value={osDados.horario}
                onChange={(e) => setOsDados({ ...osDados, horario: e.target.value })}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 6,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
            </label>

            {/* Multiselect defeitos */}
            <label style={{ display: "block", marginBottom: 12 }}>
              Defeitos relatados <span style={{ color: "red" }}>*</span>
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  maxHeight: 120,
                  overflowY: "auto",
                  padding: 8,
                  marginTop: 6,
                }}
              >
                {(() => {
                  // Pega checklist atual para pegar os defeitos
                  const checklistAtual = checklists.find((ch) => ch.id === osChecklistId);
                  if (!checklistAtual || !checklistAtual.respostas) {
                    return (
                      <p style={{ fontStyle: "italic", color: "#999" }}>
                        Nenhum defeito encontrado no checklist.
                      </p>
                    );
                  }
                  const defeitosDisponiveis = Object.entries(checklistAtual.respostas)
                    .filter(([_, resp]) => resp.status === "defeito")
                    .map(([item]) => item);

                  if (defeitosDisponiveis.length === 0) {
                    return (
                      <p style={{ fontStyle: "italic", color: "#999" }}>
                        Nenhum defeito encontrado no checklist.
                      </p>
                    );
                  }

                  return defeitosDisponiveis.map((defeito) => (
                    <div key={defeito} style={{ marginBottom: 4 }}>
                      <label style={{ cursor: "pointer", userSelect: "none" }}>
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(osDados.defeitosSelecionados) &&
                            osDados.defeitosSelecionados.includes(defeito)
                          }
                          onChange={() => {
                            let novosDefeitos = Array.isArray(osDados.defeitosSelecionados)
                              ? [...osDados.defeitosSelecionados]
                              : [];
                            if (novosDefeitos.includes(defeito)) {
                              novosDefeitos = novosDefeitos.filter((d) => d !== defeito);
                            } else {
                              novosDefeitos.push(defeito);
                            }
                            setOsDados({ ...osDados, defeitosSelecionados: novosDefeitos });
                          }}
                          style={{ marginRight: 8 }}
                        />
                        {defeito}
                      </label>
                    </div>
                  ));
                })()}
              </div>
            </label>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 20,
              }}
            >
              <button
                onClick={fecharModalOS}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarOS}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Salvar OS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
