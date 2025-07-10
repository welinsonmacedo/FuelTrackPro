import { useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export const useFinanceiroCRUD = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDespesa = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const ref = collection(db, "financeiro");
      await addDoc(ref, {
        ...data,
        data: data.data instanceof Date ? Timestamp.fromDate(data.data) : data.data,
        criadoEm: Timestamp.now(),
      });
    } catch (e) {
      setError(e);
      console.error("Erro ao criar despesa:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateDespesa = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const ref = doc(db, "financeiro", id);
      await updateDoc(ref, {
        ...data,
        data: data.data instanceof Date ? Timestamp.fromDate(data.data) : data.data,
      });
    } catch (e) {
      setError(e);
      console.error("Erro ao atualizar despesa:", e);
    } finally {
      setLoading(false);
    }
  };

  const deleteDespesa = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const ref = doc(db, "financeiro", id);
      await deleteDoc(ref);
    } catch (e) {
      setError(e);
      console.error("Erro ao excluir despesa:", e);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createDespesa,
    updateDespesa,
    deleteDespesa,
  };
};
