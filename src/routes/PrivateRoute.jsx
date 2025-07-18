import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ allowedRoles, children }) {
  const { usuario, tipoUsuario, loading } = useAuth();

  if (loading) return <p>Carregando...</p>;

  if (!usuario) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(tipoUsuario)) {
    if (tipoUsuario === "Motorista") {
      return <Navigate to="/motorista" replace />;
    }
    return <p>Acesso negado</p>;
  }

  return children;
}
