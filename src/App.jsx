import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { UIProvider } from "./contexts/UIContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import MotoristasList from "./pages/MotoristasList";
import Layout from "./components/Layout";
import { PrivateRoute } from "./routes/PrivateRoute";
import VeiculosList from "./pages/VeiculosList";
import ManutencoesList from "./pages/ManutencoesList";
import FornecedoresList from "./pages/FornecedoresList";
import AbastecimentosList from "./pages/AbastecimentosList";
import TiposManutencaoList from "./pages/TiposManutencaoList";
import Notificacoes from "./pages/Notificacoes";
import ViagensList from "./pages/ViagensList";
import MediasPage from "./pages/MediasPage";

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Rota privada com Layout */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
         
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="home" element={<Home />} />
              <Route path="motoristas" element={<MotoristasList />} />
              <Route path="veiculos" element={<VeiculosList/>} />
              <Route path="abastecimentos" element={<AbastecimentosList/>} />
             <Route path="manutencoes" element={<ManutencoesList/>} />
             <Route path="tipos-manutencoes" element={<TiposManutencaoList/>} />
              <Route path="fornecedores" element={<FornecedoresList/>} />
              <Route path="notificacoes" element={<Notificacoes/>} />
              <Route path="viagens" element={<ViagensList/>} />
              <Route path="medias" element={<MediasPage/>} />
           
            </Route>
          </Routes>
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}
