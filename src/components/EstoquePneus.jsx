import React, { useState } from "react";
import { usePneusEstoque } from "../hooks/usePneusEstoque";

export function EstoquePneus({
  medidasAceitas = [],
  onArrastarPneu,
  onCadastrarPneu, // opcional
}) {
  const { pneusEstoque, loading, error } = usePneusEstoque(medidasAceitas);

  const [novoPneu, setNovoPneu] = useState({
    marca: "",
    modelo: "",
    medida: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoPneu((prev) => ({ ...prev, [name]: value }));
  };

  const handleCadastrar = () => {
    const { marca, modelo, medida } = novoPneu;
    if (!marca.trim() || !modelo.trim() || !medida.trim()) {
      alert("Preencha todos os campos para cadastrar.");
      return;
    }

    const novoPneuObj = {
      id: Date.now().toString(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      medida: medida.trim(),
    };

    // Aqui, se quiser salvar no backend, chama callback
    if (onCadastrarPneu) {
      onCadastrarPneu(novoPneuObj);
    }

    setNovoPneu({ marca: "", modelo: "", medida: "" });
  };

  if (loading) return <p>Carregando pneus do estoque...</p>;
  if (error) return <p>Erro ao carregar pneus: {error}</p>;

  return (
    <div style={{ border: "1px solid #ccc", padding: 12, maxHeight: 350, overflowY: "auto" }}>
      <h3>Estoque Pneus Disponíveis</h3>

      <div
        style={{
          border: "1px solid #888",
          padding: 10,
          marginBottom: 12,
          borderRadius: 4,
          backgroundColor: "#fafafa",
        }}
      >
        <h4>Cadastrar Novo Pneu</h4>
        <input
          type="text"
          name="marca"
          placeholder="Marca"
          value={novoPneu.marca}
          onChange={handleChange}
          style={{ width: "30%", marginRight: 8, padding: 6 }}
        />
        <input
          type="text"
          name="modelo"
          placeholder="Modelo"
          value={novoPneu.modelo}
          onChange={handleChange}
          style={{ width: "40%", marginRight: 8, padding: 6 }}
        />
        <input
          type="text"
          name="medida"
          placeholder="Medida"
          value={novoPneu.medida}
          onChange={handleChange}
          style={{ width: "20%", marginRight: 8, padding: 6 }}
        />
        <button
          onClick={handleCadastrar}
          style={{
            padding: "6px 12px",
            backgroundColor: "#2c7be5",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Cadastrar
        </button>
      </div>

      {pneusEstoque.length === 0 && <p>Nenhum pneu disponível com medida aceita.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {pneusEstoque.map((pneu) => (
          <li
            key={pneu.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", JSON.stringify(pneu));
              if (onArrastarPneu) onArrastarPneu(pneu);
            }}
            style={{
              border: "1px solid #aaa",
              padding: 8,
              marginBottom: 6,
              cursor: "grab",
              backgroundColor: "#f0f0f0",
            }}
            title={`Marca: ${pneu.marca} | Modelo: ${pneu.modelo} | Medida: ${pneu.medida}`}
          >
            {pneu.marca} {pneu.modelo} - {pneu.medida}
          </li>
        ))}
      </ul>
    </div>
  );
}
