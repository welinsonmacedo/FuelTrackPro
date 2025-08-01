import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from "firebase/firestore";

export function usePneusEstoque(medidasAceitas = []) {
  const [pneusEstoque, setPneusEstoque] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transformar medidasAceitas em string estável para dependência
  const medidasKey = medidasAceitas.sort().join(",");

  useEffect(() => {
    async function fetchPneus() {
      setLoading(true);
      setError(null);
      try {
        const pneusRef = collection(db, "pneus");
        let q;

        if (medidasAceitas && medidasAceitas.length > 0) {
          if (medidasAceitas.length > 10) {
            throw new Error("Limite máximo de 10 medidas para filtro.");
          }
          q = query(pneusRef, where("medida", "in", medidasAceitas));
        } else {
          q = query(pneusRef);
        }

        const querySnapshot = await getDocs(q);
        const pneus = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPneusEstoque(pneus);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }

    fetchPneus();
  }, [medidasKey]);

  // Função para adicionar pneu no estoque
  async function adicionarPneu(pneu) {
  try {
    const pneusRef = collection(db, "pneus");
    const docRef = await addDoc(pneusRef, {
      ...pneu,
      dataCadastro: serverTimestamp(),
    });

    setPneusEstoque((prev) => [
      ...prev,
      {
        id: docRef.id,
        ...pneu,
        dataCadastro: new Date().toISOString(),
      },
    ]);

    return docRef; // ✅ Esta linha resolve seu erro!
  } catch (err) {
    setError(err.message);
    throw err;
  }
}
async function removerPneuDoVeiculo(pneuId, kmDesinstalacao, acaoRemover) {
  try {
    const pneuRef = doc(db, "pneus", pneuId);

    const novoStatus =
      acaoRemover === "estoque"
        ? "Estoque"
        : acaoRemover === "recap"
        ? "Recapagem"
        : "Descartado";

    await updateDoc(pneuRef, {
      status: novoStatus,
      kmDesinstalacao: kmDesinstalacao ? parseInt(kmDesinstalacao) : null,
      dataRemocao: new Date().toISOString(),
    });

    console.log("Pneu atualizado com sucesso.");
  } catch (error) {
    console.error("Erro ao remover pneu:", error);
    alert("Erro ao atualizar status do pneu.");
  }
}


  return {
    pneusEstoque,
    loading,
    error,
    removerPneuDoVeiculo,
    adicionarPneu, // função para cadastrar pneus
  };
}
