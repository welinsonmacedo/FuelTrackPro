// hooks/useAlertasManutencao.js
import { useState, useEffect } from "react";
import { useManutencoes } from "./useManutencoes";
import { useAbastecimentos } from "./useAbastecimentos";
import { useTiposManutencao } from "./useTiposManutencao";

export function useAlertasManutencao() {
  const { manutencoes } = useManutencoes();
  const { abastecimentos } = useAbastecimentos();
  const { tipos } = useTiposManutencao();
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    if (!manutencoes || !abastecimentos || !tipos) return;

    const hoje = new Date();

    function getUltimoKm(placa) {
      const doVeiculo = abastecimentos
        .filter((a) => a.placa === placa)
        .sort(
          (a, b) =>
            Number(b.kmAbastecimento || b.km || 0) -
            Number(a.kmAbastecimento || a.km || 0)
        );
      return Number(doVeiculo[0]?.kmAbastecimento || doVeiculo[0]?.km || 0);
    }

    function buscarTipoManutencao(nomeTipo) {
      if (!tipos) return null;
      return tipos.find((t) => t.nome === nomeTipo) || null;
    }

    const alertasFiltrados = manutencoes.filter((m) => {
      if (m.realizada) return false;

      const ultimoKm = getUltimoKm(m.placa);
      const tipoCompleto = buscarTipoManutencao(m.tipoManutencao);

      if (!tipoCompleto) return false;

      const diasAntecedencia = tipoCompleto.avisoDiasAntes || 0;
      const kmAntecedencia = tipoCompleto.avisoKmAntes || 0;

      let alertaData = false;
      let alertaKm = false;

      if (m.proximaRevisaoData) {
        const dataRevisao = m.proximaRevisaoData.toDate();
        const diffDias = Math.ceil((dataRevisao - hoje) / (1000 * 60 * 60 * 24));
        alertaData = diffDias <= diasAntecedencia && diffDias >= 0;
      }

      if (m.proximaRevisaoKm) {
        const diffKm = m.proximaRevisaoKm - ultimoKm;
        alertaKm = diffKm <= kmAntecedencia && diffKm >= 0;
      }

      const atrasoKm = m.proximaRevisaoKm !== undefined && ultimoKm > m.proximaRevisaoKm;

      return alertaData || alertaKm || atrasoKm;
    });

    setAlertas(alertasFiltrados);
  }, [manutencoes, abastecimentos, tipos]);

  return alertas;
}
