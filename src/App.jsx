/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import { UIProvider } from "./contexts/UIContext";
import { useAuth } from "./contexts/AuthContext"; // importa seu hook correto
import PrivateRoute from "./routes/PrivateRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import MotoristasList from "./pages/MotoristasList";
import Layout from "./components/Layout";
import VeiculosList from "./pages/VeiculosList";
import ManutencoesList from "./pages/ManutencoesList";
import FornecedoresList from "./pages/FornecedoresList";
import AbastecimentosList from "./pages/AbastecimentosList";
import TiposManutencaoList from "./pages/TiposManutencaoList";
import Notificacoes from "./pages/Notificacoes";
import ViagensList from "./pages/ViagensList";
import MediasPage from "./pages/MediasPage";
import MediasCalculadasPage from "./pages/MediasCalculadasPage ";
import UsuarioPage from "./pages/UsuarioPage";
import MotoristaArea from "./pages/Motoristas/MotoristaArea"; // página exclusiva do motorista
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import AdminRoutes from "./routes/AdminRoutes";
import Licenca from "./pages/Licenca";
import Logs from "./pages/Logs";
import MediaGeralPorMesPage from "./pages/MediaGeralPorMesPage";
import ChecklistPage from "./pages/ChecklistPage";
import VeiculosConsulta from "./pages/VeiculosConsulta";
import FornecedoresConsulta from "./pages/FornecedoresConsulta";
import MotoristasConsulta from "./pages/MotoristasConsulta";
import RelatorioAbastecimentos from "./pages/RelatorioAbastecimentos";
import DashboardKPIs from "./pages/DashboardKPI";
import FinanceiroPage from "./pages/FinanceiroPage";
import RelatoriosFinanceirosPage from "./pages/RelatoriosFinanceirosPage";
import FinanceiroPageCadastro from "./pages/FinanceiroPageCadastro";

function AppWrapper() {
  // Para usar hooks como useNavigate e useEffect, componente wrapper dentro do BrowserRouter
  const { usuario, tipoUsuario, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && usuario) {
      // Só redireciona se estiver na raiz ou em login
      if (location.pathname === "/" || location.pathname === "/login") {
        if (tipoUsuario === "motorista") {
          navigate("/motorista", { replace: true });
        } else if (tipoUsuario === "admin" || tipoUsuario === "padrao") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      }
    }
  }, [usuario, tipoUsuario, loading, navigate, location.pathname]);

  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<Login />} />

      {/* Área exclusiva motorista */}
      <Route
        path="/motorista/*"
        element={
          <PrivateRoute allowedRoles={["motorista"]}>
            <MotoristaArea />
          </PrivateRoute>
        }
      />

      {/* Área protegida admin + padrão com layout principal */}
      <Route
        path="/*"
        element={
          <PrivateRoute allowedRoles={["admin", "padrao"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="home" element={<Home />} />
        <Route path="motoristas" element={<MotoristasList />} />
        <Route path="veiculos" element={<VeiculosList />} />
        <Route path="abastecimentos" element={<AbastecimentosList />} />
        <Route path="manutencoes" element={<ManutencoesList />} />
        <Route path="tipos-manutencoes" element={<TiposManutencaoList />} />
        <Route path="fornecedores" element={<FornecedoresList />} />
        <Route path="notificacoes" element={<Notificacoes />} />
        <Route path="viagens" element={<ViagensList />} />
        <Route path="medias" element={<MediasPage />} />
        <Route path="mediasreport" element={<MediasCalculadasPage />} />
        <Route path="usuario" element={<UsuarioPage />} />
        <Route path="medias-mes" element={<MediaGeralPorMesPage />} />
        <Route path="check-list" element={<ChecklistPage />} />
        <Route path="veiculos-consulta" element={<VeiculosConsulta />} />
        <Route path="fornecedores-consulta" element={<FornecedoresConsulta />}
        />
        <Route path="motoristas-consulta" element={<MotoristasConsulta />} />
        <Route path="relatorio-abastecimentos" element={<RelatorioAbastecimentos />}
        />
        <Route path="dashboard-kpis" element={<DashboardKPIs />} />
        <Route path="financeiro" element={<FinanceiroPage/>} />
        <Route path="relatorio-financeiro" element={<RelatoriosFinanceirosPage/>} />
        <Route path="financeiro-cadastro" element={<FinanceiroPageCadastro/>} />
      </Route>

      {/* Admin Routes separadas com layout próprio (caso queira reutilizar o Layout) */}
      <Route path="/admin" element={<AdminRoutes />}>
        <Route element={<Layout />}>
          <Route path="usuarios" element={<UsuarioPage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
          <Route path="licenca" element={<Licenca />} />
          <Route path="logs" element={<Logs />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <AppWrapper />
      </UIProvider>
    </BrowserRouter>
  );
}
