import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { manutencaoSchema } from "../schemas/manutencaoSchema ";
import { useManutencoes } from "../hooks/useManutencoes";
import { useVeiculos } from "../hooks/useVeiculos";
import { useTiposManutencao } from "../hooks/useTiposManutencao";
import { useFornecedores } from "../hooks/useFornecedores";
import { useAuditoria } from "../hooks/useAuditoria";
import { FormField } from "../components/FormField";
import { Modal } from "../components/Modal";
import { Form } from "../components/Form";
import { SubmitButton } from "../components/SubmitButton";
import { SearchInput } from "../components/SearchInput";
import { ListItem } from "../components/ListItem";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { formatData } from "../utils/data";

const ManutencoesList = () => {
  const {
    manutencoes,
    adicionarManutencao,
    editarManutencao,
    excluirManutencao,
  } = useManutencoes();
  const { veiculos } = useVeiculos();
  const { tipos: tiposManutencao } = useTiposManutencao();
  const { fornecedores } = useFornecedores();
  const { log } = useAuditoria();

  // Estados para listagem e filtros
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tituloForm, setTituloForm] = useState("Cadastro");
  const [confirmarId, setConfirmarId] = useState(null);

  // Estado modal realização manutenção
  const [mostrarModalRealizacao, setMostrarModalRealizacao] = useState(false);
  const [manutencaoParaRealizar, setManutencaoParaRealizar] = useState(null);
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [kmRealizacao, setKmRealizacao] = useState("");
  const [fornecedorRealizacao, setFornecedorRealizacao] = useState("");

  // Filtro para busca
  const filtradas = manutencoes.filter((m) => {
    const buscaLower = busca.toLowerCase();
    return (
      m.placa?.toLowerCase().includes(buscaLower) ||
      m.fornecedor?.toLowerCase().includes(buscaLower)
    );
  });

  // Formulário de cadastro/edição
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(manutencaoSchema) });

  // Reset form ao abrir/fechar modal
  useEffect(() => {
    if (!mostrarForm) {
      reset({});
      setEditando(null);
    } else {
      if (editando) {
        reset(editando);
      } else {
        reset({});
      }
    }
  }, [mostrarForm, editando, reset]);

  // Abrir modal cadastro
  const abrirCadastro = () => {
    setEditando(null);
    setTituloForm("Cadastro");
    setMostrarForm(true);
  };

  // Fechar modal cadastro
  const fecharModal = () => setMostrarForm(false);

  // Abrir modal realização manutenção
  const abrirModalRealizacao = (manutencao) => {
    setManutencaoParaRealizar(manutencao);
    setDataRealizacao("");
    setKmRealizacao("");
    setFornecedorRealizacao("");
    setMostrarModalRealizacao(true);
  };

  // Fechar modal realização manutenção
  const fecharModalRealizacao = () => {
    setMostrarModalRealizacao(false);
    setManutencaoParaRealizar(null);
  };

  // Função para imprimir ficha - pode customizar conforme necessidade
  const imprimirManutencao = (m) => {
  const conteudo = `
    <html>
      <head>
        <title>Ficha de Manutenção</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
             border: 2px solid #1e2933e2;
             padding:10px;
          }
          h1 {
            color: #1E90FF;
            border-bottom: 1px solid #0d1b29e1;
            padding-bottom: 8px;
          }
            div {
             padding: 8px;
            border-bottom: 1px solid #090b0cb0;
           
          }
          p {
            font-size: 16px;
            line-height: 1.4;
            margin: 6px 0;
          }
          b {
            color: #555;
          }
            footer{
            margin-top:90%;}
        </style>
      </head>
      <body>
        <h1>Ficha de Manutenção</h1>
        <p><b>Placa:</b> ${m.placa}</p>
        <p><b>Tipo:</b> ${m.tipoManutencao}</p>
        <p><b>Fornecedor:</b> ${m.fornecedor}</p>
        <p><b>KM Atual:</b> ${m.km}</p>
        <p><b>Observação:</b> ${m.observacao || "-"}</p>
        <p><b>Próxima Revisão Data:</b> ${
          m.proximaRevisaoData ? formatData(m.proximaRevisaoData) : "-"
        }</p>
        <p><b>Próxima Revisão KM:</b> ${m.proximaRevisaoKm || "-"}</p>
        <footer>
        <div>
           <p>Assinatura Oficina: </p>
        </div>
     <div>
       <p>Assinatura Gerência: </p>
     </div>
      
         </footer>

        
      </body>
    </html>
  `;

  const w = window.open("", "_blank");
  w.document.write(conteudo);
  w.document.close();
  w.focus();
  w.print();
  w.close();
};


  // Confirmar realização da manutenção
  const handleConfirmarRealizacao = async () => {
    if (!dataRealizacao || !kmRealizacao || !fornecedorRealizacao) {
      alert("Preencha todos os campos para concluir a realização.");
      return;
    }

    const tipoSelecionado = tiposManutencao.find(
      (t) => t.nome === manutencaoParaRealizar.tipoManutencao
    );

    const dataRealizacaoObj = new Date(dataRealizacao);

    // Calcular próxima revisão baseado em tipo
    const proximaRevisaoData = tipoSelecionado?.tempoDias
      ? new Date(
          dataRealizacaoObj.getTime() + tipoSelecionado.tempoDias * 24 * 60 * 60 * 1000
        )
      : null;

    const proximaRevisaoKm = tipoSelecionado?.tempoKm
      ? parseInt(kmRealizacao) + parseInt(tipoSelecionado.tempoKm)
      : null;

    // Atualiza manutenção atual marcando como realizada
    await editarManutencao(manutencaoParaRealizar.id, {
      ...manutencaoParaRealizar,
      dataRealizacao: dataRealizacaoObj,
      kmRealizacao: parseInt(kmRealizacao),
      fornecedorRealizacao,
      realizada: true,
    });

    // Criar nova manutenção para próximo ciclo
    const novaManutencao = {
      placa: manutencaoParaRealizar.placa,
      tipoManutencao: manutencaoParaRealizar.tipoManutencao,
      fornecedor: "", // pode ficar vazio ou pré-definido
      km: proximaRevisaoKm || 0,
      observacao: "",
      proximaRevisaoData,
      proximaRevisaoKm,
      realizada: false,
    };
    await adicionarManutencao(novaManutencao);

    await log(
      "auditoriaManutencoes",
      "Realizar manutenção",
      `Manutenção realizada: ${manutencaoParaRealizar.id}`,
      manutencaoParaRealizar,
      novaManutencao
    );

    fecharModalRealizacao();
  };

  // Submit cadastro/edição
  const onSubmit = async (dados) => {
    const tipoSelecionado = tiposManutencao.find(
      (t) => t.nome === dados.tipoManutencao
    );

    const hoje = new Date();
    const proximaRevisaoData = tipoSelecionado?.tempoDias
      ? new Date(
          hoje.getTime() + tipoSelecionado.tempoDias * 24 * 60 * 60 * 1000
        )
      : null;

    const proximaRevisaoKm = tipoSelecionado?.tempoKm
      ? parseInt(dados.km) + parseInt(tipoSelecionado.tempoKm)
      : null;

    const dadosComProxima = {
      ...dados,
      proximaRevisaoData,
      proximaRevisaoKm,
      realizada: false,
    };

    if (editando) {
      await editarManutencao(editando.id, dadosComProxima);
      await log(
        "auditoriaManutencoes",
        "Editar manutenção",
        "Atualizou manutenção",
        editando,
        dadosComProxima
      );
    } else {
      await adicionarManutencao(dadosComProxima);
      await log(
        "auditoriaManutencoes",
        "Cadastrar manutenção",
        "Criou nova manutenção",
        null,
        dadosComProxima
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
    const dadosAntes = manutencoes.find((m) => m.id === confirmarId);
    await excluirManutencao(confirmarId);
    await log(
      "auditoriaManutencoes",
      "Excluir manutenção",
      "Removeu manutenção",
      dadosAntes,
      null
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
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Manutenções</h2>

      <button
        onClick={abrirCadastro}
        style={{
          marginBottom: "20px",
          padding: "12px 20px",
          fontSize: "16px",
          backgroundColor: "#3498db",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        Cadastrar Manutenção
      </button>

      {/* Modal cadastro/edição */}
      <Modal
        isOpen={mostrarForm}
        onClose={fecharModal}
        title={`${tituloForm} Manutenção`}
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
            {veiculos.map((v) => (
              <option key={v.id} value={v.placa}>
                {v.placa} - {v.modelo}
              </option>
            ))}
          </FormField>

          <FormField
            label="Tipo de Manutenção"
            name="tipoManutencao"
            as="select"
            register={register}
            error={errors.tipoManutencao}
          >
            <option value="">Selecione o tipo</option>
            {Array.isArray(tiposManutencao) &&
              tiposManutencao.map((tipo) => (
                <option key={tipo.id} value={tipo.nome}>
                  {tipo.nome}
                </option>
              ))}
          </FormField>

          <FormField
            label="Fornecedor"
            name="fornecedor"
            as="select"
            register={register}
            error={errors.fornecedor}
          >
            <option value="">Selecione o fornecedor</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.nome}>
                {f.nome}
              </option>
            ))}
          </FormField>

          <FormField
            label="KM Atual"
            name="km"
            type="number"
            register={register}
            error={errors.km}
          />

          <FormField
            label="Observação"
            name="observacao"
            type="text"
            register={register}
            error={errors.observacao}
          />

          <SubmitButton loading={isSubmitting}>
            {editando ? "Atualizar" : "Cadastrar"}
          </SubmitButton>
        </Form>
      </Modal>

      {/* Modal realização da manutenção */}
      <Modal
        isOpen={mostrarModalRealizacao}
        onClose={fecharModalRealizacao}
        title={`Marcar manutenção como realizada - ${
          manutencaoParaRealizar?.placa || ""
        }`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label>
            Data da realização:
            <input
              type="date"
              value={dataRealizacao}
              onChange={(e) => setDataRealizacao(e.target.value)}
              style={{ width: "90%", padding: "8px", marginTop: "4px" }}
            />
          </label>
          <label>
            KM na realização:
            <input
              type="number"
              value={kmRealizacao}
              onChange={(e) => setKmRealizacao(e.target.value)}
              style={{ width: "90%", padding: "8px", marginTop: "4px" }}
            />
          </label>
          <label>
            Oficina / Fornecedor:
            <select
              value={fornecedorRealizacao}
              onChange={(e) => setFornecedorRealizacao(e.target.value)}
              style={{ width: "95%", padding: "8px", marginTop: "4px" }}
            >
              <option value="">Selecione o fornecedor</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.nome}>
                  {f.nome}
                </option>
              ))}
            </select>
          </label>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <button
              onClick={() => imprimirManutencao(manutencaoParaRealizar)}
              style={{
                backgroundColor: "#3498db",
                color: "#fff",
                padding: "10px 15px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Imprimir ficha (antes)
            </button>
            <button
              onClick={handleConfirmarRealizacao}
              style={{
                backgroundColor: "#27ae60",
                color: "#fff",
                padding: "10px 15px",
                border: "none",
               
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Confirmar realização
            </button>
          </div>
        </div>
      </Modal>

      <SearchInput
        value={busca}
        onChange={setBusca}
        placeholder="Buscar por placa ou fornecedor..."
        style={{ marginBottom: "20px", maxWidth: "400px" }}
      />

      <div>
        {filtradas.map((m) => (
          <ListItem
    key={m.id}
    title={`${m.placa} - ${m.tipoManutencao}`}
    subtitle={`Fornecedor: ${m.fornecedor || "-"} | Próxima revisão: ${
      m.proximaRevisaoData
        ? `Data: ${formatData(m.proximaRevisaoData)}`
        : "-"
    } | KM prevista: ${m.proximaRevisaoKm || "-"}`}
    onEdit={m.realizada ? undefined : () => handleEdit(m)}
    onDelete={m.realizada ? undefined : () => setConfirmarId(m.id)}
    style={{ marginBottom: "12px" }}
    actions={
      m.realizada
        ? [
            {
              label: "Visualizar ficha",
              onClick: () => imprimirManutencao(m),
              style: { backgroundColor: "#95a5a6", color: "white" },
            },
          ]
        : [
            {
              label: "Marcar como realizada",
              onClick: () => abrirModalRealizacao(m),
              style: {
                backgroundColor: "#27ae60",
                color: "white",
                marginRight: 8,
              },
            },
            {
              label: "Imprimir ficha",
              onClick: () => imprimirManutencao(m),
              style: { backgroundColor: "#3498db", color: "white" },
            },
          ]
    }
  />
        ))}
      </div>

      {confirmarId && (
        <ConfirmDialog
          title="Excluir manutenção"
          message="Tem certeza que deseja excluir esta manutenção?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmarId(null)}
        />
      )}
    </div>
  );
};

export default ManutencoesList;
