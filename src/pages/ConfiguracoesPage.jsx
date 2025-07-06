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
  const [selecao, setSelecao] = useState("configuracoes"); // 'configuracoes' | 'empresa' | 'usuarios'

  // Configs Gerais
  const [configs, setConfigs] = useState(null);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [formConfigs, setFormConfigs] = useState({
    avisoDiasManutencao: "",
    avisoKmManutencao: "",
    valorLitroCombustivel: "",
    tipoLicenca: "",
    vencimentoLicenca: "",
  });
  const [salvandoConfigs, setSalvandoConfigs] = useState(false);

  // Dados Empresa
  const [empresa, setEmpresa] = useState(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [formEmpresa, setFormEmpresa] = useState({
    nome: "",
    cnpj: "",
    ie: "",
    endereco: "",
    logotipoBase64: "",
  });
  const [uploadError, setUploadError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Usuários
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserTipo, setEditUserTipo] = useState("");
  const [salvandoTipoUsuario, setSalvandoTipoUsuario] = useState(false);

  // Garante doc inicial configs gerais
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
            avisoDiasManutencao: data.avisoDiasManutencao || "",
            avisoKmManutencao: data.avisoKmManutencao || "",
            valorLitroCombustivel: data.valorLitroCombustivel || "",
            tipoLicenca: data.tipoLicenca || "",
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

  // Busca dados da empresa
  useEffect(() => {
    async function fetchEmpresa() {
      try {
        const docRef = doc(db, "configs", "empresa");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEmpresa(data);
          setFormEmpresa({
            nome: data.nome || "",
            cnpj: data.cnpj || "",
            ie: data.ie || "",
            endereco: data.endereco || "",
            logotipoBase64: data.logotipoBase64 || "",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
      }
      setLoadingEmpresa(false);
    }
    fetchEmpresa();
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

  // Manipulação configs gerais
  function handleChangeConfigs(e) {
    const { name, value } = e.target;
    setFormConfigs((old) => ({ ...old, [name]: value }));
  }

  async function salvarConfigs() {
    setSalvandoConfigs(true);
    try {
      const docRef = doc(db, "configs", "geral");
      await setDoc(docRef, formConfigs, { merge: true });
      alert("Configurações gerais salvas!");
    } catch (error) {
      alert("Erro ao salvar configurações.");
      console.error(error);
    }
    setSalvandoConfigs(false);
  }

  // Manipulação dados empresa
  function handleChangeEmpresa(e) {
    const { name, value } = e.target;
    setFormEmpresa((old) => ({ ...old, [name]: value }));
  }

  async function salvarEmpresa() {
    try {
      const docRef = doc(db, "configs", "empresa");
      await setDoc(docRef, formEmpresa, { merge: true });
      alert("Dados da empresa salvos!");
      setEmpresa(formEmpresa);
    } catch (error) {
      alert("Erro ao salvar dados da empresa.");
      console.error(error);
    }
  }

  // Upload logotipo (salva em base64 no Firestore)
  async function handleLogoChange(e) {
    setUploadError("");
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 1000 * 1024; // 500 KB
    if (file.size > maxSize) {
      setUploadError("Arquivo muito grande. Máximo permitido: 500KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result; // base64 com data:image/...

      setFormEmpresa((old) => ({ ...old, logotipoBase64: base64data }));

      try {
        const docRef = doc(db, "configs", "empresa");
        await setDoc(docRef, { logotipoBase64: base64data }, { merge: true });
        alert("Logotipo salvo com sucesso no Firestore!");
      } catch (error) {
        alert("Erro ao salvar logotipo no Firestore.");
        console.error(error);
      }
    };

    reader.readAsDataURL(file);
  }

  // Usuários
  function abrirEdicaoUsuario(usuario) {
    setEditUserId(usuario.id);
    setEditUserTipo(usuario.tipoUsuario || "");
  }

  async function salvarTipoUsuario() {
    if (!editUserId) return;

    const tiposValidos = ["admin", "padrao", "motorista"];
    if (!tiposValidos.includes(editUserTipo.toLowerCase())) {
      alert(`Tipo inválido! Use: ${tiposValidos.join(", ")}`);
      return;
    }

    setSalvandoTipoUsuario(true);
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
    setSalvandoTipoUsuario(false);
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "auto",
        padding: 20,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Menu Seções */}
      <div style={{ marginBottom: 30, display: "flex", gap: 10 }}>
        <Button
          onClick={() => setSelecao("configuracoes")}
          style={{ backgroundColor: selecao === "configuracoes" ? "#2c3e50" : "#555" }}
        >
          Configurações Gerais
        </Button>
        <Button
          onClick={() => setSelecao("empresa")}
          style={{ backgroundColor: selecao === "empresa" ? "#2c3e50" : "#555" }}
        >
          Dados da Empresa
        </Button>
        <Button
          onClick={() => setSelecao("usuarios")}
          style={{ backgroundColor: selecao === "usuarios" ? "#2c3e50" : "#555" }}
        >
          Usuários
        </Button>
      </div>

      {/* Conteúdo baseado na seleção */}
      {selecao === "configuracoes" && (
        <>
          <h2>Configurações Gerais</h2>
          {loadingConfigs ? (
            <p>Carregando configurações...</p>
          ) : (
            <>
              <Input
                name="avisoDiasManutencao"
                label="Dias de antecedência para aviso de manutenção"
                type="number"
                value={formConfigs.avisoDiasManutencao}
                onChange={handleChangeConfigs}
                placeholder="Ex: 10"
              />
              <Input
                name="avisoKmManutencao"
                label="KM de antecedência para aviso de manutenção"
                type="number"
                value={formConfigs.avisoKmManutencao}
                onChange={handleChangeConfigs}
                placeholder="Ex: 500"
              />
              <Input
                name="valorLitroCombustivel"
                label="Valor do litro do combustível (R$)"
                type="number"
                step="0.01"
                value={formConfigs.valorLitroCombustivel}
                onChange={handleChangeConfigs}
                placeholder="Ex: 5.25"
              />
              <Input
                name="tipoLicenca"
                label="Tipo de licença do sistema"
                type="text"
                value={formConfigs.tipoLicenca}
                onChange={handleChangeConfigs}
                placeholder="Ex: Trial, Básico, Premium"
              />
              <Input
                name="vencimentoLicenca"
                label="Vencimento da licença"
                type="date"
                value={formConfigs.vencimentoLicenca}
                onChange={handleChangeConfigs}
              />
              <Button onClick={salvarConfigs} disabled={salvandoConfigs} style={{ marginTop: 20 }}>
                {salvandoConfigs ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </>
          )}
        </>
      )}

      {selecao === "empresa" && (
        <>
          <h2>Dados da Empresa</h2>
          {loadingEmpresa ? (
            <p>Carregando dados da empresa...</p>
          ) : (
            <>
              <Input
                name="nome"
                label="Nome da Empresa"
                type="text"
                value={formEmpresa.nome}
                onChange={handleChangeEmpresa}
                placeholder="Nome completo da empresa"
              />
              <Input
                name="cnpj"
                label="CNPJ"
                type="text"
                value={formEmpresa.cnpj}
                onChange={handleChangeEmpresa}
                placeholder="00.000.000/0000-00"
              />
              <Input
                name="ie"
                label="Inscrição Estadual (IE)"
                type="text"
                value={formEmpresa.ie}
                onChange={handleChangeEmpresa}
                placeholder="Número da IE"
              />
              <Input
                name="endereco"
                label="Endereço"
                type="text"
                value={formEmpresa.endereco}
                onChange={handleChangeEmpresa}
                placeholder="Endereço completo"
              />

              <div style={{ marginTop: 20 }}>
                <label style={{ display: "block", marginBottom: 8 }}>Logotipo (máx 500KB):</label>
                {formEmpresa.logotipoBase64 && (
                  <img
                    src={formEmpresa.logotipoBase64}
                    alt="Logotipo da empresa"
                    style={{ maxWidth: 200, maxHeight: 100, objectFit: "contain", marginBottom: 10 }}
                  />
                )}
                <input type="file" accept="image/*" onChange={handleLogoChange} />
                {uploadError && <p style={{ color: "red", marginTop: 5 }}>{uploadError}</p>}
                {uploadingLogo && <p>Enviando logotipo...</p>}
              </div>

              <Button onClick={salvarEmpresa} style={{ marginTop: 20 }}>
                Salvar Dados da Empresa
              </Button>
            </>
          )}
        </>
      )}

      {selecao === "usuarios" && (
        <>
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
                marginBottom: "20px",
              }}
            >
              <option value="">-- Selecione --</option>
              <option value="admin">Admin</option>
              <option value="padrao">Padrão</option>
              <option value="motorista">Motorista</option>
            </select>
            <Button onClick={salvarTipoUsuario} disabled={salvandoTipoUsuario}>
              {salvandoTipoUsuario ? "Salvando..." : "Salvar"}
            </Button>
          </Modal>
        </>
      )}
    </div>
  );
}
