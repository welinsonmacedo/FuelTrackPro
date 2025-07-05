/* eslint-disable no-unused-vars */
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import Home from "./Home";

export default function Dashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert("Erro ao sair. Tente novamente.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bem-vindo, {usuario?.email}</h1>
      <p>Este é seu dashboard do FuelTrack.</p>
      <Home/>
    </div>
  );
}
