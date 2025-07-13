import React, { useState, useEffect, useRef } from "react";
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
  overflowY: "auto",
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



const submenuStyle = {
  paddingLeft: 20,
  display: "flex",
  flexDirection: "column",
};

const submenuItemStyle = (active) => ({
  padding: "8px 20px",
  cursor: "pointer",
  backgroundColor: active ? "#3a5068" : "transparent",
  color: "#ecf0f1",
  textDecoration: "none",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  userSelect: "none",
});

const contentStyle = (collapsed) => ({
  marginLeft: collapsed ? "60px" : "220px",
  padding: "20px",
  transition: "margin-left 0.3s ease",
  minHeight: "100vh",
  backgroundColor: "#f4f6f8",
  boxSizing: "border-box",
});

function SidebarDropdown({ label, icon, items, collapsed, currentPath }) {
  const [open, setOpen] = useState(false);


  useEffect(() => {
    const isAnySubActive = items.some((item) => item.to === currentPath);
    setOpen(isAnySubActive);
  }, [currentPath, items]);

  if (collapsed) {
  
    return (
      <div
        title={label}
        style={{
          padding: "12px 10px",
          textAlign: "center",
          cursor: "default",
          userSelect: "none",
          color: "#ecf0f1",
        }}
      >
        {icon}
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          cursor: "pointer",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: open ? "#34495e" : "transparent",
          color: "#ecf0f1",
          userSelect: "none",
          fontWeight: "bold",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{icon}</span>
          <span>{label}</span>
        </div>
        <span style={{ userSelect: "none" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={submenuStyle}>
          {items.map(({ to, label }) => {
            const active = currentPath === to;
            return (
              <Link
                key={to}
                to={to}
                style={submenuItemStyle(active)}
                title={label}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !collapsed &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setCollapsed(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [collapsed]);

  // Define as categorias e seus subitens
  const menuCategorias = [
    {
      label: "Principal",
      icon: "📊",
      items: [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/dashboard-kpis", label: "Dashboard KPIs" },
      
      ],
    },
    {
      label: "Gestão",
      icon: "🛠️",
      items: [
        { to: "/viagens", label: "Viagens" },
        { to: "/abastecimentos", label: "Abastecimentos" },
        { to: "/manutencoes", label: "Manutenções" },
        { to: "/check-list", label: " Check-List" },
         { to: "/notificacoes", label: "Notificações" },
      ],
    },
    {
      label: "Consultas",
      icon: "🔍",
      items: [
       { to: "/veiculos-consulta", label: "Veiculos" },
        { to: "/fornecedores-consulta", label: "Fornecedores" },
        { to: "/motoristas-consulta", label: "Motoristas" },
      ],
    },
    {
      label: "Relátorios",
      icon: "🛣️",
      items: [
        
        { to: "/medias", label: "Médias" },
        { to: "/mediasreport", label: "Relatório de Médias" },
        { to: "/medias-mes", label: " Médias Mês" },
        { to: "/relatorio-abastecimentos", label: "Abastecimentos" },
      
       
      ],
    },
      {
      label: "Cadastros/Edições",
      icon: "✅",
      items: [
        { to: "/motoristas", label: "Motoristas" },
        { to: "/veiculos", label: "Veículos" },
        { to: "/tipos-manutencoes", label: "Tipos de Manutenção" },
        { to: "/fornecedores", label: "Fornecedores" },
      ],
    },
   {
      label: "Financeiro",
      icon: "💸",
      items: [
        { to: "/financeiro", label: "Geral" },
        { to: "/relatorio-financeiro", label: "Relatorio" },
      { to: "/financeiro-cadastro", label: "Cadastro" },
      { to: "/financeiro-notas-os", label: "Notas/Os" },
      ],
    },

    {
      label: "Administração",
      icon: "⚙️",
      items: [
        { to: "/usuario", label: "Usuário" },
        { to: "/admin/configuracoes", label: "Configurações" },
        { to: "/admin/licenca", label: "Licença" },
        { to: "/admin/logs", label: "Logs" },
      ],
    },
  ];

  return (
    <>
      <aside style={sidebarStyle(collapsed)} ref={sidebarRef}>
        <button
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          style={toggleButtonStyle}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "»" : "«"}
        </button>

        <nav style={{ flex: 1 }}>
          {menuCategorias.map(({ label, icon, items }) => (
            <SidebarDropdown
              key={label}
              label={label}
              icon={icon}
              items={items}
              collapsed={collapsed}
              currentPath={location.pathname}
            />
          ))}
        </nav>
      </aside>

      <main style={contentStyle(collapsed)}>
        <Outlet />
      </main>
    </>
  );
}
