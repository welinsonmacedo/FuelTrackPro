/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";

export const useChecklists = (filtrosFirebase = []) => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);

  const salvarChecklist = async (dados) => {
    const ref = collection(db, "checklists");
    await addDoc(ref, {
      ...dados,
      deletado: false,
      dataRegistro: new Date(),
    });
  };

  const carregarChecklists = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "checklists");
      const conditions = [where("deletado", "==", false)];

      filtrosFirebase.forEach(([campo, op, valor]) => {
        conditions.push(where(campo, op, valor));
      });

      const q = query(ref, ...conditions);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChecklists(data);
    } catch (error) {
      console.error("Erro ao carregar checklists:", error);
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  };

  const excluirChecklist = async (checklistId) => {
    try {
      if (!checklistId) throw new Error("ID do checklist não fornecido");
      await deleteDoc(doc(db, "checklists", checklistId));
      await carregarChecklists();
    } catch (error) {
      console.error("Erro ao excluir checklist:", error);
      throw error;
    }
  };

  useEffect(() => {
    carregarChecklists();
  }, [JSON.stringify(filtrosFirebase)]); // disparar quando os filtros mudarem

  return {
    checklists,
    loading,
    salvarChecklist,
    carregarChecklists,
    excluirChecklist,
  };
};
