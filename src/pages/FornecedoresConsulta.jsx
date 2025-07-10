import React, { useState } from "react";
import { useFornecedores } from "../hooks/useFornecedores"; // hook similar ao useVeiculos
import { SearchInput } from "../components/SearchInput";
import Card from "../components/Card";
import { InfoRow } from "../components/InfoRow";

const FornecedoresConsulta = () => {
  const { fornecedores = [], loading } = useFornecedores();
  const [busca, setBusca] = useState("");

  const filtrados = fornecedores.filter(
    (f) =>
      f.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      f.cnpj?.toLowerCase().includes(busca.toLowerCase()) ||
      f.telefone?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2rem",
        height: "80vh",      // limita altura total
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
        <h2 style={{ marginBottom: "1rem" }}>🏢 Consulta de Fornecedores</h2>

        <SearchInput
          placeholder="Buscar por nome, CNPJ ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div
        style={{
          overflowY: "auto",
          marginTop: "1rem",
          flexGrow: 1,     // ocupa espaço restante
        }}
      >
        {loading ? (
          <p>Carregando fornecedores...</p>
        ) : filtrados.length === 0 ? (
          <p>Nenhum fornecedor encontrado.</p>
        ) : (
          filtrados.map((f) => (
            <Card key={f.id} style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                🏢 {f.nome}
              </h3>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <InfoRow label="CNPJ" value={f.cnpj || "-"} />
                <InfoRow label="Telefone" value={f.telefone || "-"} />
                <InfoRow label="Endereço" value={f.endereco || "-"} />
                <InfoRow label="Email" value={f.email || "-"} />
                <InfoRow label="Cidade" value={f.cidade || "-"} />
                <InfoRow label="Estado" value={f.estado || "-"} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FornecedoresConsulta;
