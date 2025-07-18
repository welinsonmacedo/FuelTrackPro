import React, { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { useMotoristas } from "../hooks/useMotoristas";
import { useVeiculos } from "../hooks/useVeiculos";
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
  const { motoristas } = useMotoristas();
  const { veiculos } = useVeiculos();

  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tituloForm, setTituloForm] = useState("Cadastro");
  const [confirmarId, setConfirmarId] = useState(null);
  const [viagemParaVincular, setViagemParaVincular] = useState(null);
  const [viagemChecklist, setViagemChecklist] = useState(null);
  const [checklistsPorViagem, setChecklistsPorViagem] = useState({});

  const clean = (str) => (str || "").toString().toLowerCase().trim();

  // motoristas para select com id e nome
  const motoristasDisponiveis = motoristas
    .filter((m) => m.id && m.nome)
    .map((m) => ({ id: m.id, nome: m.nome }));

  // Placas e motoristas disponíveis para selects
  const placasDisponiveis = [
    ...new Set(
      veiculos
        .filter((v) => v.tipo !== "Carreta") // filtra veículos que NÃO são carreta
        .map((v) => v.placa )
        .filter(Boolean)
    ),
  ];
  const placasCarretas = veiculos
    .filter((v) => v.tipo === "Carreta")
    .map((v) => v.placa);

  // Filtra viagens pelo termo da busca, incluindo nome do motorista
  const filtrados = useMemo(() => {
    const buscaLower = busca.toLowerCase();
    return viagens.filter((v) => {
      // buscar nome do motorista pelo id salvo na viagem
      const motoristaObj = motoristas.find((m) => m.id === v.motoristaId);
      const nomeMotorista = motoristaObj ? motoristaObj.nome : v.motoristaNome || "";

      return (
        clean(v.placa).includes(buscaLower) ||
        clean(nomeMotorista).includes(buscaLower) ||
        clean(v.rota).includes(buscaLower)
      );
    });
  }, [viagens, busca, motoristas]);

  // Hook form setup
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(viagensSchema) });

  // Observa o campo "placa" para atualizar o veículo selecionado
  const placaSelecionada = useWatch({ control, name: "placa" });
  const [veiculoPrincipalSelecionado, setVeiculoPrincipalSelecionado] =
    useState(null);

  useEffect(() => {
    if (!placaSelecionada) {
      setVeiculoPrincipalSelecionado(null);
      return;
    }
    const veiculo = veiculos.find((v) => v.placa === placaSelecionada);
    setVeiculoPrincipalSelecionado(veiculo || null);
  }, [placaSelecionada, veiculos]);

  // Form reset quando abrir/fechar modal ou editar
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
        motorista: editando.motoristaId || "", // passa o id para o select
        carreta: editando.carreta || "",
        km: editando.km || "",
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
      // pegar nome do motorista pelo id selecionado
      const motoristaSelecionado = motoristasDisponiveis.find(
        (m) => m.id === dados.motorista
      );

      if (!motoristaSelecionado) {
        alert("Motorista inválido!");
        return;
      }

      const dadosFormatados = {
        ...dados,
        motoristaId: dados.motorista, // salva o id
        motoristaNome: motoristaSelecionado.nome,
        motorista:  motoristaSelecionado.nome,
        dataInicio: Timestamp.fromDate(new Date(dados.dataInicio)),
        dataFim: Timestamp.fromDate(new Date(dados.dataFim)),
      };

      // Remove o campo antigo 'motorista' para evitar conflito, já que usamos motoristaId e motoristaNome
      delete dadosFormatados.motorista;

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
    const { placa, motoristaNome, dataInicio, dataFim } = viagemParaVincular;
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
        clean(ab.motorista) === clean(motoristaNome) &&
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

  // Buscar checklists para as viagens filtradas
  useEffect(() => {
    async function fetchChecklistsPorViagem() {
      const resultados = {};

      for (const viagem of filtrados) {
        try {
          const q = query(
            collection(db, "checklists"),
            where("viagemId", "==", viagem.id)
          );

          const querySnapshot = await getDocs(q);
          const checklists = querySnapshot.docs.map((doc) => doc.data());

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

      <Modal isOpen={mostrarForm} onClose={fecharModal} title={`${tituloForm} Viagem`}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField
            label="Placa (Veículo Principal)"
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

          {veiculoPrincipalSelecionado?.tipo === "Cavalo Mec." && (
            <FormField
              label="Carreta"
              name="carreta"
              as="select"
              register={register}
              error={errors.carreta}
            >
              <option value="">Selecione a carreta</option>
              {placasCarretas.map((placa) => (
                <option key={placa} value={placa}>
                  {placa}
                </option>
              ))}
            </FormField>
          )}

          <FormField
            label="Motorista"
            name="motorista"
            as="select"
            register={register}
            error={errors.motorista}
          >
            <option value="">Selecione o motorista</option>
            {motoristasDisponiveis.map(({ id, nome }) => (
              <option key={id} value={id}>
                {nome}
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
console.log("Viagem:", v);
          // Desabilitar botão se já tem checklist daquele tipo para essa viagem (baseado no viagemId)
          const temChecklistInicio = checklistsDaViagem.some((c) => c.tipo === "inicio");
          const temChecklistFim = checklistsDaViagem.some((c) => c.tipo === "fim");

          return (
            <ListItem
              key={v.id}
              title={`${v.placa} - ${v.carreta?.trim() || ''}- ${v.motoristaNome || ""}`}
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
                    backgroundColor: abastecimentos.some((ab) => ab.viagemId === v.id)
                      ? "#aaa"
                      : "#28a745",
                    border:
                      "1px solid " +
                      (abastecimentos.some((ab) => ab.viagemId === v.id)
                        ? "#999"
                        : "#28a745"),
                    color: "#fff",
                    cursor: "pointer",
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
          isOpen={!!confirmarId}
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
            <p>Nenhum abastecimento disponível para esta viagem.</p>
          )}

          <h3>Abastecimentos já vinculados:</h3>
          {abastecimentosVinculados.length > 0 ? (
            abastecimentosVinculados.map((ab) => (
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
                  onClick={() => desvincularAbastecimento(ab)}
                  style={{
                    marginTop: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#c0392b",
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
            <p>Sem abastecimentos vinculados.</p>
          )}
        </div>
      </Modal>

      {viagemChecklist && (
        <ChecklistViagem
          viagem={viagemChecklist.viagem}
          tipo={viagemChecklist.tipo}
          onClose={() => setViagemChecklist(null)}
        />
      )}
    </div>
  );
};

export default ViagensList;
