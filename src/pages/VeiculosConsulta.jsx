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
      v.placa?.toLowerCase().includes(busca.toLowerCase()) ||
      v.modelo?.toLowerCase().includes(busca.toLowerCase()) ||
      v.marca?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🚛 Consulta de Veículos</h2>
        <input
          placeholder="🔍 Buscar por placa, marca ou modelo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
           style={{
            marginBottom: "20px",
            padding: "12px 16px",
            width: "100%",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            outline: "none",
            transition: "border 0.2s ease-in-out",
          }}
        />
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={styles.message}>Carregando veículos...</p>
        ) : filtrados.length === 0 ? (
          <p style={styles.message}>Nenhum veículo encontrado.</p>
        ) : (
          filtrados.map((v) => (
            <div key={v.id} style={styles.card}>
              <h3 style={styles.cardTitle}>
                🚗 {v.placa} - {v.marca} {v.modelo} ({v.ano})
              </h3>
              <div style={styles.cardContent}>
                <InfoRow label="Tipo" value={v.tipo || "-"} />
                <InfoRow label="Chassi" value={v.chassi || "-"} />
                <InfoRow label="Renavam" value={v.renavam || "-"} />
                <InfoRow label="Ano" value={v.ano || "-"} />
                <InfoRow label="Cor" value={v.cor || "-"} />
                <InfoRow label="Filial" value={v.filial || "-"} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "100%",
    margin: "0 auto",
    padding: "2rem",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    paddingBottom: "1rem",
    zIndex: 10,
    borderBottom: "1px solid #ddd",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "1rem",
    color: "#111827",
  },
  content: {
    overflowY: "auto",
    marginTop: "1rem",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#f9fafb",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginBottom: "1.5rem",
    transition: "transform 0.2s ease-in-out",
  },
  cardTitle: {
    fontSize: "1.2rem",
    marginBottom: "1rem",
    color: "#1f2937",
  },
  cardContent: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  },
  message: {
    fontStyle: "italic",
    color: "#6b7280",
    padding: "1rem",
  },
};

export default VeiculosConsulta;
