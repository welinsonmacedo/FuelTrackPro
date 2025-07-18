import React from "react";
import UsuarioForm from "../components/UsuarioForm";

export default function CadastroUsuarioPage() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>Cadastrar Novo Usuário</h2>
      <UsuarioForm />
    </div>
  );
}
