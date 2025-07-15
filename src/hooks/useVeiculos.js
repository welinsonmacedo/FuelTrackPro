import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

export const useVeiculos = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    try {
      const unsubscribe = onSnapshot(collection(db, "veiculos"), (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setVeiculos(list);
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("Erro na escuta em tempo real:", err);
        setError(err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Erro ao configurar listener:", err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const adicionarVeiculo = async (dados) => {
    try {
      setLoading(true);
      await addDoc(collection(db, "veiculos"), dados);
      return true;
    } catch (err) {
      console.error("Erro ao adicionar veículo:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editarVeiculo = async (id, dados) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "veiculos", id), dados);
      return true;
    } catch (err) {
      console.error("Erro ao editar veículo:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const excluirVeiculo = async (id) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "veiculos", id));
      return true;
    } catch (err) {
      console.error("Erro ao excluir veículo:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    veiculos,
    loading,
    error,
    adicionarVeiculo,
    editarVeiculo,
    excluirVeiculo,
  };
};