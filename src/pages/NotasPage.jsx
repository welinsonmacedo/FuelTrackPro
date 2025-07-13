import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export function NotasPage() {
  const [osList, setOsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gerando, setGerando] = useState(null); // id da OS que está gerando nota
  const [error, setError] = useState(null);

  // Função para buscar OS válidas para gerar nota
  const fetchOs = async () => {
    setLoading(true);
    setError(null);
    try {
      const ref = collection(db, "checklists");
      const q = query(ref, where("statusOS", "in", ["aberta", "concluida"]));
      const snap = await getDocs(q);
      const lista = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((os) => !os.notaCriada);
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

  // Função para gerar nota (criar despesa no financeiro e atualizar OS)
  const gerarNota = async (os) => {
    setGerando(os.id);
    setError(null);
    try {
      // 1) Criar despesa no financeiro (ajuste os campos conforme seu schema)
      const financeiroRef = collection(db, "financeiro");
      await addDoc(financeiroRef, {
        tipo: "Nota OS",
        osId: os.id,
        placa: os.placa || "",
        descricao: `Nota gerada para OS ${os.id}`,
        valor: os.valorNota || 0, // suponha que valorNota exista na OS
        data: Timestamp.now(),
        criadoEm: Timestamp.now(),
      });

      // 2) Atualizar a OS para marcar notaCriada: true
      const osRef = doc(db, "checklists", os.id);
      await updateDoc(osRef, { notaCriada: true });

      // 3) Atualizar a lista local removendo a OS que gerou nota
      setOsList((oldList) => oldList.filter((item) => item.id !== os.id));
    } catch (e) {
      console.error("Erro ao gerar nota:", e);
      setError("Erro ao gerar nota para a OS.");
    } finally {
      setGerando(null);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: "0 10px" }}>
      <h1>Gerar Notas a partir de Ordens de Serviço</h1>

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
               
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {os.placa || "-"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{os.statusOS}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {os.valorNota != null ? `R$ ${os.valorNota.toFixed(2)}` : "-"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  <button
                    disabled={gerando === os.id}
                    onClick={() => gerarNota(os)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: gerando === os.id ? "#ccc" : "#4caf50",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: gerando === os.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {gerando === os.id ? "Gerando..." : "Gerar Nota"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
