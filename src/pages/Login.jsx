import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { validarEmail, validarSenha } from "../utils/validations";
import Logo from "../components/Logo";
import Input from "../components/Input";
import Button from "../components/Button";
import InputPassword from "../components/InputPassword";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();
  setErro("");

  if (!validarEmail(email)) {
    setErro("Por favor, insira um e-mail válido.");
    return;
  }

  if (!validarSenha(senha)) {
    setErro("A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    setSenha(""); 
    navigate("/home");
  } catch {
    setErro("Email ou senha inválidos.");
    setSenha(""); 
  }
};

  return (
    <div className="login-container">
      <Logo width={200} height={200} />

      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={erro ? true : false}
          required
        />
        <InputPassword
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          error={!!erro}
          required
        />
        <Button type="submit">Entrar</Button>
      </form>
      {erro && <p className="error">{erro}</p>}
    </div>
  );
}
