import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ref da coleção
  const fornecedoresCollection = collection(db, "fornecedores");

  // Listar todos fornecedores
  async function carregarFornecedores() {
    setLoading(true);
    try {
      const snapshot = await getDocs(fornecedoresCollection);
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFornecedores(lista);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    } finally {
      setLoading(false);
    }
  }

  // Criar fornecedor
  async function adicionarFornecedor(dados) {
    setLoading(true);
    try {
      await addDoc(fornecedoresCollection, {
        ...dados,
        criadoEm: serverTimestamp(),
      });
      await carregarFornecedores();
    } catch (error) {
      console.error("Erro ao adicionar fornecedor:", error);
    } finally {
      setLoading(false);
    }
  }

  // Editar fornecedor
  async function editarFornecedor(id, dados) {
    setLoading(true);
    try {
      const docRef = doc(db, "fornecedores", id);
      await updateDoc(docRef, {
        ...dados,
        atualizadoEm: serverTimestamp(),
      });
      await carregarFornecedores();
    } catch (error) {
      console.error("Erro ao editar fornecedor:", error);
    } finally {
      setLoading(false);
    }
  }

  // Excluir fornecedor
  async function excluirFornecedor(id) {
    setLoading(true);
    try {
      const docRef = doc(db, "fornecedores", id);
      await deleteDoc(docRef);
      await carregarFornecedores();
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error);
    } finally {
      setLoading(false);
    }
  }

  // Carrega fornecedores inicialmente
  useEffect(() => {
    carregarFornecedores();
  }, []);

  return {
    fornecedores,
    loading,
    carregarFornecedores,
    adicionarFornecedor,
    editarFornecedor,
    excluirFornecedor,
  };
}
