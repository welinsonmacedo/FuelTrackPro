import { useState } from "react";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "../services/firebase"; 

const db = getFirestore(app);

export function usePneusFirestore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Adiciona um pneu novo no veículo
  async function adicionarPneu(veiculoId, pneu) {
    setLoading(true);
    setError(null);
    try {
      // Cria documento para o pneu na coleção "pneus"
      const pneuDocRef = doc(collection(db, "pneus"));
      await setDoc(pneuDocRef, {
        ...pneu,
        veiculoId,
        criadoEm: serverTimestamp(),
      });

      // Opcional: vincular o id do pneu ao veículo (se necessário atualizar veículo)
      // await updateDoc(doc(db, "veiculos", veiculoId), {
      //   pneus: arrayUnion(pneuDocRef.id)
      // });

      setLoading(false);
      return pneuDocRef.id;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }

  // Atualiza os pneus do veículo no array (geralmente em veiculos coleção)
  async function atualizarPneusVeiculo(veiculoId, pneusAtualizados) {
    setLoading(true);
    setError(null);
    try {
      const veiculoRef = doc(db, "veiculos", veiculoId);
      await updateDoc(veiculoRef, { pneus: pneusAtualizados });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }

  // Remove pneu do veículo e registra ação na subcoleção correta dentro do documento do pneu
 async function removerPneuComAcao(pneu, acao, veiculoId, recapId = null) {
  setLoading(true);
  setError(null);

  try {
    let pneuDocRef;

    if (pneu.id) {
      pneuDocRef = doc(db, "pneus", pneu.id);
      // Atualiza o pneu existente com dados atualizados e timestamp
      await updateDoc(pneuDocRef, {
        ...pneu,
        veiculoId,
        atualizadoEm: serverTimestamp(),
      });
    } else {
      pneuDocRef = doc(collection(db, "pneus"));
      await setDoc(pneuDocRef, {
        ...pneu,
        veiculoId,
        criadoEm: serverTimestamp(),
      });
    }

    // Define a subcoleção para registrar a ação
    const acaoCollectionName = {
      estoque: "estoque",
      recap: "recapagens",
      descarte: "descartes",
    }[acao];

    if (!acaoCollectionName) throw new Error("Ação inválida");

    const acaoDoc = {
      posicao: pneu.posicao,
      marca: pneu.marca,
      modelo: pneu.modelo || "",
      medida: pneu.medida,
      dataAcao: serverTimestamp(),
      status: pneu.status,
      veiculoId,
      obs: `Pneu ${acao}`,
    };

    if (acao === "recap" && recapId) {
      acaoDoc.idRecapagem = recapId;
    }

    await addDoc(collection(pneuDocRef, acaoCollectionName), acaoDoc);

    setLoading(false);
  } catch (err) {
    setLoading(false);
    setError(err.message);
    throw err;
  }
}

  return {
    loading,
    error,
    adicionarPneu,
    atualizarPneusVeiculo,
    removerPneuComAcao,
  };
}
