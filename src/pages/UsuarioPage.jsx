import React from "react";
import { useAuth } from "../contexts/AuthContext";

const UsuarioPage = () => {
  const { usuario, tipoUsuario, logout, loading } = useAuth();

  if (loading) return <p>Carregando...</p>;
  if (!usuario) return <p>Nenhum usuário logado.</p>;

  return (
    <div style={styles.container}>
      <h2>Perfil do Usuário</h2>

      <div style={styles.infoBox}>
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>Tipo:</strong> {tipoUsuario}</p>
        {/* Se tiver nome no Firestore, pode exibir aqui também */}
      </div>

      <button style={styles.logoutButton} onClick={logout}>
        Sair da Conta
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  infoBox: {
    background: "#f4f4f4",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
  },
  logoutButton: {
    padding: "10px 20px",
    borderRadius: "6px",
    backgroundColor: "#d9534f",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default UsuarioPage;
