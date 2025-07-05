import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export function useAlertasPendentes(usuarioId) {
  const [alertasCount, setAlertasCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuarioId) return;

    async function fetchAlertas() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "alertas"),
          where("usuarioId", "==", usuarioId),
          where("status", "==", "pendente")
        );
        const snapshot = await getDocs(q);
        setAlertasCount(snapshot.size);
      } catch (error) {
        console.error("Erro ao buscar alertas pendentes:", error);
      }
      setLoading(false);
    }

    fetchAlertas();
  }, [usuarioId]);

  return { alertasCount, loading };
}
