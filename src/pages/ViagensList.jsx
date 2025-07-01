import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { viagensSchema } from "../schemas/viagemSchema"; // seu schema Yup para viagens
import { useViagens } from "../hooks/useViagens"; // seu hook custom para viagens
import { useAbastecimentos } from "../hooks/useAbastecimentos"; // seu hook custom para abastecimentos
import { useRotas } from "../hooks/useRotas";
import { FormField } from "../components/FormField";
import { Modal } from "../components/Modal";
import { Form } from "../components/Form";
import { SubmitButton } from "../components/SubmitButton";
import { ListItem } from "../components/ListItem";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { formatData } from "../utils/data";

const ViagensList = () => {
  const { viagens, adicionarViagem, editarViagem, excluirViagem } = useViagens();
  const { abastecimentos } = useAbastecimentos();
  const { rotas, loading: loadingRotas } = useRotas();

  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tituloForm, setTituloForm] = useState("Cadastro");
  const [confirmarId, setConfirmarId] = useState(null);

  const filtrados = viagens.filter((v) => {
    const buscaLower = busca.toLowerCase();

    const placa = typeof v.placa === "string" ? v.placa.toLowerCase() : "";
    const motorista = typeof v.motorista === "string" ? v.motorista.toLowerCase() : "";
    const destino = typeof v.destino === "string" ? v.destino.toLowerCase() : "";

    return (
      placa.includes(buscaLower) ||
      motorista.includes(buscaLower) ||
      destino.includes(buscaLower)
    );
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(viagensSchema),
  });

  // Campos observados para filtro de abastecimentos vinculáveis
  const watchedPlaca = watch("placa");
  const watchedMotorista = watch("motorista");
  const watchedDataInicio = watch("dataInicio");
  const watchedDataFim = watch("dataFim");
  const watchedDestino = watch("rota"); // no seu FormField o nome do campo é "rota"

  // Filtra abastecimentos para vincular com base nos dados do formulário
  const abastecimentosParaVincular = useMemo(() => {
    if (
      !watchedPlaca ||
      !watchedMotorista ||
      !watchedDataInicio ||
      !watchedDataFim ||
      !watchedDestino
    )
      return [];
    const dtInicio = new Date(watchedDataInicio);
    const dtFim = new Date(watchedDataFim);

    return abastecimentos.filter((ab) => {
      const dataAbastecimento = new Date(ab.data);
      return (
        ab.placa === watchedPlaca &&
        ab.motorista === watchedMotorista &&
        (ab.destino === watchedDestino || ab.rota === watchedDestino) &&
        dataAbastecimento >= dtInicio &&
        dataAbastecimento <= dtFim
      );
    });
  }, [
    abastecimentos,
    watchedPlaca,
    watchedMotorista,
    watchedDataInicio,
    watchedDataFim,
    watchedDestino,
  ]);

  // Listas únicas para selects
  const placasDisponiveis = [
    ...new Set(
      abastecimentos
        .map((ab) => ab.placa)
        .filter((p) => typeof p === "string" && p.trim() !== "")
    ),
  ];

  const motoristasDisponiveis = [
    ...new Set(
      abastecimentos
        .map((ab) => ab.motorista)
        .filter((m) => typeof m === "string" && m.trim() !== "")
    ),
  ];

  useEffect(() => {
    if (!mostrarForm) {
      reset({});
      setEditando(null);
    } else if (editando) {
      reset({
        ...editando,
        dataInicio: formatData(editando.dataInicio),
        dataFim: formatData(editando.dataFim),
        rota: editando.rota || "", // garantindo que rota esteja setado
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

  const fecharModal = () => {
    setMostrarForm(false);
  };

  const onSubmit = async (dados) => {
    console.log("onSubmit chamado", dados);

    try {
      const dadosFormatados = {
        ...dados,
        dataInicio: formatData(dados.dataInicio),
        dataFim: formatData(dados.dataFim),
      };
      if (editando) {
        await editarViagem(editando.id, dadosFormatados);
      } else {
        await adicionarViagem(dadosFormatados);
      }
      fecharModal();
    } catch (error) {
      console.log("Erro ao salvar viagem:", error);
    }
  };

  const handleEdit = (item) => {
    setEditando(item);
    setTituloForm("Editar");
    setMostrarForm(true);
  };

  const handleConfirmDelete = async () => {
    await excluirViagem(confirmarId);
    setConfirmarId(null);
  };

  // Função para vincular abastecimento (a implementar conforme sua lógica)
  const vincularAbastecimento = (abastecimento) => {
    alert(`Vincular abastecimento ${abastecimento.id} à viagem.`);
    // Aqui você implementa a lógica para salvar essa vinculação
  };

  const onError = (errors) => {
    console.log("Erros no formulário:", errors);
  };

  if (loadingRotas) {
    return <p>Carregando rotas...</p>;
  }

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
      <h2 style={{ marginBottom: "20px" }}>Viagens</h2>

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
        Cadastrar Viagem
      </button>

      <Modal isOpen={mostrarForm} onClose={fecharModal} title={`${tituloForm} Viagem`}>
        <Form
          onSubmit={handleSubmit(onSubmit, onError)}
          style={{ padding: 0, border: "none", maxWidth: "100%" }}
        >
          <FormField label="Placa" name="placa" as="select" register={register} error={errors.placa}>
            <option value="">Selecione a placa</option>
            {placasDisponiveis.map((placa) => (
              <option key={placa} value={placa}>
                {placa}
              </option>
            ))}
          </FormField>

          <FormField
            label="Motorista"
            name="motorista"
            as="select"
            register={register}
            error={errors.motorista}
          >
            <option value="">Selecione o motorista</option>
            {motoristasDisponiveis.map((motorista) => (
              <option key={motorista} value={motorista}>
                {motorista}
              </option>
            ))}
          </FormField>

          <FormField label="Destino (Rota)" name="rota" as="select" register={register} error={errors.rota}>
            <option value="">Selecione a rota</option>
            {rotas.map((rota) => (
              <option key={rota.id} value={rota.sigla}>
                {rota.sigla} - {rota.origem} → {rota.destino}
              </option>
            ))}
          </FormField>

          <FormField
            label="Data Início"
            name="dataInicio"
            type="date"
            register={register}
            error={errors.dataInicio}
          />

          <FormField
            label="Data Fim"
            name="dataFim"
            type="date"
            register={register}
            error={errors.dataFim}
          />

          <FormField label="KM" name="km" type="number" register={register} error={errors.km} />

          {/* Lista abastecimentos vinculáveis */}
          {abastecimentosParaVincular.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h4>Abastecimentos para vincular:</h4>
              {abastecimentosParaVincular.map((ab) => (
                <div
                  key={ab.id}
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    marginBottom: "8px",
                  }}
                >
                  <div>Data: {formatData(ab.data)}</div>
                  <div>Litros: {ab.litros}</div>
                  <div>KM: {ab.km}</div>
                  <button
                    style={{
                      marginTop: "8px",
                      padding: "6px 12px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => vincularAbastecimento(ab)}
                  >
                    Vincular abastecimento
                  </button>
                </div>
              ))}
            </div>
          )}

          <SubmitButton loading={isSubmitting}>{editando ? "Atualizar" : "Cadastrar"}</SubmitButton>
        </Form>
      </Modal>

      <input
        type="text"
        placeholder="Buscar viagens..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
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
            title={`${v.placa} - ${v.motorista}`}
            subtitle={`Destino: ${v.destino} | KM: ${v.km} | Período: ${formatData(
              v.dataInicio
            )} - ${formatData(v.dataFim)}`}
            onEdit={() => handleEdit(v)}
            onDelete={() => setConfirmarId(v.id)}
            style={{ marginBottom: "12px" }}
          />
        ))}
      </div>

      {confirmarId && (
        <ConfirmDialog
          title="Excluir viagem"
          message="Tem certeza que deseja excluir esta viagem?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmarId(null)}
        />
      )}
    </div>
  );
};

export default ViagensList;
