import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export const PrivateRoute = ({ children }) => {
  const { usuario, carregando } = useAuth();

  if (carregando) return <div>Carregando...</div>;

  return usuario ? children : <Navigate to="/login" />;
};
