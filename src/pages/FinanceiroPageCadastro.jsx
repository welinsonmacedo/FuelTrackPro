/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useFinanceiro } from "../hooks/useFinanceiro";
import { useFinanceiroCRUD } from "../hooks/useFinanceiroCRUD";
import DespesaForm from "../components/DespesaForm";
import { formatCurrency, formatData } from "../utils/data";

export default function FinanceiroPage() {
  const [filtros, setFiltros] = useState({});
  const { despesas, loading } = useFinanceiro(filtros);
  const { createDespesa, updateDespesa, deleteDespesa, loading: loadingCrud } =
    useFinanceiroCRUD();

  const [editando, setEditando] = useState(null);

  const handleCreate = async (data) => {
    await createDespesa(data);
    setEditando(null);
  };

  const handleUpdate = async (data) => {
    await updateDespesa(editando.id, data);
    setEditando(null);
  };

  return (
    <div style={container}>
      <h2 style={title}>💰 Controle Financeiro da Frota</h2>

      {!editando ? (
        <>
          <div style={topBar}>
            <button style={button} onClick={() => setEditando({})}>
              ➕ Nova Despesa
            </button>
          </div>

          {loading ? (
            <p style={centerText}>Carregando despesas...</p>
          ) : despesas.length === 0 ? (
            <p style={centerText}>Nenhuma despesa cadastrada.</p>
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
                  {despesas.map((d) => (
                    <tr key={d.id}>
                      <td style={td}>{d.tipo}</td>
                      <td style={td}>{d.placa}</td>
                      <td style={td}>{formatData(d.data)}</td>
                      <td style={td}>{formatCurrency(d.valor)}</td>
                      <td style={td}>{d.descricao}</td>
                      <td style={td}>
                        <button style={editBtn} onClick={() => setEditando(d)}>
                          ✏️
                        </button>
                        <button
                          style={deleteBtn}
                          onClick={() => {
                            if (window.confirm("Confirma exclusão?")) {
                              deleteDespesa(d.id);
                            }
                          }}
                          disabled={loadingCrud}
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

const container = {
  maxWidth: 1000,
  margin: "0 auto",
  padding: 20,
};

const title = {
  fontSize: 24,
  marginBottom: 20,
};

const topBar = {
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: 10,
};

const centerText = {
  textAlign: "center",
  marginTop: 40,
  color: "#777",
};

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

const td = {
  padding: 10,
  borderBottom: "1px solid #eee",
};

const button = {
  padding: "8px 12px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14,
};

const editBtn = {
  ...button,
  backgroundColor: "#ffc107",
  marginRight: 5,
};

const deleteBtn = {
  ...button,
  backgroundColor: "#dc3545",
};
