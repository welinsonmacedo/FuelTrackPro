import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import "./style.css"

export default function ViagensList({ onIniciarChecklist }) {
  const { usuario } = useAuth();
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchViagens() {
      if (!usuario) return;
      setLoading(true);

      const q = query(
        collection(db, "viagens"),
        where("motoristaId", "==", usuario.uid)
      );

      const querySnapshot = await getDocs(q);
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });

      setViagens(lista);
      setLoading(false);
    }

    fetchViagens();
  }, [usuario]);

  if (loading) return <p>Carregando viagens...</p>;
  if (viagens.length === 0) return <p>Nenhuma viagem encontrada.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {viagens.map((viagem) => (
        <li
          key={viagem.id}
          style={{
            marginBottom: "12px",
            padding: "12px",
            background: "#fff",
            borderRadius: "6px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Destino:</strong> {viagem.destino} <br />
            <strong>Data Início:</strong> {viagem.dataInicio} <br />
            <strong>Status:</strong> {viagem.status}
          </div>
          <button onClick={() => onIniciarChecklist(viagem)}>Checklist</button>
        </li>
      ))}
    </ul>
  );
}
