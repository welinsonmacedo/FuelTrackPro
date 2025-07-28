/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { usePneus } from "../hooks/usePneus";

const statusOptions = ["Novo", "Recapado", "Usado", "Em Manutenção"];
const marcasPneuOptions = ["Pirelli", "Michelin", "Goodyear", "Continental", "Outra"];

export function CadastroPneu() {
  const { addPneu, fetchPneus } = usePneus();

  const [marcaPneu, setMarcaPneu] = useState("");
  const [marcaFogo, setMarcaFogo] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [especificacoes, setEspecificacoes] = useState("");
  const [status, setStatus] = useState(statusOptions[0]);
  const [posicao, setPosicao] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!marcaPneu || !posicao || !status) {
      setError("Preencha os campos: Marca do pneu, posição e status.");
      return;
    }

    setLoading(true);

    try {
      await addPneu(
        { marcaPneu, marcaFogo, fornecedor, especificacoes, status, },
        fotoFile
      );
      setMsg("Pneu salvo com sucesso!");
      // Resetar campos
      setMarcaPneu("");
      setMarcaFogo("");
      setFornecedor("");
      setEspecificacoes("");
      setStatus(statusOptions[0]);
     
      setFotoFile(null);
      setFotoPreview(null);
      fetchPneus();
    } catch (error) {
      setError("Erro ao salvar pneu. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: "1.8px solid #ccc",
    fontSize: 16,
    transition: "border-color 0.3s ease",
  };

  const inputFocusStyle = {
    borderColor: "#2c7be5",
    outline: "none",
    boxShadow: "0 0 6px rgba(44, 123, 229, 0.5)",
  };

  const labelStyle = {
    fontWeight: "600",
    color: "#34495e",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "40px auto",
        padding: 24,
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        borderRadius: 12,
        backgroundColor: "#fff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 24, color: "#2c3e50", textAlign: "center" }}>
        Cadastro de Pneu
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        {/* Marca do Pneu */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle} htmlFor="marcaPneu">
            Marca do Pneu*:
          </label>
          <select
            id="marcaPneu"
            value={marcaPneu}
            onChange={(e) => setMarcaPneu(e.target.value)}
            required
            style={{
              ...inputStyle,
              ...(marcaPneu ? inputFocusStyle : {}),
              appearance: "none",
              backgroundColor: "#f9faff",
              cursor: "pointer",
            }}
          >
            <option value="" disabled>
              Selecione a marca
            </option>
            {marcasPneuOptions.map((marca) => (
              <option key={marca} value={marca}>
                {marca}
              </option>
            ))}
          </select>
        </div>

        {/* Marca da Fogo */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle} htmlFor="marcaFogo">
            Marca da Fogo:
          </label>
          <input
            type="text"
            id="marcaFogo"
            value={marcaFogo}
            onChange={(e) => setMarcaFogo(e.target.value)}
            placeholder="Marca relacionada à foto (opcional)"
            style={{ ...inputStyle, backgroundColor: "#f9faff" }}
          />
        </div>

       

        {/* Fornecedor */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle} htmlFor="fornecedor">
            Fornecedor:
          </label>
          <input
            type="text"
            id="fornecedor"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
            style={{ ...inputStyle, backgroundColor: "#f9faff" }}
          />
        </div>

        {/* Especificações */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle} htmlFor="especificacoes">
            Especificações:
          </label>
          <textarea
            id="especificacoes"
            value={especificacoes}
            onChange={(e) => setEspecificacoes(e.target.value)}
            rows={4}
            style={{
              ...inputStyle,
              backgroundColor: "#f9faff",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Status */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle} htmlFor="status">
            Status*:
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            style={{
              ...inputStyle,
              ...(status ? inputFocusStyle : {}),
              appearance: "none",
              backgroundColor: "#f9faff",
              cursor: "pointer",
            }}
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

      
     

        {/* Mensagens */}
        {error && (
          <p
            style={{
              color: "#e74c3c",
              fontWeight: "600",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
        {msg && (
          <p
            style={{
              color: "#27ae60",
              fontWeight: "600",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {msg}
          </p>
        )}

        {/* Botão */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: 18,
            backgroundColor: loading ? "#8aa8e8" : "#2c7be5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "default" : "pointer",
            boxShadow: "0 4px 12px rgba(44,123,229,0.5)",
            transition: "background-color 0.3s ease",
          }}
        >
          {loading ? "Salvando..." : "Salvar Pneu"}
        </button>
      </form>
    </div>
  );
}
