import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { tipoManutencaoSchema } from "../schemas/tipoManutencaoSchema";
import { useTiposManutencao } from "../hooks/useTiposManutencao";
import { useAuditoria } from "../hooks/useAuditoria";
import { FormField } from "../components/FormField";
import { ListItem } from "../components/ListItem";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SubmitButton } from "../components/SubmitButton";
import { Modal } from "../components/Modal";
import { Form } from "../components/Form";

const TiposManutencaoList = () => {
  const { tipos, adicionarTipo, editarTipo, excluirTipo } = useTiposManutencao();
  const { log } = useAuditoria();

  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [confirmarId, setConfirmarId] = useState(null);
  const [tituloForm, setTituloForm] = useState("Cadastro");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(tipoManutencaoSchema),
  });

  useEffect(() => {
    if (!mostrarForm) {
      reset({});
      setEditando(null);
    } else if (editando) {
      reset({ ...editando });
    }
  }, [mostrarForm, editando, reset]);

  const abrirCadastro = () => {
    setEditando(null);
    setTituloForm("Cadastro");
    setMostrarForm(true);
  };

  const fecharModal = () => setMostrarForm(false);

  const onSubmit = async (dados) => {
    if (editando) {
      const dadosAntes = editando;
      await editarTipo(editando.id, dados);
      await log(
        "auditoriaTiposManutencao",
        "Editar tipo de manutenção",
        "Atualizou tipo de manutenção",
        dadosAntes,
        dados,
        "TiposManutencaoList"
      );
    } else {
      await adicionarTipo(dados);
      await log(
        "auditoriaTiposManutencao",
        "Criar tipo de manutenção",
        "Cadastrou novo tipo de manutenção",
        null,
        dados,
        "TiposManutencaoList"
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
    const dadosAntes = tipos.find((t) => t.id === confirmarId);
    await excluirTipo(confirmarId);
    await log(
      "auditoriaTiposManutencao",
      "Excluir tipo de manutenção",
      "Removeu tipo de manutenção",
      dadosAntes,
      null,
      "TiposManutencaoList"
    );
    setConfirmarId(null);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", padding: "20px", background: "#fff", borderRadius: "8px" }}>
      <h2>Tipos de Manutenção</h2>

      <button
        onClick={abrirCadastro}
        style={{
          margin: "20px 0",
          padding: "12px 20px",
          background: "#3498db",
          color: "#fff",
          borderRadius: "6px",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        Cadastrar Tipo de Manutenção
      </button>

      <Modal isOpen={mostrarForm} onClose={fecharModal} title={`${tituloForm} Tipo de Manutenção`}>
        <Form onSubmit={handleSubmit(onSubmit)} style={{ padding: 0, border: "none" }}>
          {[
            { name: "nome", label: "Nome da Manutenção" },
            { name: "marca", label: "Marca do Veículo" },
            { name: "modelo", label: "Modelo do Veículo" },
            { name: "tempoDias", label: "Frequência (em dias)", type: "number" },
            { name: "tempoKm", label: "Frequência (em km)", type: "number" },
            { name: "avisoDiasAntes", label: "Avisar quantos dias antes", type: "number" },
            { name: "avisoKmAntes", label: "Avisar quantos km antes", type: "number" },
          ].map((field) => (
            <FormField
              key={field.name}
              name={field.name}
              label={field.label}
              type={field.type || "text"}
              register={register}
              error={errors[field.name]}
              inputStyle={{
                width: "100%",
                maxWidth: "400px",
                marginBottom: "12px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "14px",
                height: "38px",
              }}
            />
          ))}

          <SubmitButton loading={isSubmitting}>
            {editando ? "Atualizar" : "Cadastrar"}
          </SubmitButton>
        </Form>
      </Modal>

      {tipos.map((tipo) => (
        <ListItem
          key={tipo.id}
          title={tipo.nome}
          subtitle={`Marca: ${tipo.marca} | Modelo: ${tipo.modelo} | Dias: ${tipo.tempoDias} | Km: ${tipo.tempoKm}`}
          onEdit={() => handleEdit(tipo)}
          onDelete={() => setConfirmarId(tipo.id)}
          style={{ marginBottom: "12px" }}
        />
      ))}

      {confirmarId && (
        <ConfirmDialog
          title="Excluir tipo de manutenção"
          message="Tem certeza que deseja excluir este tipo de manutenção?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmarId(null)}
        />
      )}
    </div>
  );
};

export default TiposManutencaoList;
