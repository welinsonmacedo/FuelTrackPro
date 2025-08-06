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

  const dadosFiltrados = [...dados].filter((item) => {
    const termo = searchTerm.toLowerCase();
    return (
      item.placa?.toLowerCase().includes(termo) ||
      item.modelo?.toLowerCase().includes(termo) ||
      item.marca?.toLowerCase().includes(termo)
    );
  });

  if (loading) return <p style={{ textAlign: "center" }}>Carregando KM atual dos veículos...</p>;

  return (
    <div style={styles.wrapper}>
      <div  style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 10,
          paddingBottom: 10,
        }}>
<h2 style={styles.title}>Odômetro Atual dos Veículos</h2>
      <input
        type="text"
        placeholder="🔍 Buscar por placa, modelo ou marca..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.input}
      />
      </div>
      
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Placa</th>
              <th style={styles.th}>Ano</th>
              <th style={styles.th}>Marca</th>
              <th style={styles.th}>Modelo</th>
              <th style={styles.th}>KM Atual</th>
              <th style={styles.th}>Última Atualização</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados
              .sort((a, b) => a.modelo.localeCompare(b.modelo))
              .map((item, index) => (
                <tr key={index} style={styles.trHover}>
                  <td style={styles.td}>{item.placa}</td>
                  <td style={styles.td}>{item.ano}</td>
                  <td style={styles.td}>{item.marca}</td>
                  <td style={styles.td}>{item.modelo}</td>
                  <td style={styles.td}>
                    {item.kmAtual !== null ? item.kmAtual : "Sem registro"}
                  </td>
                  <td style={styles.td}>
                    {item.dataAbastecimento
                      ? item.dataAbastecimento.toLocaleDateString()
                      : "Sem registro"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: "100%",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#111827",
    textAlign: "start",
  },
  input: {
    marginBottom: "20px",
    padding: "12px 16px",
    width: "100%",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
    transition: "border 0.2s ease-in-out",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    borderRadius: "8px",
    overflow: "hidden",
  },
  th: {
    padding: "14px",
    backgroundColor: "#e5e7eb",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
    borderBottom: "2px solid #d1d5db",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#4b5563",
  },
  trHover: {
    transition: "background 0.2s",
  },
};

export default KmAtualPage;
