/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useEmpresa } from "../hooks/useEmpresa";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
} from "firebase/firestore";
import { formatData } from "../utils/data";
import { Modal } from "../components/Modal";
import { FormField } from "../components/FormField";
import { SubmitButton } from "../components/SubmitButton";
import { OsModal } from "../components/OsModal";

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState([]);
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroMotorista, setFiltroMotorista] = useState("");
  const [loading, setLoading] = useState(false);
  const { usuario } = useAuth();
  const { empresa } = useEmpresa();
  const [modalOSAberto, setModalOSAberto] = useState(false);
  const [osChecklistId, setOsChecklistId] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [osDados, setOsDados] = useState({
    oficina: "",
    dataAgendada: "",
    horario: "",
    defeitosSelecionados: [],
  });

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

  const fecharModalOS = () => {
    setModalOSAberto(false);
    setOsChecklistId(null);
    setOsDados({
      oficina: "",
      dataAgendada: "",
      horario: "",
      defeitosSelecionados: [],
    });
  };

  const salvarOS = async () => {
    if (!osDados.oficina || !osDados.dataAgendada || !osDados.horario) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    if (!osDados.defeitosSelecionados.length) {
      alert("Selecione ao menos um defeito relatado.");
      return;
    }
    try {
      const checklistRef = doc(db, "checklists", osChecklistId);
      const docSnap = await getDoc(checklistRef);
      let dadosAtuais = {};
      if (docSnap.exists()) dadosAtuais = docSnap.data();

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

  const imprimirOS = (checklist) => {
    if (!checklist.osCriada) {
      alert("Esta checklist ainda não tem OS criada.");
      return;
    }

    const os = checklist.osDetalhes || {};
    const defeitos = os.defeitosSelecionados || [];
    const itensUsados = os.itensUsados || [];
    const totalGeral = (os.totalGeral ?? 0).toFixed(2);
    const desconto = (os.desconto ?? 0).toFixed(2);
  const janela = window.open("", "_blank");
    const html = `
  <html>
    <head>
      <title>OS - ${checklist.placa}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 20px;
          color: #333;
          border: 1px solid #ccc;
         
        }
         div {
  display: flex;
  align-items: center;
  justify-content: center;
   gap:10px;
}
   img{
   width:160px;
    margin-left: 60px;
   }
        h2 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 30px;
         
        }
        p ,h3{
          font-size: 16px;
          padding-left: 70px;
          margin-top: 20px;
        }
        b {
          color: #34495e;
        }
        ul {
          list-style-type: disc;
          padding-left: 100px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        table, th, td {
          border: 1px solid #6b6666;
        }
        th, td {
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          color: #2c3e50;
        }
        tfoot td {
          font-weight: bold;
        }
        .assinaturas {
          margin-top: 40px;
          display: flex;
          gap:80px;
          justify-content: space-evelyn;
        }
        .assinatura {
          width: 20%;
          text-align: center;
        }
        .linha-assinatura {
          margin-top: 60px;
          border-top: 1px solid #000;
          padding-top: 5px;
        }
        .footer {
         width: 100%;
          margin-top: 60px;
          text-align: center;
          font-size: 14px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <h3>Ordem de Serviço</h3>
      <div>
      
      <img src=${empresa.logoURL} alt="Logo" } />
      <h2><b>${empresa.nome}</b> </h2>
       </div>
    
      <p><b>Placa:</b> ${checklist.placa}</p>
      <p><b>Status OS:</b> ${checklist.statusOS || "N/A"}</p>
      <p><b>Oficina:</b> ${os.oficina}</p>
      <p><b>Data Agendada:</b> ${formatData(os.dataAgendada)}</p>
      <p><b>Horário:</b> ${os.horario}</p>

      <p><b>Defeitos Relatados:</b></p>
      ${
        defeitos.length > 0
          ? `<ul>${defeitos
              .map(
                (d) =>
                  `<li><strong>${d.item}</strong> — <em>${
                    d.observacao || ""
                  }</em></li>`
              )
              .join("")}</ul>`
          : "<p>Nenhum defeito relatado.</p>"
      }

      <div class="assinaturas">
        <div class="assinatura">
          <div class="linha-assinatura">Responsável da Empresa</div>
        </div>
        <div class="assinatura">
          <div class="linha-assinatura">Responsável da Oficina</div>
        </div>
       
      </div>

      <div class="footer">
        <h5>FuelTrack - Sistema de Gestão de Frotas</h5>
        <h5>Gerado em: ${new Date().toLocaleString()}</h5>
        <h5>Usuário: ${usuario.email}</h5>
      </div>
    </body>
  </html>
`;

  
    janela.document.write(html);
  janela.document.close();
  janela.focus(); // opcional, para garantir foco
  janela.print(); // chama a impressão automaticamente
    
  };

  const checklistAtual = checklists.find((ch) => ch.id === osChecklistId);
  const defeitosDisponiveis = checklistAtual?.respostas
    ? Object.entries(checklistAtual.respostas)
        .filter(([_, resp]) => resp.status === "defeito")
        .map(([item, resp]) => ({ item, observacao: resp.observacao }))
    : [];
  const buttonStyle = (bgColor) => ({
    backgroundColor: bgColor,
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 13,
    transition: "background-color 0.3s",
  });
  return (
    <div style={{ padding: 24 }}>
      <h1>Checklists</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Filtrar por placa"
          value={filtroPlaca}
          onChange={(e) => setFiltroPlaca(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filtrar por motorista"
          value={filtroMotorista}
          onChange={(e) => setFiltroMotorista(e.target.value)}
        />
        <button onClick={carregarChecklists}>Aplicar Filtros</button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : checklists.length === 0 ? (
        <p>Nenhum checklist encontrado.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            border={0}
            cellPadding={10}
            cellSpacing={0}
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
              borderRadius: 8,
              overflow: "hidden",
              minWidth: 800,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#2c3e50",
                  color: "#fff",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                <th style={{ padding: "12px 16px" }}>Placa</th>
                <th style={{ padding: "12px 16px" }}>Motorista</th>
                <th style={{ padding: "12px 16px" }}>Tipo</th>
                <th style={{ padding: "12px 16px" }}>Data</th>
                <th style={{ padding: "12px 16px" }}>OS Criada</th>
                <th style={{ padding: "12px 16px" }}>Status OS</th>
                <th style={{ padding: "12px 16px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {checklists.map((ch, index) => (
                <tr
                  key={ch.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <td style={{ padding: "12px 16px" }}>{ch.placa}</td>
                  <td style={{ padding: "12px 16px" }}>{ch.motorista}</td>
                  <td style={{ padding: "12px 16px" }}>{ch.tipo}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {formatData(ch.dataRegistro)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {ch.osCriada ? "Sim" : "Não"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{ch.statusOS || "-"}</td>
                  <td
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {!ch.osCriada && (
                      <button
                        onClick={() => abrirModalOS(ch)}
                        style={buttonStyle("#3498db")}
                      >
                        Criar OS
                      </button>
                    )}
                    <button
                      onClick={() => imprimirChecklist(ch)}
                      style={buttonStyle("#2ecc71")}
                    >
                      Imprimir
                    </button>
                    {ch.osCriada && (
                      <>
                        <button
                          onClick={() => abrirModalOS(ch)}
                          style={buttonStyle("#f39c12")}
                        >
                          Editar OS
                        </button>
                        <button
                          onClick={() => imprimirOS(ch)}
                          style={buttonStyle("#9b59b6")}
                        >
                          Imprimir OS
                        </button>
                        {ch.statusOS !== "concluida" && (
                          <button
                            onClick={() => darBaixaOS(ch.id)}
                            style={buttonStyle("#e74c3c")}
                          >
                            Dar Baixa
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OsModal
        isOpen={modalOSAberto}
        onClose={fecharModalOS}
        checklistId={osChecklistId}
        fornecedores={fornecedores}
        onSaved={carregarChecklists}
        defeitosDisponiveis={defeitosDisponiveis}
        modoSimplificado={true}
      />
    </div>
  );
}
