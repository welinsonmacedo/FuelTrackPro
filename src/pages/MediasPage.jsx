import React, { useState, useMemo } from "react";
import { useMedias } from "../hooks/useMedias";
import ResumoModal from "../components/ResumoModal";
import { formatData } from "../utils/data";

function extrairData(item) {
  return item.data || item.criadoEm || null;
}

export default function MediasPage() {
  const [filtroMotorista, setFiltroMotorista] = useState("");
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [selecionado, setSelecionado] = useState(null);

  const { abastecimentos } = useMedias();

  // Filtra abastecimentos pelo motorista e placa
  const abastecimentosFiltrados = useMemo(() => {
    return abastecimentos.filter((a) => {
      const matchMotorista = filtroMotorista
        ? a.motorista?.toLowerCase().includes(filtroMotorista.toLowerCase())
        : true;
      const matchPlaca = filtroPlaca
        ? a.placa?.toLowerCase().includes(filtroPlaca.toLowerCase())
        : true;
      return matchMotorista && matchPlaca;
    });
  }, [abastecimentos, filtroMotorista, filtroPlaca]);

  // Cálculo da média geral por tanque cheio (para exibir no topo)
  const mediaGeral = useMemo(() => {
    const ordenados = [...abastecimentosFiltrados].sort((a, b) => a.km - b.km);
    let totalKm = 0;
    let totalLitros = 0;

    for (let i = 1; i < ordenados.length; i++) {
      const anterior = ordenados[i - 1];
      const atual = ordenados[i];

      if (anterior.tanqueCheio && atual.tanqueCheio) {
        const km = atual.km - anterior.km;
        const litros = atual.litros;
        if (km > 0 && litros > 0) {
          totalKm += km;
          totalLitros += litros;
        }
      }
    }

    return totalLitros > 0 ? (totalKm / totalLitros).toFixed(2) : "-";
  }, [abastecimentosFiltrados]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Média de Consumo por Abastecimento (Tanque Cheio)</h1>

      <div style={{ marginTop: 10, marginBottom: 20 }}>
        <input
          placeholder="Filtrar por motorista"
          value={filtroMotorista}
          onChange={(e) => setFiltroMotorista(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          placeholder="Filtrar por placa"
          value={filtroPlaca}
          onChange={(e) => setFiltroPlaca(e.target.value)}
        />
      </div>

      <div>
        <strong>Média Geral:</strong> {mediaGeral} km/l
      </div>

      <div style={{ marginTop: 30 }}>
        <h2>Abastecimentos</h2>
        {abastecimentosFiltrados.length === 0 ? (
          <p>Nenhum abastecimento encontrado.</p>
        ) : (
          abastecimentosFiltrados.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelecionado(item)}
              style={{
                cursor: "pointer",
                padding: 10,
                marginBottom: 5,
                border: "1px solid #ccc",
                borderRadius: 4,
                backgroundColor: "#f9f9f9",
              }}
            >
              <strong>{item.motorista || "Motorista não informado"}</strong> —{" "}
              {item.placa || "Placa não informada"} <br />
              <small>{extrairData(item) ? formatData(extrairData(item)) : "Data não informada"}</small>
            </div>
          ))
        )}
      </div>

      {selecionado && (
        <ResumoModal dados={selecionado} onClose={() => setSelecionado(null)} />
      )}
    </div>
  );
}
