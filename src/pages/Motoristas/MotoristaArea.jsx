import React, { useState } from "react";
import ViagensList from "../ViagensList";
import AbastecimentosList from "../AbastecimentosList";
import MediasResumo from "../MediasPage";
import ChecklistModal from "../../components/ChecklistModal";
import { FaBars } from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./style.css";

export default function MotoristaArea() {
  const [checklistAberto, setChecklistAberto] = useState(false);
  const [viagemSelecionada, setViagemSelecionada] = useState(null);
  const [secaoAtiva, setSecaoAtiva] = useState("viagens");
  const [menuAberto, setMenuAberto] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();

  function abrirChecklist(viagem) {
    setViagemSelecionada(viagem);
    setChecklistAberto(true);
  }

  function fecharChecklist() {
    setChecklistAberto(false);
    setViagemSelecionada(null);
  }

  function trocarSecao(secao) {
    setSecaoAtiva(secao);
    setMenuAberto(false);
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login"); // ou "/" se for para a home
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao sair. Tente novamente.");
    }
  }

  return (
    <div className="motorista-container">
      <div className="topo-motorista">
        <h1>Área do Motorista</h1>
        <button onClick={handleLogout} className="logout-button">Sair</button>
      </div>

      {/* Menu Hamburguer */}
      <div className="menu-mobile">
        <button onClick={() => setMenuAberto(!menuAberto)} className="menu-toggle">
          <FaBars size={24} />
        </button>

        {menuAberto && (
          <div className="menu-opcoes">
            <button onClick={() => trocarSecao("viagens")} className={secaoAtiva === "viagens" ? "ativo" : ""}>
              Viagens
            </button>
            <button onClick={() => trocarSecao("abastecimentos")} className={secaoAtiva === "abastecimentos" ? "ativo" : ""}>
              Abastecimentos
            </button>
            <button onClick={() => trocarSecao("medias")} className={secaoAtiva === "medias" ? "ativo" : ""}>
              Médias
            </button>
          </div>
        )}
      </div>

      {/* Seções */}
      <div className="sections-wrapper">
        {secaoAtiva === "viagens" && (
          <section>
            <ViagensList onIniciarChecklist={abrirChecklist} mostrarCadastrar={false} />
          </section>
        )}
        {secaoAtiva === "abastecimentos" && (
          <section>
            <AbastecimentosList />
          </section>
        )}
        {secaoAtiva === "medias" && (
          <section>
            <MediasResumo />
          </section>
        )}
      </div>

      {/* Modal do checklist */}
      {checklistAberto && (
        <ChecklistModal viagem={viagemSelecionada} onClose={fecharChecklist} />
      )}
    </div>
  );
}
