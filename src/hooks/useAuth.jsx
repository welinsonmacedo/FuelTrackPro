import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { startInactivityTimer, stopInactivityTimer } from "../utils/inactivityManager";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null); // Novo
  const [loading, setLoading] = useState(true);

  const logout = () => {
    signOut(auth);
    setUsuario(null);
    setTipoUsuario(null);
    stopInactivityTimer();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUsuario(user);
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const tipo = docSnap.data().tipo || "padrao";
          setTipoUsuario(tipo);
        } else {
          setTipoUsuario("padrao");
        }

        startInactivityTimer(logout, 5 * 60 * 1000); // 5 minutos
      } else {
        logout();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      stopInactivityTimer();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, tipoUsuario, loading, logout }}>
    {children}
  </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
