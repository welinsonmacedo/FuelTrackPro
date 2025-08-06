/* eslint-disable no-unused-vars */
 
import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useEmpresa } from "../hooks/useEmpresa";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
} from "firebase/firestore";
import { formatData } from "../utils/data";
import { OsModal } from "../components/OsModal";
import { SearchInput } from "../components/SearchInput";
import { useChecklists } from "../hooks/useChecklists";

export default function ChecklistPage() {
const {
  checklists,
  loading,
  carregarChecklists,
  excluirChecklist,
  setChecklists,
  setLoading,
} = useChecklists();

  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroMotorista, setFiltroMotorista] = useState("");
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
    const lista = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((fornecedor) => fornecedor.tipo?.toLowerCase() !== "posto");
    setFornecedores(lista);
  } catch (error) {
    console.error("Erro ao carregar fornecedores", error);
    alert("Erro ao carregar fornecedores");
  }
};
  

  const excluir = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este checklist?")) {
      try {
        await excluirChecklist(id);
        alert("Checklist excluído com sucesso.");
        carregarChecklists();
      } catch (error) {
        console.error("Erro ao excluir checklist:", error);
        alert("Erro ao excluir checklist.");
      }
    }
  };

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
    <div style={{ padding: 4 }}>
      <h1>Checklists</h1>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <SearchInput
          type="text"
          placeholder="Filtrar por placa"
          value={filtroPlaca}
          onChange={(e) => setFiltroPlaca(e.target.value)}
        />
        <SearchInput
          type="text"
          placeholder="Filtrar por motorista"
          value={filtroMotorista}
          onChange={(e) => setFiltroMotorista(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : checklists.length === 0 ? (
        <p>Nenhum checklist encontrado.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
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
              {checklists.map((ch, index) => {
                const possuiDefeitos = Object.values(ch.respostas || {}).some(
                  (resp) => resp.status === "defeito"
                );

                const corDeFundo = possuiDefeitos
                  ? index % 2 === 0
                    ? "#ffffff"
                    : "#fffd81"
                  : "#d4edda";

                return (
                  <tr
                    key={ch.id}
                    style={{
                      backgroundColor: corDeFundo,
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
                    <td style={{ padding: "12px 16px" }}>
                      {ch.statusOS || "-"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={() => abrirModalOS(ch)}
                        style={buttonStyle("#3498db")}
                      >
                        {ch.osCriada ? "Editar OS" : "Criar OS"}
                      </button>
                      {ch.osCriada && (
                        <>
                          <button
                            onClick={() => darBaixaOS(ch.id)}
                            style={buttonStyle("#e67e22")}
                          >
                            Dar Baixa
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => excluir(ch.id)}
                        style={buttonStyle("#e74c3c")}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
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
