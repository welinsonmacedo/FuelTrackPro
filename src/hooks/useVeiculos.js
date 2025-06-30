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

export const useVeiculos = () => {
  const [veiculos, setVeiculos] = useState([]);

  const fetchVeiculos = async () => {
    const snap = await getDocs(collection(db, "veiculos"));
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setVeiculos(list);
  };

  const adicionarVeiculo = async (dados) => {
    await addDoc(collection(db, "veiculos"), dados);
    fetchVeiculos();
  };

  const editarVeiculo = async (id, dados) => {
    await updateDoc(doc(db, "veiculos", id), dados);
    fetchVeiculos();
  };

  const excluirVeiculo = async (id) => {
    await deleteDoc(doc(db, "veiculos", id));
    fetchVeiculos();
  };

  useEffect(() => {
    fetchVeiculos();
  }, []);

  return { veiculos, adicionarVeiculo, editarVeiculo, excluirVeiculo };
};
