/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from "react";
import { useAbastecimentos } from "../hooks/useAbastecimentos";
import { useChecklists } from "../hooks/useChecklists";
import { useVeiculos } from "../hooks/useVeiculos";
import { useMotoristas } from "../hooks/useMotoristas";
import { useMediasGeral } from "../hooks/useMediasGeral";
import { useMedias } from "../hooks/useMedias";
import Card from "../components/Card";
import { formatCurrency, calcularMediaConsumo } from "../utils/data";

const DashboardKPIs = () => {
  const { abastecimentos = [] } = useAbastecimentos();
  const { checklists = [] } = useChecklists();
  const { veiculos = [] } = useVeiculos();
  const { motoristas = [] } = useMotoristas();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const { mediaGeral, loading: loadingMediaGeral } = useMediasGeral(
    dataInicio,
    dataFim
  );
  const { medias, loading } = useMedias();

  const filtrarPorData = (items, campoData = "data") => {
    return items.filter((item) => {
      if (!item[campoData]) return false;

      let dataItem;
      if (item[campoData]?.seconds) {
        dataItem = new Date(item[campoData].seconds * 1000);
      } else if (typeof item[campoData] === "string") {
        dataItem = new Date(item[campoData]);
      } else if (item[campoData] instanceof Date) {
        dataItem = item[campoData];
      } else {
        return false;
      }

      const dataDia = new Date(
        dataItem.getFullYear(),
        dataItem.getMonth(),
        dataItem.getDate()
      );

      if (dataInicio) {
        const inicio = new Date(dataInicio);
        if (dataDia < inicio) return false;
      }
      if (dataFim) {
        const fim = new Date(dataFim);
        if (dataDia > fim) return false;
      }
      return true;
    });
  };

  const abastecimentosFiltrados = useMemo(
    () => filtrarPorData(abastecimentos, "data"),
    [abastecimentos, dataInicio, dataFim]
  );
  const mediasFiltradas = useMemo(
    () => filtrarPorData(medias, "data"),
    [medias, dataInicio, dataFim]
  );
  const checklistsFiltrados = useMemo(
    () => filtrarPorData(checklists, "dataRegistro"),
    [checklists, dataInicio, dataFim]
  );

  const totalLitros = useMemo(
    () => abastecimentosFiltrados.reduce((acc, a) => acc + (a.litros || 0), 0),
    [abastecimentosFiltrados]
  );
  const totalValor = useMemo(
    () =>
      abastecimentosFiltrados.reduce(
        (acc, a) => acc + (a.litros * a.valorLitro || 0),
        0
      ),
    [abastecimentosFiltrados]
  );

  const mediaConsumo = useMemo(() => {
    const mediasCalc = calcularMediaConsumo(abastecimentosFiltrados);
    return mediasCalc.geral;
  }, [abastecimentosFiltrados]);

  const gastoPorVeiculo = useMemo(() => {
    const map = {};
    abastecimentosFiltrados.forEach((a) => {
      if (!a.placa) return;
      if (!map[a.placa]) map[a.placa] = 0;
      map[a.placa] += a.litros * a.valorLitro;
    });
    return Object.entries(map).map(([placa, valor]) => ({ placa, valor }));
  }, [abastecimentosFiltrados]);

  const ranking = useMemo(() => {
    const map = {};
    mediasFiltradas.forEach(({ motorista, media }) => {
      if (!motorista || typeof media !== "number") return;
      if (!map[motorista]) map[motorista] = { soma: 0, count: 0 };
      map[motorista].soma += media;
      map[motorista].count++;
    });

    return Object.entries(map)
      .map(([nome, { soma, count }]) => ({
        nome,
        mediaGeral: soma / count,
      }))
      .sort((a, b) => b.mediaGeral - a.mediaGeral);
  }, [mediasFiltradas]);

  if (loading) return <p>Carregando ranking...</p>;

  return (
    <div
      style={{
        maxWidth: 1300,
        margin: "0 auto",
        padding: "30px 20px",
        backgroundColor: "#f4f6f8",
        fontFamily: "Segoe UI, sans-serif",
        color: "#2e2e2e",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 600,
          marginBottom: 30,
          color: "#333",
        }}
      >
        📊 Painel de Indicadores - Frota
      </h2>

      {/* Filtros */}
      <div
        style={{
          marginBottom: 30,
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: "16px",
          borderRadius: 10,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", fontSize: 14 }}>
          Data Início:
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 14,
              marginTop: 4,
            }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", fontSize: 14 }}>
          Data Fim:
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 14,
              marginTop: 4,
            }}
          />
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
        }}
      >
        <Card title="Gasto Total">
          <p>{formatCurrency(totalValor)}</p>
        </Card>
        <Card title="Total de Litros">
          <p>{totalLitros.toFixed(2)} L</p>
        </Card>
        <Card title="Média Geral">
          {loadingMediaGeral ? (
            <p>Carregando média...</p>
          ) : (
            <p>{mediaGeral.toFixed(2)} km/L</p>
          )}
        </Card>
        <Card title="Total de Veículos">
          <p>{veiculos.length}</p>
        </Card>
        <Card title="Motoristas">
          <p>{motoristas.length}</p>
        </Card>
        <Card title="Checklists Pendentes">
          <p>{checklistsFiltrados.filter((c) => c.statusOS !== "concluida").length}</p>
        </Card>
      </div>

      <h3 style={{ marginTop: 40 }}>🚛 Gasto por Veículo</h3>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          padding: "20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          marginTop: 10,
        }}
      >
        {gastoPorVeiculo.length === 0 ? (
          <p>Nenhum dado disponível</p>
        ) : (
          <ul style={{ fontSize: 15, lineHeight: 1.8, paddingLeft: 0, listStyle: "none" }}>
            {gastoPorVeiculo.map(({ placa, valor }) => (
              <li key={placa}>
                <strong>{placa}</strong>:{" "}
                {valor.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </li>
            ))}
          </ul>
        )}
      </div>

      <h3 style={{ marginTop: 40 }}>👷 Ranking de Motoristas por Consumo</h3>
      <ul
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          padding: "20px",
          listStyle: "none",
          marginTop: 10,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          fontSize: 15,
          lineHeight: 1.8,
        }}
      >
        {ranking.slice(0, 5).map(({ nome, mediaGeral }) => (
          <li key={nome}>
            <strong>{nome}</strong>: {mediaGeral.toFixed(2)} km/L
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardKPIs;
