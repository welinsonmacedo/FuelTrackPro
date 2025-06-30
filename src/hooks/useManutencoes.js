import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";

export const useManutencoes = () => {
  const [manutencoes, setManutencoes] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "manutencoes"), (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setManutencoes(dados);
    });

    return () => unsubscribe();
  }, []);

  const adicionarManutencao = async (dados) => {
    await addDoc(collection(db, "manutencoes"), {
      ...dados,
      data: new Date(),
    });
  };

  const editarManutencao = async (id, dados) => {
    const ref = doc(db, "manutencoes", id);
    await updateDoc(ref, {
      ...dados,
      atualizadoEm: new Date(),
    });
  };

  const excluirManutencao = async (id) => {
    await deleteDoc(doc(db, "manutencoes", id));
  };

  return {
    manutencoes,
    adicionarManutencao,
    editarManutencao,
    excluirManutencao,
  };
};
