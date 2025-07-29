import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export function usePneusEstoque(medidasAceitas = []) {
  const [pneusEstoque, setPneusEstoque] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Para evitar loop infinito, vamos transformar medidasAceitas em string para usar como dependência:
  const medidasKey = medidasAceitas.sort().join(","); // ordenar para consistência

  useEffect(() => {
    async function fetchPneus() {
      setLoading(true);
      setError(null);
      try {
        const pneusRef = collection(db, "pneus");
        let q;

        if (medidasAceitas && medidasAceitas.length > 0) {
          // Firestore permite máximo 10 elementos em 'in'
          if (medidasAceitas.length > 10) {
            throw new Error("Limite máximo de 10 medidas para filtro.");
          }
          q = query(pneusRef, where("medida", "in", medidasAceitas));
        } else {
          q = query(pneusRef);
        }

        const querySnapshot = await getDocs(q);
        const pneus = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPneusEstoque(pneus);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }

    fetchPneus();
  }, [medidasKey]); // usar chave string estável evita loop

  return { pneusEstoque, loading, error };
}
