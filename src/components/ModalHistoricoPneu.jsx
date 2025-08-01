import React, { useState, useEffect } from "react";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  backdropFilter: "blur(4px)", // leve desfoque atrás do modal
  WebkitBackdropFilter: "blur(4px)",
};

const contentStyle = {
  backgroundColor: "#fff",
  padding: "24px 32px",
  borderRadius: 12,
  maxWidth: 560,
  width: "70%",
  maxHeight: "85vh",
  boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
  position: "relative",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen",
  color: "#2E2E2E",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const titleStyle = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  color: "#1F2937", // cinza escuro
};

const labelStyle = {
  fontWeight: 600,
  fontSize: 14,
  color: "#4B5563",
  marginBottom: 6,
  display: "block",
};

const inputStyle = {
  width: "90%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1.5px solid #D1D5DB", // cinza claro
  fontSize: 16,
  fontWeight: 500,
  color: "#111827",
  transition: "border-color 0.2s ease",
  outline: "none",
};

const inputFocusStyle = {
  borderColor: "#2563EB", // azul FuelTrack
  boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.3)",
};

const spanStyle = {
  marginLeft: 8,
  fontWeight: "600",
  fontSize: 16,
  color: "#111827",
};

const buttonStyle = {
  marginTop: 16,
  padding: "12px 24px",
  backgroundColor: "#2563EB",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
  alignSelf: "flex-start",
  transition: "background-color 0.3s ease",
  margin: "0 auto",
};

const buttonDisabledStyle = {
  backgroundColor: "#93C5FD",
  cursor: "not-allowed",
};

export function ModalHistoricoPneu({
  aberto,
  pneu,
  onFechar,
  salvarMarcaPneu,
  marcasExistentes = [], // lista de marcas já usadas
}) {
  const [marcaFogo, setMarcaFogo] = useState("");
  const [editavel, setEditavel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (pneu) {
      if (pneu.marcaFogo) {
        setMarcaFogo(pneu.marcaFogo);
        setEditavel(false);
      } else {
        setMarcaFogo("NP"); // já começa com NP
        setEditavel(true);
      }
    }
  }, [pneu]);

  if (!aberto || !pneu) return null;

  const handleChange = (e) => {
    let val = e.target.value.toUpperCase();

    if (!val.startsWith("NP")) {
      val = "NP" + val.replace(/[^0-9]/g, "");
    } else {
      const numeros = val.slice(2).replace(/[^0-9]/g, "");
      val = "NP" + numeros;
    }
    setMarcaFogo(val);
  };

  const handleSalvar = async () => {
    if (!marcaFogo || marcaFogo.length < 4) {
      alert("Informe a marca/fogo no formato NP + número (ex: NP01).");
      return;
    }

    // Verificar duplicidade ignorando maiúsculas/minúsculas
    const existeDuplicado = marcasExistentes.some(
      (marca) => marca.toUpperCase() === marcaFogo.toUpperCase()
    );

    // Se a marca duplicada for a mesma do pneu atual, permitir salvar (editar sem mudar)
    if (existeDuplicado && pneu.marcaFogo?.toUpperCase() !== marcaFogo.toUpperCase()) {
      alert("Já existe uma marca/fogo igual cadastrada. Escolha outra.");
      return;
    }

    setLoading(true);
    try {
      await salvarMarcaPneu(pneu.id, marcaFogo);
      setEditavel(false);
      alert("Marca cadastrada com sucesso.");
    } catch (error) {
      alert("Erro ao salvar marca: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onFechar} aria-modal="true" role="dialog">
      <div
        style={contentStyle}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <h2 style={titleStyle}>Histórico do Pneu</h2>

        <p>
          <strong>Marca Fogo:</strong> {pneu.marcaFogo || "-"}
        </p>
        <p>
          <strong>Marca:</strong> {pneu.marca || "-"}
        </p>
        <p>
          <strong>Modelo:</strong> {pneu.modelo || "-"}
        </p>
        <p>
          <strong>Medida:</strong> {pneu.medida || "-"}
        </p>

        <hr style={{ borderColor: "#E5E7EB", margin: "16px 0" }} />

        <label style={labelStyle} htmlFor="marcaFogoInput">
          Marca / Fogo do Pneu:
        </label>

        {editavel ? (
          <input
            id="marcaFogoInput"
            type="text"
            value={marcaFogo}
            onChange={handleChange}
            disabled={loading}
            style={{
              ...inputStyle,
              ...(inputFocused ? inputFocusStyle : {}),
            }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            autoFocus
            maxLength={6} // ex: NP + 4 números
          />
        ) : (
          <span style={spanStyle}>{marcaFogo}</span>
        )}

        {editavel && (
          <button
            onClick={handleSalvar}
            disabled={loading}
            style={{
              ...buttonStyle,
              ...(loading ? buttonDisabledStyle : {}),
            }}
          >
            {loading ? "Salvando..." : "Salvar Marca"}
          </button>
        )}
      </div>
    </div>
  );
}