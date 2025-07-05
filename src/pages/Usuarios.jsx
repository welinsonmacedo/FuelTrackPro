import React, { useState } from "react";
import { useUsuarios } from "../hooks/useUsuarios";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Usuarios() {
  const { usuarios, loading, adicionarUsuario, atualizarUsuario, deletarUsuario } = useUsuarios();

  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    perfil: "motorista",
    ativo: true,
  });

  function abrirModal(usuario = null) {
    setUsuarioSelecionado(usuario);
    if (usuario) {
      setForm({
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
      });
    } else {
      setForm({ nome: "", email: "", perfil: "motorista", ativo: true });
    }
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setUsuarioSelecionado(null);
  }

  async function salvar() {
    if (usuarioSelecionado) {
      await atualizarUsuario(usuarioSelecionado.id, form);
    } else {
      await adicionarUsuario(form);
    }
    fecharModal();
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((old) => ({
      ...old,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  if (loading) return <p>Carregando usuários...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2>Usuários</h2>
      <Button onClick={() => abrirModal()}>Adicionar Usuário</Button>
      <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Perfil</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.perfil}</td>
              <td>{u.ativo ? "Sim" : "Não"}</td>
              <td>
                <Button onClick={() => abrirModal(u)}>Editar</Button>
                <Button
                  onClick={() => deletarUsuario(u.id)}
                  style={{ marginLeft: 10, backgroundColor: "#e74c3c" }}
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalAberto && (
        <Modal onClose={fecharModal}>
          <h3>{usuarioSelecionado ? "Editar Usuário" : "Adicionar Usuário"}</h3>
          <Input
            name="nome"
            placeholder="Nome"
            value={form.nome}
            onChange={handleChange}
          />
          <Input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <select name="perfil" value={form.perfil} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="motorista">Motorista</option>
            <option value="financeiro">Financeiro</option>
          </select>
          <label>
            <input
              name="ativo"
              type="checkbox"
              checked={form.ativo}
              onChange={handleChange}
            />{" "}
            Ativo
          </label>

          <Button onClick={salvar} style={{ marginTop: 20 }}>
            Salvar
          </Button>
        </Modal>
      )}
    </div>
  );
}
