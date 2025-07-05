import React from "react";
import { useAuth } from "../contexts/AuthContext";

const UsuarioInfo = () => {
  const { usuario, tipoUsuario, loading } = useAuth();

  if (loading) {
    return <p>Carregando informações do usuário...</p>;
  }

  if (!usuario) {
    return <p>Nenhum usuário logado.</p>;
  }

  return (
    <div style={estilos.container}>
      <p><strong>Email:</strong> {usuario.email}</p>
      <p><strong>Tipo de Usuário:</strong> {tipoUsuario}</p>
    </div>
  );
};

const estilos = {
  container: {
    padding: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    width: "fit-content",
    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
    marginTop: "20px"
  }
};

export default UsuarioInfo;
