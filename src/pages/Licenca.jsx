import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import Button from "../components/Button";

export default function Licenca() {
  const [licenca, setLicenca] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLicenca() {
      const docRef = doc(db, "licencas", "ativa");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLicenca(docSnap.data());
      }
      setLoading(false);
    }
    fetchLicenca();
  }, []);

  async function renovarLicenca() {
    // Implementar renovação (ex: abrir modal, integrar pagamento)
    alert("Funcionalidade de renovação ainda não implementada.");
  }

  if (loading) return <p>Carregando dados da licença...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Licença do Sistema</h2>
      {licenca ? (
        <>
          <p><b>Tipo:</b> {licenca.tipo}</p>
          <p><b>Início:</b> {new Date(licenca.dataInicio).toLocaleDateString()}</p>
          <p><b>Vencimento:</b> {new Date(licenca.dataVencimento).toLocaleDateString()}</p>
          <p><b>Usuários Permitidos:</b> {licenca.usuariosPermitidos}</p>
          <p><b>Status:</b> {licenca.status}</p>
          <Button onClick={renovarLicenca}>Renovar Licença</Button>
        </>
      ) : (
        <p>Nenhuma licença ativa encontrada.</p>
      )}
    </div>
  );
}
