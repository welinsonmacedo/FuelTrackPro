import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../services/firebase";

const KmAtualPage = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchKmAtual = async () => {
    try {
      const veiculosSnapshot = await getDocs(collection(db, "veiculos"));
      const veiculos = veiculosSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((v) => v.tipo?.toLowerCase() !== "carreta");

      const dadosComKm = await Promise.all(
        veiculos.map(async (veiculo) => {
          const abastecimentoRef = collection(db, "abastecimentos");
          const q = query(
            abastecimentoRef,
            where("placa", "==", veiculo.placa),
            orderBy("data", "desc"),
            limit(1)
          );

          const abSnapshot = await getDocs(q);
          const ultimoAbastecimento = abSnapshot.docs[0]?.data();

          return {
            placa: veiculo.placa,
            marca: veiculo.marca,
            modelo: veiculo.modelo,
            ano: veiculo.ano,
            kmAtual: ultimoAbastecimento?.km ?? null,
            dataAbastecimento: ultimoAbastecimento?.data?.toDate?.() ?? null,
          };
        })
      );

      setDados(dadosComKm);
    } catch (error) {
      console.error("Erro ao buscar KM atual:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKmAtual();
  }, []);

  if (loading) return <p>Carregando KM atual dos veículos...</p>;

  const dadosFiltrados = [...dados].filter((item) => {
    const termo = searchTerm.toLowerCase();
    return (
      item.placa?.toLowerCase().includes(termo) ||
      item.modelo?.toLowerCase().includes(termo) ||
      item.marca?.toLowerCase().includes(termo)
    );
  });

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "20px auto",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>KM Atual </h2>
      <input
        type="text"
        placeholder="Buscar por placa, modelo ou marca..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: "15px",
          padding: "8px",
          width: "100%",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={thStyle}>Placa</th>
            <th style={thStyle}>Ano</th>
            <th style={thStyle}>Marca</th>
            <th style={thStyle}>Modelo</th>
            <th style={thStyle}>KM Atual</th>
            <th style={thStyle}>Última Atualização</th>
          </tr>
        </thead>
        <tbody>
          {dadosFiltrados
            .sort((a, b) => a.modelo.localeCompare(b.modelo))
            .map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{item.placa}</td>
                <td style={tdStyle}>{item.ano}</td>
                <td style={tdStyle}>{item.marca}</td>
                <td style={tdStyle}>{item.modelo}</td>
                <td style={tdStyle}>
                  {item.kmAtual !== null ? item.kmAtual : "Sem registro"}
                </td>
                <td style={tdStyle}>
                  {item.dataAbastecimento
                    ? item.dataAbastecimento.toLocaleDateString()
                    : "Sem registro"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #ccc",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

export default KmAtualPage;
