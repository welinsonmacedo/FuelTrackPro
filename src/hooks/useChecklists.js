import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";

export const useChecklists = ({
  viagemId = null,
  veiculoId = null,
  dataInicio = null,
  dataFim = null,
} = {}) => {
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

  // Função para listar checklists com filtros opcionais
  const listarChecklists = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "checklists");
      const conditions = [];

      if (viagemId) {
        conditions.push(where("viagemId", "==", viagemId));
      }
      if (veiculoId) {
        conditions.push(where("veiculoId", "==", veiculoId));
      }
      if (dataInicio) {
        conditions.push(where("data", ">=", Timestamp.fromDate(new Date(dataInicio))));
      }
      if (dataFim) {
        conditions.push(where("data", "<=", Timestamp.fromDate(new Date(dataFim))));
      }

      const q = conditions.length > 0 ? query(ref, ...conditions) : ref;

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChecklists(data);
    } catch (error) {
      console.error("Erro ao carregar checklists:", error);
      setChecklists([]);
    }
    setLoading(false);
  };

  // Recarrega quando algum filtro mudar
  useEffect(() => {
    listarChecklists();
  }, [viagemId, veiculoId, dataInicio, dataFim]);

  return { checklists, loading, salvarChecklist, listarChecklists };
};
