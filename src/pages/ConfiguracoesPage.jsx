/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import Input from "../components/Input";
import Button from "../components/Button";
import Modal from "../components/Modalgenerico";

export default function ConfiguracoesPage() {
  const [configs, setConfigs] = useState(null);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserTipo, setEditUserTipo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [formConfigs, setFormConfigs] = useState({
    avisoDiasManutencao: "",
    avisoKmManutencao: "",
    valorLitroCombustivel: "",
    tipoLicenca: "",
    vencimentoLicenca: "",
  });

  // Garante documento config inicial
  async function garantirConfigInicial() {
    const docRef = doc(db, "configs", "geral");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        avisoDiasManutencao: 10,
        avisoKmManutencao: 500,
        valorLitroCombustivel: 5.25,
        tipoLicenca: "Trial",
        vencimentoLicenca: "",
      });
      console.log("Documento configs/geral criado com valores padrão.");
    }
  }

  // Busca configs gerais
  useEffect(() => {
    async function fetchConfigs() {
      try {
        await garantirConfigInicial();
        const docRef = doc(db, "configs", "geral");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setConfigs(data);
          setFormConfigs({
            ...data,
            vencimentoLicenca: data.vencimentoLicenca || "",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar configs:", error);
      }
      setLoadingConfigs(false);
    }
    fetchConfigs();
  }, []);

  // Busca lista de usuários
  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setUsuarios(lista);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
      setLoadingUsuarios(false);
    }
    fetchUsuarios();
  }, []);

  function handleChangeConfigs(e) {
    const { name, value } = e.target;
    setFormConfigs((old) => ({ ...old, [name]: value }));
  }

  async function salvarConfigs() {
    setSalvando(true);
    try {
      const docRef = doc(db, "configs", "geral");
      await setDoc(docRef, formConfigs, { merge: true });
      alert("Configurações gerais salvas!");
    } catch (error) {
      alert("Erro ao salvar configurações.");
      console.error(error);
    }
    setSalvando(false);
  }

  function abrirEdicaoUsuario(usuario) {
    setEditUserId(usuario.id);
    setEditUserTipo(usuario.tipoUsuario || "");
  }

  async function salvarTipoUsuario() {
    if (!editUserId) return;

    // Validação simples:
    const tiposValidos = ["admin", "padrao", "motorista"];
    if (!tiposValidos.includes(editUserTipo.toLowerCase())) {
      alert(`Tipo inválido! Use: ${tiposValidos.join(", ")}`);
      return;
    }

    try {
      const userRef = doc(db, "usuarios", editUserId);
      await updateDoc(userRef, { tipoUsuario: editUserTipo.toLowerCase() });
      alert("Tipo de usuário atualizado!");
      setUsuarios((old) =>
        old.map((u) =>
          u.id === editUserId ? { ...u, tipoUsuario: editUserTipo.toLowerCase() } : u
        )
      );
      setEditUserId(null);
      setEditUserTipo("");
    } catch (error) {
      alert("Erro ao atualizar tipo do usuário.");
      console.error(error);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>Configurações Gerais</h2>
      {loadingConfigs ? (
        <p>Carregando configurações...</p>
      ) : (
        <>
          <Input
            name="avisoDiasManutencao"
            label="Dias de antecedência para aviso de manutenção"
            type="number"
            value={formConfigs.avisoDiasManutencao || ""}
            onChange={handleChangeConfigs}
            placeholder="Ex: 10"
          />
          <Input
            name="avisoKmManutencao"
            label="KM de antecedência para aviso de manutenção"
            type="number"
            value={formConfigs.avisoKmManutencao || ""}
            onChange={handleChangeConfigs}
            placeholder="Ex: 500"
          />
          <Input
            name="valorLitroCombustivel"
            label="Valor do litro do combustível (R$)"
            type="number"
            step="0.01"
            value={formConfigs.valorLitroCombustivel || ""}
            onChange={handleChangeConfigs}
            placeholder="Ex: 5.25"
          />
          <Input
            name="tipoLicenca"
            label="Tipo de licença do sistema"
            type="text"
            value={formConfigs.tipoLicenca || ""}
            onChange={handleChangeConfigs}
            placeholder="Ex: Trial, Básico, Premium"
          />
          <Input
            name="vencimentoLicenca"
            label="Vencimento da licença"
            type="date"
            value={formConfigs.vencimentoLicenca || ""}
            onChange={handleChangeConfigs}
          />
          <Button onClick={salvarConfigs} disabled={salvando} style={{ marginTop: 20 }}>
            {salvando ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </>
      )}

      <hr style={{ margin: "40px 0" }} />

      <h2>Usuários Cadastrados</h2>
      {loadingUsuarios ? (
        <p>Carregando usuários...</p>
      ) : usuarios.length === 0 ? (
        <p>Nenhum usuário cadastrado.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: "8px" }}>Email</th>
              <th style={{ padding: "8px" }}>Nome</th>
              <th style={{ padding: "8px" }}>Tipo</th>
              <th style={{ padding: "8px" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr
                key={u.id}
                style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                onClick={() => abrirEdicaoUsuario(u)}
              >
                <td style={{ padding: "8px" }}>{u.email}</td>
                <td style={{ padding: "8px" }}>{u.nome || "-"}</td>
                <td style={{ padding: "8px" }}>{u.tipoUsuario || "Não definido"}</td>
                <td style={{ padding: "8px" }}>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirEdicaoUsuario(u);
                    }}
                  >
                    Editar Tipo
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
  isOpen={!!editUserId}
  onClose={() => {
    setEditUserId(null);
    setEditUserTipo("");
  }}
  title="Editar Tipo de Usuário"
>
  <label htmlFor="tipoUsuarioSelect" style={{ display: "block", marginBottom: 6 }}>
    Tipo de Usuário
  </label>
  <select
    id="tipoUsuarioSelect"
    value={editUserTipo}
    onChange={(e) => setEditUserTipo(e.target.value)}
    style={{
      width: "300px",
      padding: "8px",
      fontSize: "1rem",
      borderRadius: 4,
      border: "1px solid #ccc",
      marginBottom: "20px"
    }}
  >
    <option value="">-- Selecione --</option>
    <option value="admin">Admin</option>
    <option value="padrao">Padrão</option>
    <option value="motorista">Motorista</option>
  </select>
  <Button onClick={salvarTipoUsuario}>
    Salvar
  </Button>
</Modal>
    </div>
  );
}
