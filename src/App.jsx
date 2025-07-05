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

      {/* Área exclusiva motorista - só motorista */}
      <Route
        path="/motorista/*"
        element={
          <PrivateRoute allowedRoles={["motorista"]}>
            <MotoristaArea />
          </PrivateRoute>
        }
      />

      {/* Área protegida admin e padrão */}
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
