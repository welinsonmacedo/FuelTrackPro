import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

function timestampToDate(obj) {
  if (!obj || typeof obj !== "object" || obj.seconds === undefined) return null;
  return new Date(obj.seconds * 1000);
}

function formatarDiferencas(obj) {
  const convertido = {};
  for (const chave in obj) {
    const campo = obj[chave];
    if (campo && typeof campo === "object" && "antes" in campo && "depois" in campo) {
      const antes = campo.antes?.seconds
        ? new Date(campo.antes.seconds * 1000).toLocaleString("pt-BR")
        : campo.antes;
      const depois = campo.depois?.seconds
        ? new Date(campo.depois.seconds * 1000).toLocaleString("pt-BR")
        : campo.depois;
      convertido[chave] = { antes, depois };
    } else {
      convertido[chave] = campo;
    }
  }
  return convertido;
}

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [logSelecionado, setLogSelecionado] = useState(null);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchUsuarios() {
    const usuariosRef = collection(db, "usuarios");
    const snapshot = await getDocs(usuariosRef);
    const mapUsuarios = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      mapUsuarios[doc.id] = data.nome || "Sem nome";
    });
    setUsuarios(mapUsuarios);
  }

  async function fetchLogs(dataInicio, dataFim) {
    setLoading(true);
    await fetchUsuarios();

    let q = query(collection(db, "colecaoAuditoria"), orderBy("timestamp", "desc"));

    if (dataInicio && dataFim) {
      const inicioDate = new Date(dataInicio);
      const fimDate = new Date(dataFim);
      fimDate.setHours(23, 59, 59, 999);

      q = query(
        collection(db, "colecaoAuditoria"),
        where("timestamp", ">=", inicioDate),
        where("timestamp", "<=", fimDate),
        orderBy("timestamp", "desc")
      );
    } else {
      q = query(collection(db, "colecaoAuditoria"), orderBy("timestamp", "desc"), limit(50));
    }

    const snapshot = await getDocs(q);
    const lista = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        usuarioId: data.usuarioId || "Não informado",
        acao: data.acao || "Não informada",
        descricao: data.descricao || "",
        diferencas: data.diferencas || {},
        dataAntes: timestampToDate(data.data?.antes),
        dataDepois: timestampToDate(data.data?.depois),
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
      };
    });

    setLogs(lista);
    setLoading(false);
  }

  function imprimirLista() {
    const win = window.open("", "_blank");
    const html = `
      <html>
        <head>
          <title>Relatório de Logs</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h2>Relatório de Logs</h2>
          <p>Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
          <table>
            <thead>
              <tr><th>Usuário</th><th>Ação</th><th>Descrição</th><th>Data</th></tr>
            </thead>
            <tbody>
              ${logs.map(log => `
                <tr>
                  <td>${usuarios[log.usuarioId] || log.usuarioId}</td>
                  <td>${log.acao}</td>
                  <td>${log.descricao}</td>
                  <td>${log.timestamp.toLocaleString("pt-BR")}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  function imprimirIndividual(log) {
    const win = window.open("", "_blank");
    const diferencas = JSON.stringify(formatarDiferencas(log.diferencas), null, 2)
      .replace(/\n/g, "<br>").replace(/ /g, "&nbsp;");

    const html = `
      <html>
        <head>
          <title>Detalhes do Log</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h2>Detalhes do Log</h2>
          <p><b>Usuário:</b> ${usuarios[log.usuarioId] || log.usuarioId}</p>
          <p><b>Ação:</b> ${log.acao}</p>
          <p><b>Descrição:</b> ${log.descricao}</p>
          <p><b>Data do Evento:</b> ${log.timestamp.toLocaleString("pt-BR")}</p>
          <h4>Diferenças:</h4>
          <pre>${diferencas}</pre>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>Logs de Auditoria (Últimos 50)</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Data Inicial: </label>
        <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        <label style={{ marginLeft: 10 }}>Data Final: </label>
        <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
        <button onClick={() => fetchLogs(inicio, fim)} style={{ marginLeft: 10 }}>
          Filtrar
        </button>
        <button
          onClick={imprimirLista}
          style={{
            marginLeft: 10,
            backgroundColor: "#2c3e50",
            color: "#ecf0f1",
            padding: "6px 12px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Imprimir Logs
        </button>
      </div>

      {loading ? (
        <p>Carregando logs...</p>
      ) : !logs.length ? (
        <p>Nenhum log encontrado.</p>
      ) : (
        <div
          style={{
            maxHeight: 400,
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 600,
            }}
          >
            <thead style={{ backgroundColor: "#2c3e50", color: "#ecf0f1" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left" }}>Usuário</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Ação</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Descrição</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  style={{
                    backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#fff",
                    borderBottom: "1px solid #ddd",
                    cursor: "pointer",
                  }}
                  onClick={() => setLogSelecionado(log)}
                  title="Clique para ver detalhes"
                >
                  <td style={{ padding: "10px" }}>
                    {usuarios[log.usuarioId] || log.usuarioId || "Usuário não encontrado"}
                  </td>
                  <td style={{ padding: "10px" }}>{log.acao}</td>
                  <td style={{ padding: "10px" }}>{log.descricao}</td>
                  <td style={{ padding: "10px" }}>{log.timestamp.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {logSelecionado && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setLogSelecionado(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              width: "90%",
              maxWidth: 600,
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Detalhes da Alteração</h3>
            <p><b>Ação:</b> {logSelecionado.acao}</p>
            <p><b>Descrição:</b> {logSelecionado.descricao}</p>
            <p><b>Data do Evento:</b> {logSelecionado.timestamp.toLocaleString("pt-BR")}</p>
            <p><b>Usuário:</b> {usuarios[logSelecionado.usuarioId] || logSelecionado.usuarioId}</p>

            <hr />

            <h4>Diferenças:</h4>
            <pre
              style={{
                backgroundColor: "#f4f4f4",
                padding: 10,
                borderRadius: 4,
                maxHeight: 300,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {JSON.stringify(formatarDiferencas(logSelecionado.diferencas), null, 2)}
            </pre>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                onClick={() => imprimirIndividual(logSelecionado)}
                style={{
                  backgroundColor: "#2c3e50",
                  color: "#ecf0f1",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Imprimir Log
              </button>
              <button
                onClick={() => setLogSelecionado(null)}
                style={{
                  backgroundColor: "#ccc",
                  color: "#333",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
