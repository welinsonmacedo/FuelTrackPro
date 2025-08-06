/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { Modal } from "./Modal";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";

export function OsModal({
  isOpen,
  onClose,
  checklistId,
  fornecedores,
  defeitosDisponiveis = [],
  modoSimplificado = false,
  modoNota = false,
  modoVisualizacao = false,
  onSaved,
}) {
  const [osDados, setOsDados] = useState({
    oficina: "",
    placa: "",
    dataAgendada: "",
    horario: "",
    defeitosSelecionados: [],
    itensUsados: [],
    desconto: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const temFornecedores =
    Array.isArray(fornecedores) && fornecedores.length > 0;
  const [defeitosParaExibir, setDefeitosParaExibir] = useState([]);

 useEffect(() => {
  if (!isOpen || !checklistId) return;

  const carregarOS = async () => {
    try {
      const ref = doc(db, "checklists", checklistId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const dados = snap.data();

        if (dados.osCriada && dados.osDetalhes) {
          setOsDados({
            oficina: dados.osDetalhes.oficina || "",
            placa: dados.osDetalhes.placa || "",
            dataAgendada: dados.osDetalhes.dataAgendada || "",
            horario: dados.osDetalhes.horario || "",
            defeitosSelecionados: dados.osDetalhes.defeitosSelecionados || [],
            itensUsados: dados.osDetalhes.itensUsados || [],
            desconto: dados.osDetalhes.desconto || 0,
          });

          if (modoVisualizacao) {
            setDefeitosParaExibir(dados.osDetalhes.defeitosSelecionados || []);
          } else {
            // se não for visualização, exiba todos defeitos disponíveis, que você deve passar via props
            // para isso use defeitosDisponiveis que vem do ChecklistPage
            setDefeitosParaExibir(defeitosDisponiveis);
          }
        } else {
          setOsDados({
            oficina: "",
            placa: "",
            dataAgendada: "",
            horario: "",
            defeitosSelecionados: [],
            itensUsados: [],
            desconto: 0,
          });
          setDefeitosParaExibir(defeitosDisponiveis);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar OS:", error);
      alert("Erro ao carregar OS");
    }
  };

  carregarOS();
}, [isOpen, checklistId, defeitosDisponiveis, modoVisualizacao]);


  const adicionarItem = () => {
    if (modoVisualizacao) return;
    setOsDados((prev) => ({
      ...prev,
      itensUsados: [
        ...prev.itensUsados,
        { nome: "", valorUnitario: 0, quantidade: 1 },
      ],
    }));
  };

  const atualizarItem = (index, campo, valor) => {
    if (modoVisualizacao) return;
    const novosItens = [...osDados.itensUsados];
    novosItens[index][campo] =
      campo === "quantidade" || campo === "valorUnitario"
        ? Number(valor)
        : valor;
    setOsDados((prev) => ({ ...prev, itensUsados: novosItens }));
  };

  const calcularTotalItens = () =>
    osDados.itensUsados.reduce(
      (total, item) => total + item.valorUnitario * item.quantidade,
      0
    );

  const salvar = async () => {
    if (modoVisualizacao) return;
    if (isSubmitting) return;

    if (!osDados.oficina || !osDados.dataAgendada || !osDados.horario) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);

      const refChecklist = doc(db, "checklists", checklistId);
      const snap = await getDoc(refChecklist);
      const dadosChecklist = snap.exists() ? snap.data() : {};

      const statusOSNovo = modoNota
        ? "concluida"
        : dadosChecklist.statusOS === "concluida"
        ? "concluida"
        : "aberta";

      // Atualiza checklist com os dados do formulário
      await updateDoc(refChecklist, {
        osCriada: true,
        statusOS: statusOSNovo,
        dataOSCriada: dadosChecklist.dataOSCriada || new Date(),
        osDetalhes: {
          ...osDados,
          totalGeral: calcularTotalItens() - osDados.desconto,
        },
      });

      // Salva ou atualiza na coleção financeiro/os
      const refFinanceiroOS = doc(db, "financeiro", "os", checklistId);

      const dadosFinanceiros = {
        placa: osDados.placa,
        defeitosSelecionados: osDados.defeitosSelecionados,
        totalGeral: calcularTotalItens() - osDados.desconto,
        dataAgendada: osDados.dataAgendada,
        horario: osDados.horario,
        oficina: osDados.oficina,
        checklistId,
        timestamp: Timestamp.now(),
        statusOS: statusOSNovo,
      };

      await setDoc(refFinanceiroOS, dadosFinanceiros);

      alert("OS salva com sucesso!");
      onSaved?.();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar OS:", error);
      alert("Erro ao salvar OS, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modoNota ? "Nota de Vinculo" : "Ordem de Serviço"}
      maxWidth={700}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          salvar();
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Dados gerais */}
          <div
            style={{
              padding: 16,
              border: "1px solid #ccc",
              borderRadius: 8,
              backgroundColor: "#f9f9f9",
              display: "flex",
              gap: "30px",
              flexWrap: "wrap",
            }}
          >
            {/* Oficina (select ou input) */}
            {Array.isArray(fornecedores) && fornecedores.length > 0 ? (
              <FormField
                label="Oficina"
                name="oficina"
                as="select"
                value={osDados.oficina}
                onChange={(e) =>
                  setOsDados((p) => ({ ...p, oficina: e.target.value }))
                }
                options={fornecedores.map((f) => ({
                  label: f.nome,
                  value: f.nome,
                }))}
                required
                disabled={modoVisualizacao}
                style={{ minWidth: 200 }}
              />
            ) : (
              <FormField
                label="Oficina"
                name="oficina"
                type="text"
                value={osDados.oficina}
                onChange={(e) =>
                  setOsDados((p) => ({ ...p, oficina: e.target.value }))
                }
                required
                disabled={modoVisualizacao}
                style={{ minWidth: 200 }}
              />
            )}

            {/* Placa editável */}
            <FormField
              label="Placa"
              name="placa"
              type="text"
              value={osDados.placa}
              onChange={(e) =>
                setOsDados((p) => ({ ...p, placa: e.target.value }))
              }
              disabled={modoVisualizacao}
              style={{ minWidth: 120 }}
            />

            <FormField
              label="Data Agendada"
              type="date"
              value={osDados.dataAgendada}
              onChange={(e) =>
                setOsDados((p) => ({ ...p, dataAgendada: e.target.value }))
              }
              required
              disabled={modoVisualizacao}
              style={{ minWidth: 150 }}
            />
            <FormField
              label="Horário"
              type="time"
              value={osDados.horario}
              onChange={(e) =>
                setOsDados((p) => ({ ...p, horario: e.target.value }))
              }
              required
              disabled={modoVisualizacao}
              style={{ minWidth: 100 }}
            />
          </div>

          {/* Defeitos Relatados */}
          <fieldset
            style={{
              padding: 16,
              border: "1px solid #ccc",
              borderRadius: 8,
              backgroundColor: "#fefefe",
              minWidth: 500,
            }}
            disabled={modoVisualizacao}
          >
            <legend>
              <strong>Defeitos Relatados</strong>
            </legend>
            {defeitosParaExibir.length === 0 ? (
              <p>Nenhum defeito relatado.</p>
            ) : (
              defeitosParaExibir.map((defeito) => {
                const isChecked = osDados.defeitosSelecionados.some(
                  (d) => d.item === defeito.item
                );
                return (
                  <label
                    key={defeito.item}
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        ;
                        let novoArray;
                        if (e.target.checked) {
                          novoArray = [
                            ...osDados.defeitosSelecionados,
                            {
                              item: defeito.item,
                              observacao: defeito.observacao,
                            },
                          ];
                        } else {
                          novoArray = osDados.defeitosSelecionados.filter(
                            (d) => d.item !== defeito.item
                          );
                        }
                        setOsDados((p) => ({
                          ...p,
                          defeitosSelecionados: novoArray,
                        }));
                      }}
                      style={{ marginRight: 8 }}
                      disabled={modoVisualizacao}
                    />
                    {defeito.item} — <em>{defeito.observacao}</em>
                  </label>
                );
              })
            )}
          </fieldset>

          {/* Itens usados + desconto (se não modo simplificado) */}
          {!modoSimplificado && (
            <>
              <fieldset
                style={{
                  padding: 16,
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  backgroundColor: "#fefefe",
                }}
              >
                <legend>
                  <strong>Itens Usados</strong>
                </legend>
                {osDados.itensUsados.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Item"
                      value={item.nome}
                      onChange={(e) =>
                        atualizarItem(index, "nome", e.target.value)
                      }
                      style={{ flex: 2, padding: 6 }}
                      disabled={modoVisualizacao}
                    />
                    <input
                      type="number"
                      placeholder="Valor Unit."
                      value={item.valorUnitario}
                      onChange={(e) =>
                        atualizarItem(index, "valorUnitario", e.target.value)
                      }
                      style={{ width: 100, padding: 6 }}
                      disabled={modoVisualizacao}
                    />
                    <input
                      type="number"
                      placeholder="Qtd"
                      value={item.quantidade}
                      onChange={(e) =>
                        atualizarItem(index, "quantidade", e.target.value)
                      }
                      style={{ width: 70, padding: 6 }}
                      disabled={modoVisualizacao}
                    />
                    <strong style={{ width: 100 }}>
                      R$ {(item.valorUnitario * item.quantidade).toFixed(2)}
                    </strong>
                  </div>
                ))}
                {!modoVisualizacao && (
                  <button
                    type="button"
                    onClick={adicionarItem}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      marginTop: 8,
                      cursor: "pointer",
                    }}
                  >
                    + Adicionar Item
                  </button>
                )}
              </fieldset>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: 16,
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <FormField
                  label="Desconto (R$)"
                  type="number"
                  value={osDados.desconto}
                  onChange={(e) =>
                    setOsDados((p) => ({
                      ...p,
                      desconto: Number(e.target.value),
                    }))
                  }
                  disabled={modoVisualizacao}
                />
                <p style={{ marginTop: 8, fontWeight: "bold", fontSize: 16 }}>
                  Total: R${" "}
                  {(calcularTotalItens() - osDados.desconto).toFixed(2)}
                </p>
              </div>
            </>
          )}

          {/* Botão salvar */}
          {!modoVisualizacao && (
            <SubmitButton type="submit" loading={isSubmitting}>
              {modoNota ? "Salvar Nota" : "Salvar OS"}
            </SubmitButton>
          )}
        </div>
      </form>
    </Modal>
  );
}
