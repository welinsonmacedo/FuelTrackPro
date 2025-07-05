import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const logsRef = collection(db, "logs");
      const q = query(logsRef, orderBy("data", "desc"), limit(50));
      const snapshot = await getDocs(q);
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchLogs();
  }, []);

  if (loading) return <p>Carregando logs...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>Logs de Auditoria (Últimos 50)</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Ação</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td>{log.idUsuario}</td>
              <td>{log.acao}</td>
              <td>{new Date(log.data).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
