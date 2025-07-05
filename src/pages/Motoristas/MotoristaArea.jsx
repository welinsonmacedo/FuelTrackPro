import React, { useState } from "react";
import ViagensList from "../ViagensList";
import AbastecimentosList from "../AbastecimentosList";
import MediasResumo from "../MediasPage";
import ChecklistModal from "../../components/ChecklistModal";
import "./style.css";

export default function MotoristaArea() {
  const [checklistAberto, setChecklistAberto] = useState(false);
  const [viagemSelecionada, setViagemSelecionada] = useState(null);

  function abrirChecklist(viagem) {
    setViagemSelecionada(viagem);
    setChecklistAberto(true);
  }

  function fecharChecklist() {
    setChecklistAberto(false);
    setViagemSelecionada(null);
  }

  return (
    <div className="motorista-container">
      <h1>Área do Motorista</h1>

      <div className="sections-wrapper">
        <section>
          <h2>Minhas Viagens</h2>
          <ViagensList onIniciarChecklist={abrirChecklist} />
        </section>

        <section>
          <h2>Meus Abastecimentos</h2>
          <AbastecimentosList />
        </section>

        <section>
          <h2>Minhas Médias</h2>
          <MediasResumo />
        </section>
      </div>

      {checklistAberto && (
        <ChecklistModal viagem={viagemSelecionada} onClose={fecharChecklist} />
      )}
    </div>
  );
}
