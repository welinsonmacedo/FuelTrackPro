import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";

export const useOsDisponiveisParaNota = () => {
  const [osList, setOsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarOs = async () => {
    setLoading(true);
    const q = query(
      collection(db, "checklists"),
      where("status", "==", "Finalizada"),
      where("notaGerada", "==", false)
    );

    const snapshot = await getDocs(q);
    const dados = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setOsList(dados);
    setLoading(false);
  };

  useEffect(() => {
    carregarOs();
  }, []);

  return { osList, carregarOs, loading };
};
