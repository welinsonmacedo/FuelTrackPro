import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { fornecedorSchema } from "../schemas/fornecedorSchema";
import { useFornecedores } from "../hooks/useFornecedores";
import { useAuditoria } from "../hooks/useAuditoria";
import { SearchInput } from "../components/SearchInput";
import { FormField } from "../components/FormField";
import { ListItem } from "../components/ListItem";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SubmitButton } from "../components/SubmitButton";
import { Form } from "../components/Form";
import { Modal } from "../components/Modal";

const tiposFornecedor = ["Oficina", "Postos", "Outros"];

const FornecedoresList = () => {
  const {
    fornecedores,
    adicionarFornecedor,
    editarFornecedor,
    excluirFornecedor,
  } = useFornecedores();
  const { log } = useAuditoria();

  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tituloForm, setTituloForm] = useState("Cadastro");
  const [confirmarId, setConfirmarId] = useState(null);

  const filtrados = fornecedores.filter((f) => {
    const termo = busca.toLowerCase();
    return (
      (f.nome?.toLowerCase() || "").includes(termo) ||
      (f.cnpj || "").includes(termo) ||
      (f.rua?.toLowerCase() || "").includes(termo) ||
      (f.bairro?.toLowerCase() || "").includes(termo) ||
      (f.cidade?.toLowerCase() || "").includes(termo) ||
      (f.estado?.toLowerCase() || "").includes(termo) ||
      (f.tipo?.toLowerCase() || "").includes(termo)
    );
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(fornecedorSchema),
  });

  useEffect(() => {
    if (!mostrarForm) {
      reset({});
      setEditando(null);
    } else {
      if (editando) {
        reset({
          nome: editando.nome || "",
          cnpj: editando.cnpj || "",
          rua: editando.rua || "",
          numero: editando.numero || "",
          bairro: editando.bairro || "",
          cidade: editando.cidade || "",
          estado: editando.estado || "",
          cep: editando.cep || "",
          tipo: editando.tipo || "Outros",
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
      await editarFornecedor(editando.id, dados);
      await log(
        "auditoriaFornecedores",
        "Editar fornecedor",
        "Atualizou dados do fornecedor",
        dadosAntes,
        dados,
        "FornecedoresList"
      );
    } else {
      await adicionarFornecedor(dados);
      await log(
        "auditoriaFornecedores",
        "Criar fornecedor",
        "Cadastro de novo fornecedor",
        null,
        dados,
        "FornecedoresList"
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
    const dadosAntes = fornecedores.find((f) => f.id === confirmarId);
    await excluirFornecedor(confirmarId);
    await log(
      "auditoriaFornecedores",
      "Excluir fornecedor",
      "Removeu fornecedor",
      dadosAntes,
      null,
      "FornecedoresList"
    );
    setConfirmarId(null);
  };

  return (
    <div
      style={{
         maxWidth: "100%",
        minheight:"100vh",
        padding: "20px 15px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxSizing: "border-box",
        
        
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
        <h2 style={{ marginBottom: "20px" }}>Fornecedores</h2>

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
          Cadastrar Fornecedor
        </button>
        <SearchInput
          value={busca}
          onChange={setBusca}
          placeholder="Buscar fornecedores..."
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
      </div>

      <Modal
        isOpen={mostrarForm}
        onClose={fecharModal}
        title={`${tituloForm} Fornecedor`}
      >
        <Form
          onSubmit={handleSubmit(onSubmit)}
          style={{ padding: 0, border: "none", maxWidth: "100%" }}
        >
          <FormField
            label="Nome"
            name="nome"
            type="text"
            register={register}
            error={errors.nome}
            inputStyle={{
              width: "100%",
              maxWidth: "400px",
              boxSizing: "border-box",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              height: "38px",
              marginBottom: "12px",
            }}
          />
          <FormField
            label="CNPJ"
            name="cnpj"
            type="text"
            register={register}
            error={errors.cnpj}
            inputStyle={{
              width: "100%",
              maxWidth: "400px",
              boxSizing: "border-box",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              height: "38px",
              marginBottom: "12px",
            }}
            placeholder="Somente números (14 dígitos)"
          />
          <FormField
            label="Rua"
            name="rua"
            type="text"
            register={register}
            error={errors.rua}
            inputStyle={{
              width: "100%",
              maxWidth: "400px",
              boxSizing: "border-box",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              height: "38px",
              marginBottom: "12px",
            }}
          />
          <FormField
            label="Número"
            name="numero"
            type="text"
            register={register}
            error={errors.numero}
            inputStyle={{
              width: "100%",
              maxWidth: "400px",
              boxSizing: "border-box",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              height: "38px",
              marginBottom: "12px",
            }}
          />
          <FormField
            label="Bairro"
            name="bairro"
            type="text"
            register={register}
            error={errors.bairro}
            inputStyle={{
              width: "100%",
              maxWidth: "400px",
              boxSizing: "border-box",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              height: "38px",
              marginBottom: "12px",
            }}
          />
          <FormField
            label="Cidade"
            name="cidade"
            type="text"
            register={register}
            error={errors.cidade}
            inputStyle={{
              width: "100%",
              maxWidth: "400px",
              boxSizing: "border-box",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              height: "38px",
              marginBottom: "12px",
            }}
          />
          <FormField
            label="Estado"
            name="estado"
            type="text"
            register={register}
            error={errors.estado}
            inputStyle={{
              width: "100%",
              maxWidth: "400px",
              boxSizing: "border-box",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              height: "38px",
              marginBottom: "12px",
            }}
          />
          <FormField
            label="CEP"
            name="cep"
            type="text"
            register={register}
            error={errors.cep}
            inputStyle={{
              width: "100%",
              maxWidth: "400px",
              boxSizing: "border-box",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              height: "38px",
              marginBottom: "12px",
            }}
            placeholder="Somente números (8 dígitos)"
          />

          {/* Select Tipo */}
          <label
            htmlFor="tipo"
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          >
            Tipo
          </label>
          <select
            id="tipo"
            {...register("tipo")}
            style={{
              width: "100%",
              maxWidth: "400px",
              boxSizing: "border-box",
              padding: "8px",
              borderRadius: "4px",
              border: errors.tipo ? "1px solid red" : "1px solid #ccc",
              fontSize: "14px",
              height: "38px",
              marginBottom: "12px",
            }}
          >
            {tiposFornecedor.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          {errors.tipo && (
            <span style={{ color: "red", fontSize: "12px" }}>
              {errors.tipo.message}
            </span>
          )}

          <SubmitButton loading={isSubmitting}>
            {editando ? "Atualizar" : "Cadastrar"}
          </SubmitButton>
        </Form>
      </Modal>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          padding: "30px",
        }}
      >
        {filtrados.map((f) => (
          <ListItem
            key={f.id}
            title={`${f.nome} (${f.tipo})`}
            subtitle={`${f.rua}, ${f.numero} - ${f.bairro} | ${f.cidade} - ${f.estado} | CEP: ${f.cep}`}
            onEdit={() => handleEdit(f)}
            onDelete={() => setConfirmarId(f.id)}
            style={{ marginBottom: "12px" ,width: "calc(30% - 10px)"}}
          />
        ))}
      </div>

      {confirmarId !== null && (
        <ConfirmDialog
          title="Excluir fornecedor"
          message="Tem certeza que deseja excluir este fornecedor?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmarId(null)}
        />
      )}
    </div>
  );
};

export default FornecedoresList;
