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
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(null);

  const removeUndefinedFields = (obj) => {
    return Object.entries(obj).reduce((acc, [key, val]) => {
      acc[key] = val === undefined ? null : val;
      return acc;
    }, {});
  };

  const normalizeItem = (item) => ({
    ...item,
    valorUnitario: parseFloat(item.valorUnitario) || 0,
    quantidade: parseFloat(item.quantidade) || 0,
    desconto: parseFloat(item.desconto) || 0,
    valorTotal: parseFloat(item.valorTotal) || 0,
  });

  const normalizeDespesa = (data) => {
    const itensNormalizados = Array.isArray(data.itens)
      ? data.itens.map(normalizeItem)
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
    if (value.seconds) return value;
    return null;
  };

  const createDespesa = async (data) => {
    setLoadingCreate(true);
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
      setError(e.message || "Erro ao criar despesa");
      console.error("Erro ao criar despesa:", e);
    } finally {
      setLoadingCreate(false);
    }
  };

  const updateDespesa = async (id, data) => {
    setLoadingUpdate(true);
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
      setError(e.message || "Erro ao atualizar despesa");
      console.error("Erro ao atualizar despesa:", e);
    } finally {
      setLoadingUpdate(false);
    }
  };

  const deleteDespesa = async (id) => {
    setLoadingDelete(true);
    setError(null);
    try {
      const ref = doc(db, "financeiro", id);
      await deleteDoc(ref);
    } catch (e) {
      setError(e.message || "Erro ao excluir despesa");
      console.error("Erro ao excluir despesa:", e);
    } finally {
      setLoadingDelete(false);
    }
  };

  return {
    error,
    createDespesa,
    updateDespesa,
    deleteDespesa,
    loadingCreate,
    loadingUpdate,
    loadingDelete,
  };
};
