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

   const navigate = useNavigate();

    const tipos= () => {
    navigate("/tipos-manutencoes");
  };
  // Estado para dropdown aberto em manutenções realizadas
  const [dropdownAbertoId, setDropdownAbertoId] = useState(null);

  const filtradas = manutencoes.filter((m) => {
    const buscaLower = String(busca || "").toLowerCase();
    return (
      (m.placa?.toLowerCase().includes(buscaLower)) ||
      (m.fornecedor?.toLowerCase().includes(buscaLower))
    );
  });

  useEffect(() => {
    if (!mostrarForm) {
      setEditando(null);
    } else {
      if (editando) {
        reset(editando);
      } else {
        reset({});
      }
    }
  }, [mostrarForm, editando]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(manutencaoSchema) });

  const abrirCadastro = () => {
    setEditando(null);
    setTituloForm("Cadastro");
    setMostrarForm(true);
  };

  const fecharModal = () => setMostrarForm(false);

  const abrirModalRealizacao = (manutencao) => {
    setManutencaoParaRealizar(manutencao);
    setDataRealizacao("");
    setKmRealizacao("");
    setFornecedorRealizacao("");
    setMostrarModalRealizacao(true);
  };

  const fecharModalRealizacao = () => {
    setMostrarModalRealizacao(false);
    setManutencaoParaRealizar(null);
  };

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
            footer {
              margin-top: 90%;
            }
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

  const handleConfirmarRealizacao = async () => {
    if (!dataRealizacao || !kmRealizacao || !fornecedorRealizacao) {
      alert("Preencha todos os campos para concluir a realização.");
      return;
    }

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
      ? parseInt(kmRealizacao) + parseInt(tipoSelecionado.tempoKm)
      : null;

    await editarManutencao(manutencaoParaRealizar.id, {
      ...manutencaoParaRealizar,
      dataRealizacao: dataRealizacaoObj,
      kmRealizacao: parseInt(kmRealizacao),
      fornecedorRealizacao,
      realizada: true,
    });

    const novaManutencao = {
      placa: manutencaoParaRealizar.placa,
      tipoManutencao: manutencaoParaRealizar.tipoManutencao,
      fornecedor: "",
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
    setDropdownAbertoId(null);
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
    setDropdownAbertoId(null);
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
            width: "auto",
            cursor:"pointer"
          }}
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
          fontWeight:"900",
          width: "100%",
          maxWidth: "400px",
          boxSizing: "border-box",
        }}
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
            {...register("placa")}
            error={errors.placa?.message}
            options={veiculos.map((v) => v.placa)}
            listId="veiculos-list"
          />
          <FormField
            label="Tipo Manutenção"
            {...register("tipoManutencao")}
            error={errors.tipoManutencao?.message}
            options={tiposManutencao.map((t) => t.nome)}
            listId="tipos-list"
          />
          <FormField
            label="Fornecedor"
            {...register("fornecedor")}
            error={errors.fornecedor?.message}
            options={fornecedores.map((f) => f.nome)}
            listId="fornecedores-list"
          />
          <FormField
            label="KM"
            type="number"
            {...register("km")}
            error={errors.km?.message}
          />
          <FormField
            label="Observação"
            {...register("observacao")}
            error={errors.observacao?.message}
            type="textarea"
          />
          <SubmitButton
            disabled={isSubmitting}
            style={{
              marginTop: "15px",
              width: "100%",
              backgroundColor: "#3498db",
              color: "#fff",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tituloForm}
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
            >
              Confirmar
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
                  ? `Data: ${formatData(m.proximaRevisaoData)}`
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
                  >
                    Marcar como realizada
                  </button>

                  <button
                    onClick={() => imprimirManutencao(m)}
                    style={{
                      backgroundColor: "#3498db",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Imprimir ficha
                  </button>

                  <button
                    onClick={() => handleEdit(m)}
                    style={{
                      backgroundColor: "#f39c12",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      marginLeft: "8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => setConfirmarId(m.id)}
                    style={{
                      backgroundColor: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      marginLeft: "8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Excluir
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: "8px", position: "relative" }}>
                  <button
                    onClick={() => toggleDropdown(m.id)}
                    style={{
                      backgroundColor: "#95a5a6",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    Visualizar ficha ▾
                  </button>

                  {dropdownAbertoId === m.id && (
                    <div
                      style={{
                        position: "absolute",
                        top: "40px",
                        left: "0",
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        borderRadius: "4px",
                        zIndex: 100,
                        width: "180px",
                      }}
                    >
                      <button
                        onClick={() => {
                          imprimirManutencao(m);
                          setDropdownAbertoId(null);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 12px",
                          backgroundColor: "transparent",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        Visualizar ficha
                      </button>
                      <button
                        onClick={() => {
                          setDropdownAbertoId(null);
                          handleEdit(m);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 12px",
                          backgroundColor: "transparent",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          color: "#f39c12",
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setDropdownAbertoId(null);
                          setConfirmarId(m.id);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 12px",
                          backgroundColor: "transparent",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          color: "#e74c3c",
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
