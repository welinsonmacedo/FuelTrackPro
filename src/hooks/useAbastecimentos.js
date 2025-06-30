import { useState, useEffect } from 'react';
import { db } from '../services/firebase'; // seu setup do firebase
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

export function useAbastecimentos() {
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'abastecimentos'), orderBy('data', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setAbastecimentos(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function adicionarAbastecimento(dados) {
    await addDoc(collection(db, 'abastecimentos'), {
      ...dados,
      data: new Date(dados.data), // garante que a data esteja em formato Date
      criadoEm: new Date(),
    });
  }

  async function editarAbastecimento(id, dados) {
    const docRef = doc(db, 'abastecimentos', id);
    await updateDoc(docRef, {
      ...dados,
      data: new Date(dados.data),
      atualizadoEm: new Date(),
    });
  }

  async function excluirAbastecimento(id) {
    const docRef = doc(db, 'abastecimentos', id);
    await deleteDoc(docRef);
  }

  return {
    abastecimentos,
    loading,
    adicionarAbastecimento,
    editarAbastecimento,
    excluirAbastecimento,
  };
}
