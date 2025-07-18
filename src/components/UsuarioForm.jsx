import React, { useState, useEffect } from "react";
import { useCadastroUsuario } from "../hooks/useCadastroUsuario";
import { useMotoristas } from "../hooks/useMotoristas";

const tipos = ["Administrador", "Operador", "Motorista"];

export default function UsuarioCadastro() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    tipo: "Operador",
    motoristaId: "",
  });

  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const { cadastrarUsuario } = useCadastroUsuario();
  const { motoristas, loading: loadingMotoristas } = useMotoristas();
  const [motoristasDisponiveis, setMotoristasDisponiveis] = useState([]);

  useEffect(() => {
    // Filtra motoristas disponíveis para vincular (se precisar pode implementar essa lógica)
    // Por simplicidade, mostra todos motoristas
    setMotoristasDisponiveis(motoristas);
  }, [motoristas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
console.log("Form enviado:", form)
    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setCarregando(true);
      await cadastrarUsuario(form);
      alert("Usuário criado com sucesso!");
      setForm({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        tipo: "Operador",
        motoristaId: "",
      });
    } catch (err) {
      setErro(err.message || "Erro ao cadastrar usuário.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 24,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        maxWidth: 500,
        margin: "auto",
      }}
    >
      <h2 style={{ marginBottom: 10, textAlign: "center" }}>Cadastro de Usuário</h2>

      <label style={labelStyle}>Nome</label>
      <input
        name="nome"
        value={form.nome}
        onChange={handleChange}
        required
        style={inputStyle}
        placeholder="Nome completo"
      />

      <label style={labelStyle}>Email</label>
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
        style={inputStyle}
        placeholder="email@exemplo.com"
      />

      <label style={labelStyle}>Senha</label>
      <input
        name="senha"
        type="password"
        value={form.senha}
        onChange={handleChange}
        required
        style={inputStyle}
        placeholder="******"
      />

      <label style={labelStyle}>Confirmar Senha</label>
      <input
        name="confirmarSenha"
        type="password"
        value={form.confirmarSenha}
        onChange={handleChange}
        required
        style={inputStyle}
        placeholder="******"
      />

      <label style={labelStyle}>Tipo de Acesso</label>
      <select
        name="tipo"
        value={form.tipo}
        onChange={handleChange}
        style={{ ...inputStyle, cursor: "pointer" }}
      >
        {tipos.map((tipo) => (
          <option key={tipo} value={tipo}>
            {tipo}
          </option>
        ))}
      </select>

      {form.tipo === "Motorista" && (
        <>
          <label style={labelStyle}>Vincular Motorista</label>
          <select
            name="motoristaId"
            value={form.motoristaId}
            onChange={handleChange}
            required
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Selecione o motorista</option>
            {loadingMotoristas ? (
              <option disabled>Carregando motoristas...</option>
            ) : motoristasDisponiveis.length === 0 ? (
              <option disabled>Nenhum motorista disponível</option>
            ) : (
              motoristasDisponiveis.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} {m.placa ? `- ${m.placa}` : ""}
                </option>
              ))
            )}
          </select>
        </>
      )}

      {erro && <p style={{ color: "red", marginTop: -10 }}>{erro}</p>}

      <button
        type="submit"
        disabled={carregando}
        style={{
          padding: "12px 20px",
          backgroundColor: "#2E7D32",
          color: "#fff",
          fontWeight: "bold",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 16,
          transition: "background 0.3s",
        }}
      >
        {carregando ? "Cadastrando..." : "Cadastrar"}
      </button>
    </form>
  );
}

const labelStyle = {
  marginBottom: 4,
  fontWeight: 500,
  fontSize: 14,
  color: "#333",
};

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
};
