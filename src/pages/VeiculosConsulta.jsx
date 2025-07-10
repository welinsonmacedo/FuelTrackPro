import React, { useState } from "react";
import { useVeiculos } from "../hooks/useVeiculos";
import { SearchInput } from "../components/SearchInput";
import Card from "../components/Card";
import { InfoRow } from "../components/InfoRow";

const VeiculosConsulta = () => {
  const { veiculos = [], loading } = useVeiculos();
  const [busca, setBusca] = useState("");

  const filtrados = veiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(busca.toLowerCase()) ||
      v.modelo?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2rem",
        height: "80vh",      // altura total para o container
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          paddingBottom: "1rem",
          zIndex: 10,
          borderBottom: "1px solid #ccc",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>🚛 Consulta de Veículos</h2>

        <SearchInput
          placeholder="Buscar por placa, marca ou modelo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div
        style={{
          overflowY: "auto",
          marginTop: "1rem",
          flexGrow: 1,       // faz a lista ocupar o espaço restante
        }}
      >
        {loading ? (
          <p>Carregando veículos...</p>
        ) : filtrados.length === 0 ? (
          <p>Nenhum veículo encontrado.</p>
        ) : (
          filtrados.map((v) => (
            <Card key={v.id} style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                🚗 {v.placa} - {v.marca} {v.modelo} ({v.ano})
              </h3>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <InfoRow label="Tipo" value={v.tipo} />
                <InfoRow label="Chassi" value={v.chassi} />
                <InfoRow label="Renavam" value={v.renavam} />
                <InfoRow label="Ano" value={v.ano} />
                <InfoRow label="Cor" value={v.cor} />
                <InfoRow label="Filial" value={v.filial} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default VeiculosConsulta;
