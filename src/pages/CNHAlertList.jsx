import React from "react";
import { differenceInDays } from "date-fns";
import { useMotoristas } from "../hooks/useMotoristas";

const CNHAlertList = () => {
  const { motoristas = [], loading } = useMotoristas();

  const hoje = new Date();
  const vencidas = [];
  const vencendo = [];

  motoristas.forEach((m) => {
    if (!m.dataValidade) return;

    const validade = m.dataValidade.toDate();
    const diasParaVencer = differenceInDays(validade, hoje);

    if (diasParaVencer < 0) vencidas.push({ ...m, validade });
    else if (diasParaVencer <= 60) vencendo.push({ ...m, validade });
  });

  if (loading) return <p>Carregando motoristas...</p>;

  const containerStyle = {
    maxWidth: 700,
    margin: "20px auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    padding: 20,
    marginBottom: 20,
  };

  const titleStyle = {
    fontWeight: "700",
    fontSize: 22,
    marginBottom: 16,
    color: "#333",
  };

  const listItemStyle = {
    padding: "10px 15px",
    borderRadius: 6,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 16,
  };

  const redStyle = {
    backgroundColor: "#ffe6e6",
    color: "#cc0000",
    fontWeight: "600",
  };

  const orangeStyle = {
    backgroundColor: "#fff4e5",
    color: "#cc8400",
    fontWeight: "600",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>⚠️ CNHs Vencidas</h2>
        {vencidas.length === 0 ? (
          <p style={{ color: "#666" }}>Nenhuma CNH vencida.</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {vencidas.map((m) => (
              <li key={m.id} style={{ ...listItemStyle, ...redStyle }}>
                <span>{m.nome}</span>
                <span>Vencida em {m.validade.toLocaleDateString("pt-BR")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={cardStyle}>
        <h2 style={titleStyle}>🕒 CNHs Vencendo em até 60 dias</h2>
        {vencendo.length === 0 ? (
          <p style={{ color: "#666" }}>Nenhuma CNH prestes a vencer.</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {vencendo.map((m) => (
              <li key={m.id} style={{ ...listItemStyle, ...orangeStyle }}>
                <span>{m.nome}</span>
                <span>Vence em {m.validade.toLocaleDateString("pt-BR")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CNHAlertList;
