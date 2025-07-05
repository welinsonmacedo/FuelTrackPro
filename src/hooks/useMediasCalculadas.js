import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export function useMediasCalculadas({ placa, motorista, inicio, fim }) {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      try {
        const col = collection(db, "medias");
        const filtros = [];

        if (placa) filtros.push(where("placa", "==", placa));
        if (motorista) filtros.push(where("motorista", "==", motorista));

        // Para filtro de data, Firestore requer um range entre >= inicio e <= fim
        if (inicio && fim) {
          filtros.push(where("data", ">=", Timestamp.fromDate(inicio)));
          filtros.push(where("data", "<=", Timestamp.fromDate(fim)));
        }

        const q = query(col, ...filtros);

        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMedias(lista);
      } catch (error) {
        console.error("Erro ao buscar médias:", error);
      }
      setLoading(false);
    }

    carregar();
  }, [placa, motorista, inicio, fim]);

  return { medias, loading };
}
