import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export function useRelatoriosFinanceiros() {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatorios = async () => {
      try {
        const snapshot = await getDocs(collection(db, "relatoriosFinanceiros"));
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRelatorios(lista);
      } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorios();
  }, []);

  return { relatorios, loading };
}
