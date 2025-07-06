import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";

export const useViagens = () => {
  const [viagens, setViagens] = useState([]);

 const fetchViagens = async () => {
  try {
    const snap = await getDocs(collection(db, "viagens"));
    const list = snap.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        placa: data.placa ?? "",
        motorista: data.motorista ?? "",
        rota: data.rota ?? "",
        km: data.km ?? 0,
        dataInicio: data.dataInicio ?? "",
        dataFim: data.dataFim ?? "",
        
      };
    });

    setViagens(list);
  } catch (error) {
    console.error("Erro ao buscar viagens:", error);
    setViagens([]);
  }
};


 const adicionarViagem = async (dados) => {
  await addDoc(collection(db, "viagens"), dados);
  await fetchViagens();
};

  const editarViagem = async (id, dados) => {
    await updateDoc(doc(db, "viagens", id), dados);
    fetchViagens();
  };

  const excluirViagem = async (id) => {
    await deleteDoc(doc(db, "viagens", id));
    fetchViagens();
  };

  useEffect(() => {
    fetchViagens();
  }, []);

  return { viagens, adicionarViagem, editarViagem, excluirViagem };
};
