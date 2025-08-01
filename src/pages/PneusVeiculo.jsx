import React, { useState, useEffect } from "react";
import { useVeiculos } from "../hooks/useVeiculos";
import { useModelosVeiculos } from "../hooks/useModelosVeiculos";
import { usePneus } from "../hooks/usePneus";
import { PneuBox } from "../components/PneuBox";
import { Modal } from "../components/Modal";
import { EstoquePneus } from "../components/EstoquePneus";
import { ModalHistoricoPneu } from "../components/ModalHistoricoPneu";
import { buscarTodasMarcasFogo } from "../utils/pneusMarcaFogo";

// Modal Remoção Pneu completo (exemplo funcional)
const ModalRemocaoPneu = ({
  pneu,
  kmAtual,
  aberto,
  onFechar,
  onConfirmar,
  acaoRemover,
  setAcaoRemover,
  kmDesinstalacao,
  setKmDesinstalacao,
}) => {
  if (!aberto) return null;
  if (!pneu) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
      }}
      onClick={onFechar}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 8,
          minWidth: 320,
          maxWidth: 400,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Remover Pneu</h3>
        <p>
          Marca Fogo: <b>{pneu.marcaFogo}</b>
          <br />
          Modelo: <b>{pneu.modelo}</b>
          <br />
          Medida: <b>{pneu.medida}</b>
          <br />
          Posição: <b>{pneu.posicao}</b>
        </p>

        <label>
          Quilometragem de desinstalação (atual: {kmAtual} km):
          <br />
          <input
            type="number"
            min={pneu.kmInstalacao || 0}
            max={kmAtual}
            value={kmDesinstalacao}
            onChange={(e) => setKmDesinstalacao(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              marginBottom: 12,
            }}
          />
        </label>

        <label>
          Ação ao remover:
          <br />
          <select
            value={acaoRemover}
            onChange={(e) => setAcaoRemover(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              marginBottom: 12,
            }}
          >
            <option value="">Selecione uma ação</option>
            <option value="descartado">Descartado</option>
            <option value="estoque">Devolver ao estoque</option>
            <option value="manutencao">Enviar para manutenção</option>
          </select>
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onFechar}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ccc",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={
              !acaoRemover ||
              !kmDesinstalacao ||
              kmDesinstalacao < (pneu.kmInstalacao || 0) ||
              kmDesinstalacao > kmAtual
            }
            style={{
              padding: "8px 16px",
              backgroundColor:
                !acaoRemover || !kmDesinstalacao ? "#999" : "#d9534f",
              border: "none",
              borderRadius: 4,
              color: "#fff",
              cursor:
                !acaoRemover || !kmDesinstalacao ? "not-allowed" : "pointer",
            }}
          >
            Confirmar Remoção
          </button>
        </div>
      </div>
    </div>
  );
};

const statusOptions = [
  "Normal",
  "Desgastado",
  "Trocar",
  "Em manutenção",
  "Novo",
  "Recap",
];

const PneusVeiculo = () => {
  const {
    veiculos,
    loading: loadingVeiculos,
    error: errorVeiculos,
  } = useVeiculos();
  const { modelos } = useModelosVeiculos();

  const {
    loading: loadingPneus,
    error: errorPneus,
    removerPneuComAcao,
    atualizarPneusVeiculo,
    fetchPneus,
    salvarMarcaPneu,
  } = usePneus();

  const [placaSelecionada, setPlacaSelecionada] = useState("");
  const [modeloAtual, setModeloAtual] = useState(null);
  const [kmAtual, setKmAtual] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [pneuParaRemover, setPneuParaRemover] = useState(null);
  const [acaoRemover, setAcaoRemover] = useState("");
  const [kmDesinstalacao, setKmDesinstalacao] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [pneus, setPneus] = useState([]);
  const [pneusEstoque, setPneusEstoque] = useState([]);
  const [pneuSelecionado, setPneuSelecionado] = useState(null);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [marcasExistentes, setMarcasExistentes] = useState([]);

  function abrirModalHistorico(pneu) {
    setPneuSelecionado(pneu);
    setModalHistoricoAberto(true);
  }
  function fecharModalHistorico() {
    setModalHistoricoAberto(false);
    setPneuSelecionado(null);
  }

  // Seleciona a placa inicial
  useEffect(() => {
    if (veiculos.length > 0 && !placaSelecionada) {
      setPlacaSelecionada(veiculos[0].placa);
    }
  }, [veiculos, placaSelecionada]);

  useEffect(() => {
    async function carregarMarcas() {
      const marcas = await buscarTodasMarcasFogo();
      setMarcasExistentes(marcas);
    }
    carregarMarcas();
  }, []);

  // Atualiza pneus, modelo e km quando placa ou dados mudam
  useEffect(() => {
    const veiculo = veiculos.find((v) => v.placa === placaSelecionada);
    if (veiculo?.pneus) setPneus(veiculo.pneus);
    else setPneus([]);
    setKmAtual(veiculo?.kmAtual || 0);

    const modeloConfig = modelos.find(
      (m) => m.modelo?.toLowerCase() === veiculo?.modelo?.toLowerCase()
    );
    setModeloAtual(modeloConfig || null);
  }, [placaSelecionada, veiculos, modelos]);

  // Carregar pneus do estoque para arrastar
  useEffect(() => {
    async function carregarEstoque() {
      try {
        const pneusTodos = await fetchPneus();
        // Só pneus sem veículo (disponíveis no estoque)
        const disponiveis = pneusTodos.filter((p) => !p.veiculoId);
        setPneusEstoque(disponiveis);
      } catch (e) {
        console.error("Erro ao carregar pneus do estoque:", e);
      }
    }
    carregarEstoque();
  }, [fetchPneus]);

  const handleStatusChange = async (posicao, novoStatus) => {
    try {
      const pneusAtualizados = pneus.map((p) =>
        p.posicao === posicao ? { ...p, status: novoStatus } : p
      );
      setPneus(pneusAtualizados);

      const veiculo = veiculos.find((v) => v.placa === placaSelecionada);
      await atualizarPneusVeiculo(veiculo.id, pneusAtualizados);
    } catch (error) {
      alert("Erro ao atualizar status do pneu.");
      console.error(error);
    }
  };

  const abrirModalRemover = (pneu) => {
    if (!pneu?.id) {
      alert("Pneu inválido para remoção: falta o ID.");
      return;
    }
    setPneuParaRemover(pneu);
    setAcaoRemover("");
    setKmDesinstalacao("");
    setModalAberto(true);
  };

  const confirmarRemocao = async () => {
    try {
      if (!pneuParaRemover?.id) {
        alert("Nenhum pneu válido selecionado para remoção.");
        return;
      }
      if (!acaoRemover) {
        alert("Selecione a ação de remoção.");
        return;
      }
      if (!kmDesinstalacao) {
        alert("Informe a quilometragem de desinstalação.");
        return;
      }
      if (kmDesinstalacao < (pneuParaRemover.kmInstalacao || 0)) {
        alert(
          `A quilometragem de desinstalação não pode ser menor que a de instalação (${
            pneuParaRemover.kmInstalacao || 0
          }).`
        );
        return;
      }
      if (kmDesinstalacao > kmAtual) {
        alert(
          `A quilometragem de desinstalação não pode ser maior que o km atual (${kmAtual}).`
        );
        return;
      }

      const veiculo = veiculos.find((v) => v.placa === placaSelecionada);
      if (!veiculo) {
        alert("Veículo não encontrado.");
        return;
      }

      await removerPneuComAcao(
        pneuParaRemover,
        acaoRemover,
        veiculo.id,
        null,
        kmDesinstalacao
      );

      setPneus((prev) => prev.filter((p) => p.id !== pneuParaRemover.id));

      // Se devolveu ao estoque, adiciona ao estoque local
      if (acaoRemover === "estoque") {
        setPneusEstoque((prev) => [
          ...prev,
          { ...pneuParaRemover, veiculoId: null, status: "Estoque" },
        ]);
      }

      setModalAberto(false);
      setPneuParaRemover(null);
      setAcaoRemover("");
      setKmDesinstalacao("");
    } catch (error) {
      alert("Erro ao remover pneu: " + error.message);
      console.error(error);
    }
  };

  // Função para tratar drop do pneu do estoque para a roda
  const handleDropPneu = async (event, posicao) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    if (!data) return;

    const pneuArrastado = JSON.parse(data);

    // Verifica se medida do pneu é aceita
    if (modeloAtual && modeloAtual.medidasAceitas) {
      if (!modeloAtual.medidasAceitas.includes(pneuArrastado.medida)) {
        alert(
          `Pneu com medida ${pneuArrastado.medida} não é aceita para este veículo.`
        );
        return;
      }
    }

    const veiculo = veiculos.find((v) => v.placa === placaSelecionada);
    if (!veiculo) {
      alert("Veículo não encontrado");
      return;
    }

    try {
      // Remove pneu antigo da posição
      const pneusSemPosicao = pneus.filter((p) => p.posicao !== posicao);

      // Atualiza o pneu arrastado para vincular ao veículo e à posição
      const pneuAtualizado = {
        ...pneuArrastado,
        veiculoId: veiculo.id,
        posicao,
        instaladoEm: new Date().toISOString(),
        kmInstalacao: kmAtual,
        status: "Normal",
      };

      // Atualiza lista de pneus do veículo no backend/firestore
      await atualizarPneusVeiculo(veiculo.id, [
        ...pneusSemPosicao,
        pneuAtualizado,
      ]);

      // Atualiza estado local de pneus do veículo
      setPneus([...pneusSemPosicao, pneuAtualizado]);

      // Remove pneu do estoque local para evitar duplicação
      setPneusEstoque((prevEstoque) =>
        prevEstoque.filter((p) => p.id !== pneuArrastado.id)
      );
    } catch (error) {
      alert("Erro ao adicionar pneu: " + error.message);
      console.error(error);
    }
  };

  // Render PneuBox para posição
  const renderPneuBox = (pos) => {
    const pneu = pneus.find((p) => p.posicao === pos);
    const kmRodado = pneu?.kmInstalacao ? kmAtual - pneu.kmInstalacao : null;

    return (
      <div
        key={pos}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDropPneu(e, pos)}
        style={{ minWidth: 150 }}
      >
        <PneuBox
          pos={pos}
          pneu={pneu}
          statusOptions={statusOptions}
          handleStatusChange={handleStatusChange}
          abrirModalRemover={abrirModalRemover}
          kmRodado={kmRodado}
        />
      </div>
    );
  };

  if (loadingVeiculos || loadingPneus) return <p>Carregando...</p>;
  if (errorVeiculos) return <p>Erro: {errorVeiculos}</p>;
  if (errorPneus) return <p>Erro: {errorPneus}</p>;

  // Agrupa pneus por prefixo para eixo (ex: D1, T1)
  const gruposPneus =
    modeloAtual?.configPneus?.reduce((acc, pneu) => {
      const eixoPrefixo = pneu.posicao.substring(0, 2);
      if (!acc[eixoPrefixo]) acc[eixoPrefixo] = [];
      acc[eixoPrefixo].push(pneu);
      return acc;
    }, {}) || {};

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h2>Controle de Pneus</h2>

      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#2c7be5",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 16,
          marginBottom: 20,
        }}
      >
        Adicionar Pneu ao Estoque
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <EstoquePneus
          pneusEstoque={pneusEstoque}
          medidasAceitas={modeloAtual?.medidasAceitas || []}
        />
      </Modal>

      <select
        value={placaSelecionada}
        onChange={(e) => setPlacaSelecionada(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 20 }}
      >
        {veiculos.map((v) => (
          <option key={v.id} value={v.placa}>
            {v.placa} - {v.modelo}
          </option>
        ))}
      </select>

      {/* Container flex: estoque e pneus veículo lado a lado */}
      <div style={{ display: "flex", gap: 40 }}>
        {/* Coluna estoque (esquerda) */}
        <div
          style={{
            flex: "1 1 40%",
            border: "1px solid #ccc",
            padding: 12,
            maxHeight: "auto",
            overflowY: "auto",
            borderRadius: 6,
            backgroundColor: "#98a1a7",
          }}
        >
          <h3>Estoque de Pneus</h3>
          {pneusEstoque.length === 0 && (
            <p>Nenhum pneu disponível no estoque.</p>
          )}
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {pneusEstoque.map((pneu) => (
              <li
                key={pneu.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", JSON.stringify(pneu));
                }}
                onClick={() => abrirModalHistorico(pneu)}
                style={{
                  border: "1px solid #aaa",
                  padding: 8,
                  marginBottom: 6,
                  cursor: "pointer",
                  backgroundColor: "#f9f9f9",
                  userSelect: "none",
                  borderRadius: 4,
                }}
                title={`Marca Fogo: ${pneu.marcaFogo} | Marca: ${pneu.marca} | Modelo: ${pneu.modelo} | Medida: ${pneu.medida}`}
              >
                {pneu.marcaFogo} - {pneu.marca} - {pneu.modelo} - {pneu.medida}
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna pneus veículo (direita) */}
        <div style={{ flex: "1 1 60%", backgroundColor: "#c2bebe" }}>
          {Object.entries(gruposPneus).map(([grupo, pneusDoGrupo]) => {
            if (grupo === "D1") {
              // Encontra pneu esquerdo e direito — deve ser um só por lado
              const pneuEsquerdo = pneusDoGrupo.find(
                (p) => p.posicao === "D1E"
              );
              const pneuDireito = pneusDoGrupo.find((p) => p.posicao === "D1D");

              return (
                <div key={grupo} style={{ marginBottom: 30 }}>
                  <h3 style={{ textAlign: "center" }}>Eixo Dianteiro (D1)</h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      maxWidth: 600,
                      margin: "0 auto",
                      padding: "0 20px",
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ width: 150 }}>
                      {pneuEsquerdo
                        ? renderPneuBox(pneuEsquerdo.posicao)
                        : "[Sem pneu]"}
                    </div>
                    <div style={{ width: 150 }}>
                      {pneuDireito
                        ? renderPneuBox(pneuDireito.posicao)
                        : "[Sem pneu]"}
                    </div>
                  </div>
                </div>
              );
            }

            if (grupo === "T1") {
              return (
                <div key={grupo} style={{ marginBottom: 30 }}>
                  <h3 style={{ textAlign: "center" }}>Eixo Traseiro (T1)</h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      maxWidth: 700,
                      margin: "0 auto",
                      padding: "0 20px",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>Esquerdo</div>
                      <div style={{ display: "flex", gap: 16 }}>
                        {renderPneuBox("T1EE")}
                        {renderPneuBox("T1IE")}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>Direito</div>
                      <div style={{ display: "flex", gap: 16 }}>
                        {renderPneuBox("T1ED")}
                        {renderPneuBox("T1ID")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={grupo} style={{ marginBottom: 30 }}>
                <h3 style={{ textAlign: "center" }}>{grupo}</h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 20,
                    flexWrap: "wrap",
                  }}
                >
                  {pneusDoGrupo.map(({ posicao }) => renderPneuBox(posicao))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para remoção de pneu */}
      <ModalRemocaoPneu
        pneu={pneuParaRemover}
        kmAtual={kmAtual}
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onConfirmar={confirmarRemocao}
        acaoRemover={acaoRemover}
        setAcaoRemover={setAcaoRemover}
        kmDesinstalacao={kmDesinstalacao}
        setKmDesinstalacao={setKmDesinstalacao}
      />

      {/* Modal histórico do pneu */}
      <ModalHistoricoPneu
        aberto={modalHistoricoAberto}
        pneu={pneuSelecionado}
        onFechar={fecharModalHistorico}
        salvarMarcaPneu={salvarMarcaPneu}
        marcasExistentes={marcasExistentes}
      />
    </div>
  );
};

export default PneusVeiculo;
