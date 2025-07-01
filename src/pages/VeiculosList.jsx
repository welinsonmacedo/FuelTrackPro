import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { veiculoSchema } from "../schemas/veiculoSchema";
import { useVeiculos } from "../hooks/useVeiculos";
import { useAuditoria } from "../hooks/useAuditoria";
import { SearchInput } from "../components/SearchInput";
import { FormField } from "../components/FormField";
import { ListItem } from "../components/ListItem";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SubmitButton } from "../components/SubmitButton";
import { Form } from "../components/Form";
import { Modal } from "../components/Modal";

const VeiculosList = () => {
  const { veiculos, adicionarVeiculo, editarVeiculo, excluirVeiculo } = useVeiculos();
  const { log } = useAuditoria();

  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tituloForm, setTituloForm] = useState("Cadastro");
  const [confirmarId, setConfirmarId] = useState(null);

  const filtrados = veiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(busca.toLowerCase()) ||
      v.modelo?.toLowerCase().includes(busca.toLowerCase())
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(veiculoSchema) });

  useEffect(() => {
    if (!mostrarForm) {
      reset({});
      setEditando(null);
    } else {
      if (editando) {
        reset({
          placa: editando.placa || "",
          marca: editando.marca || "",
          modelo: editando.modelo || "",
          ano: editando.ano || "",
          tipo: editando.tipo || "",
          chassi: editando.chassi || "",
          renavam: editando.renavam || "",
          cor: editando.cor || "",
          filial: editando.filial || "",
          capacidadeTanque: editando.capacidadeTanque || "",
        });
      } else {
        reset({});
      }
    }
  }, [mostrarForm, editando, reset]);

  const abrirCadastro = () => {
    setEditando(null);
    setTituloForm("Cadastro");
    setMostrarForm(true);
  };

  const fecharModal = () => {
    setMostrarForm(false);
  };

  const onSubmit = async (dados) => {
    if (editando) {
      const dadosAntes = editando;
      await editarVeiculo(editando.id, dados);
      await log(
        "auditoriaVeiculos",
        "Editar veículo",
        "Atualizou dados do veículo",
        dadosAntes,
        dados,
        "VeiculosList"
      );
    } else {
      await adicionarVeiculo(dados);
      await log(
        "auditoriaVeiculos",
        "Criar veículo",
        "Cadastro de novo veículo",
        null,
        dados,
        "VeiculosList"
      );
    }
    fecharModal();
  };

  const handleEdit = (item) => {
    setEditando(item);
    setTituloForm("Editar");
    setMostrarForm(true);
  };

  const handleConfirmDelete = async () => {
    const dadosAntes = veiculos.find((v) => v.id === confirmarId);
    await excluirVeiculo(confirmarId);
    await log(
      "auditoriaVeiculos",
      "Excluir veículo",
      "Removeu veículo",
      dadosAntes,
      null,
      "VeiculosList"
    );
    setConfirmarId(null);
  };

  // Estilo para inputs lado a lado no modal
  const linhaInputsStyle = {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "15px",
  };

  // Estilo individual dos inputs para que fiquem lado a lado
  const inputLadoALado = {
    flex: "1 1 200px",
    minWidth: "200px",
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "20px auto",
        padding: "20px 15px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Veículos</h2>

      <button
        onClick={abrirCadastro}
        style={{
          marginBottom: "20px",
          padding: "12px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#3498db",
          color: "#fff",
          width: "100%",
          maxWidth: "400px",
          boxSizing: "border-box",
        }}
      >
        Cadastrar Veículo
      </button>

      <Modal isOpen={mostrarForm} onClose={fecharModal} title={`${tituloForm} Veículo`}>
        <Form onSubmit={handleSubmit(onSubmit)} style={{ padding: 0, border: "none" }}>
          <div style={linhaInputsStyle}>
            <FormField
              label="Placa"
              name="placa"
              register={register}
              error={errors.placa}
              inputStyle={inputLadoALado}
            />
            <FormField
              label="Marca"
              name="marca"
              register={register}
              error={errors.marca}
              inputStyle={inputLadoALado}
            />
          </div>

          <div style={linhaInputsStyle}>
            <FormField
              label="Modelo"
              name="modelo"
              register={register}
              error={errors.modelo}
              inputStyle={inputLadoALado}
            />
            <FormField
              label="Ano"
              name="ano"
              type="number"
              register={register}
              error={errors.ano}
              inputStyle={inputLadoALado}
            />
          </div>

          <div style={linhaInputsStyle}>
            <FormField
              label="Tipo"
              name="tipo"
              register={register}
              error={errors.tipo}
              inputStyle={inputLadoALado}
            />
            <FormField
              label="Chassi"
              name="chassi"
              register={register}
              error={errors.chassi}
              inputStyle={inputLadoALado}
            />
          </div>

          <div style={linhaInputsStyle}>
            <FormField
              label="Renavam"
              name="renavam"
              register={register}
              error={errors.renavam}
              inputStyle={inputLadoALado}
            />
            <FormField
              label="Cor"
              name="cor"
              register={register}
              error={errors.cor}
              inputStyle={inputLadoALado}
            />
          </div>

          <div style={linhaInputsStyle}>
            <FormField
              label="Filial"
              name="filial"
              register={register}
              error={errors.filial}
              inputStyle={inputLadoALado}
            />
            <FormField
              label="Capacidade Tanque (L)"
              name="capacidadeTanque"
              type="number"
              register={register}
              error={errors.capacidadeTanque}
              inputStyle={inputLadoALado}
            />
          </div>

          <SubmitButton loading={isSubmitting}>
            {editando ? "Atualizar" : "Cadastrar"}
          </SubmitButton>
        </Form>
      </Modal>

      <SearchInput
        value={busca}
        onChange={setBusca}
        placeholder="Buscar veículos..."
        style={{
          marginBottom: "20px",
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />

      <div style={{ width: "100%", maxWidth: "900px" }}>
        {filtrados.map((v) => (
          <ListItem
            key={v.id}
            title={`${v.placa} - ${v.modelo || ""}`}
            subtitle={`Marca: ${v.marca || "-"} | Tipo: ${v.tipo || "-"} | Capacidade Tanque: ${v.capacidadeTanque || "-"} L`}
            onEdit={() => handleEdit(v)}
            onDelete={() => setConfirmarId(v.id)}
            style={{ marginBottom: "12px" }}
          />
        ))}
      </div>

      {confirmarId !== null && (
        <ConfirmDialog
          title="Excluir veículo"
          message="Tem certeza que deseja excluir este veículo?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmarId(null)}
        />
      )}
    </div>
  );
};

export default VeiculosList;
