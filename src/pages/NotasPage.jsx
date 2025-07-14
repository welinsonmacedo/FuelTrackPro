import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { OsModal } from "../components/OsModal"; // ajuste o caminho se necessário

export function NotasPage() {
  const [osList, setOsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedOS, setSelectedOS] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);

  // Buscar OS com status válido e sem nota
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

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: "0 10px" }}>
      <h1>Gerar Notas /OS</h1>

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
                  {os.osDetalhes.totalGeral != null ? `R$ ${os.osDetalhes.totalGeral.toFixed(2)}` : "-"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {os.statusOS === "concluida" ? (
                    <button
                      onClick={() => abrirModalVisualizacao(os)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#4caf50",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Visualizar
                    </button>
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
          fornecedores={
            Array.isArray(selectedOS.osDetalhes.fornecedores)
              ? selectedOS.osDetalhes.fornecedores
              : []
          }
          defeitosDisponiveis={selectedOS.osDetalhes.defeitosSelecionados || []}
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
