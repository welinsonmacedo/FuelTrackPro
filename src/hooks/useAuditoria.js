/* eslint-disable no-unused-vars */
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext"; // ajuste o caminho conforme seu projeto

function limparUndefined(obj) {
  if (Array.isArray(obj)) {
    return obj.map(limparUndefined);
  }
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, limparUndefined(v)])
    );
  }
  return obj;
}

export function useAuditoria() {
  const { usuario } = useAuth();

  async function log(collectionName, acao, descricao, dadosAntes, dadosDepois, local) {
    try {
      const usuarioInfo = usuario
        ? {
            uid: usuario.uid,
            email: usuario.email,
            displayName: usuario.displayName || null,
          }
        : null;

      const antesLimpo = dadosAntes === "novo" ? "novo" : limparUndefined(dadosAntes);
      const depoisLimpo = dadosDepois === null ? null : limparUndefined(dadosDepois);

      const docData = {
        acao,
        descricao,
        dadosAntes: antesLimpo,
        dadosDepois: depoisLimpo,
        local,
        usuario: usuarioInfo,
        timestamp: Timestamp.fromDate(new Date()),
      };

      console.log("Auditoria gravando documento:", JSON.stringify(docData, null, 2));

      await addDoc(collection(db, collectionName), docData);
    } catch (error) {
      console.error("Erro ao gravar auditoria:", error);
      throw error;
    }
  }

  return { log };
}
