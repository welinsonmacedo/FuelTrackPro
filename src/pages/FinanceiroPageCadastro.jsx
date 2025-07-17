/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useFinanceiro } from "../hooks/useFinanceiro";
import { useFinanceiroCRUD } from "../hooks/useFinanceiroCRUD";
import DespesaForm from "../components/DespesaForm";
import { formatCurrency, formatData } from "../utils/data";

export default function FinanceiroPageCadastro() {
  const [filtros, setFiltros] = useState({});
  const [refresh, setRefresh] = useState(0);
  const { despesas, loading } = useFinanceiro(filtros, refresh);
  const {
    createDespesa,
    updateDespesa,
    deleteDespesa,
    loadingCreate,
    loadingUpdate,
    loadingDelete,
  } = useFinanceiroCRUD();

  const [editando, setEditando] = useState(null);

  const handleCreate = async (data) => {
    try {
      await createDespesa({ ...data, origem: "manual" });
      setEditando(null);
      setRefresh((r) => r + 1);
    } catch (e) {
      alert("Erro ao criar despesa: " + e.message);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateDespesa(editando.id, data);
      setEditando(null);
      setRefresh((r) => r + 1);
    } catch (e) {
      alert("Erro ao atualizar despesa: " + e.message);
    }
  };

  const handleDelete = async (id) => {
     console.log("ID para deletar:", id);
    if (!window.confirm("Confirma exclusão?")) return;
    try {
      await deleteDespesa(id);
      setRefresh((r) => r + 1);
    } catch (e) {
      alert("Erro ao excluir despesa: " + e.message);
    }
  };

  const despesasManuais = despesas.filter((d) => !d.checklistId);
  const despesasOS = despesas.filter((d) => d.checklistId);

  return (
    <div style={container}>
      <h2 style={title}>💰 Controle Financeiro da Frota</h2>

      {!editando ? (
        <>
          <div style={topBar}>
            <button style={button} onClick={() => setEditando({})} disabled={loadingCreate || loadingUpdate || loadingDelete}>
              ➕ Nova Despesa
            </button>
          </div>

          {loading ? (
            <p style={centerText}>Carregando despesas...</p>
          ) : (
            <>
              {/* Despesas de OS */}
              <h3 style={{ marginTop: 20 }}>Despesas de Ordens de Serviço</h3>
              {despesasOS.length === 0 ? (
                <p style={centerText}>Nenhuma despesa de OS cadastrada.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={table}>
                    <thead>
                      <tr>
                        <th style={th}>Data</th>
                        <th style={th}>Descrição</th>
                        <th style={th}>Status</th>
                        <th style={th}>Valor</th>
                        <th style={th}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {despesasOS.map((d) => (
                        <tr key={d.id}>
                          <td style={td}>{formatData(d.data)}</td>
                          <td style={td}>{d.descricao}</td>
                          <td style={td}>{d.status || "—"}</td>
                          <td style={td}>{formatCurrency(d.valor)}</td>
                          <td style={td}>
                            {/* OS não editável nem deletável aqui */}
                            <button
                              style={editBtn}
                              onClick={() => setEditando(d)}
                          
                              title="Não é possível editar despesa originada de OS"
                            >
                              ✏️
                            </button>
                            <button
                              style={deleteBtn}
                          
                              onClick={() => handleDelete(d.id)}
                              title="Não é possível excluir despesa originada de OS"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Despesas manuais */}
              <h3 style={{ marginTop: 40 }}>Despesas Cadastradas Manualmente</h3>
              {despesasManuais.length === 0 ? (
                <p style={centerText}>Nenhuma despesa manual cadastrada.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={table}>
                    <thead>
                      <tr>
                        <th style={th}>Tipo</th>
                        <th style={th}>Placa</th>
                        <th style={th}>Data</th>
                        <th style={th}>Valor</th>
                        <th style={th}>Descrição</th>
                        <th style={th}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {despesasManuais.map((d) => {
                        const tipo = d.itens?.[0]?.tipo || "Manual";
                        const placa = d.itens?.[0]?.placa?.trim() || "—";
                        const dataFormatada = d.data ? formatData(d.data) : "-";
                        const valor = d.total ?? 0;
                        const descricao =
                          d.descricao ||
                          (Array.isArray(d.itens) && d.itens.length > 0
                            ? d.itens.map((i) => i.descricao).join(", ")
                            : "-");

                        return (
                          <tr key={d.id}>
                            <td style={td}>{tipo}</td>
                            <td style={td}>{placa}</td>
                            <td style={td}>{dataFormatada}</td>
                            <td style={td}>{formatCurrency(valor)}</td>
                            <td style={td}>{descricao}</td>
                            <td style={td}>
                              <button
                                style={editBtn}
                                onClick={() => setEditando(d)}
                                disabled={loadingCreate || loadingUpdate || loadingDelete}
                              >
                                ✏️
                              </button>
                              <button
                                style={deleteBtn}
                                onClick={() => handleDelete(d.id)}
                                disabled={loadingDelete}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <DespesaForm
          initialData={editando}
          onSubmit={editando.id ? handleUpdate : handleCreate}
          onCancel={() => setEditando(null)}
        />
      )}
    </div>
  );
}

// Estilos (copie do seu código original)
const container = { maxWidth: 1000, margin: "0 auto", padding: 20 };
const title = { fontSize: 24, marginBottom: 20 };
const topBar = { display: "flex", justifyContent: "flex-end", marginBottom: 10 };
const centerText = { textAlign: "center", marginTop: 40, color: "#777" };
const table = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "#fff",
  borderRadius: 8,
  boxShadow: "0 0 10px rgba(0,0,0,0.05)",
  overflow: "hidden",
};
const th = {
  backgroundColor: "#f2f2f2",
  padding: 10,
  textAlign: "left",
  fontWeight: 600,
  borderBottom: "2px solid #ddd",
};
const td = { padding: 10, borderBottom: "1px solid #eee" };
const button = {
  padding: "8px 12px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14,
};
const editBtn = { ...button, backgroundColor: "#ffc107", marginRight: 5 };
const deleteBtn = { ...button, backgroundColor: "#dc3545" };
