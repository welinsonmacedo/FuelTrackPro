import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';

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
    const dataConvertida = new Date(dados.data);
    const docRef = await addDoc(collection(db, 'abastecimentos'), {
      ...dados,
      data: dataConvertida,
      criadoEm: new Date(),
    });

    await salvarMedia({ ...dados, data: dataConvertida, id: docRef.id });
  }

  async function editarAbastecimento(id, dados) {
    const dataConvertida = new Date(dados.data);
    const docRef = doc(db, 'abastecimentos', id);

    await updateDoc(docRef, {
      ...dados,
      data: dataConvertida,
      atualizadoEm: new Date(),
    });

    await salvarMedia({ ...dados, data: dataConvertida, id });
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

// Função para salvar a média automaticamente
async function salvarMedia(abastecimentoAtual) {
  const { placa, motorista, km, litros, data, id } = abastecimentoAtual;

  if (!placa || !motorista || !km || !litros || !data) return;

  const q = query(
    collection(db, 'abastecimentos'),
    where('placa', '==', placa),
    where('motorista', '==', motorista)
  );

  const snapshot = await getDocs(q);

  const abastecimentosAnteriores = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((a) => a.id !== id && a.km < km)
    .sort((a, b) => b.km - a.km); // do maior para o menor km

  const anterior = abastecimentosAnteriores[0];
  if (!anterior) return;

  const kmRodado = km - anterior.km;
  if (kmRodado <= 0) return;

  const media = parseFloat((kmRodado / litros).toFixed(2));

  await addDoc(collection(db, 'medias'), {
    placa,
    motorista,
    data: data instanceof Date ? Timestamp.fromDate(data) : data,
    kmInicial: anterior.km,
    kmFinal: km,
    litros,
    media,
    criadoEm: Timestamp.now(),
  });
}
