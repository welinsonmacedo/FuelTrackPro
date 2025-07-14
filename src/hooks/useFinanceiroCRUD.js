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

  const removeUndefinedFields = (obj) => {
    return Object.entries(obj).reduce((acc, [key, val]) => {
      acc[key] = val === undefined ? null : val;
      return acc;
    }, {});
  };

  const normalizeDespesa = (data) => {
    const itensNormalizados = Array.isArray(data.itens)
      ? data.itens.map((item) => ({
          ...item,
          valorUnitario: parseFloat(item.valorUnitario) || 0,
          quantidade: parseFloat(item.quantidade) || 0,
          desconto: parseFloat(item.desconto) || 0,
          valorTotal: parseFloat(item.valorTotal) || 0,
        }))
      : [];

    return {
      ...data,
      itens: itensNormalizados,
      total: parseFloat(data.total) || 0,
    };
  };

  const convertToTimestamp = (value) => {
    if (!value) return null;
    if (value instanceof Date) return Timestamp.fromDate(value);
    return value;
  };

  const createDespesa = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const dataNormalizada = normalizeDespesa(data);
      const dataTratada = {
        ...removeUndefinedFields(dataNormalizada),
        data: convertToTimestamp(dataNormalizada.data),
        criadoEm: Timestamp.now(),
      };
      await addDoc(collection(db, "financeiro"), dataTratada);
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
      const dataNormalizada = normalizeDespesa(data);
      const dataTratada = {
        ...removeUndefinedFields(dataNormalizada),
        data: convertToTimestamp(dataNormalizada.data),
        atualizadoEm: Timestamp.now(),
      };
      const ref = doc(db, "financeiro", id);
      await updateDoc(ref, dataTratada);
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
