/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useVeiculos } from "../hooks/useVeiculos";
import { useModelosVeiculos } from "../hooks/useModelosVeiculos";

const statusOptions = ["Normal", "Desgastado", "Trocar", "Em manutenção","Novo"];

const PneusVeiculo = () => {
  const { veiculos, loading, error, editarVeiculo } = useVeiculos();
  const { modelos } = useModelosVeiculos();

  const [placaSelecionada, setPlacaSelecionada] = useState("");
  const [pneus, setPneus] = useState([]);
  const [modeloAtual, setModeloAtual] = useState(null);

  const [novoPneu, setNovoPneu] = useState({
    posicao: "",
    marca: "",
    modelo: "",
    medida: "",
    dataInstalacao: "",
    kmInstalacao: "",
    status: "Normal",
  });

  // Define placa selecionada automaticamente quando veículos carregarem
  useEffect(() => {
    if (veiculos.length > 0 && !placaSelecionada) {
      setPlacaSelecionada(veiculos[0].placa);
    }
  }, [veiculos, placaSelecionada]);

  // Atualiza pneus e modelo atual quando placa, veículos ou modelos mudam
  useEffect(() => {
    const veiculo = veiculos.find((v) => v.placa === placaSelecionada);
    if (veiculo?.pneus) setPneus(veiculo.pneus);
    else setPneus([]);

    const modeloConfig = modelos.find(
      (m) => m.modelo?.toLowerCase() === veiculo?.modelo?.toLowerCase()
    );
    setModeloAtual(modeloConfig || null);
  }, [placaSelecionada, veiculos, modelos]);

  // Extrai listas únicas de posições e medidas do configPneus do modeloAtual
  const posicoesPneus = modeloAtual
    ? Array.from(new Set(modeloAtual.configPneus?.map((p) => p.posicao) || []))
    : [];

  const medidasPneus = modeloAtual
    ? Array.from(new Set(modeloAtual.configPneus?.map((p) => p.medida) || []))
    : [];

  const handleStatusChange = async (posicao, novoStatus) => {
    const pneusAtualizados = pneus.map((p) =>
      p.posicao === posicao ? { ...p, status: novoStatus } : p
    );
    setPneus(pneusAtualizados);
    try {
      await editarVeiculo(
        veiculos.find((v) => v.placa === placaSelecionada).id,
        { pneus: pneusAtualizados }
      );
    } catch (error) {
      alert("Erro ao atualizar status do pneu.");
      console.error(error);
    }
  };

  const handleNovoPneuChange = (e) => {
    const { name, value } = e.target;
    setNovoPneu((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdicionarPneu = async (e) => {
    e.preventDefault();

    if (!novoPneu.posicao || !novoPneu.medida || !novoPneu.dataInstalacao) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (pneus.find((p) => p.posicao === novoPneu.posicao)) {
      alert("Já existe um pneu cadastrado nesta posição.");
      return;
    }

    const novoPneuFormatado = {
      ...novoPneu,
      kmInstalacao: novoPneu.kmInstalacao ? Number(novoPneu.kmInstalacao) : null,
    };

    const pneusAtualizados = [...pneus, novoPneuFormatado];
    setPneus(pneusAtualizados);

    try {
      await editarVeiculo(
        veiculos.find((v) => v.placa === placaSelecionada).id,
        { pneus: pneusAtualizados }
      );
      setNovoPneu({
        posicao: "",
        marca: "",
        modelo: "",
        medida: "",
        dataInstalacao: "",
        kmInstalacao: "",
        status: "Normal",
      });
    } catch (error) {
      alert("Erro ao adicionar pneu.");
      console.error(error);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 30,
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 30, color: "#2c3e50" }}>
        Controle de Pneus
      </h2>

      <label
        htmlFor="selectVeiculo"
        style={{
          display: "block",
          fontWeight: "600",
          marginBottom: 8,
          fontSize: 14,
          color: "#34495e",
        }}
      >
        Selecione o veículo:
      </label>
      <select
        id="selectVeiculo"
        value={placaSelecionada}
        onChange={(e) => setPlacaSelecionada(e.target.value)}
        style={{
          padding: "12px 15px",
          marginBottom: 30,
          width: "100%",
          borderRadius: 8,
          border: "1.5px solid #d1d5db",
          fontSize: 16,
          transition: "border-color 0.3s",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#3498db")}
        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
      >
        {veiculos.map((v) => (
          <option key={v.id} value={v.placa}>
            {v.placa} - {v.modelo}
          </option>
        ))}
      </select>

      {modeloAtual && (
        <>
          <h3
            style={{
              color: "#2c3e50",
              borderBottom: "2px solid #3498db",
              paddingBottom: 8,
              marginBottom: 18,
            }}
          >
            Posições Esperadas
          </h3>
          <ul
            style={{
              listStyle: "none",
              paddingLeft: 0,
              marginBottom: 40,
              fontSize: 16,
              color: "#34495e",
            }}
          >
            {posicoesPneus.length > 0 ? (
              posicoesPneus.map((pos) => (
                <li
                  key={pos}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#ecf0f1",
                    borderRadius: 6,
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "600",
                    boxShadow:
                      "inset 1px 1px 3px rgba(0,0,0,0.05), inset -1px -1px 3px rgba(255,255,255,0.7)",
                  }}
                >
                  <span>{pos}</span>
                  <span style={{ fontWeight: "400", fontStyle: "italic" }}>
                    {pneus.find((p) => p.posicao === pos)?.marca || "[Sem pneu]"}
                  </span>
                </li>
              ))
            ) : (
              <li
                style={{
                  fontStyle: "italic",
                  color: "#7f8c8d",
                  textAlign: "center",
                }}
              >
                Nenhuma posição de pneu definida para esse modelo.
              </li>
            )}
          </ul>
        </>
      )}

      <h3
        style={{
          color: "#2c3e50",
          borderBottom: "2px solid #3498db",
          paddingBottom: 8,
          marginBottom: 18,
        }}
      >
        Adicionar Pneu
      </h3>
      <form onSubmit={handleAdicionarPneu} style={{
    maxWidth: 600,
    margin: "auto",
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
  }}>
        <div style={{ flex: "1 1 48%" }}>
          <label
            htmlFor="posicao"
            style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
          >
            Posição*:
          </label>
          <select
            id="posicao"
            name="posicao"
            value={novoPneu.posicao}
            onChange={handleNovoPneuChange}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1.5px solid #d1d5db",
              fontSize: 15,
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3498db")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            <option value="">Selecione</option>
            {posicoesPneus.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label
            htmlFor="medida"
            style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
          >
            Medida*:
          </label>
          <select
            id="medida"
            name="medida"
            value={novoPneu.medida}
            onChange={handleNovoPneuChange}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1.5px solid #d1d5db",
              fontSize: 15,
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3498db")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            <option value="">Selecione</option>
            {medidasPneus.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          name="marca"
          placeholder="Marca"
          value={novoPneu.marca}
          onChange={handleNovoPneuChange}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            borderRadius: 6,
            border: "1.5px solid #d1d5db",
            fontSize: 15,
            outline: "none",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3498db")}
          onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
        />

        <input
          type="text"
          name="modelo"
          placeholder="Modelo"
          value={novoPneu.modelo}
          onChange={handleNovoPneuChange}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            borderRadius: 6,
            border: "1.5px solid #d1d5db",
            fontSize: 15,
            outline: "none",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3498db")}
          onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
        />

        <input
          type="date"
          name="dataInstalacao"
          value={novoPneu.dataInstalacao}
          onChange={handleNovoPneuChange}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            borderRadius: 6,
            border: "1.5px solid #d1d5db",
            fontSize: 15,
            outline: "none",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3498db")}
          onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
        />

        <input
          type="number"
          name="kmInstalacao"
          placeholder="KM Instalação"
          value={novoPneu.kmInstalacao}
          onChange={handleNovoPneuChange}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            borderRadius: 6,
            border: "1.5px solid #d1d5db",
            fontSize: 15,
            outline: "none",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3498db")}
          onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
        />

        <div style={{ marginBottom: 25 }}>
          <label
            htmlFor="status"
            style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
          >
            Status:
          </label>
          <select
            id="status"
            name="status"
            value={novoPneu.status}
            onChange={handleNovoPneuChange}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1.5px solid #d1d5db",
              fontSize: 15,
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3498db")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          style={{
            padding: 14,
            backgroundColor: "#3498db",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "700",
            fontSize: 16,
            width: "100%",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(52, 152, 219, 0.4)",
            transition: "background-color 0.3s, box-shadow 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2980b9";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(41, 128, 185, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#3498db";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(52, 152, 219, 0.4)";
          }}
        >
          Adicionar Pneu
        </button>
      </form>
    </div>
  );
};

export default PneusVeiculo;
