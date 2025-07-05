import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminRoutes() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        const tipo = snap.data().tipo;
        if (tipo === "admin") {
          setAuthorized(true);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <p>Verificando permissões...</p>;
  if (!authorized) return <Navigate to="/login" replace />;

  return <Outlet />;
}
