import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { veiculoSchema } from "../schemas/veiculoSchema";
import { useVeiculos } from "../hooks/useVeiculos";
import { useAuditoria } from "../hooks/useAuditoria";
import { useModelosVeiculos } from "../hooks/useModelosVeiculos"; // Importa o hook
import { SearchInput } from "../components/SearchInput";
import { FormField } from "../components/FormField";
import { ListItem } from "../components/ListItem";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SubmitButton } from "../components/SubmitButton";
import { Form } from "../components/Form";
import { Modal } from "../components/Modal";
import CadastroModeloVeiculo from "../components/CadastroModeloVeiculo";

const VeiculosList = () => {
  const { veiculos, adicionarVeiculo, editarVeiculo, excluirVeiculo } = useVeiculos();
  const { modelos } = useModelosVeiculos(); // Pega modelos do hook
  const { log } = useAuditoria();

  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tituloForm, setTituloForm] = useState("Cadastro");
  const [deleting, setDeleting] = useState(false);
  const [confirmarId, setConfirmarId] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const [mostrarModalModelo, setMostrarModalModelo] = useState(false);

  const filtrados = veiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(busca.toLowerCase()) ||
      v.modelo?.toLowerCase().includes(busca.toLowerCase())
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: yupResolver(veiculoSchema),
    mode: "onChange",
  });

  const tipo = watch("tipo");

  useEffect(() => {
    if (!mostrarForm) {
      reset({});
      setEditando(null);
      setSubmitError(null);
    } else if (editando) {
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
        capacidadeTanque: editando.capacidadeTanque || null,
        tipoCombustivel: editando.tipoCombustivel || "",
        capacidadeCarga: editando.capacidadeCarga || null,
      });
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

  const abrirCadastroModelo = () => {
    setMostrarModalModelo(true);
  };

  const fecharCadastroModelo = () => {
    setMostrarModalModelo(false);
  };

  const prepararDadosParaEnvio = (dados) => {
    const payload = { ...dados };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") payload[key] = null;
    });

    if (payload.tipo === "Carreta") {
      payload.capacidadeTanque = null;
      payload.tipoCombustivel = null;
    } else {
      payload.capacidadeCarga = null;
    }

    return payload;
  };

  const onSubmit = async (dados) => {
    try {
      setSubmitError(null);
      const payload = prepararDadosParaEnvio(dados);

      if (editando) {
        await editarVeiculo(editando.id, payload);
        await log(
          "colecaoAuditoria",
          "Editar veículo",
          `Atualizou veículo ${editando.placa}`,
          editando,
          payload,
          "VeiculosList"
        );
      } else {
        await adicionarVeiculo(payload);
        await log(
          "colecaoAuditoria",
          "Criar veículo",
          `Cadastrou novo veículo ${payload.placa}`,
          null,
          payload,
          "VeiculosList"
        );
      }

      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
      setSubmitError(error.message || "Ocorreu um erro ao salvar o veículo");
    }
  };

  const handleEdit = (item) => {
    setEditando(item);
    setTituloForm("Editar");
    setMostrarForm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);

      const dadosAntes = veiculos.find((v) => v.id === confirmarId);
      if (!dadosAntes) throw new Error("Veículo não encontrado");

      await excluirVeiculo(confirmarId);
      await log(
        "colecaoAuditoria",
        "Excluir veículo",
        `Removeu veículo ${dadosAntes.placa}`,
        dadosAntes,
        null,
        "VeiculosList"
      );
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert(`Erro: ${error.message}`);
    } finally {
      setDeleting(false);
      setConfirmarId(null);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "20px auto",
        padding: "20px 15px",
        backgroundColor: "#fff",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 10,
          paddingBottom: 10,
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Veículos</h2>

        <button
          onClick={abrirCadastro}
          style={{
            marginBottom: "10px",
            padding: "12px 20px",
            fontSize: "16px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#3498db",
            color: "#fff",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          Cadastrar Veículo
        </button>

        <button
          onClick={abrirCadastroModelo}
          style={{
            marginBottom: "20px",
            marginLeft: "20px",
            padding: "12px 20px",
            fontSize: "16px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#28a745",
            color: "#fff",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          Cadastrar Modelo de Veículo
        </button>
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
          }}
        />
      </div>
      <Modal isOpen={mostrarForm} onClose={fecharModal} title={`${tituloForm} Veículo`}>
        <Form onSubmit={handleSubmit(onSubmit)} style={{ padding: 0, border: "none" }}>
          {submitError && (
            <div style={{ color: "red", marginBottom: "15px" }}>
              {submitError}
            </div>
          )}

          <FormField label="Placa" name="placa" register={register} error={errors.placa} />
          <FormField label="Marca" name="marca" register={register} error={errors.marca} />

          {/* Alteração aqui: campo Modelo como select */}
          <FormField
            label="Modelo"
            name="modelo"
            as="select"
            register={register}
            error={errors.modelo}
          >
            <option value="">Selecione o modelo</option>
            {modelos.map((modelo) => (
              <option key={modelo.id} value={modelo.modelo}>
                {modelo.modelo}
              </option>
            ))}
          </FormField>

          <FormField
            label="Ano"
            name="ano"
            type="number"
            register={register}
            error={errors.ano}
          />
          <FormField
            label="Tipo"
            name="tipo"
            as="select"
            register={register}
            error={errors.tipo}
          >
            <option value="">Selecione</option>
            <option value="Cavalo Mecânico">Cavalo Mecânico</option>
            <option value="Truck">Truck</option>
            <option value="Carreta">Carreta</option>
            <option value="Popular">Popular</option>
            <option value="3/4">3/4</option>
          </FormField>
          <FormField label="Chassi" name="chassi" register={register} error={errors.chassi} />
          <FormField label="Renavam" name="renavam" register={register} error={errors.renavam} />
          <FormField label="Cor" name="cor" register={register} error={errors.cor} />
          <FormField label="Filial" name="filial" register={register} error={errors.filial} />

          {tipo && tipo !== "Carreta" && (
            <>
              <FormField
                label="Capacidade Tanque (L)"
                name="capacidadeTanque"
                type="number"
                register={register}
                error={errors.capacidadeTanque}
              />
              <FormField
                label="Tipo de Combustível"
                name="tipoCombustivel"
                as="select"
                register={register}
                error={errors.tipoCombustivel}
              >
                <option value="">Selecione</option>
                <option value="Diesel S10">Diesel S10</option>
                <option value="Diesel Comum">Diesel Comum</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Etanol">Etanol</option>
              </FormField>
            </>
          )}

          {tipo === "Carreta" && (
            <FormField
              label="Capacidade de Carga (kg)"
              name="capacidadeCarga"
              type="number"
              register={register}
              error={errors.capacidadeCarga}
            />
          )}

          <SubmitButton loading={isSubmitting} disabled={!isValid || isSubmitting}>
            {editando ? "Atualizar" : "Cadastrar"}
          </SubmitButton>
        </Form>
      </Modal>

      <Modal isOpen={mostrarModalModelo} onClose={fecharCadastroModelo} title="Cadastrar Modelo de Veículo">
        <CadastroModeloVeiculo onSalvo={fecharCadastroModelo} />
      </Modal>

      <div style={{ width: "100%", maxWidth: "900px" }}>
        {filtrados.map((v) => (
          <ListItem
            key={v.id}
            title={`${v.placa} - ${v.modelo || ""}`}
            subtitle={`Tipo: ${v.tipo || "-"} | Combustível: ${v.tipoCombustivel || "-"}`}
            onEdit={() => handleEdit(v)}
            onDelete={() => setConfirmarId(v.id)}
            isDeleting={deleting && confirmarId === v.id}
            style={{ marginBottom: "12px" }}
          />
        ))}
      </div>

      {confirmarId !== null && (
        <ConfirmDialog
          isOpen={confirmarId !== null}
          title="Excluir veículo"
          message="Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita."
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmarId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default VeiculosList;
