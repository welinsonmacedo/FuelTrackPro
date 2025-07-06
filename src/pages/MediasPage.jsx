import React, { useState, useMemo, useEffect } from "react";
import { useMedias } from "../hooks/useMedias";
import ResumoModal from "../components/ResumoModal";
import { formatData } from "../utils/data";

export default function MediasPage() {
  const [filtroMotorista, setFiltroMotorista] = useState("");
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [selecionado, setSelecionado] = useState(null);

  const { abastecimentos } = useMedias();

  useEffect(() => {
    console.log("Abastecimentos recebidos:", abastecimentos);
  }, [abastecimentos]);

  // Filtra abastecimentos pela placa e motorista
  const abastecimentosFiltrados = useMemo(() => {
    return abastecimentos
      .filter((a) => {
        const matchMotorista = filtroMotorista
          ? a.motorista?.toLowerCase().includes(filtroMotorista.toLowerCase())
          : true;
        const matchPlaca = filtroPlaca
          ? a.placa?.toLowerCase().includes(filtroPlaca.toLowerCase())
          : true;
        return matchMotorista && matchPlaca;
      })
      .sort((a, b) => a.km - b.km); // garantir ordem crescente de km
  }, [abastecimentos, filtroMotorista, filtroPlaca]);

  useEffect(() => {
    console.log("Abastecimentos filtrados:", abastecimentosFiltrados);
  }, [abastecimentosFiltrados]);

  // Gera trechos com média
  const mediasPorTrecho = useMemo(() => {
    const trechos = [];
    let anterior = null;

    for (let atual of abastecimentosFiltrados) {
      if (anterior /* && anterior.tanqueCheio && atual.tanqueCheio */) {
        const kmRodado = atual.km - anterior.km;
        const litros = atual.litros;
    
        if (kmRodado > 0 && litros > 0) {
          trechos.push({
            id: atual.id,
            motorista: atual.motorista,
            placa: atual.placa,
            data: atual.data || atual.criadoEm || null,
            kmInicial: anterior.km,
            kmFinal: atual.km,
            litros,
            media: (kmRodado / litros).toFixed(2),
            abastecimento: atual,
          });
        }
      }
      anterior = atual;
    }
    return trechos;
  }, [abastecimentosFiltrados]);

  useEffect(() => {
    console.log("Médias por trecho:", mediasPorTrecho);
  }, [mediasPorTrecho]);

  // Média geral
  const mediaGeral = useMemo(() => {
    const totalKm = mediasPorTrecho.reduce((acc, t) => acc + (t.kmFinal - t.kmInicial), 0);
    const totalLitros = mediasPorTrecho.reduce((acc, t) => acc + t.litros, 0);
    return totalLitros > 0 ? (totalKm / totalLitros).toFixed(2) : "-";
  }, [mediasPorTrecho]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Média de Consumo </h1>

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
        <h2>Medias</h2>
        {mediasPorTrecho.length === 0 ? (
          <p>Nenhum trecho encontrado com dois abastecimentos de tanque cheio.</p>
        ) : (
          mediasPorTrecho.map((trecho) => (
            <div
              key={trecho.id}
              onClick={() => setSelecionado(trecho.abastecimento)}
              style={{
                cursor: "pointer",
                padding: 10,
                marginBottom: 10,
                border: "1px solid #ccc",
                borderRadius: 4,
                backgroundColor: "#f9f9f9",
              }}
            >
              <strong>{trecho.motorista || "Motorista não informado"}</strong> —{" "}
              {trecho.placa || "Placa não informada"} <br />
              <small>
                {trecho.data ? formatData(trecho.data) : "Data não informada"}
              </small>
              <br />
              <span>
                <strong>Média:</strong> {trecho.media} km/l &nbsp;|&nbsp;
                <strong>Litros:</strong> {trecho.litros} L &nbsp;|&nbsp;
                <strong>KM rodado:</strong> {trecho.kmFinal - trecho.kmInicial} km
              </span>
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