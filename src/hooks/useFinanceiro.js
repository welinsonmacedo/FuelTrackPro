import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// Hook para listar despesas
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
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // 🔧 Nova função para resolver a placa (OS ou item manual)
        const resolvePlaca = async (d) => {
          if (!d.placa && d.checklistId) {
            try {
              const checklistRef = doc(db, "checklists", d.checklistId);
              const checklistSnap = await getDoc(checklistRef);
              if (checklistSnap.exists()) {
                const dadosChecklist = checklistSnap.data();
                return {
                  ...d,
                  placa:
                    dadosChecklist.placa ||
                    dadosChecklist.osDetalhes?.placa ||
                    "-",
                };
              }
            } catch (e) {
              console.warn("Erro ao buscar checklist:", e);
            }
          }

          const placaFromItem = d.itens?.[0]?.placa?.trim();
          return {
            ...d,
            placa: d.placa || placaFromItem || "-",
          };
        };

        // Aplica a lógica de placa em todas as despesas
        const listaComPlaca = await Promise.all(docs.map(resolvePlaca));
        setDespesas(listaComPlaca);
      } catch (error) {
        console.error("Erro ao buscar despesas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDespesas();
  }, [filtros]);

  return { despesas, loading };
};

// Hook para criar nova despesa
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

// Hook para atualizar despesa
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

// Hook para deletar despesa
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
