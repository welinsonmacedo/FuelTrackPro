import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export function useMedias() {
  const [viagens, setViagens] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const viagensSnapshot = await getDocs(collection(db, "viagens"));
      setViagens(viagensSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const abastecimentosSnapshot = await getDocs(collection(db, "abastecimentos"));
      setAbastecimentos(abastecimentosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }

    fetchData();
  }, []);

  return { viagens, abastecimentos };
}
