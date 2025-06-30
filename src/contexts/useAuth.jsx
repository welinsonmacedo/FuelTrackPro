import { useContext } from "react";
import AuthContext from "./AuthProvider"; // importe o contexto criado no AuthProvider

export const useAuth = () => useContext(AuthContext);
