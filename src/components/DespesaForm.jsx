import React, { useState } from "react";
import { useFornecedores } from "../hooks/useFornecedores";
import { useVeiculos } from "../hooks/useVeiculos";
import { formatCurrency } from "../utils/data";

export default function DespesaForm({ initialData = {}, onSubmit, onCancel }) {
  // Inicializa o estado data com initialData.data, se existir, convertendo para yyyy-MM-dd para o input
  const [data, setData] = useState(() => {
    if (!initialData.data) return "";
    // Se for Timestamp do Firestore, converte para Date
    let d = initialData.data;
    if (d.toDate) d = d.toDate();
    // Formata para yyyy-MM-dd (input date padrão)
    return d.toISOString().slice(0, 10);
  });

  const [itens, setItens] = useState(initialData.itens || []);
  const { fornecedores } = useFornecedores();
  const { veiculos } = useVeiculos();

  const handleChange = (index, field, value) => {
    const novos = [...itens];
    novos[index][field] = value;

    if (["valorUnitario", "quantidade", "desconto"].includes(field)) {
      const val = parseFloat(novos[index].valorUnitario) || 0;
      const qtd = parseFloat(novos[index].quantidade) || 0;
      const desc = parseFloat(novos[index].desconto) || 0;
      novos[index].valorTotal = val * qtd - desc;
    }

    setItens(novos);
  };

  const adicionarItem = () => {
    const { tipo, fornecedor } = itens[0] || {};
    setItens((prev) => [
      ...prev,
      {
        tipo: tipo || "Compra",
        fornecedor: fornecedor || "",
        placa: "",
        descricao: "",
        valorUnitario: "",
        quantidade: "",
        desconto: "",
        valorTotal: 0,
      },
    ]);
  };

  const removerItem = (index) => {
    const novos = [...itens];
    novos.splice(index, 1);
    setItens(novos);
  };

  const totalGeral = itens.reduce((acc, item) => acc + (item.valorTotal || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Converte data de string yyyy-MM-dd para Date
    const dataDate = data ? new Date(data + "T00:00:00") : null;

    const { tipo, fornecedor } = itens[0] || {};
    const itensFinal = itens.map((item, idx) =>
      idx === 0 ? item : { ...item, tipo, fornecedor }
    );

    onSubmit({ ...initialData, data: dataDate, itens: itensFinal, total: totalGeral });
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3 style={{ textAlign: "center", marginBottom: 20 }}>📄 Cadastro de Despesa</h3>

      {/* Campo de data */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <label htmlFor="dataDespesa" style={{ marginRight: 10, fontWeight: "bold" }}>
          Data da Despesa:
        </label>
        <input
          type="date"
          id="dataDespesa"
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: "1px solid #ccc" }}
          required
        />
      </div>

      {itens.map((item, index) => (
        <div key={index} style={itemBox}>
          <div style={row}>
            {index === 0 ? (
              <>
                <select
                  value={item.tipo}
                  onChange={(e) => handleChange(index, "tipo", e.target.value)}
                  style={input}
                >
                  <option value="Compra">Compra</option>
                  <option value="Serviço">Serviço</option>
                </select>

                <select
                  value={item.fornecedor}
                  onChange={(e) => handleChange(index, "fornecedor", e.target.value)}
                  style={input}
                >
                  <option value="">Fornecedor</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.nome}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <input
                type="text"
                readOnly
                value={`Tipo: ${itens[0]?.tipo || "Compra"} | Fornecedor: ${itens[0]?.fornecedor || "-"}`}
                style={{ ...input, fontStyle: "italic", backgroundColor: "#f1f1f1", flex: "1 1 100%" }}
              />
            )}

            <select
              value={item.placa || ""}
              onChange={(e) => handleChange(index, "placa", e.target.value)}
              style={input}
            >
              <option value="">Placa</option>
              {veiculos.map((v) => (
                <option key={v.id} value={v.placa}>
                  {v.placa}
                </option>
              ))}
            </select>
          </div>

          <div style={row}>
            <input
              type="text"
              placeholder="Descrição"
              value={item.descricao}
              onChange={(e) => handleChange(index, "descricao", e.target.value)}
              style={input}
            />
            <input
              type="number"
              placeholder="Valor Unitário"
              value={item.valorUnitario}
              onChange={(e) => handleChange(index, "valorUnitario", e.target.value)}
              style={input}
            />
            <input
              type="number"
              placeholder="Qtd"
              value={item.quantidade}
              onChange={(e) => handleChange(index, "quantidade", e.target.value)}
              style={input}
            />
            <input
              type="number"
              placeholder="Desconto"
              value={item.desconto}
              onChange={(e) => handleChange(index, "desconto", e.target.value)}
              style={input}
            />
            <input
              type="text"
              readOnly
              value={formatCurrency(item.valorTotal)}
              style={{ ...input, background: "#f9f9f9", fontWeight: "bold" }}
            />
            <button
              type="button"
              onClick={() => removerItem(index)}
              style={{ ...button, backgroundColor: "#dc3545" }}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}

      <div style={row}>
        <button type="button" onClick={adicionarItem} style={button}>
          ➕ Adicionar Item
        </button>
        <div style={{ marginLeft: "auto", fontSize: 16, fontWeight: "bold" }}>
          Total Geral: {formatCurrency(totalGeral)}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button type="submit" style={button}>
          💾 Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ ...button, backgroundColor: "#777", marginLeft: 10 }}
        >
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
}

// Estilos mantidos
const formStyle = {
  maxWidth: 900,
  margin: "0 auto",
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

const row = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 10,
};

const input = {
  flex: "1 1 150px",
  padding: 8,
  borderRadius: 5,
  border: "1px solid #ccc",
};

const button = {
  padding: "8px 12px",
  borderRadius: 5,
  border: "none",
  backgroundColor: "#007bff",
  color: "#fff",
  cursor: "pointer",
};

const itemBox = {
  border: "1px solid #eee",
  padding: 10,
  borderRadius: 6,
  marginBottom: 10,
  backgroundColor: "#fafafa",
};
