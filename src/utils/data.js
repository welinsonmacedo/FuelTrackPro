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
