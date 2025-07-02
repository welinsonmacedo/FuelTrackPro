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

export const useTiposManutencao = () => {
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tiposManutencao"), (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTipos(dados);
    });

    return () => unsubscribe();
  }, []);

  const adicionarTipo = async (dados) => {
    await addDoc(collection(db, "tiposManutencao"), {
      ...dados,
      criadoEm: new Date(),
    });
  };

  const editarTipo = async (id, novosDados) => {
    const ref = doc(db, "tiposManutencao", id);
    await updateDoc(ref, {
      ...novosDados,
      atualizadoEm: new Date(),
    });
  };

  const excluirTipo = async (id) => {
    await deleteDoc(doc(db, "tiposManutencao", id));
  };

  // Corrigido: buscarTipoManutencao é função síncrona, sem async/await, retorna o tipo ou null
  const buscarTipoManutencao = (nomeTipo) => {
    return tipos.find((t) => t.nome === nomeTipo) || null;
  };

  return {
    tipos,
    adicionarTipo,
    editarTipo,
    excluirTipo,
    buscarTipoManutencao,
  };
};
