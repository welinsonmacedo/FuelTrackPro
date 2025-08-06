import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export const ModelosVeiculosList = () => {
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [visivelPneus, setVisivelPneus] = useState({});

  useEffect(() => {
    const fetchModelos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "modelosVeiculos"));
        const lista = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setModelos(lista);
      } catch (e) {
        setErro("Erro ao buscar modelos: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModelos();
  }, []);

  const togglePneus = (id) => {
    setVisivelPneus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) return <p>Carregando modelos...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;
  if (modelos.length === 0) return <p>Nenhum modelo cadastrado.</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Modelos de Veículos</h2>
      {modelos.map((modelo) => (
        <div key={modelo.id} style={styles.card}>
          <div style={styles.row}>
            <span style={styles.modeloTexto}>
              {modelo.fabricante} - {modelo.modelo}
            </span>
            <div style={styles.buttonGroup}>
              <button onClick={() => togglePneus(modelo.id)} style={styles.button}>
                {visivelPneus[modelo.id] ? "Ocultar Pneus" : "Visualizar Pneus"}
              </button>
              <button style={{ ...styles.button, backgroundColor: "#007BFF" }}>
                Editar
              </button>
            </div>
          </div>

          {visivelPneus[modelo.id] && (
            <div style={styles.pneuSection}>
              <h4>Configuração de Pneus:</h4>
              {modelo.configPneus && modelo.configPneus.length > 0 ? (
                <ul style={styles.pneuLista}>
                  {modelo.configPneus.map((pneu, index) => (
                    <li key={index}>
                      <strong>{pneu.posicao}</strong>: {pneu.medida}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontStyle: "italic" }}>Nenhuma configuração de pneu.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 900,
    margin: "40px auto",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 28,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    padding: 20,
    marginBottom: 20,
    transition: "0.3s ease",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  modeloTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
  },
  buttonGroup: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  button: {
    padding: "8px 14px",
    border: "none",
    borderRadius: 6,
    backgroundColor: "#28a745",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  pneuSection: {
    marginTop: 15,
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
  },
  pneuLista: {
    paddingLeft: 20,
    marginTop: 10,
  },
};
