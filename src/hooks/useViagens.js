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
    const snap = await getDocs(collection(db, "viagens"));
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setViagens(list);
  };

  const adicionarViagem = async (dados) => {
    await addDoc(collection(db, "viagens"), dados);
    fetchViagens();
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