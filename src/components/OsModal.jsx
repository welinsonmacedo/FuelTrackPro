import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { Modal } from "./Modal";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";

export function OsModal({
  isOpen,
  onClose,
  checklistId,
  fornecedores,
  onSaved,
  defeitosDisponiveis = [],
  modoSimplificado = false,
}) {
  const [osDados, setOsDados] = useState({
    oficina: "",
    dataAgendada: "",
    horario: "",
    defeitosSelecionados: [],
    itensUsados: [],
    desconto: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setOsDados((prev) => ({
      ...prev,
      itensUsados: [
        ...prev.itensUsados,
        { nome: "", valorUnitario: 0, quantidade: 1 },
      ],
    }));
  };

  const atualizarItem = (index, campo, valor) => {
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
    if (isSubmitting) return; // evita cliques múltiplos
    console.log("oii");
    if (!osDados.oficina || !osDados.dataAgendada || !osDados.horario) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);

      const ref = doc(db, "checklists", checklistId);
      const snap = await getDoc(ref);
      const dados = snap.exists() ? snap.data() : {};

      await updateDoc(ref, {
        osCriada: true,
        statusOS: dados.statusOS === "concluida" ? "concluida" : "aberta",
        dataOSCriada: dados.dataOSCriada || new Date(),
        osDetalhes: {
          ...osDados,
          totalGeral: calcularTotalItens() - osDados.desconto,
        },
      });

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
    <Modal isOpen={isOpen} onClose={onClose} title="Ordem de Serviço">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          salvar();
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* DADOS GERAIS */}
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
            />
            <FormField
              label="Data Agendada"
              type="date"
              value={osDados.dataAgendada}
              onChange={(e) =>
                setOsDados((p) => ({ ...p, dataAgendada: e.target.value }))
              }
              required
            />
            <FormField
              label="Horário"
              type="time"
              value={osDados.horario}
              onChange={(e) =>
                setOsDados((p) => ({ ...p, horario: e.target.value }))
              }
              required
            />
          </div>

          {/* DEFEITOS */}
          <fieldset
            style={{
              padding: 16,
              border: "1px solid #ccc",
              borderRadius: 8,
              backgroundColor: "#fefefe",
              minWidth: 500,
            }}
          >
            <legend>
              <strong>Defeitos Relatados</strong>
            </legend>
            {defeitosDisponiveis.length === 0 ? (
              <p>Nenhum defeito relatado.</p>
            ) : (
              defeitosDisponiveis.map((defeito) => {
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
                        let novoArray;
                        if (e.target.checked) {
                          // Adiciona o objeto completo
                          novoArray = [
                            ...osDados.defeitosSelecionados,
                            {
                              item: defeito.item,
                              observacao: defeito.observacao,
                            },
                          ];
                        } else {
                          // Remove pelo item
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
                    />
                    {defeito.item} — <em>{defeito.observacao}</em>
                  </label>
                );
              })
            )}
          </fieldset>
{!modoSimplificado && (
  <>
          {/* ITENS USADOS */}
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
                />
                <input
                  type="number"
                  placeholder="Valor Unit."
                  value={item.valorUnitario}
                  onChange={(e) =>
                    atualizarItem(index, "valorUnitario", e.target.value)
                  }
                  style={{ width: 100, padding: 6 }}
                />
                <input
                  type="number"
                  placeholder="Qtd"
                  value={item.quantidade}
                  onChange={(e) =>
                    atualizarItem(index, "quantidade", e.target.value)
                  }
                  style={{ width: 70, padding: 6 }}
                />
                <strong style={{ width: 100 }}>
                  R$ {(item.valorUnitario * item.quantidade).toFixed(2)}
                </strong>
              </div>
            ))}
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
          </fieldset>

          {/* DESCONTO E TOTAL */}
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
                setOsDados((p) => ({ ...p, desconto: Number(e.target.value) }))
              }
            />
            <p style={{ marginTop: 8, fontWeight: "bold", fontSize: 16 }}>
              Total: R$ {(calcularTotalItens() - osDados.desconto).toFixed(2)}
            </p>
          </div>
</>
)}
          {/* BOTÃO SALVAR */}

          <SubmitButton type="button" onClick={salvar} loading={isSubmitting}>
            Salvar OS
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
