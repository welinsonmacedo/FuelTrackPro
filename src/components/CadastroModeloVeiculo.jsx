import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

const defaultPneu = { posicao: "", medida: "" };

const CadastroModeloVeiculo = ({ modeloId, onSalvo }) => {
  const [modelo, setModelo] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [configPneus, setConfigPneus] = useState([defaultPneu]);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Se for editar, carrega dados do modelo
  useEffect(() => {
    if (!modeloId) return;
    const fetchModelo = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "modelosVeiculos", modeloId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setModelo(data.modelo || "");
          setFabricante(data.fabricante || "");
          setTipo(data.tipo || "");
          setDescricao(data.descricao || "");
          setConfigPneus(data.configPneus && data.configPneus.length > 0 ? data.configPneus : [defaultPneu]);
        } else {
          setErro("Modelo não encontrado.");
        }
      } catch (e) {
        setErro("Erro ao carregar modelo: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchModelo();
  }, [modeloId]);

  const handleAdicionarPneu = () => {
    setConfigPneus([...configPneus, defaultPneu]);
  };

  const handleRemoverPneu = (index) => {
    setConfigPneus(configPneus.filter((_, i) => i !== index));
  };

  const handlePneuChange = (index, campo, valor) => {
    const novosPneus = [...configPneus];
    novosPneus[index] = { ...novosPneus[index], [campo]: valor };
    setConfigPneus(novosPneus);
  };

  const handleSalvar = async () => {
    if (!modelo.trim() || !fabricante.trim() || !tipo.trim()) {
      setErro("Preencha fabricante, modelo e tipo.");
      return;
    }
    if (
      configPneus.some(
        (p) => !p.posicao.trim() || !p.medida.trim()
      )
    ) {
      setErro("Preencha todas as posições e medidas dos pneus.");
      return;
    }
    setErro(null);
    setLoading(true);

    const dados = {
      modelo: modelo.trim(),
      fabricante: fabricante.trim(),
      tipo: tipo.trim(),
      descricao: descricao.trim(),
      configPneus,
      updatedAt: new Date(),
    };

    try {
      if (modeloId) {
        // Atualizar existente
        const docRef = doc(db, "modelosVeiculos", modeloId);
        await updateDoc(docRef, dados);
      } else {
        // Criar novo
        dados.createdAt = new Date();
        await addDoc(collection(db, "modelosVeiculos"), dados);
      }
      setLoading(false);
      if (onSalvo) onSalvo();
      alert("Modelo salvo com sucesso!");
    } catch (e) {
      setLoading(false);
      setErro("Erro ao salvar modelo: " + e.message);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <h2>{modeloId ? "Editar Modelo de Veículo" : "Cadastrar Modelo de Veículo"}</h2>

      {erro && (
        <p style={{ color: "red", marginBottom: 10 }}>{erro}</p>
      )}

      <div style={{ marginBottom: 10 }}>
        <label>Fabricante:</label>
        <input
          type="text"
          value={fabricante}
          onChange={(e) => setFabricante(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Modelo:</label>
        <input
          type="text"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Tipo:</label>
        <input
          type="text"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          placeholder="Ex: Caminhão, Carreta"
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Descrição:</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={{ width: "100%", padding: 8, minHeight: 60 }}
        />
      </div>

      <h3>Configuração dos Pneus Padrão</h3>

      {configPneus.map((pneu, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 10,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Posição"
            value={pneu.posicao}
            onChange={(e) =>
              handlePneuChange(index, "posicao", e.target.value)
            }
            style={{ flex: 1, padding: 8 }}
          />
          <input
            type="text"
            placeholder="Medida"
            value={pneu.medida}
            onChange={(e) =>
              handlePneuChange(index, "medida", e.target.value)
            }
            style={{ flex: 1, padding: 8 }}
          />
          <button
            type="button"
            onClick={() => handleRemoverPneu(index)}
            style={{
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            X
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdicionarPneu}
        style={{
          marginBottom: 20,
          padding: "8px 12px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        + Adicionar Pneu
      </button>

      <div>
        <button
          onClick={handleSalvar}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          {modeloId ? "Atualizar Modelo" : "Cadastrar Modelo"}
        </button>
      </div>
    </div>
  );
};

export default CadastroModeloVeiculo;
