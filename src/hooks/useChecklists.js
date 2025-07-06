import { db } from "../services/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export const useChecklists = () => {
  const salvarChecklist = async (dados) => {
    const ref = collection(db, "checklists");
    await addDoc(ref, {
      ...dados,
      dataRegistro: new Date(),
    });
  };

  const listarChecklistsDaViagem = async (viagemId) => {
    const ref = collection(db, "checklists");
    const q = query(ref, where("viagemId", "==", viagemId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  return { salvarChecklist, listarChecklistsDaViagem };
};
