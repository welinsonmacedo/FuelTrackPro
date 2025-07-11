import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { viagensSchema } from "../schemas/viagemSchema";
import { useViagens } from "../hooks/useViagens";
import { useAbastecimentos } from "../hooks/useAbastecimentos";
import { useRotas } from "../hooks/useRotas";
import { FormField } from "../components/FormField";
import { Modal } from "../components/Modal";
import { Form } from "../components/Form";
import { SubmitButton } from "../components/SubmitButton";
import { ListItem } from "../components/ListItem";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { formatarPeriodo, formatData } from "../utils/data";
import { db } from "../services/firebase";
import { SearchInput } from "../components/SearchInput";
import ChecklistViagem from "./ChecklistViagem";

const ViagensList = ({ mostrarCadastrar = true }) => {
  const { viagens, adicionarViagem, editarViagem, excluirViagem } = useViagens();
  const { abastecimentos } = useAbastecimentos();
  const { rotas, loading: loadingRotas } = useRotas();

  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tituloForm, setTituloForm] = useState("Cadastro");
  const [confirmarId, setConfirmarId] = useState(null);
  const [viagemParaVincular, setViagemParaVincular] = useState(null);
  const [viagemChecklist, setViagemChecklist] = useState(null);

  // Objeto com chaves = id da viagem e valor = array de checklists vinculados
  const [checklistsPorViagem, setChecklistsPorViagem] = useState({});

  const clean = (str) => (str || "").toString().toLowerCase().trim();

  // Filtra viagens pelo termo da busca
  const filtrados = useMemo(() => {
    const buscaLower = busca.toLowerCase();

    return viagens.filter((v) => {
      return (
        clean(v.placa).includes(buscaLower) ||
        clean(v.motorista).includes(buscaLower) ||
        clean(v.rota).includes(buscaLower)
      );
    });
  }, [viagens, busca]);

  // Hook form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(viagensSchema) });

  // Placas e motoristas disponíveis para selects
  const placasDisponiveis = [
    ...new Set(abastecimentos.map((ab) => ab.placa).filter(Boolean)),
  ];
  const motoristasDisponiveis = [
    ...new Set(abastecimentos.map((ab) => ab.motorista).filter(Boolean)),
  ];

  // Form reset quando abrir/fechar modal
  useEffect(() => {
    if (!mostrarForm) {
      reset({});
      setEditando(null);
    } else if (editando) {
      reset({
        ...editando,
        dataInicio: editando.dataInicio?.toDate
          ? editando.dataInicio.toDate().toISOString().substr(0, 10)
          : "",
        dataFim: editando.dataFim?.toDate
          ? editando.dataFim.toDate().toISOString().substr(0, 10)
          : "",
        rota: editando.rota || "",
      });
    } else {
      reset({});
    }
  }, [mostrarForm, editando, reset]);

  // Funções abrir/fechar modal e submit formulário
  const abrirCadastro = () => {
    setEditando(null);
    setTituloForm("Cadastro");
    setMostrarForm(true);
  };

  const fecharModal = () => setMostrarForm(false);

  const onSubmit = async (dados) => {
    try {
      const dadosFormatados = {
        ...dados,
        dataInicio: Timestamp.fromDate(new Date(dados.dataInicio)),
        dataFim: Timestamp.fromDate(new Date(dados.dataFim)),
      };

      if (editando) {
        await editarViagem(editando.id, dadosFormatados);
      } else {
        await adicionarViagem(dadosFormatados);
      }
      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar viagem:", error);
      alert("Erro ao salvar viagem. Veja o console.");
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

  // Vinculação de abastecimentos
  const abastecimentosVinculados = useMemo(() => {
    if (!viagemParaVincular) return [];
    return abastecimentos.filter((ab) => ab.viagemId === viagemParaVincular.id);
  }, [viagemParaVincular, abastecimentos]);

  const abastecimentosDisponiveis = useMemo(() => {
    if (!viagemParaVincular) return [];
    const { placa, motorista, dataInicio, dataFim } = viagemParaVincular;
    const dtInicio = dataInicio?.toDate
      ? dataInicio.toDate()
      : new Date(dataInicio);
    const dtFim = dataFim?.toDate ? dataFim.toDate() : new Date(dataFim);

    return abastecimentos.filter((ab) => {
      const dataAbastecimento = ab.data?.toDate
        ? ab.data.toDate()
        : ab.data instanceof Date
        ? ab.data
        : new Date(ab.data);

      return (
        !ab.viagemId &&
        clean(ab.placa) === clean(placa) &&
        clean(ab.motorista) === clean(motorista) &&
        dataAbastecimento >= dtInicio &&
        dataAbastecimento <= dtFim
      );
    });
  }, [viagemParaVincular, abastecimentos]);

  const vincularAbastecimento = async (abastecimento) => {
    if (!viagemParaVincular?.id) return;
    try {
      const abastecimentoRef = doc(db, "abastecimentos", abastecimento.id);
      await updateDoc(abastecimentoRef, {
        viagemId: viagemParaVincular.id,
        atualizadoEm: new Date(),
      });
      alert("Abastecimento vinculado com sucesso!");
      setViagemParaVincular((v) => ({ ...v }));
    } catch (err) {
      console.error("Erro ao vincular abastecimento:", err);
      alert("Erro ao vincular abastecimento.");
    }
  };

  const desvincularAbastecimento = async (abastecimento) => {
    try {
      const abastecimentoRef = doc(db, "abastecimentos", abastecimento.id);
      await updateDoc(abastecimentoRef, {
        viagemId: null,
        atualizadoEm: new Date(),
      });
      alert("Abastecimento desvinculado com sucesso!");
      setViagemParaVincular((v) => ({ ...v }));
    } catch (err) {
      console.error("Erro ao desvincular abastecimento:", err);
      alert("Erro ao desvincular abastecimento.");
    }
  };

  // === BUSCAR CHECKLISTS FILTRADOS POR viagemId ===
  useEffect(() => {
    async function fetchChecklistsPorViagem() {
      const resultados = {};

      for (const viagem of filtrados) {
        try {
          // Buscar checklist onde viagemId == viagem.id
          const q = query(
            collection(db, "checklists"),
            where("viagemId", "==", viagem.id)
          );

          const querySnapshot = await getDocs(q);
          const checklists = querySnapshot.docs.map((doc) => doc.data());

          console.log(`Resultados para ${viagem.id}`, checklists.length);
          resultados[viagem.id] = checklists;
        } catch (error) {
          console.error("Erro ao buscar checklists para viagem", viagem.id, error);
          resultados[viagem.id] = [];
        }
      }

      setChecklistsPorViagem(resultados);
    }

    fetchChecklistsPorViagem();
  }, [filtrados]);

  if (loadingRotas) return <p>Carregando rotas...</p>;

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
      <h2 style={{ marginBottom: "20px" }}>Viagens</h2>

      {mostrarCadastrar && (
        <button
          onClick={abrirCadastro}
          style={{
            marginBottom: "20px",
            padding: "12px 20px",
            fontSize: "16px",
            backgroundColor: "#3498db",
            color: "#fff",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Cadastrar Viagem
        </button>
      )}

      <Modal
        isOpen={mostrarForm}
        onClose={fecharModal}
        title={`${tituloForm} Viagem`}
      >
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField
            label="Placa"
            name="placa"
            as="select"
            register={register}
            error={errors.placa}
          >
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

          <FormField
            label="Destino (Rota)"
            name="rota"
            as="select"
            register={register}
            error={errors.rota}
          >
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
          <FormField
            label="KM"
            name="km"
            type="number"
            register={register}
            error={errors.km}
          />

          <SubmitButton loading={isSubmitting}>
            {editando ? "Atualizar" : "Cadastrar"}
          </SubmitButton>
        </Form>
      </Modal>

      <SearchInput
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

      <div>
        {filtrados.map((v) => {
          const checklistsDaViagem = checklistsPorViagem[v.id] || [];

          // Desabilitar botão se já tem checklist daquele tipo para essa viagem (baseado no viagemId)
          const temChecklistInicio = checklistsDaViagem.some(
            (c) => c.tipo === "inicio"
          );
          const temChecklistFim = checklistsDaViagem.some(
            (c) => c.tipo === "fim"
          );

          return (
            <ListItem
              key={v.id}
              title={`${v.placa} - ${v.motorista}`}
              subtitle={`Destino: ${v.rota} | KM: ${v.km} | Período: ${formatarPeriodo(
                v.dataInicio,
                v.dataFim
              )}`}
              onEdit={mostrarCadastrar ? () => handleEdit(v) : undefined}
              onDelete={mostrarCadastrar ? () => setConfirmarId(v.id) : undefined}
              actions={[
                {
                  label: "Vincular",
                  onClick: () => setViagemParaVincular(v),
                  style: {
                    backgroundColor: "#28a745",
                    border: "1px solid #28a745",
                  },
                },
                {
                  label: "Checklist Início",
                  onClick: () => setViagemChecklist({ viagem: v, tipo: "inicio" }),
                  style: {
                    backgroundColor: temChecklistInicio ? "#aaa" : "#f39c12",
                    border: `1px solid ${temChecklistInicio ? "#999" : "#f39c12"}`,
                  },
                  disabled: temChecklistInicio,
                },
                {
                  label: "Checklist Fim",
                  onClick: () => setViagemChecklist({ viagem: v, tipo: "fim" }),
                  style: {
                    backgroundColor: temChecklistFim ? "#aaa" : "#8e44ad",
                    border: `1px solid ${temChecklistFim ? "#999" : "#8e44ad"}`,
                  },
                  disabled: temChecklistFim,
                },
              ]}
            />
          );
        })}
      </div>

      {confirmarId && (
        <ConfirmDialog
          title="Excluir viagem"
          message="Tem certeza que deseja excluir esta viagem?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmarId(null)}
        />
      )}

      <Modal
        isOpen={!!viagemParaVincular}
        onClose={() => setViagemParaVincular(null)}
        title={`Vincular Abastecimentos - Viagem ${viagemParaVincular?.placa || ""}`}
      >
        <div>
          <h3>Abastecimentos disponíveis para vincular:</h3>
          {abastecimentosDisponiveis.length > 0 ? (
            abastecimentosDisponiveis.map((ab) => (
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
                  onClick={() => vincularAbastecimento(ab)}
                  style={{
                    marginTop: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Vincular
                </button>
              </div>
            ))
          ) : (
            <p>Nenhum abastecimento disponível para vincular nesta viagem.</p>
          )}

          <hr style={{ margin: "20px 0" }} />

          <h3>Abastecimentos já vinculados:</h3>
          {abastecimentosVinculados.length > 0 ? (
            abastecimentosVinculados.map((ab) => (
              <div
                key={ab.id}
                style={{
                  padding: "8px",
                  border: "1px solid #999",
                  marginBottom: "8px",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div>Data: {formatData(ab.data)}</div>
                  <div>Litros: {ab.litros}</div>
                  <div>KM: {ab.km}</div>
                </div>
                <button
                  onClick={() => desvincularAbastecimento(ab)}
                  style={{
                    marginLeft: "20px",
                    padding: "6px 12px",
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Desvincular
                </button>
              </div>
            ))
          ) : (
            <p>Não há abastecimentos vinculados ainda.</p>
          )}
        </div>
      </Modal>

      {viagemChecklist && (
        <Modal
          isOpen={true}
          onClose={() => setViagemChecklist(null)}
          title={`Checklist de ${viagemChecklist.tipo === "inicio" ? "Início" : "Fim"} - ${viagemChecklist.viagem?.placa}`}
        >
          <ChecklistViagem
            tipo={viagemChecklist.tipo}
            rota={viagemChecklist.viagem.rota}
            placa={viagemChecklist.viagem.placa}
            motorista={viagemChecklist.viagem.motorista}
            viagemId={viagemChecklist.viagem.id} // importante passar o id da viagem
            onClose={() => setViagemChecklist(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ViagensList;
