import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export const useFinanceiro = (filtros) => {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDespesas = async () => {
      setLoading(true);
      try {
        const ref = collection(db, "financeiro");
        const constraints = [];

        if (filtros?.placa) constraints.push(where("placa", "==", filtros.placa));
        if (filtros?.tipo) constraints.push(where("tipo", "==", filtros.tipo));
        if (filtros?.dataInicio && filtros?.dataFim) {
          const inicio = Timestamp.fromDate(new Date(filtros.dataInicio));
          const fim = Timestamp.fromDate(new Date(filtros.dataFim));
          constraints.push(where("data", ">=", inicio));
          constraints.push(where("data", "<=", fim));
        }

        const q = constraints.length ? query(ref, ...constraints) : ref;

        const snap = await getDocs(q);
        const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDespesas(lista);
      } catch (error) {
        console.error("Erro ao buscar despesas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDespesas();
  }, [filtros]); // só refaz quando filtros mudam

  return { despesas, loading };
};
export const useCreateDespesa = () => {
  const create = async (data) => {
    try {
      const ref = collection(db, "financeiro");
      await addDoc(ref, {
        ...data,
        criadoEm: Timestamp.now(),
      });
    } catch (e) {
      console.error("Erro ao criar despesa:", e);
    }
  };
  return create;
};

export const useUpdateDespesa = () => {
  const update = async (id, data) => {
    try {
      const ref = doc(db, "financeiro", id);
      await updateDoc(ref, data);
    } catch (e) {
      console.error("Erro ao atualizar despesa:", e);
    }
  };
  return update;
};

export const useDeleteDespesa = () => {
  const remove = async (id) => {
    try {
      const ref = doc(db, "financeiro", id);
      await deleteDoc(ref);
    } catch (e) {
      console.error("Erro ao excluir despesa:", e);
    }
  };
  return remove;
};