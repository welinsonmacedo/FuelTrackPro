import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const usuariosRef = collection(db, "usuarios");

  useEffect(() => {
    async function fetchUsuarios() {
      setLoading(true);
      const snapshot = await getDocs(usuariosRef);
      setUsuarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchUsuarios();
  }, []);

  const adicionarUsuario = async (dados) => {
    await addDoc(usuariosRef, dados);
  };

  const atualizarUsuario = async (id, dados) => {
    const usuarioDoc = doc(db, "usuarios", id);
    await updateDoc(usuarioDoc, dados);
  };

  const deletarUsuario = async (id) => {
    const usuarioDoc = doc(db, "usuarios", id);
    await deleteDoc(usuarioDoc);
  };

  return {
    usuarios,
    loading,
    adicionarUsuario,
    atualizarUsuario,
    deletarUsuario,
  };
}
