import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import Logo from "../components/Logo";
import Home from "./Home";

export default function Dashboard() {
  const [logotipoBase64, setLogotipoBase64] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmpresa() {
      setLoading(true);
      const empresaDoc = doc(db, "configs", "empresa");
      const docSnap = await getDoc(empresaDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Dados empresa:", data); // Verifica no console
        setLogotipoBase64(data.logotipoBase64 || null);
      }
      setLoading(false);
    }
    fetchEmpresa();
  }, []);

  if (loading) return <p>Carregando dados da empresa...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <Home />
      <Logo src={logotipoBase64}  alt="Logotipo da Empresa" />
    </div>
  );
}
