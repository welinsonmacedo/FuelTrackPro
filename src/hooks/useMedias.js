import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export function useMedias() {
  const [viagens, setViagens] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const viagensSnapshot = await getDocs(collection(db, "viagens"));
        setViagens(viagensSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const abastecimentosSnapshot = await getDocs(collection(db, "abastecimentos"));
        setAbastecimentos(abastecimentosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const mediasSnapshot = await getDocs(collection(db, "medias"));
        setMedias(mediasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setViagens([]);
        setAbastecimentos([]);
        setMedias([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { viagens, abastecimentos, medias, loading };
}
