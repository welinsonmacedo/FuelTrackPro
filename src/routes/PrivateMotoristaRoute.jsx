import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateMotoristaRoute = () => {
  const { usuario, tipoUsuario, loading } = useAuth();

  if (loading) return <p>Carregando...</p>;

  if (!usuario) return <Navigate to="/login" replace />;

  if (tipoUsuario !== "Motorista")
    return <p>Você não tem permissão para acessar essa área.</p>;

  return <Outlet />;
};

export default PrivateMotoristaRoute;
