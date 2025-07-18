import React, { useState, useEffect } from "react";
import { useVeiculos } from "../hooks/useVeiculos";
import { useModelosVeiculos } from "../hooks/useModelosVeiculos";
import { usePneusFirestore } from "../hooks/usePneusFirestore";
import { formatData } from "../utils/data";

const statusOptions = [
  "Normal",
  "Desgastado",
  "Trocar",
  "Em manutenção",
  "Novo",
  "Recap",
];

const PneusVeiculo = () => {
  const { veiculos, loading: loadingVeiculos, error: errorVeiculos } = useVeiculos();
  const { modelos } = useModelosVeiculos();
  const {
    loading: loadingPneus,
    error: errorPneus,
    removerPneuComAcao,
    atualizarPneusVeiculo,
  } = usePneusFirestore();

  const [placaSelecionada, setPlacaSelecionada] = useState("");
  const [pneus, setPneus] = useState([]);
  const [modeloAtual, setModeloAtual] = useState(null);

  // Modal controle
  const [modalAberto, setModalAberto] = useState(false);
  const [pneuParaRemover, setPneuParaRemover] = useState(null);
  const [acaoRemover, setAcaoRemover] = useState(""); // estoque, recap, descarte
  const [recapSelecionada, setRecapSelecionada] = useState("");

  // Simulação de recapagens para escolher (pode vir do backend)
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

    if (pneus.find((p) => p.posicao === novoPneu.posicao)) {
      alert("Já existe um pneu nessa posição.");
      return;
    }

    const novoPneuFormatado = {
      ...novoPneu,
      kmInstalacao: novoPneu.kmInstalacao ? Number(novoPneu.kmInstalacao) : null,
    };

    const pneusAtualizados = [...pneus, novoPneuFormatado];
    setPneus(pneusAtualizados);

    try {
      const veiculo = veiculos.find((v) => v.placa === placaSelecionada);
      await atualizarPneusVeiculo(veiculo.id, pneusAtualizados);

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
    if (!acaoRemover) {
      alert("Selecione uma ação para remoção.");
      return;
    }
    if (acaoRemover === "recap" && !recapSelecionada) {
      alert("Selecione a recapagem para enviar o pneu.");
      return;
    }

    try {
      const pneusAtualizados = pneus.filter(
        (p) => p.posicao !== pneuParaRemover.posicao
      );
      const veiculo = veiculos.find((v) => v.placa === placaSelecionada);

      await removerPneuComAcao(
        { ...pneuParaRemover, id: pneuParaRemover.id || null },
        acaoRemover,
        veiculo.id,
        recapSelecionada || null
      );

      await atualizarPneusVeiculo(veiculo.id, pneusAtualizados);

      setPneus(pneusAtualizados);
      setModalAberto(false);
      setPneuParaRemover(null);
      setAcaoRemover("");
      setRecapSelecionada("");
    } catch (error) {
      alert("Erro ao remover pneu: " + error.message);
      console.error(error);
    }
  };

  if (loadingVeiculos || loadingPneus) return <p>Carregando...</p>;
  if (errorVeiculos) return <p>Erro: {errorVeiculos}</p>;
  if (errorPneus) return <p>Erro: {errorPneus}</p>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 30, backgroundColor: "#f9fafb", borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: 30, color: "#2c3e50" }}>Controle de Pneus</h2>

      <label htmlFor="selectVeiculo" style={{ display: "block", fontWeight: "600", marginBottom: 8, fontSize: 14, color: "#34495e" }}>
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

      {modeloAtual && (
        <>
          <h3 style={{ color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: 8, marginBottom: 18 }}>Posições</h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, maxWidth: 600, margin: "auto", marginBottom: 40 }}>
            {posicoesPneus.map((pos) => {
              const pneu = pneus.find((p) => p.posicao === pos);
              return (
                <div
                  key={pos}
                  style={{
                    backgroundColor: "#3e4142",
                    color: "#fff",
                    height: 250,
                    borderRadius: 10,
                    padding: 12,
                    boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.05), inset -1px -1px 3px rgba(255,255,255,0.7)",
                    fontWeight: "600",
                    fontSize: 14,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ textAlign: "center", marginBottom: 6 }}>{pos}</div>

                  {pneu ? (
                    <>
                      <div style={{ backgroundColor: "#cecece", borderRadius: 8, padding: 8, color: "#000", fontSize: 13, lineHeight: 1.3 }}>
                        <div><strong>Marca:</strong> {pneu.marca || "-"}</div>
                        <div><strong>Medida:</strong> {pneu.medida || "-"}</div>
                        <div><strong>Modelo:</strong> {pneu.modelo || "-"}</div>
                        <div><strong>Instalado:</strong> {pneu.dataInstalacao ? formatData(pneu.dataInstalacao) : "-"}</div>
                        <div><strong>Status:</strong></div>
                        <select
                          value={pneu.status}
                          onChange={(e) => handleStatusChange(pos, e.target.value)}
                          style={{ width: "100%", marginTop: 6, borderRadius: 6, padding: 4, fontSize: 12, outline: "none" }}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => abrirModalRemover(pneu)}
                        style={{
                          marginTop: 12,
                          backgroundColor: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 10px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        Remover
                      </button>
                    </>
                  ) : (
                    <div style={{ fontStyle: "italic", color: "#999", textAlign: "center", flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      [Sem pneu]
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <h3 style={{ color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: 8, marginBottom: 18 }}>Adicionar Pneu</h3>

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
          <label htmlFor="posicao" style={{ display: "block", fontWeight: "600", marginBottom: 6 }}>
            Posição*:
          </label>
          <select
            id="posicao"
            name="posicao"
            value={novoPneu.posicao}
            onChange={handleNovoPneuChange}
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 15, outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#3498db")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            <option value="">Selecione</option>
            {posicoesPneus.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: "1 1 48%" }}>
          <label htmlFor="medida" style={{ display: "block", fontWeight: "600", marginBottom: 6 }}>
            Medida*:
          </label>
          <select
            id="medida"
            name="medida"
            value={novoPneu.medida}
            onChange={handleNovoPneuChange}
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 15, outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#3498db")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            <option value="">Selecione</option>
            {medidasPneus.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: "1 1 48%" }}>
          <label htmlFor="marca" style={{ display: "block", fontWeight: "600", marginBottom: 6 }}>
            Marca:
          </label>
          <input
            type="text"
            id="marca"
            name="marca"
            value={novoPneu.marca}
            onChange={handleNovoPneuChange}
            placeholder="Marca do pneu"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 15, outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#3498db")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        <div style={{ flex: "1 1 48%" }}>
          <label htmlFor="modelo" style={{ display: "block", fontWeight: "600", marginBottom: 6 }}>
            Modelo:
          </label>
          <input
            type="text"
            id="modelo"
            name="modelo"
            value={novoPneu.modelo}
            onChange={handleNovoPneuChange}
            placeholder="Modelo do pneu"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 15, outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#3498db")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        <div style={{ flex: "1 1 48%" }}>
          <label htmlFor="dataInstalacao" style={{ display: "block", fontWeight: "600", marginBottom: 6 }}>
            Data Instalação*:
          </label>
          <input
            type="date"
            id="dataInstalacao"
            name="dataInstalacao"
            value={novoPneu.dataInstalacao}
            onChange={handleNovoPneuChange}
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 15, outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#3498db")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        <div style={{ flex: "1 1 48%" }}>
          <label htmlFor="kmInstalacao" style={{ display: "block", fontWeight: "600", marginBottom: 6 }}>
            KM Instalação:
          </label>
          <input
            type="number"
            id="kmInstalacao"
            name="kmInstalacao"
            value={novoPneu.kmInstalacao}
            onChange={handleNovoPneuChange}
            placeholder="KM de instalação"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 15, outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#3498db")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            min={0}
          />
        </div>

        <div style={{ flex: "1 1 48%" }}>
          <label htmlFor="status" style={{ display: "block", fontWeight: "600", marginBottom: 6 }}>
            Status:
          </label>
          <select
            id="status"
            name="status"
            value={novoPneu.status}
            onChange={handleNovoPneuChange}
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 15, outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#3498db")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: "1 1 100%", textAlign: "right" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#3498db",
              color: "white",
              padding: "10px 18px",
              fontWeight: "600",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Adicionar Pneu
          </button>
        </div>
      </form>

      {/* Modal remoção */}
      {modalAberto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setModalAberto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 25,
              width: 360,
              boxShadow: "0 0 15px rgba(0,0,0,0.2)",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          >
            <h3 style={{ marginBottom: 16 }}>Remover Pneu: {pneuParaRemover?.posicao}</h3>

            <p>
              Escolha a ação para o pneu{" "}
              <strong>{pneuParaRemover?.posicao}</strong> do veículo <strong>{placaSelecionada}</strong>:
            </p>

            <select
              value={acaoRemover}
              onChange={(e) => setAcaoRemover(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                fontSize: 16,
                borderRadius: 6,
                border: "1.5px solid #d1d5db",
                marginBottom: 20,
                outline: "none",
              }}
            >
              <option value="">Selecione a ação</option>
              <option value="estoque">Voltar para Estoque</option>
              <option value="recap">Enviar para Recapagem</option>
              <option value="descarte">Descarte</option>
            </select>

            {acaoRemover === "recap" && (
              <>
                <label
                  htmlFor="recapSelecionada"
                  style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
                >
                  Selecionar Recapagem:
                </label>
                <select
                  id="recapSelecionada"
                  value={recapSelecionada}
                  onChange={(e) => setRecapSelecionada(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    fontSize: 16,
                    borderRadius: 6,
                    border: "1.5px solid #d1d5db",
                    marginBottom: 20,
                    outline: "none",
                  }}
                >
                  <option value="">Selecione</option>
                  {recapagens.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nome}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setModalAberto(false)}
                style={{
                  marginRight: 12,
                  backgroundColor: "#ccc",
                  borderRadius: 6,
                  padding: "8px 14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRemocao}
                style={{
                  backgroundColor: "#e74c3c",
                  color: "white",
                  borderRadius: 6,
                  padding: "8px 14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PneusVeiculo;
