import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export const ModelosVeiculosList = () => {
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

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

  if (loading) return <p>Carregando modelos...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;
  if (modelos.length === 0) return <p>Nenhum modelo cadastrado.</p>;

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>Modelos de Veículos Cadastrados</h2>
      {modelos.map((modelo) => (
        <div
          key={modelo.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>{modelo.fabricante} - {modelo.modelo}</h3>
          <p><strong>Tipo:</strong> {modelo.tipo}</p>
          <p><strong>Descrição:</strong> {modelo.descricao || "Não informada"}</p>

          <h4>Configuração de Pneus:</h4>
          {modelo.configPneus && modelo.configPneus.length > 0 ? (
            <ul style={{ paddingLeft: 20 }}>
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
      ))}
    </div>
  );
};
