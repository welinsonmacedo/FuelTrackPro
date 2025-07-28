// IMPORTS (sem alteração)
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

// 🚛 Último KM abastecido por placa
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
const { veiculos, atualizarVeiculo } = useVeiculos();


  const { motoristas } = useMotoristas();
  const { fornecedores } = useFornecedores();
  const { log } = useAuditoria();

  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tituloForm, setTituloForm] = useState("Cadastro");
  const [confirmarId, setConfirmarId] = useState(null);

  const ultimoKmPorVeiculo = useMemo(
    () => getUltimoKmPorVeiculo(abastecimentos),
    [abastecimentos]
  );

  const filtrados = abastecimentos.filter((a) => {
    const buscaLower = busca.toLowerCase();
    return (
      a.placa.toLowerCase().includes(buscaLower) ||
      a.motorista?.toLowerCase().includes(buscaLower) ||
      a.fornecedor?.toLowerCase().includes(buscaLower)
    );
  });

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

  const watchedPlaca = watch("placa");
  const watchedKm = watch("km");
  const watchedLitros = watch("litros");
  const watchedTipoCombustivel = watch("tipoCombustivel");

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

  // 🚫 Valida KM
  useEffect(() => {
    if (!watchedPlaca || !watchedKm) return;

    const kmNum = Number(watchedKm);
    const ultimoKm = ultimoKmPorVeiculo[watchedPlaca] || 0;

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
  }, [watchedPlaca, watchedKm, setError, clearErrors, ultimoKmPorVeiculo, editando]);

  // ⚠️ Valida tipo de combustível compatível com o veículo
  useEffect(() => {
    if (!watchedPlaca || !watchedTipoCombustivel) return;

    const veiculo = veiculos.find((v) => v.placa === watchedPlaca);
    if (!veiculo || !veiculo.tipoCombustivel) return;

    if (veiculo.tipoCombustivel !== watchedTipoCombustivel) {
      setError("tipoCombustivel", {
        type: "manual",
        message: `Esse veículo utiliza ${veiculo.tipoCombustivel}.`,
      });
    } else {
      clearErrors("tipoCombustivel");
    }
  }, [watchedPlaca, watchedTipoCombustivel, veiculos, setError, clearErrors]);

  useEffect(() => {
    if (!mostrarForm) {
      reset({});
      setEditando(null);
    } else if (editando) {
      reset({
        ...editando,
        data: editando.data ? formatData(editando.data) : "",
        tipoCombustivel: editando.tipoCombustivel || "",
      });
    } else {
      reset({});
    }
  }, [mostrarForm, editando, reset]);

  const abrirCadastro = () => {
    setEditando(null);
    setTituloForm("Cadastro");
    setMostrarForm(true);
  };

  const fecharModal = () => setMostrarForm(false);

  const onSubmit = async (dados) => {
  const dadosFormatados = { ...dados, data: new Date(dados.data) };

  if (editando) {
    const dadosAntes = editando;
    await editarAbastecimento(editando.id, dadosFormatados);
    await log("colecaoAuditoria", "Editar abastecimento", "Atualizou dados do abastecimento", dadosAntes, dadosFormatados, "AbastecimentosList");

    const veiculoAtual = veiculos.find((v) => v.placa === dadosFormatados.placa);
    if (veiculoAtual) {
      const kmAtualVeiculo = Number(veiculoAtual.kmAtual || 0);
      if (dadosFormatados.km > kmAtualVeiculo) {
        await atualizarVeiculo(veiculoAtual.id, { kmAtual: dadosFormatados.km });
      }
    }
  } else {
    await adicionarAbastecimento(dadosFormatados);
    await log("colecaoAuditoria", "Criar abastecimento", "Cadastro de novo abastecimento", null, dadosFormatados, "AbastecimentosList");

    const veiculoAtual = veiculos.find((v) => v.placa === dadosFormatados.placa);
    if (veiculoAtual) {
      await atualizarVeiculo(veiculoAtual.id, { kmAtual: dadosFormatados.km });
    }
  }

  fecharModal();
};


  const handleEdit = (item) => {
    setEditando(item);
    setTituloForm("Editar");
    setMostrarForm(true);
  };

  const handleConfirmDelete = async () => {
    const dadosAntes = abastecimentos.find((a) => a.id === confirmarId);
    await excluirAbastecimento(confirmarId);
    await log("colecaoAuditoria", "Excluir abastecimento", "Removeu abastecimento", dadosAntes, null, "AbastecimentosList");
    setConfirmarId(null);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", padding: "20px 15px", backgroundColor: "#fff", borderRadius: "8px", boxSizing: "border-box" }}>
      <h2 style={{ marginBottom: "20px" }}>Abastecimentos</h2>

      <button onClick={abrirCadastro} style={{ marginBottom: "20px", padding: "12px 20px", fontSize: "16px", cursor: "pointer", borderRadius: "6px", border: "none", backgroundColor: "#4df55b", color: "#1e1f3b", fontWeight: "900", width: "100%", maxWidth: "400px", boxSizing: "border-box" }}>
        Lançar Abastecimento
      </button>

      <Modal isOpen={mostrarForm} onClose={fecharModal} title={`${tituloForm} Abastecimento`}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Placa" name="placa" as="select" register={register} error={errors.placa}>
            <option value="">Selecione a placa</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.placa}>
                {v.placa} - {v.modelo}
              </option>
            ))}
          </FormField>

          <FormField label="Motorista" name="motorista" as="select" register={register} error={errors.motorista}>
            <option value="">Selecione o motorista</option>
            {motoristas.map((m) => (
              <option key={m.id} value={m.nome}>
                {m.nome}
              </option>
            ))}
          </FormField>

          <FormField label="Fornecedor" name="fornecedor" as="select" register={register} error={errors.fornecedor}>
            <option value="">Selecione o fornecedor</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.nome}>
                {f.nome}
              </option>
            ))}
          </FormField>

          <FormField label="Tipo de Combustível" name="tipoCombustivel" as="select" register={register} error={errors.tipoCombustivel}>
            <option value="">Selecione o tipo</option>
            <option value="Diesel S10">Diesel S10</option>
            <option value="Diesel Comum">Diesel Comum</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Etanol">Etanol</option>
          </FormField>

          <FormField label="KM" name="km" type="number" register={register} error={errors.km} />
          <FormField label="Data" name="data" type="date" register={register} error={errors.data} />
          <FormField label="Litros" name="litros" type="number" step="0.01" register={register} error={errors.litros} />
          <FormField label="Valor do Litro" name="valorLitro" type="number" step="0.01" register={register} error={errors.valorLitro} />

          <div style={{ width: "100%" }}>
            <SubmitButton loading={isSubmitting}>{editando ? "Atualizar" : "Cadastrar"}</SubmitButton>
          </div>
        </Form>
      </Modal>

      <SearchInput value={busca} onChange={setBusca} placeholder="Buscar abastecimentos..." style={{ marginBottom: "20px", padding: "8px", width: "100%", maxWidth: "400px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />

      <div style={{ width: "100%", maxWidth: "900px" }}>
        {filtrados.map((a) => (
          <ListItem
            key={a.id}
            title={`${a.placa} - ${a.motorista || "-"}`}
            subtitle={`KM: ${a.km} | Data: ${formatData(a.data)} | Litros: ${a.litros} | Tipo: ${a.tipoCombustivel || "-"} | Valor litro: R$ ${a.valorLitro.toFixed(2)} | Total: R$ ${(a.valorLitro * a.litros).toFixed(2)}`}
            onEdit={() => handleEdit(a)}
            onDelete={() => setConfirmarId(a.id)}
            style={{ marginBottom: "12px" }}
          />
        ))}
      </div>

   {confirmarId !== null && (
 <ConfirmDialog
  isOpen={confirmarId !== null}
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
