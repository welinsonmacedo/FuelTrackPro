import { Timestamp } from "firebase/firestore";

export function formataDataInput(timestamp) {
  if (!timestamp || !timestamp.toDate) return ''; // segurança
  const data = timestamp.toDate(); // converte o Firebase Timestamp em Date
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function formatData(data) {
  if (!data) return "-";
  // Se for Timestamp do Firebase
  if (data.seconds) {
    return new Date(data.seconds * 1000).toLocaleDateString();
  }
  // Se for string, tenta criar o Date
  const dt = new Date(data);
  if (isNaN(dt)) return "-";
  return dt.toLocaleDateString();
}


export function stringParaData(dataStr) {
  if (!dataStr || typeof dataStr !== "string") return null;  // evita erro

  const partes = dataStr.split("/");
  if (partes.length !== 3) return null;

  const [dia, mes, ano] = partes;
  return new Date(`${ano}-${mes}-${dia}`);
}

export function formatarPeriodo(dataInicio, dataFim) {
  if (!dataInicio || !dataFim) return "-";

  // Função que converte Timestamp para Date, ou usa Date direto
  const toDate = (d) => {
    if (!d) return null;
    if (d instanceof Timestamp) return d.toDate();
    if (d instanceof Date) return d;
    // tenta criar Date a partir de string ou número
    const date = new Date(d);
    return isNaN(date) ? null : date;
  };

  const inicio = toDate(dataInicio);
  const fim = toDate(dataFim);

  if (!inicio || !fim) return "-";

  const formatar = (d) =>
    d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return `${formatar(inicio)} - ${formatar(fim)}`;
}