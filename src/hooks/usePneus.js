/* eslint-disable no-unused-vars */
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

const pneusCollection = collection(db, "pneus");

export function usePneus() {
  // Buscar todos os pneus
  const fetchPneus = async () => {
    const snapshot = await getDocs(pneusCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  // Adicionar novo pneu
  const addPneu = async (pneu) => {
    pneu.criadoEm = serverTimestamp();
    const docRef = await addDoc(pneusCollection, pneu);
    return docRef.id;
  };

  // Atualizar pneus do veículo
  const atualizarPneusVeiculo = async (veiculoId, pneusAtualizados) => {
    try {
      // Limpar serverTimestamp() de dentro do array pneus
      const pneusLimpos = pneusAtualizados.map(
        ({
          id,
          instaladoEm,
          ultimaAlteracao,
          criadoEm,
          atualizadoEm,
          ...rest
        }) => ({
          ...rest,
          // Se quiser guardar datas, converta para ISO strings
          instaladoEm: instaladoEm
            ? instaladoEm.toDate?.()?.toISOString?.() || instaladoEm
            : null,
        })
      );

      const docRef = doc(db, "veiculos", veiculoId);
      await updateDoc(docRef, {
        pneus: pneusLimpos,
        atualizadoEm: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao atualizar pneus do veículo:", error);
      throw error;
    }
  };

  // Deletar pneu por ID
  const deletePneu = async (id) => {
    const pneuDoc = doc(db, "pneus", id);
    await deleteDoc(pneuDoc);
  };

  // Remover pneu do veículo (sem deletar do banco)
  const removerPneuComAcao = async ({
    pneu,
    acaoRemover = "Removido do veículo",
    placa = null,
    recapSelecionada = null,
    kmDesinstalacao = null,
  }) => {
    if (!pneu || !pneu.id || !pneu.veiculoId || !pneu.posicao) {
      throw new Error("Parâmetros insuficientes para remover pneu");
    }

    const pneuRef = doc(db, "pneus", pneu.id);
    const veiculoRef = doc(db, "veiculos", pneu.veiculoId);

    // Buscar histórico atual do pneu
    const pneuSnap = await getDoc(pneuRef);
    if (!pneuSnap.exists()) {
      throw new Error("Pneu não encontrado.");
    }
    const pneuData = pneuSnap.data();
    const historicoAtual = pneuData.historico || [];

    const novoRegistro = {
      data: new Date().toISOString(),
      acao: acaoRemover,
      placaAnterior: placa,
      veiculoId: pneu.veiculoId,
      posicaoAnterior: pneu.posicao,
      recapagem: recapSelecionada || null,
      kmDesinstalacao: kmDesinstalacao || null,
    };

    const novoHistorico = [...historicoAtual, novoRegistro];

    // Atualizar documento do pneu
    await updateDoc(pneuRef, {
      veiculoId: null,
      posicao: null,
      instaladoEm: null,
      kmInstalacao: null,
      status: "Removido",
      ultimaAlteracao: serverTimestamp(),
      historico: novoHistorico,
    });

    // Atualizar documento do veículo, removendo o pneu pela posição
    const veiculoSnap = await getDoc(veiculoRef);
    if (!veiculoSnap.exists()) {
      throw new Error("Veículo não encontrado.");
    }
    const veiculoData = veiculoSnap.data();
    const pneusAtuais = veiculoData.pneus || [];

    const pneusFiltrados = pneusAtuais.filter((p) => p.posicao !== pneu.posicao);

    await updateDoc(veiculoRef, {
      pneus: pneusFiltrados,
      atualizadoEm: serverTimestamp(),
    });
  };
const salvarMarcaPneu = async (idPneu, marcaFogo) => {
  if (!idPneu) throw new Error("ID do pneu não informado");
  const pneuRef = doc(db, "pneus", idPneu);
  await updateDoc(pneuRef, { marcaFogo });
};

  return {
    fetchPneus,
    addPneu,
    atualizarPneusVeiculo,
    deletePneu,
    removerPneuComAcao,
    salvarMarcaPneu
  };
}
