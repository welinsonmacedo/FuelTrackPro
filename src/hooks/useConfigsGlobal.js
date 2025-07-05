// src/hooks/useConfigsGlobal.js
import { useEffect, useState } from "react";
import { doc,  setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase"; // seu firestore config

export function useConfigsGlobal() {
  const [configs, setConfigs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const docRef = doc(db, "configs", "global");

    // Listener em tempo real, atualiza quando o admin muda
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setConfigs(docSnap.data());
        } else {
          setConfigs({});
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Função para salvar/atualizar configurações
  async function salvarConfigs(novasConfigs) {
    setLoading(true);
    try {
      const docRef = doc(db, "configs", "global");
      await setDoc(docRef, novasConfigs, { merge: true });
      setConfigs((prev) => ({ ...prev, ...novasConfigs }));
      setLoading(false);
      return true;
    } catch (err) {
      setError(err);
      setLoading(false);
      return false;
    }
  }

  return { configs, loading, error, salvarConfigs };
}
