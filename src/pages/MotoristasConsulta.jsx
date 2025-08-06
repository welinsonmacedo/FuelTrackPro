import React, { useState } from "react";
import { useMotoristas } from "../hooks/useMotoristas";
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>👷 Consulta de Motoristas</h2>
        <input
          placeholder="🔍 Buscar por nome, CNH ou CPF..."
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
          <p style={styles.message}>Carregando motoristas...</p>
        ) : filtrados.length === 0 ? (
          <p style={styles.message}>Nenhum motorista encontrado.</p>
        ) : (
          filtrados.map((m) => (
            <div key={m.id} style={styles.card}>
              <h3 style={styles.cardTitle}>👷 {m.nome}</h3>
              <div style={styles.cardContent}>
                <InfoRow label="CNH" value={m.cnh || "-"} />
                <InfoRow label="Categoria" value={m.categoria || "-"} />
                <InfoRow
                  label="Data Emissão CNH"
                  value={formatData(m.dataEmissao || "-")}
                />
                <InfoRow
                  label="Data Validade CNH"
                  value={formatData(m.dataValidade || "-")}
                />
                <InfoRow label="CPF" value={m.cpf || "-"} />
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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    zIndex: 10,
    paddingBottom: "1rem",
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
    minWidth:"100%"
    
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

export default MotoristasConsulta;
