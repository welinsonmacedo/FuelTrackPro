import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export async function registrarAuditoria(
  colecaoAuditoria,
  idAnterior,
  dadosAntes,
  dadosDepois,
  acao,
  usuarioId,
  descricao,
  pagina
) {
  if (!usuarioId) {
    console.warn("Usuário ID ausente. Auditoria não será salva.");
    return;
  }

  function getDiferencas(antes = {}, depois = {}) {
    const difs = {};
    const chaves = new Set([...Object.keys(antes), ...Object.keys(depois)]);
    chaves.forEach((key) => {
      if (JSON.stringify(antes[key]) !== JSON.stringify(depois[key])) {
        difs[key] = { antes: antes[key], depois: depois[key] };
      }
    });
    return difs;
  }

  const diferencas = getDiferencas(dadosAntes, dadosDepois);

  const registro = {
    documentoId: idAnterior || null,
    acao,
    descricao,
    usuarioId,
    pagina,
    timestamp: serverTimestamp(),
    diferencas,
  };

  await addDoc(collection(db, "colecaoAuditoria"), registro);

}
