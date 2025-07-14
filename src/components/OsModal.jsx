 
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { Modal } from "./Modal";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";
import { useCreateDespesa } from "../hooks/useFinanceiro";

export function OsModal({
  isOpen,
  onClose,
  checklistId,
  fornecedores,
  onSaved,
  defeitosDisponiveis = [],
  modoSimplificado = false,
  modoNota = false,
  modoVisualizacao = false, 
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

  const temFornecedores = Array.isArray(fornecedores) && fornecedores.length > 0;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDespesa = useCreateDespesa();

  useEffect(() => {
    if (!isOpen || !checklistId) return;

    const carregarOS = async () => {
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
            defeitosSelecionados: dados.osDetalhes.defeitos || [],
            itensUsados: dados.osDetalhes.itensUsados || [],
            desconto: dados.osDetalhes.desconto || 0,
          });
        }
      }
    };

    carregarOS();
  }, [isOpen, checklistId]);

  const adicionarItem = () => {
    if (modoVisualizacao) return; // bloqueia se estiver visualizando
    setOsDados((prev) => ({
      ...prev,
      itensUsados: [...prev.itensUsados, { nome: "", valorUnitario: 0, quantidade: 1 }],
    }));
  };

  const atualizarItem = (index, campo, valor) => {
    if (modoVisualizacao) return; // bloqueia se estiver visualizando
    const novosItens = [...osDados.itensUsados];
    novosItens[index][campo] =
      campo === "quantidade" || campo === "valorUnitario" ? Number(valor) : valor;
    setOsDados((prev) => ({ ...prev, itensUsados: novosItens }));
  };

  const calcularTotalItens = () =>
    osDados.itensUsados.reduce(
      (total, item) => total + item.valorUnitario * item.quantidade,
      0
    );

  const salvar = async () => {
    if (modoVisualizacao) return; // Não salva em modo visualização
    if (isSubmitting) return;

    if (!osDados.oficina || !osDados.dataAgendada || !osDados.horario) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);

      const ref = doc(db, "checklists", checklistId);
      const snap = await getDoc(ref);
      const dados = snap.exists() ? snap.data() : {};

      const statusOSNovo = modoNota ? "concluida" : dados.statusOS === "concluida" ? "concluida" : "aberta";

      await updateDoc(ref, {
        osCriada: true,
        statusOS: statusOSNovo,
        dataOSCriada: dados.dataOSCriada || new Date(),
        osDetalhes: {
          ...osDados,
          totalGeral: calcularTotalItens() - osDados.desconto,
        },
      });

      if (modoNota) {
        const despesaData = {
          tipo: "nota",
          placa: osDados.placa,
          descricao: `OS - Oficina: ${osDados.oficina}`,
          valor: calcularTotalItens() - osDados.desconto,
          data: Timestamp.fromDate(new Date(osDados.dataAgendada)),
          checklistId,
          status: "baixada",
        };
        await createDespesa(despesaData);
      }

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
    <Modal isOpen={isOpen} onClose={onClose} title={modoNota ? "Nota de Vinculo" : "Ordem de Serviço"}>
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
            }}
          >
            {temFornecedores ? (
              <FormField
                label="Oficina"
                name="oficina"
                as="select"
                value={osDados.oficina}
                onChange={(e) => setOsDados((p) => ({ ...p, oficina: e.target.value }))}
                options={fornecedores.map((f) => ({ label: f.nome, value: f.nome }))}
                required
                disabled={modoVisualizacao} // desabilita no modo visualização
              />
            ) : (
              <FormField
                label="Oficina"
                name="oficina"
                type="text"
                value={osDados.oficina}
                onChange={(e) => setOsDados((p) => ({ ...p, oficina: e.target.value }))}
                required
                disabled={modoVisualizacao}
              />
            )}

            <FormField
              label="Data Agendada"
              type="date"
              value={osDados.dataAgendada}
              onChange={(e) => setOsDados((p) => ({ ...p, dataAgendada: e.target.value }))}
              required
              disabled={modoVisualizacao}
            />
            <FormField
              label="Horário"
              type="time"
              value={osDados.horario}
              onChange={(e) => setOsDados((p) => ({ ...p, horario: e.target.value }))}
              required
              disabled={modoVisualizacao}
            />
          </div>

          {/* Defeitos */}
          <fieldset
            style={{
              padding: 16,
              border: "1px solid #ccc",
              borderRadius: 8,
              backgroundColor: "#fefefe",
              minWidth: 500,
            }}
            disabled={modoVisualizacao} // fieldset desabilitado no modo visualização
          >
            <legend>
              <strong>Defeitos Relatados</strong>
            </legend>
            {defeitosDisponiveis.length === 0 ? (
              <p>Nenhum defeito relatado.</p>
            ) : (
              defeitosDisponiveis.map((defeito) => {
                const isChecked = osDados.defeitosSelecionados.some((d) => d.item === defeito.item);
                return (
                  <label key={defeito.item} style={{ display: "block", marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (modoVisualizacao) return;
                        let novoArray;
                        if (e.target.checked) {
                          novoArray = [
                            ...osDados.defeitosSelecionados,
                            { item: defeito.item, observacao: defeito.observacao },
                          ];
                        } else {
                          novoArray = osDados.defeitosSelecionados.filter((d) => d.item !== defeito.item);
                        }
                        setOsDados((p) => ({ ...p, defeitosSelecionados: novoArray }));
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

          {/* Itens usados e desconto (se não modo simplificado) */}
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
                      onChange={(e) => atualizarItem(index, "nome", e.target.value)}
                      style={{ flex: 2, padding: 6 }}
                      disabled={modoVisualizacao}
                    />
                    <input
                      type="number"
                      placeholder="Valor Unit."
                      value={item.valorUnitario}
                      onChange={(e) => atualizarItem(index, "valorUnitario", e.target.value)}
                      style={{ width: 100, padding: 6 }}
                      disabled={modoVisualizacao}
                    />
                    <input
                      type="number"
                      placeholder="Qtd"
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(index, "quantidade", e.target.value)}
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
                  onChange={(e) => setOsDados((p) => ({ ...p, desconto: Number(e.target.value) }))}
                  disabled={modoVisualizacao}
                />
                <p style={{ marginTop: 8, fontWeight: "bold", fontSize: 16 }}>
                  Total: R$ {(calcularTotalItens() - osDados.desconto).toFixed(2)}
                </p>
              </div>
            </>
          )}

          {/* Botão salvar só aparece se não for modo visualização */}
          {!modoVisualizacao && (
            <SubmitButton type="button" onClick={salvar} loading={isSubmitting}>
              {modoNota ? "Salvar Nota" : "Salvar OS"}
            </SubmitButton>
          )}
        </div>
      </form>
    </Modal>
  );
}
