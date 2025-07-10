import React, { useState } from "react";

const tipos = ["Combustível", "Manutenção", "Pedágio", "Diária", "Outros"];

export default function DespesaForm({ initialData = {}, onSubmit, onCancel }) {
  const [tipo, setTipo] = useState(initialData.tipo || "");
  const [placa, setPlaca] = useState(initialData.placa || "");
  const [data, setData] = useState(() => {
    if (initialData.data) {
      // Se timestamp do Firestore, converte para string YYYY-MM-DD
      if (initialData.data.seconds) {
        const d = new Date(initialData.data.seconds * 1000);
        return d.toISOString().slice(0, 10);
      }
      // Se já for string, tenta usar direto
      if (typeof initialData.data === "string") return initialData.data;
    }
    return "";
  });
  const [valor, setValor] = useState(initialData.valor || "");
  const [descricao, setDescricao] = useState(initialData.descricao || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!tipo || !placa || !data || !valor) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    onSubmit({
      tipo,
      placa: placa.toUpperCase(),
      data: new Date(data),
      valor: parseFloat(valor),
      descricao,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "1rem auto" }}>
      <label>
        Tipo*:
        <select value={tipo} onChange={e => setTipo(e.target.value)} required>
          <option value="">Selecione o tipo</option>
          {tipos.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Placa*:
        <input
          type="text"
          value={placa}
          onChange={e => setPlaca(e.target.value.toUpperCase())}
          maxLength={8}
          required
          placeholder="Ex: ABC1234"
          style={{ textTransform: "uppercase" }}
        />
      </label>
      <br />
      <label>
        Data*:
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Valor*:
        <input
          type="number"
          step="0.01"
          min="0"
          value={valor}
          onChange={e => setValor(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Descrição:
        <textarea
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          rows={3}
          placeholder="Opcional"
        />
      </label>
      <br />
      <button type="submit" style={{ marginRight: 10 }}>Salvar</button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </form>
  );
}
