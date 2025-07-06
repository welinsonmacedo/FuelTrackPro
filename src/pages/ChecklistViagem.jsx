import React, { useState } from "react";
import { checklistSchema } from "../schemas/checklistSchema";
import { useChecklists } from "../hooks/useChecklists";

const checklistPadrao = [
  {
    titulo: "Mecânica e Fluídos",
    itens: [
      "Óleo do motor",
      "Fluido de freio",
      "Água do radiador",
      "Correias",
      "Filtro de ar",
    ],
  },
  {
    titulo: "Sinalização e Iluminação",
    itens: [
      "Faróis dianteiros",
      "Luz de freio",
      "Setas (dianteira e traseira)",
      "Luz de ré",
      "Buzina",
    ],
  },
  {
    titulo: "Cabine / Painel",
    itens: [
      "Cinto de segurança",
      "Limpador de para-brisa",
      "Painel sem alertas",
      "Tacógrafo funcionando",
      "Interior limpo",
    ],
  },
  {
    titulo: "Pneus e Estrutura",
    itens: [
      "Pneus calibrados e sem desgaste",
      "Estepe em boas condições",
      "Baú fechado e travado",
      "Portas funcionais",
      "Lataria sem danos novos",
      "Extintor dentro da validade",
    ],
  },
];

export default function ChecklistViagem({
  tipo = "inicio",
  rota,
  placa,
  motorista,
  onSave,
}) {
  const checklist = checklistPadrao;

  const [respostas, setRespostas] = useState(() =>
    checklist.reduce((acc, grupo) => {
      grupo.itens.forEach((item) => {
        acc[item] = { status: "", observacao: "" };
      });
      return acc;
    }, {})
  );

  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [osCriada, setOsCriada] = useState(false);
  const [statusOS, setStatusOS] = useState(null); // pode ser "aberta", "concluida" ou null
  const [isSaving, setIsSaving] = useState(false);

  const { salvarChecklist } = useChecklists();

  const handleStatusChange = (item, status) => {
    setRespostas((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        status,
        observacao: status === "defeito" ? prev[item].observacao : "",
      },
    }));
  };

  const handleObservacaoChange = (item, observacao) => {
    setRespostas((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        observacao,
      },
    }));
  };

  const handleSubmit = async () => {
   
    const dadosChecklist = {
      rota,
      placa,
      motorista,
      tipo,
      dataRegistro: new Date(),
      respostas,
      observacoesGerais: observacoesGerais.trim(),
      osCriada,
      statusOS,
    };
 console.log(dadosChecklist.placa)
    try {
      setIsSaving(true);
      await checklistSchema.validate(dadosChecklist);
      await salvarChecklist(dadosChecklist);
      alert("Checklist salvo com sucesso!");
      setIsSaving(false);
      if (onSave) onSave(dadosChecklist);
    } catch (err) {
      setIsSaving(false);
      console.error("Erro ao salvar checklist:", err);
      alert("Erro ao salvar checklist. Veja o console.");
    }
  };

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 900,
        margin: "0 auto",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>
        Checklist de {tipo === "inicio" ? "Início" : "Fim"} da Viagem
      </h2>

      {checklist.map((grupo) => (
        <div key={grupo.titulo} style={{ marginBottom: 24 }}>
          <h4
            style={{ marginBottom: 10, color: "#2c3e50", fontSize: "18px" }}
          >
            {grupo.titulo}
          </h4>
          {grupo.itens.map((item) => (
            <div
              key={item}
              style={{
                marginBottom: 12,
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 6,
                backgroundColor: "#f9f9f9",
              }}
            >
              <div style={{ marginBottom: 8, fontWeight: 500 }}>{item}</div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <label>
                  <input
                    type="radio"
                    name={item}
                    checked={respostas[item].status === "ok"}
                    onChange={() => handleStatusChange(item, "ok")}
                    disabled={isSaving}
                  />{" "}
                  OK
                </label>
                <label>
                  <input
                    type="radio"
                    name={item}
                    checked={respostas[item].status === "defeito"}
                    onChange={() => handleStatusChange(item, "defeito")}
                    disabled={isSaving}
                  />{" "}
                  Com Defeito
                </label>
                <label>
                  <input
                    type="radio"
                    name={item}
                    checked={respostas[item].status === ""}
                    onChange={() => handleStatusChange(item, "")}
                    disabled={isSaving}
                  />{" "}
                  Não Verificado
                </label>
              </div>
              {respostas[item].status === "defeito" && (
                <textarea
                  placeholder="Descreva o defeito..."
                  value={respostas[item].observacao}
                  onChange={(e) => handleObservacaoChange(item, e.target.value)}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #aaa",
                    backgroundColor: "#fff",
                  }}
                  disabled={isSaving}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginBottom: 20 }}>
        <label>
          <strong>Observações gerais:</strong>
          <textarea
            value={observacoesGerais}
            onChange={(e) => setObservacoesGerais(e.target.value)}
            rows={3}
            style={{
              width: "93%",
              marginTop: 8,
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
              backgroundColor: "#fff",
            }}
            disabled={isSaving}
          />
        </label>
      </div>

      {/* Controle da OS */}
      <div style={{ marginBottom: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={osCriada}
            onChange={() => setOsCriada(!osCriada)}
            disabled={isSaving}
          />{" "}
          OS Criada
        </label>
        {osCriada && (
          <select
            value={statusOS || ""}
            onChange={(e) => setStatusOS(e.target.value)}
            disabled={isSaving}
            style={{ marginLeft: 20, padding: 4, borderRadius: 4 }}
          >
            <option value="">Selecione o status da OS</option>
            <option value="aberta">Aberta</option>
            <option value="concluida">Concluída</option>
          </select>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 40,
        }}
      >
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "10px 20px",
            backgroundColor: isSaving ? "#94d3a2" : "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: isSaving ? "wait" : "pointer",
          }}
          disabled={isSaving}
        >
          {isSaving ? "Salvando..." : "Salvar Checklist"}
        </button>
      </div>
    </div>
  );
}
