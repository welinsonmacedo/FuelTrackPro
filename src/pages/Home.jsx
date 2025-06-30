import React from "react";
import Card from "../components/Card";
import colors from "../styles/colors";

const Home = ({ usuario }) => {
  return (
    <div
      style={{
        padding: 20,
        backgroundColor: colors.background,
        color: colors.textPrimary,
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ color: colors.primary }}>Olá, {usuario?.nome || "Usuário"}!</h1>

      <section style={{ marginTop: 30 }}>
        <h2>Resumo Rápido</h2>
        <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
          <Card
            title="Consumo Médio"
            style={{ backgroundColor: colors.primaryDark, color: colors.background, flex: 1 }}
          >
            12,5 km/l
          </Card>

          <Card
            title="Viagens Recentes"
            style={{ backgroundColor: colors.accent, color: colors.background, flex: 1 }}
          >
            5 concluídas
          </Card>

          <Card
            title="Alertas"
            style={{ backgroundColor: colors.success, color: colors.background, flex: 1 }}
          >
            0 pendentes
          </Card>
        </div>
      </section>

      <section style={{ marginTop: 40 }}>
        <h2>Principais Ações</h2>
        <div style={{ display: "flex", gap: 15, marginTop: 10 }}>
          <button
            style={{
              flex: 1,
              padding: "15px",
              backgroundColor: colors.primary,
              color: colors.background,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Nova Viagem
          </button>
          <button
            style={{
              flex: 1,
              padding: "15px",
              backgroundColor: colors.primaryDark,
              color: colors.background,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Abastecimentos
          </button>
          <button
            style={{
              flex: 1,
              padding: "15px",
              backgroundColor: colors.accent,
              color: colors.background,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Relatórios
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
