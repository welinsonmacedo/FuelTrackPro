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
    } catch (error) {
      setErro("Email ou senha inválidos.");
      setSenha("");
      console.error("Erro no login:", error);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f9f9f9",
      }}
    >
      <div
        style={{
          width: 300,
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img src="./logo.jpeg" alt="" style={{ width: 200 }} />

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 15,
            marginTop: 20,
            width: "100%",
          }}
          noValidate
        >
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!erro}
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

        {erro && (
          <p
            className="error"
            style={{ color: "red", marginTop: 10, textAlign: "center" }}
            role="alert"
          >
            {erro}
          </p>
        )}

        {erro && (
          <p
            className="error"
            style={{ color: "red", marginTop: 10, textAlign: "center" }}
            role="alert"
          >
            {erro}
          </p>
        )}

        <p
          style={{
            marginTop: 20,
            fontSize: 14,
            textAlign: "center",
            color: "#555",
          }}
        >
          Esqueceu a senha ou não tem acesso?{" "}
          <a
            href="https://wa.me/5534991448794"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#25D366",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Fale com o suporte pelo WhatsApp 📱
          </a>
        </p>
      </div>
    </div>
  );
}
