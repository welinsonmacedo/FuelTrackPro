/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export const useChecklists = (viagemId = null) => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);

  // Função para salvar checklist
  const salvarChecklist = async (dados) => {
    const ref = collection(db, "checklists");
    await addDoc(ref, {
      ...dados,
      dataRegistro: new Date(),
    });
  };

  // Função para listar checklists da viagem (ou todos se viagemId não fornecido)
  const listarChecklists = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "checklists");
      let q;
      if (viagemId) {
        q = query(ref, where("viagemId", "==", viagemId));
      }
      const snapshot = q ? await getDocs(q) : await getDocs(ref);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChecklists(data);
    } catch (error) {
      console.error("Erro ao carregar checklists:", error);
      setChecklists([]);
    }
    setLoading(false);
  };

  // Carregar ao montar o hook e quando viagemId mudar
  useEffect(() => {
    listarChecklists();
  }, [viagemId]);

  return { checklists, loading, salvarChecklist, listarChecklists };
};
