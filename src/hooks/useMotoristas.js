import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,        // IMPORTAÇÃO FALTANTE
} from "firebase/firestore";

export const useMotoristas = () => {
  const [motoristas, setMotoristas] = useState([]);

  const fetchMotoristas = async () => {
    const snap = await getDocs(collection(db, "motoristas"));
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMotoristas(list);
  };

  const adicionarMotorista = async (dados) => {
    await addDoc(collection(db, "motoristas"), dados);
    fetchMotoristas();
  };

  const editarMotorista = async (id, dados) => {
    await updateDoc(doc(db, "motoristas", id), dados);
    fetchMotoristas();
  };

  const excluirMotorista = async (id) => {
    await deleteDoc(doc(db, "motoristas", id));
    fetchMotoristas();
  };

  async function buscarMotoristaPorId(id) {
    if (!id) return null;
    const docRef = doc(db, "motoristas", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  useEffect(() => {
    fetchMotoristas();
  }, []);

  return {
    motoristas,
    adicionarMotorista,
    editarMotorista,
    excluirMotorista,
    buscarMotoristaPorId,  // <-- exporte a função aqui!
  };
};
