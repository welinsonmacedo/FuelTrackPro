 
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useVeiculos } from "../hooks/useVeiculos";
import { useModelosVeiculos } from "../hooks/useModelosVeiculos";
import { usePneus } from "../hooks/usePneus";
import { formatData } from "../utils/data";
import { PneuBox } from "../components/PneuBox";
import { ModalRemocaoPneu } from "../components/ModalRemocaoPneu";
import { Modal } from "../components/Modal";
import { CadastroPneu } from "../components/CadastroPneu";

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
  const [placa, setPlaca] = useState() 
  const {
    loading: loadingPneus,
    error: errorPneus, // se tiver erro, você pode adicionar estado para erro
    salvarNovoPneuGlobal,
    atualizarPneuGlobal,
    removerPneuComAcao, // se existir, senão remova
    atualizarPneusVeiculo, // se existir, senão remova
  } = usePneus();

  const [placaSelecionada, setPlacaSelecionada] = useState("");
  const [modeloAtual, setModeloAtual] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  // Modal controle
  const [kmAtual, setKmAtual] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [pneuParaRemover, setPneuParaRemover] = useState(null);
  const [acaoRemover, setAcaoRemover] = useState(""); // estoque, recap, descarte
  const [recapSelecionada, setRecapSelecionada] = useState("");
  // Simulação de recapagens para escolher (pode vir do backend)
  const [pneus, setPneus] = useState([]);
  const [kmDesinstalacao, setKmDesinstalacao] = useState("");

  const recapagens = [
    { id: "r1", nome: "Recapagem A" },
    { id: "r2", nome: "Recapagem B" },
    { id: "r3", nome: "Recapagem C" },
  ];

  const [novoPneu, setNovoPneu] = useState({
    posicao: "",
    marca: "",
    modelo: "",
    medida: "",
    dataInstalacao: "",
    kmInstalacao: "",
    status: "Normal",
  });

  // Seleciona automaticamente a primeira placa disponível
  useEffect(() => {
    if (veiculos.length > 0 && !placaSelecionada) {
      setPlacaSelecionada(veiculos[0].placa);
    }
  }, [veiculos, placaSelecionada]);

  // Atualiza pneus e modelo quando placa muda
  useEffect(() => {
    const veiculo = veiculos.find((v) => v.placa === placaSelecionada);
    if (veiculo?.pneus) setPneus(veiculo.pneus);
    else setPneus([]);

    const modeloConfig = modelos.find(
      (m) => m.modelo?.toLowerCase() === veiculo?.modelo?.toLowerCase()
    );
    setModeloAtual(modeloConfig || null);
  }, [placaSelecionada, veiculos, modelos]);

  useEffect(() => {
  const veiculo = veiculos.find((v) => v.placa === placaSelecionada);
  if (veiculo?.pneus) setPneus(veiculo.pneus);
  else setPneus([]);

  const modeloConfig = modelos.find(
    (m) => m.modelo?.toLowerCase() === veiculo?.modelo?.toLowerCase()
  );
  setModeloAtual(modeloConfig || null);

  setKmAtual(veiculo?.kmAtual || 0); // atualiza o km do veículo
}, [placaSelecionada, veiculos, modelos]);

  // Posições e medidas únicas do modelo
  const posicoesPneus = modeloAtual
    ? Array.from(new Set(modeloAtual.configPneus?.map((p) => p.posicao) || []))
    : [];

  const medidasPneus = modeloAtual
    ? Array.from(new Set(modeloAtual.configPneus?.map((p) => p.medida) || []))
    : [];

  // Atualiza status do pneu no veículo
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

  // Handle input novo pneu
  const handleNovoPneuChange = (e) => {
    const { name, value } = e.target;
    setNovoPneu((prev) => ({ ...prev, [name]: value }));
  };

  // Adiciona pneu novo
  const handleAdicionarPneu = async (e) => {
    e.preventDefault();

    if (!novoPneu.posicao || !novoPneu.medida || !novoPneu.dataInstalacao) {
      alert("Preencha os campos obrigatórios (posição, medida e data).");
      return;
    }

    if (new Date(novoPneu.dataInstalacao) > new Date()) {
      alert("A data de instalação não pode ser no futuro.");
      return;
    }

    if (pneus.find((p) => p.posicao === novoPneu.posicao)) {
      alert("Já existe um pneu nessa posição.");
      return;
    }

    const pneuComID = {
      ...novoPneu,
      kmInstalacao: novoPneu.kmInstalacao
        ? Number(novoPneu.kmInstalacao)
        : null,
    };

    try {
      const veiculo = veiculos.find((v) => v.placa === placaSelecionada);

      // 🔥 Salva na coleção `pneus`
      const pneuId = await salvarNovoPneuGlobal(pneuComID, placaSelecionada);
      const pneuComFirestoreId = { ...pneuComID, id: pneuId };

      // 🔁 Atualiza lista do veículo
      const pneusAtualizados = [...pneus, pneuComFirestoreId];
      setPneus(pneusAtualizados);
      await atualizarPneusVeiculo(veiculo.id, pneusAtualizados);

      // Limpa formulário
      setNovoPneu({
        posicao: "",
        marca: "",
        modelo: "",
        medida: "",
        dataInstalacao: "",
        kmInstalacao: "",
        status: "Normal",
      });
    } catch (error) {
      alert("Erro ao adicionar pneu.");
      console.error(error);
    }
  };

  // Abre modal remoção
  const abrirModalRemover = (pneu) => {
    setPneuParaRemover(pneu);
    setAcaoRemover("");
    setRecapSelecionada("");
    setModalAberto(true);
  };

  // Confirma remoção com ação
const confirmarRemocao = async () => {
 

  const veiculo = veiculos.find((v) => v.placa === placa);
  console.log
  if (!veiculo) {
    console.error("Veículo não encontrado para a placa:", placa);
    return;
  }

  const kmDesinstalacao = veiculo.kmAtual || 0;
  const kmRodado = pneuParaRemover.kmInstalacao
    ? kmDesinstalacao - pneuParaRemover.kmInstalacao
    : null;

  await removerPneuComAcao({
    pneu: pneuParaRemover,
    placa,
    acao: acaoRemover,
    recapSelecionada,
    kmDesinstalacao,
    kmRodado,
  });

  setModalAberto(false);
  setAcaoRemover("");
  setRecapSelecionada("");
};



  if (loadingVeiculos || loadingPneus) return <p>Carregando...</p>;
  if (errorVeiculos) return <p>Erro: {errorVeiculos}</p>;
  if (errorPneus) return <p>Erro: {errorPneus}</p>;

  // Corrigindo duplicatas das posições fixas
  const posicoesFixas = [
    { sigla: "D1E", descricao: "Dianteiro 1 Esquerdo" },
    { sigla: "D1D", descricao: "Dianteiro 1 Direito" },

    { sigla: "T1EE", descricao: "Traseiro 1 Externo Esquerdo" },
    { sigla: "T1IE", descricao: "Traseiro 1 Interno Esquerdo" },

    { sigla: "T1ED", descricao: "Traseiro 1 Externo Direito" },
    { sigla: "T1ID", descricao: "Traseiro 1 Interno Direito" },

    { sigla: "T2EE", descricao: "Traseiro 2 Externo Esquerdo" },
    { sigla: "T2IE", descricao: "Traseiro 2 Interno Esquerdo" },

    { sigla: "T2ED", descricao: "Traseiro 2 Externo Direito" },
    { sigla: "T2ID", descricao: "Traseiro 2 Interno Direito" },

    { sigla: "T3ED", descricao: "Traseiro 3 Externo Direito" },
    { sigla: "T3ID", descricao: "Traseiro 3 Interno Direito" },

    { sigla: "T3EE", descricao: "Traseiro 3 Externo Esquerdo" },
    { sigla: "T3IE", descricao: "Traseiro 3 Interno Esquerdo" },

    { sigla: "ESTEPE", descricao: "Estepe" },
  ];

  const renderPneuBox = (pos) => {
    const pneu = pneus.find((p) => p.posicao === pos);
  const kmRodado = pneu?.kmInstalacao
    ? kmAtual - pneu.kmInstalacao
    : null;

    return (
     <PneuBox
      key={pos}
      pos={pos}
      pneu={pneu}
      statusOptions={statusOptions}
      handleStatusChange={handleStatusChange}
      abrirModalRemover={abrirModalRemover}
      kmRodado={kmRodado}
    />
    );
  };

  return (
    <div
      style={{
        margin: "40px auto",
        padding: 30,
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        maxWidth: 900,
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 30, color: "#2c3e50" }}>
        Controle de Pneus
      </h2>
      //
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
        Cadastrar Novo Pneu
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <CadastroPneu />
      </Modal>
      //
      <label
        htmlFor="selectVeiculo"
        style={{
          display: "block",
          fontWeight: "600",
          marginBottom: 8,
          fontSize: 14,
          color: "#34495e",
        }}
      >
        Selecione o veículo:
      </label>
      <select
        id="selectVeiculo"
        value={placaSelecionada}
        onChange={(e) => setPlacaSelecionada(e.target.value)}
        style={{
          padding: "12px 15px",
          marginBottom: 30,
          width: "100%",
          borderRadius: 8,
          border: "1.5px solid #d1d5db",
          fontSize: 16,
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#3498db")}
        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
      >
        {veiculos.map((v) => (
          <option key={v.id} value={v.placa}>
            {v.placa} - {v.modelo}
          </option>
        ))}
      </select>
      {modeloAtual && modeloAtual.configPneus && (
        <>
          <h3
            style={{
              color: "#2c3e50",
              borderBottom: "2px solid #3498db",
              paddingBottom: 8,
              marginBottom: 18,
            }}
          >
            Posições dos Pneus por Eixo
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 800,
              margin: "auto",
              marginBottom: 40,
            }}
          >
            {/** Agrupamento por eixo/prefixo */}
            {Object.entries(
              modeloAtual.configPneus.reduce((acc, pneu) => {
                const eixo = pneu.posicao.slice(0, 2);
                if (!acc[eixo]) acc[eixo] = [];
                acc[eixo].push(pneu.posicao);
                return acc;
              }, {})
            ).map(([eixo, posicoes]) => {
              if (eixo === "D1") {
                // eixo dianteiro: só dois pneus, um na esquerda e outro na direita
                const pneuEsquerda = posicoes.find((p) => p.endsWith("E"));
                const pneuDireita = posicoes.find((p) => p.endsWith("D"));

                return (
                  <div key={eixo} style={{ marginBottom: 24 }}>
                    <h4
                      style={{
                        marginBottom: 10,
                        fontWeight: "600",
                        color: "#34495e",
                        borderBottom: "1px solid #ccc",
                        paddingBottom: 4,
                      }}
                    >
                      Eixo {eixo}
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 12,
                        minWidth: 220,
                      }}
                    >
                      <div style={{ minWidth: 100 }}>
                        {pneuEsquerda && renderPneuBox(pneuEsquerda)}
                      </div>
                      <div style={{ minWidth: 100 }}>
                        {pneuDireita && renderPneuBox(pneuDireita)}
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Outros eixos (exemplo T1, T2, etc), criar pares externo+interno
                const externos = posicoes.filter(
                  (p) => p.includes("E") && !p.includes("IE")
                );
                const internos = posicoes.filter((p) => p.includes("I"));

                // Montar pares lado a lado (externo+interno)
                const pares = [];
                for (
                  let i = 0;
                  i < Math.max(externos.length, internos.length);
                  i++
                ) {
                  pares.push([externos[i], internos[i]].filter(Boolean));
                }

                // Agora, pra alinhar os pares com extremos nas bordas, podemos usar justify-content: space-between
                // Com cada par numa div flex vertical, e a linha com display:flex space-between

                return (
                  <div key={eixo} style={{ marginBottom: 24 }}>
                    <h4
                      style={{
                        marginBottom: 10,
                        fontWeight: "600",
                        color: "#34495e",
                        borderBottom: "1px solid #ccc",
                        paddingBottom: 4,
                      }}
                    >
                      Eixo {eixo}
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 12,
                        minWidth: pares.length * 120, // só para garantir largura suficiente
                      }}
                    >
                      {pares.map((par, idx) => (
                        <div
                          key={idx}
                          style={{ display: "flex", gap: 8, minWidth: 100 }}
                        >
                          {par.map((pos) => (
                            <div key={pos} style={{ minWidth: 45 }}>
                              {renderPneuBox(pos)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            })}
          </div>

          <h3
            style={{
              color: "#2c3e50",
              borderBottom: "2px solid #3498db",
              paddingBottom: 8,
              marginBottom: 18,
            }}
          >
            Adicionar Pneu
          </h3>

          <form
            onSubmit={handleAdicionarPneu}
            style={{
              maxWidth: 600,
              margin: "auto",
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ flex: "1 1 48%" }}>
              <label
                htmlFor="posicao"
                style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
              >
                Posição*:
              </label>
              <select
                id="posicao"
                name="posicao"
                value={novoPneu.posicao}
                onChange={handleNovoPneuChange}
                style={{
                  width: "100%",
                  padding: 10,
                  fontSize: 16,
                  borderRadius: 6,
                  border: "1.5px solid #d1d5db",
                  outline: "none",
                }}
              >
                <option value="">Selecione a posição</option>
                {posicoesFixas
                  .filter((p) => !pneus.some((pn) => pn.posicao === p.sigla))
                  .map((p) => (
                    <option key={p.sigla} value={p.sigla}>
                      {p.descricao}
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ flex: "1 1 48%" }}>
              <label
                htmlFor="medida"
                style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
              >
                Medida*:
              </label>
              <select
                id="medida"
                name="medida"
                value={novoPneu.medida}
                onChange={handleNovoPneuChange}
                style={{
                  width: "100%",
                  padding: 10,
                  fontSize: 16,
                  borderRadius: 6,
                  border: "1.5px solid #d1d5db",
                  outline: "none",
                }}
              >
                <option value="">Selecione a medida</option>
                {medidasPneus.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: "1 1 48%" }}>
              <label
                htmlFor="marca"
                style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
              >
                Marca:
              </label>
              <input
                type="text"
                id="marca"
                name="marca"
                value={novoPneu.marca}
                onChange={handleNovoPneuChange}
                placeholder="Marca do pneu"
                style={{
                  width: "100%",
                  padding: 10,
                  fontSize: 16,
                  borderRadius: 6,
                  border: "1.5px solid #d1d5db",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ flex: "1 1 48%" }}>
              <label
                htmlFor="modelo"
                style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
              >
                Modelo:
              </label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={novoPneu.modelo}
                onChange={handleNovoPneuChange}
                placeholder="Modelo do pneu"
                style={{
                  width: "100%",
                  padding: 10,
                  fontSize: 16,
                  borderRadius: 6,
                  border: "1.5px solid #d1d5db",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ flex: "1 1 48%" }}>
              <label
                htmlFor="dataInstalacao"
                style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
              >
                Data Instalação*:
              </label>
              <input
                type="date"
                id="dataInstalacao"
                name="dataInstalacao"
                value={novoPneu.dataInstalacao}
                onChange={handleNovoPneuChange}
                style={{
                  width: "100%",
                  padding: 10,
                  fontSize: 16,
                  borderRadius: 6,
                  border: "1.5px solid #d1d5db",
                  outline: "none",
                }}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div style={{ flex: "1 1 48%" }}>
              <label
                htmlFor="kmInstalacao"
                style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
              >
                KM Instalação:
              </label>
              <input
                type="number"
                id="kmInstalacao"
                name="kmInstalacao"
                min={0}
                value={novoPneu.kmInstalacao}
                onChange={handleNovoPneuChange}
                placeholder="Km da instalação"
                style={{
                  width: "100%",
                  padding: 10,
                  fontSize: 16,
                  borderRadius: 6,
                  border: "1.5px solid #d1d5db",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ flex: "1 1 48%" }}>
              <label
                htmlFor="status"
                style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
              >
                Status:
              </label>
              <select
                id="status"
                name="status"
                value={novoPneu.status}
                onChange={handleNovoPneuChange}
                style={{
                  width: "100%",
                  padding: 10,
                  fontSize: 16,
                  borderRadius: 6,
                  border: "1.5px solid #d1d5db",
                  outline: "none",
                }}
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: "1 1 100%", textAlign: "right" }}>
              <button
                type="submit"
                disabled={
                  !novoPneu.posicao ||
                  !novoPneu.medida ||
                  !novoPneu.dataInstalacao
                }
                style={{
                  backgroundColor:
                    !novoPneu.posicao ||
                    !novoPneu.medida ||
                    !novoPneu.dataInstalacao
                      ? "#bdc3c7"
                      : "#27ae60",
                  color: "white",
                  padding: "12px 24px",
                  fontSize: 16,
                  fontWeight: "600",
                  border: "none",
                  borderRadius: 8,
                  cursor:
                    !novoPneu.posicao ||
                    !novoPneu.medida ||
                    !novoPneu.dataInstalacao
                      ? "not-allowed"
                      : "pointer",
                  transition: "background-color 0.3s ease",
                }}
              >
                Adicionar Pneu
              </button>
            </div>
          </form>
        </>
      )}
      <ModalRemocaoPneu
        aberto={modalAberto}
        pneu={pneuParaRemover}
        placa={placaSelecionada}
        recapagens={recapagens}
        acaoRemover={acaoRemover}
        setAcaoRemover={setAcaoRemover}
        recapSelecionada={recapSelecionada}
        setRecapSelecionada={setRecapSelecionada}
        kmDesinstalacao={kmDesinstalacao}
        setKmDesinstalacao={setKmDesinstalacao}
        onFechar={() => setModalAberto(false)}
        onConfirmar={confirmarRemocao}
      />
    </div>
  );
};

export default PneusVeiculo;
