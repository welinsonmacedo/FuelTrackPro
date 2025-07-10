import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export function useMediasGeral(dataInicio, dataFim) {
  const [mediaGeral, setMediaGeral] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedias() {
      setLoading(true);
      try {
        const mediasRef = collection(db, "medias");
        const snapshot = await getDocs(mediasRef);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtrar pelo intervalo de datas, se informado
        if (dataInicio) {
          const dtInicio = new Date(dataInicio);
          data = data.filter(item => {
            const itemDate = item.data?.seconds ? new Date(item.data.seconds * 1000) : new Date(item.data);
            return itemDate >= dtInicio;
          });
        }
        if (dataFim) {
          const dtFim = new Date(dataFim);
          data = data.filter(item => {
            const itemDate = item.data?.seconds ? new Date(item.data.seconds * 1000) : new Date(item.data);
            return itemDate <= dtFim;
          });
        }

        // Calcular média geral
        if (data.length === 0) {
          setMediaGeral(0);
        } else {
          const soma = data.reduce((acc, m) => acc + (m.media || 0), 0);
          setMediaGeral(soma / data.length);
        }
      } catch (error) {
        console.error("Erro ao buscar médias:", error);
        setMediaGeral(0);
      }
      setLoading(false);
    }
    fetchMedias();
  }, [dataInicio, dataFim]);

  return { mediaGeral, loading };
}
