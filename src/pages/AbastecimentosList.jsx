import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { abastecimentoSchema } from "../schemas/abastecimentoSchema";
import { useAbastecimentos } from "../hooks/useAbastecimentos";
import { useVeiculos } from "../hooks/useVeiculos";
import { useMotoristas } from "../hooks/useMotoristas";
import { useFornecedores } from "../hooks/useFornecedores";
import { useAuditoria } from "../hooks/useAuditoria";
import { SearchInput } from "../components/SearchInput";
import { FormField } from "../components/FormField";
import { ListItem } from "../components/ListItem";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SubmitButton } from "../components/SubmitButton";
import { Form } from "../components/Form";
import { Modal } from "../components/Modal";
import { formatData } from "../utils/data";
// Função auxiliar para pegar último km abastecido por veículo
const getUltimoKmPorVeiculo = (abastecimentos) =>
  abastecimentos.reduce((acc, cur) => {
    const kmAtual = acc[cur.placa] || 0;
    if (cur.km > kmAtual) {
      acc[cur.placa] = cur.km;
    }
    return acc;
  }, {});

const AbastecimentosList = () => {
  const {
    abastecimentos,
    adicionarAbastecimento,
    editarAbastecimento,
    excluirAbastecimento,
  } = useAbastecimentos();
  const { veiculos } = useVeiculos();
  const { motoristas } = useMotoristas();
  const { fornecedores } = useFornecedores();
  const { log } = useAuditoria();

  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tituloForm, setTituloForm] = useState("Cadastro");
  const [confirmarId, setConfirmarId] = useState(null);

  // Indexar últimos kms para validação
  const ultimoKmPorVeiculo = useMemo(
    () => getUltimoKmPorVeiculo(abastecimentos),
    [abastecimentos]
  );

  // Filtrar abastecimentos pela placa, motorista ou fornecedor
  const filtrados = abastecimentos.filter((a) => {
    const buscaLower = busca.toLowerCase();
    return (
      a.placa.toLowerCase().includes(buscaLower) ||
      a.motorista?.toLowerCase().includes(buscaLower) ||
      a.fornecedor?.toLowerCase().includes(buscaLower)
    );
  });

  // Hook Form com validação dinâmica para litros e km
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(abastecimentoSchema),
  });

  // Watch campos para validação customizada
  const watchedPlaca = watch("placa");
  const watchedKm = watch("km");
  const watchedLitros = watch("litros");

  // Validação extra litros vs capacidade tanque
  useEffect(() => {
    if (!watchedPlaca || !watchedLitros) return;

    const veiculo = veiculos.find((v) => v.placa === watchedPlaca);
    if (!veiculo) return;

    const capacidadeTanque = Number(veiculo.capacidadeTanque || 0);
    const litrosNum = Number(watchedLitros);

    if (litrosNum > capacidadeTanque) {
      setError("litros", {
        type: "manual",
        message: `Litros não podem exceder a capacidade do tanque (${capacidadeTanque} L).`,
      });
    } else {
      clearErrors("litros");
    }
  }, [watchedPlaca, watchedLitros, setError, clearErrors, veiculos]);

  // Validação extra km ≥ último km abastecido
  useEffect(() => {
    if (!watchedPlaca || !watchedKm) return;

    const kmNum = Number(watchedKm);
    const ultimoKm = ultimoKmPorVeiculo[watchedPlaca] || 0;

    // Se estamos editando e o km não mudou, não dá erro
    if (editando && editando.km === kmNum) {
      clearErrors("km");
      return;
    }

    if (kmNum < ultimoKm) {
      setError("km", {
        type: "manual",
        message: `KM não pode ser menor que o último abastecimento (${ultimoKm} km).`,
      });
    } else {
      clearErrors("km");
    }
  }, [
    watchedPlaca,
    watchedKm,
    setError,
    clearErrors,
    ultimoKmPorVeiculo,
    editando,
  ]);

  // Reset form ao abrir/fechar modal e editar
  useEffect(() => {
    if (!mostrarForm) {
      reset({});
      setEditando(null);
    } else if (editando) {
      reset({
        ...editando,
        data: editando.data
          ? new Date(editando.data).toISOString().slice(0, 10)
          : "",
      });
    } else {
      reset({});
    }
  }, [mostrarForm, editando, reset]);

  // Abrir cadastro
  const abrirCadastro = () => {
    setEditando(null);
    setTituloForm("Cadastro");
    setMostrarForm(true);
  };

  // Fechar modal
  const fecharModal = () => setMostrarForm(false);

  // Submit form
  const onSubmit = async (dados) => {
    // converte data string para Date
    const dadosFormatados = { ...dados, data: new Date(dados.data) };

    if (editando) {
      const dadosAntes = editando;
      await editarAbastecimento(editando.id, dadosFormatados);
      await log(
        "auditoriaAbastecimentos",
        "Editar abastecimento",
        "Atualizou dados do abastecimento",
        dadosAntes,
        dadosFormatados,
        "AbastecimentosList"
      );
    } else {
      await adicionarAbastecimento(dadosFormatados);
      await log(
        "auditoriaAbastecimentos",
        "Criar abastecimento",
        "Cadastro de novo abastecimento",
        null,
        dadosFormatados,
        "AbastecimentosList"
      );
    }
    fecharModal();
  };

  // Editar item
  const handleEdit = (item) => {
    setEditando(item);
    setTituloForm("Editar");
    setMostrarForm(true);
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    const dadosAntes = abastecimentos.find((a) => a.id === confirmarId);
    await excluirAbastecimento(confirmarId);
    await log(
      "auditoriaAbastecimentos",
      "Excluir abastecimento",
      "Removeu abastecimento",
      dadosAntes,
      null,
      "AbastecimentosList"
    );
    setConfirmarId(null);
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
      <h2 style={{ marginBottom: "20px" }}>Abastecimentos</h2>

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
        Cadastrar Abastecimento
      </button>

      <Modal
        isOpen={mostrarForm}
        onClose={fecharModal}
        title={`${tituloForm} Abastecimento`}
      >
        <Form
          onSubmit={handleSubmit(onSubmit)}
          style={{ padding: 0, border: "none", maxWidth: "100%" }}
        >
          {/* Placa (select) */}
          <FormField
            label="Placa"
            name="placa"
            as="select"
            register={register}
            error={errors.placa}
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
          >
            <option value="">Selecione a placa</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.placa}>
                {v.placa} - {v.modelo}
              </option>
            ))}
          </FormField>

          {/* Motorista (select) */}
          <FormField
            label="Motorista"
            name="motorista"
            as="select"
            register={register}
            error={errors.motorista}
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
          >
            <option value="">Selecione o motorista</option>
            {motoristas.map((m) => (
              <option key={m.id} value={m.nome}>
                {m.nome}
              </option>
            ))}
          </FormField>

          {/* Fornecedor (select) */}
          <FormField
            label="Fornecedor"
            name="fornecedor"
            as="select"
            register={register}
            error={errors.fornecedor}
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
          >
            <option value="">Selecione o fornecedor</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.nome}>
                {f.nome}
              </option>
            ))}
          </FormField>

          {/* KM */}
          <FormField
            label="KM"
            name="km"
            type="number"
            register={register}
            error={errors.km}
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

          {/* Data */}
          <FormField
            label="Data"
            name="data"
            type="date"
            register={register}
            error={errors.data}
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

          {/* Litros */}
          <FormField
            label="Litros"
            name="litros"
            type="number"
            step="0.01"
            register={register}
            error={errors.litros}
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

          {/* Valor litro */}
          <FormField
            label="Valor do Litro"
            name="valorLitro"
            type="number"
            step="0.01"
            register={register}
            error={errors.valorLitro}
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

          <SubmitButton loading={isSubmitting}>
            {editando ? "Atualizar" : "Cadastrar"}
          </SubmitButton>
        </Form>
      </Modal>

      <SearchInput
        value={busca}
        onChange={setBusca}
        placeholder="Buscar abastecimentos..."
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
        {filtrados.map((a) => (
          <ListItem
            key={a.id}
            title={`${a.placa} - ${a.motorista || "-"}`}
            subtitle={`KM: ${a.km} |  Data: ${formatData(a.data)} | Litros: ${
              a.litros
            } | Valor litro: R$ ${a.valorLitro.toFixed(2)}`}
            onEdit={() => handleEdit(a)}
            onDelete={() => setConfirmarId(a.id)}
            style={{ marginBottom: "12px" }}
          />
        ))}
      </div>

      {confirmarId !== null && (
        <ConfirmDialog
          title="Excluir abastecimento"
          message="Tem certeza que deseja excluir este abastecimento?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmarId(null)}
        />
      )}
    </div>
  );
};

export default AbastecimentosList;
