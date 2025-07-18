import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RoleRoute = ({ allowedRoles }) => {
  const { usuario, tipoUsuario, loading } = useAuth();

  if (loading) return <p>Carregando...</p>;

  if (!usuario) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(tipoUsuario)) {
    if (tipoUsuario === "Motorista") {
      return <Navigate to="/motorista" replace />;
    }
    return <p>Acesso negado</p>;
  }

  return <Outlet />;
};

export default RoleRoute;
