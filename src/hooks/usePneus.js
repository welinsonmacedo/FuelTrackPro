import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

const pneusCollection = collection(db, "pneus");

export function usePneus() {
  const fetchPneus = async () => {
    const snapshot = await getDocs(pneusCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const addPneu = async (pneu) => {
    pneu.criadoEm = serverTimestamp();
    await addDoc(pneusCollection, pneu);
  };

  const updatePneu = async (id, dados) => {
    const pneuDoc = doc(db, "pneus", id);
    await updateDoc(pneuDoc, dados);
  };

  const deletePneu = async (id) => {
    const pneuDoc = doc(db, "pneus", id);
    await deleteDoc(pneuDoc);
  };

  const removerPneuComAcao = async (pneu, acao, veiculoId, recapId = null) => {
    if (!pneu?.id || !acao || !veiculoId || pneu.kmDesinstalacao == null) {
      throw new Error("Parâmetros insuficientes para remover pneu");
    }

    const kmRodado = pneu.kmInstalacao
      ? Number(pneu.kmDesinstalacao) - pneu.kmInstalacao
      : null;

    const dadosRemocao = {
      ...pneu,
      veiculoId,
      acao,
      kmRodado,
      dataRemocao: new Date().toISOString(),
    };

    if (acao === "recap" && recapId) {
      dadosRemocao.recapId = recapId;
    }

    await addDoc(collection(db, "pneus_removidos"), dadosRemocao);
    await updatePneu(pneu.id, {
      instaladoEm: null,
      posicao: null,
      kmInstalacao: null,
      veiculoId: null,
    });
  };

  return {
    fetchPneus,
    addPneu,
    updatePneu,
    deletePneu,
    removerPneuComAcao,
  };
}