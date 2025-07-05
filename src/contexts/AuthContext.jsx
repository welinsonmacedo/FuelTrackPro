import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    signOut(auth);
    setUsuario(null);
    setTipoUsuario(null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUsuario(user);

        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const tipo = docSnap.data().tipo || "padrao";
            setTipoUsuario(tipo);
          } else {
            setTipoUsuario("padrao");
          }
        } catch (error) {
          console.error("Erro ao buscar tipo de usuário:", error);
          setTipoUsuario("padrao");
        }
      } else {
        setUsuario(null);
        setTipoUsuario(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, tipoUsuario, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
