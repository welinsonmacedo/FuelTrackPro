import React, { useState } from "react";
import { useMotoristas } from "../hooks/useMotoristas"; // seu hook para motoristas
import { SearchInput } from "../components/SearchInput";
import Card from "../components/Card";
import { InfoRow } from "../components/InfoRow";
import { formatData } from "../utils/data";

const MotoristasConsulta = () => {
  const { motoristas = [], loading } = useMotoristas();
  const [busca, setBusca] = useState("");

  const filtrados = motoristas.filter((m) =>
    (m.nome?.toLowerCase().includes(busca.toLowerCase()) ||
     m.cnh?.toLowerCase().includes(busca.toLowerCase()) ||
     m.cpf?.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2rem",
        height: "80vh",          // define altura fixa
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
        <h2 style={{ marginBottom: "1rem" }}>👷 Consulta de Motoristas</h2>

        <SearchInput
          placeholder="Buscar por nome, CNH ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div
        style={{
          overflowY: "auto",
          marginTop: "1rem",
          flexGrow: 1,
        }}
      >
        {loading ? (
          <p>Carregando motoristas...</p>
        ) : filtrados.length === 0 ? (
          <p>Nenhum motorista encontrado.</p>
        ) : (
          filtrados.map((m) => (
            <Card key={m.id} style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                👷 {m.nome}
              </h3>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <InfoRow label="CNH" value={m.cnh || "-"} />
                <InfoRow label="Categoria" value={m.categoria || "-"} />
                <InfoRow label="Data Emissão CNH" value={formatData( m.dataEmissao || "-")} />
                <InfoRow label="Data Validade CNH" value={formatData( m.dataValidade || "-")} />
                <InfoRow label="CPF" value={m.cpf || "-"} />
              
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MotoristasConsulta;
