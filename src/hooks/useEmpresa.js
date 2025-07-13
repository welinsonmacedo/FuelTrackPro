import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../services/firebase";

export function useEmpresa() {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function fetchEmpresa() {
      setLoading(true);
      try {
        const q = query(collection(db, "empresa"), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setEmpresa({ id: docSnap.id, ...docSnap.data() });
        } else {
          setEmpresa(null);
          setErro("Empresa não encontrada.");
        }
      } catch (err) {
        console.error("Erro ao buscar empresa:", err);
        setErro("Erro ao buscar dados da empresa.");
      } finally {
        setLoading(false);
      }
    }

    fetchEmpresa();
  }, []);

  return { empresa, loading, erro };
}
