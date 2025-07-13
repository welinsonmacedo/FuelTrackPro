import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { manutencaoSchema } from "../schemas/manutencaoSchema";
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
import { ConfirmDialog } from "../components/ConfirmDialog";
import { formatData } from "../utils/data";
import { useNavigate } from "react-router-dom";

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

  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tituloForm, setTituloForm] = useState("Cadastro");
  const [confirmarId, setConfirmarId] = useState(null);

  const [mostrarModalRealizacao, setMostrarModalRealizacao] = useState(false);
  const [manutencaoParaRealizar, setManutencaoParaRealizar] = useState(null);
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [kmRealizacao, setKmRealizacao] = useState("");
  const [fornecedorRealizacao, setFornecedorRealizacao] = useState("");
  const [isRealizando, setIsRealizando] = useState(false);

  const [dropdownAbertoId, setDropdownAbertoId] = useState(null);

  const navigate = useNavigate();

  const tipos = () => {
    navigate("/tipos-manutencoes");
  };

  // Filtrar manutencoes (trata valores null/undefined)
  const filtradas = manutencoes.filter((m) => {
    const buscaLower = String(busca || "").toLowerCase();
    return (
      (m.placa || "").toLowerCase().includes(buscaLower) ||
      (m.fornecedor || "").toLowerCase().includes(buscaLower)
    );
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(manutencaoSchema),
  });

  // Resetar formulário quando abrir/fechar modal e preparar edição
  useEffect(() => {
    if (!mostrarForm) {
      setEditando(null);
      reset({});
    } else if (editando) {
      // Formatar datas para input date (string 'yyyy-MM-dd')
      const formatDateString = (d) => {
        if (!d) return "";
        if (d.toDate) return d.toDate().toISOString().substr(0, 10);
        if (d instanceof Date) return d.toISOString().substr(0, 10);
        return "";
      };

      reset({
        ...editando,
        proximaRevisaoData: formatDateString(editando.proximaRevisaoData),
        dataRealizacao: formatDateString(editando.dataRealizacao),
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

  const abrirModalRealizacao = (manutencao) => {
    setManutencaoParaRealizar(manutencao);
    setDataRealizacao("");
    setKmRealizacao("");
    setFornecedorRealizacao("");
    setIsRealizando(false);
    setMostrarModalRealizacao(true);
  };

  const fecharModalRealizacao = () => {
    setMostrarModalRealizacao(false);
    setManutencaoParaRealizar(null);
    setIsRealizando(false);
  };

  const imprimirManutencao = (m) => {
    const conteudo = `
      <html>
        <head>
          <title>Ficha de Manutenção</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; border: 2px solid #1e2933e2; padding:10px; }
            h1 { color: #1E90FF; border-bottom: 1px solid #0d1b29e1; padding-bottom: 8px; }
            div { padding: 8px; border-bottom: 1px solid #090b0cb0; }
            p { font-size: 16px; line-height: 1.4; margin: 6px 0; }
            b { color: #555; }
            footer { margin-top: 90%; }
          </style>
        </head>
        <body>
          <h1>Ficha de Manutenção</h1>
          <p><b>Placa:</b> ${m.placa}</p>
          <p><b>Tipo:</b> ${m.tipoManutencao}</p>
          <p><b>Fornecedor:</b> ${m.fornecedor || "-"}</p>
          <p><b>KM Atual:</b> ${m.km}</p>
          <p><b>Observação:</b> ${m.observacao || "-"}</p>
          <p><b>Próxima Revisão Data:</b> ${
            m.proximaRevisaoData
              ? formatData(
                  m.proximaRevisaoData.toDate
                    ? m.proximaRevisaoData.toDate()
                    : m.proximaRevisaoData
                )
              : "-"
          }</p>
          <p><b>Próxima Revisão KM:</b> ${m.proximaRevisaoKm || "-"}</p>
          <footer>
            <div><p>Assinatura Oficina: </p></div>
            <div><p>Assinatura Gerência: </p></div>
          </footer>
        </body>
      </html>
    `;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(conteudo);
      w.document.close();
      w.focus();
      w.print();
    } else {
      alert(
        "Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está ativo."
      );
    }
  };

  const handleConfirmarRealizacao = async () => {
    if (!dataRealizacao || !kmRealizacao || !fornecedorRealizacao) {
      alert("Preencha todos os campos para concluir a realização.");
      return;
    }
    setIsRealizando(true);

    try {
      const tipoSelecionado = tiposManutencao.find(
        (t) => t.nome === manutencaoParaRealizar.tipoManutencao
      );

      const dataRealizacaoObj = new Date(dataRealizacao);

      const proximaRevisaoData = tipoSelecionado?.tempoDias
        ? new Date(
            dataRealizacaoObj.getTime() +
              tipoSelecionado.tempoDias * 24 * 60 * 60 * 1000
          )
        : null;

      const proximaRevisaoKm = tipoSelecionado?.tempoKm
        ? Number(kmRealizacao) + Number(tipoSelecionado.tempoKm)
        : null;

      await editarManutencao(manutencaoParaRealizar.id, {
        ...manutencaoParaRealizar,
        dataRealizacao: dataRealizacaoObj,
        kmRealizacao: Number(kmRealizacao),
        fornecedorRealizacao,
        realizada: true,
      });

      const novaManutencao = {
        placa: manutencaoParaRealizar.placa,
        tipoManutencao: manutencaoParaRealizar.tipoManutencao,
        fornecedor: "", // adaptável conforme schema
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
    } catch (error) {
      alert("Erro ao realizar manutenção: " + error.message);
      setIsRealizando(false);
    }
  };

  const [isSalvando, setIsSalvando] = useState(false);

  const onSubmit = async (dados) => {
    setIsSalvando(true);
    try {
      // Validar tipo manutenção
      const tipoSelecionado = tiposManutencao.find(
        (t) => t.nome === dados.tipoManutencao
      );
      if (!tipoSelecionado) {
        alert("Tipo de manutenção inválido!");
        setIsSalvando(false);
        return;
      }

      const hoje = new Date();
      const proximaRevisaoData = tipoSelecionado.tempoDias
        ? new Date(
            hoje.getTime() + tipoSelecionado.tempoDias * 24 * 60 * 60 * 1000
          )
        : null;
      const proximaRevisaoKm = tipoSelecionado.tempoKm
        ? Number(dados.km) + Number(tipoSelecionado.tempoKm)
        : null;

      const dadosComProxima = {
        ...dados,
        proximaRevisaoData,
        proximaRevisaoKm,
        realizada: false,
      };

      if (editando) {
        await editarManutencao(editando.id, dadosComProxima);
        alert("Manutenção editada com sucesso");
        await log(
          "auditoriaManutencoes",
          "Editar manutenção",
          "Atualizou manutenção",
          editando,
          dadosComProxima
        );
      } else {
        await adicionarManutencao(dadosComProxima);
        alert("Manutenção cadastrada com sucesso");
        await log(
          "auditoriaManutencoes",
          "Cadastrar manutenção",
          "Criou nova manutenção",
          null,
          dadosComProxima
        );
      }
      fecharModal();
    } catch (error) {
      alert("Erro ao salvar manutenção: " + error.message);
      console.error("Erro onSubmit:", error);
    } finally {
      setIsSalvando(false);
    }
  };

  const handleEdit = (item) => {
    setEditando(item);
    setTituloForm("Editar");
    setMostrarForm(true);
    setDropdownAbertoId(null);
  };

  const handleConfirmDelete = async () => {
    try {
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
      setDropdownAbertoId(null);
    } catch (error) {
      alert("Erro ao excluir manutenção: " + error.message);
    }
  };

  const toggleDropdown = (id) => {
    setDropdownAbertoId((prev) => (prev === id ? null : id));
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Manutenções</h2>
        <button
          onClick={tipos}
          style={{
            marginBottom: "10px",
            padding: "10px 10px",
            fontSize: "16px",
            backgroundColor: "#cfd3d6",
            color: "#110a0a",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          type="button"
        >
          Tipos de Manutenção
        </button>
      </div>

      <button
        onClick={abrirCadastro}
        style={{
          marginBottom: "20px",
          padding: "12px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#4df55b",
          color: "#1e1f3b",
          fontWeight: "900",
          width: "100%",
          maxWidth: "400px",
          boxSizing: "border-box",
        }}
        type="button"
      >
        Lançar Manutenção
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
            error={errors.placa?.message}
            options={veiculos.map((v) => ({ value: v.placa, label: v.placa }))}
          />

          <FormField
            label="Tipo Manutenção"
            name="tipoManutencao"
            as="select"
            register={register}
            error={errors.tipoManutencao?.message}
            options={tiposManutencao.map((v) => ({
              value: v.nome,
              label: v.nome,
            }))}
          />

          <FormField
            label="Fornecedor"
            name="fornecedor"
            as="select"
            register={register}
            error={errors.fornecedor?.message}
            options={fornecedores.map((f) => ({
              value: f.nome,
              label: f.nome,
            }))}
          />

          <FormField
            label="KM"
            name="km"
            type="number"
            register={register}
            error={errors.km?.message}
          />

          <FormField
            label="Observação"
            name="observacao"
            as="textarea"
            register={register}
            error={errors.observacao?.message}
          />

          <SubmitButton type="submit" disabled={isSubmitting || isSalvando}>
            {isSalvando ? "Salvando..." : editando ? "Atualizar" : "Salvar"}
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirmarRealizacao();
          }}
        >
          <label>
            Data de realização:
            <input
              type="date"
              value={dataRealizacao}
              onChange={(e) => setDataRealizacao(e.target.value)}
              required
              style={{ width: "100%", marginBottom: "10px", padding: "6px" }}
            />
          </label>
          <label>
            KM na realização:
            <input
              type="number"
              value={kmRealizacao}
              onChange={(e) => setKmRealizacao(e.target.value)}
              required
              style={{ width: "100%", marginBottom: "10px", padding: "6px" }}
              min={manutencaoParaRealizar?.km || 0}
            />
          </label>
          <label>
            Fornecedor da realização:
            <select
              value={fornecedorRealizacao}
              onChange={(e) => setFornecedorRealizacao(e.target.value)}
              required
              style={{ width: "100%", marginBottom: "10px", padding: "6px" }}
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.nome}>
                  {f.nome}
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={fecharModalRealizacao}
              style={{
                marginRight: "10px",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                cursor: "pointer",
                backgroundColor: "#eee",
              }}
              disabled={isRealizando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#27ae60",
                color: "#fff",
                cursor: "pointer",
              }}
              disabled={isRealizando}
            >
              {isRealizando ? "Confirmando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </Modal>

      <SearchInput
        value={busca}
        onChange={setBusca}
        placeholder="Buscar por placa ou fornecedor..."
        style={{ marginBottom: "20px", maxWidth: "400px" }}
      />

      <div>
        {filtradas.map((m) => {
          const realizado = m.realizada;
          return (
            <div
              key={m.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "12px",
                position: "relative",
                backgroundColor: realizado ? "#ecf0f1" : "#fff",
              }}
            >
              <strong>
                {m.placa} - {m.tipoManutencao}
              </strong>
              <div
                style={{ marginTop: "4px", fontSize: "14px", color: "#555" }}
              >
                Fornecedor: {m.fornecedor || "-"} | Próxima revisão:{" "}
                {m.proximaRevisaoData
                  ? `Data: ${formatData(
                      m.proximaRevisaoData.toDate
                        ? m.proximaRevisaoData.toDate()
                        : m.proximaRevisaoData
                    )}`
                  : "-"}{" "}
                | KM prevista: {m.proximaRevisaoKm || "-"}
              </div>

              {!realizado ? (
                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() => abrirModalRealizacao(m)}
                    style={{
                      backgroundColor: "#27ae60",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      marginRight: "8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    type="button"
                  >
                    Marcar como realizada
                  </button>

                  <button
                    onClick={() => handleEdit(m)}
                    style={{
                      backgroundColor: "#2980b9",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      marginRight: "8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    type="button"
                  >
                    Editar
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: "8px", fontStyle: "italic" }}>
                  Realizada em:{" "}
                  {m.dataRealizacao
                    ? formatData(
                        m.dataRealizacao.toDate
                          ? m.dataRealizacao.toDate()
                          : m.dataRealizacao
                      )
                    : "-"}{" "}
                  | KM realizada: {m.kmRealizacao || "-"} | Fornecedor:{" "}
                  {m.fornecedorRealizacao || "-"}
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  cursor: "pointer",
                  userSelect: "none",
                  fontWeight: "900",
                  fontSize: "20px",
                }}
                onClick={() => toggleDropdown(m.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleDropdown(m.id);
                }}
                aria-label="Abrir menu de opções"
              >
                ⋮
                {dropdownAbertoId === m.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: "24px",
                      right: "0",
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      zIndex: 10,
                      minWidth: "140px",
                    }}
                  >
                    <button
                      onClick={() => {
                        imprimirManutencao(m);
                        setDropdownAbertoId(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      type="button"
                    >
                      Imprimir
                    </button>
                    <button
                      onClick={() => {
                        setConfirmarId(m.id);
                        setDropdownAbertoId(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "red",
                      }}
                      type="button"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={!!confirmarId}
        onCancel={() => setConfirmarId(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir esta manutenção?"
      />
    </div>
  );
};

export default ManutencoesList;
