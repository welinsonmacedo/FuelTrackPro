import { useCallback } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export const useUpdateVeiculo = () => {
  const updatePneus = useCallback(
    async (placa, pneusAtualizados) => {
      const veiculoRef = doc(db, "veiculos", placa);
      await updateDoc(veiculoRef, { pneus: pneusAtualizados });
    },
    []
  );

  return { updatePneus };
};
