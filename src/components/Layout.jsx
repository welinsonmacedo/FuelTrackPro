import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";

const sidebarStyle = (collapsed) => ({
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width: collapsed ? "60px" : "220px",
  backgroundColor: "#2c3e50",
  color: "#ecf0f1",
  paddingTop: "20px",
  transition: "width 0.3s ease",
  overflow: "hidden",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
});

const toggleButtonStyle = {
  background: "none",
  border: "none",
  color: "#ecf0f1",
  fontSize: "24px",
  cursor: "pointer",
  padding: "10px",
  alignSelf: "flex-end",
};

const menuItemStyle = (active) => ({
  padding: "15px 20px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  backgroundColor: active ? "#34495e" : "transparent",
  textDecoration: "none",
  color: "#ecf0f1",
  display: "block",
});

const menuItemCollapsedStyle = (active) => ({
  padding: "15px 10px",
  cursor: "pointer",
  textAlign: "center",
  backgroundColor: active ? "#34495e" : "transparent",
  textDecoration: "none",
  color: "#ecf0f1",
  display: "block",
});

const contentStyle = (collapsed) => ({
  marginLeft: collapsed ? "60px" : "220px",
  padding: "20px",
  transition: "margin-left 0.3s ease",
  minHeight: "100vh",
  backgroundColor: "#f4f6f8",
  boxSizing: "border-box",
});

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

const menuItems = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/motoristas", icon: "🚚", label: "Motoristas" },
  { to: "/", icon: "🛣️", label: "Viagens" },
  { to: "/abastecimentos", icon: "⛽", label: "Abastecimentos" },
  { to: "/veiculos", icon: "🚛", label: "Veículos" },
  { to: "/manutencoes", icon: "🛠️", label: "Manutenções" },
    { to: "/tipos-manutencoes", icon: "🛠️", label: "Tipos Manutenções" },
  { to: "/fornecedores", icon: "🏢", label: "Fornecedores" },
   { to: "/notificacoes", icon: "🏢", label: "Notificações" },
];


  return (
    <>
      <aside style={sidebarStyle(collapsed)}>
        <button
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          style={toggleButtonStyle}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "»" : "«"}
        </button>

        <nav style={{ flex: 1 }}>
          {menuItems.map(({ to, icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={
                  collapsed
                    ? menuItemCollapsedStyle(active)
                    : menuItemStyle(active)
                }
                title={label}
              >
                {icon} {collapsed ? "" : label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Aqui no main, renderize as rotas filhas */}
      <main style={contentStyle(collapsed)}>
        <Outlet />
      </main>
    </>
  );
}
