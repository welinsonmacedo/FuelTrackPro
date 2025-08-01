/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { usePneusEstoque } from "../hooks/usePneusEstoque";
import { useModelosVeiculos } from "../hooks/useModelosVeiculos";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export function EstoquePneus({
  medidasAceitas = [],
  onArrastarPneu,
  onCadastrarPneu,
}) {
  const { pneusEstoque, loading, error, adicionarPneu, pneusUsados } =
    usePneusEstoque(medidasAceitas);
  const [salvando, setSalvando] = useState(false);
  const [novoPneu, setNovoPneu] = useState({
    marca: "",
    modeloPneu: "",
    medida: "",
    fornecedor: "",
    valorUnitario: "",
    quantidade: "",
    notaFiscal: "",
    desconto: "",
    dataFabricacao: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoPneu((prev) => ({ ...prev, [name]: value }));
  };

  async function adicionarDespesaFinanceira(despesa) {
    try {
      const financeiroRef = collection(db, "financeiro");
      await addDoc(financeiroRef, {
        ...despesa,
        dataCadastro: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao salvar despesa financeira:", error);
      throw error;
    }
  }

  const handleCadastrar = async () => {
    const {
      marca,
      modeloPneu,
      medida,
      fornecedor,
      valorUnitario,
      quantidade,
      notaFiscal,
      desconto,
      dataFabricacao,
    } = novoPneu;

    if (
      !marca ||
      !modeloPneu ||
      !medida ||
      !fornecedor ||
      !valorUnitario ||
      !quantidade ||
      !notaFiscal ||
      !dataFabricacao
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const valorUnit = parseFloat(valorUnitario);
    const qtd = parseInt(quantidade);
    const desc = desconto ? parseFloat(desconto) : 0;

    setSalvando(true);
    try {
      const pneusCadastrados = [];

      for (let i = 0; i < qtd; i++) {
        const pneuUnitario = {
          marca,
          modelo: modeloPneu,
          medida,
          fornecedor,
          valorUnitario: valorUnit,
          quantidade: 1,
          notaFiscal,
          desconto: desc / qtd,
          dataFabricacao,
          status: "Estoque",
          dataCadastro: serverTimestamp(),
        };

        // Aqui capturamos o DocumentReference para obter o id
        const docRef = await adicionarPneu(pneuUnitario);

        pneusCadastrados.push({ id: docRef.id, ...pneuUnitario });
      }

      const entradaFinanceira = {
        tipo: "Despesa",
        categoria: "Compra de Pneus",
        descricao: `Compra de ${qtd} pneus ${marca} ${modeloPneu} - ${medida}`,
        valor: valorUnit * qtd - desc,
        fornecedor,
        notaFiscal,
        data: new Date().toISOString(),
      };

      await adicionarDespesaFinanceira(entradaFinanceira);
      alert("Pneus cadastrados e entrada financeira registrada com sucesso.");

      setNovoPneu({
        marca: "",
        modeloPneu: "",
        medida: "",
        fornecedor: "",
        valorUnitario: "",
        quantidade: "",
        notaFiscal: "",
        desconto: "",
        dataFabricacao: "",
      });

      if (onCadastrarPneu) onCadastrarPneu(pneusCadastrados);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Erro ao cadastrar pneus. Veja o console para detalhes.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <p>Carregando pneus do estoque...</p>;
  if (error) return <p>Erro ao carregar pneus: {error}</p>;

  return (
    <div>
      <div
        style={{
          border: "1px solid #888",
          padding: 10,
          marginBottom: 12,
          borderRadius: 4,
          backgroundColor: "#fafafa",
        }}
      >
        <h4>Cadastrar Novo Pneu</h4>

        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}
        >
          <input
            type="text"
            name="marca"
            placeholder="Marca"
            value={novoPneu.marca}
            onChange={handleChange}
            style={{ flex: 1, minWidth: 120, padding: 6 }}
          />
          <input
            type="text"
            name="modeloPneu"
            placeholder="Modelo do Pneu"
            value={novoPneu.modeloPneu}
            onChange={handleChange}
            style={{ flex: 2, minWidth: 160, padding: 6 }}
          />
          <input
            list="medidas-pneus"
            name="medida"
            placeholder="Medida"
            value={novoPneu.medida}
            onChange={handleChange}
            style={{ flex: 1, minWidth: 120, padding: 6 }}
          />

          <datalist id="medidas-pneus">
            {[ /* lista de medidas */ ].map((medida) => (
              <option key={medida} value={medida} />
            ))}
          </datalist>
        </div>

        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}
        >
          <input
            type="text"
            name="fornecedor"
            placeholder="Fornecedor"
            value={novoPneu.fornecedor}
            onChange={handleChange}
            style={{ flex: 2, minWidth: 160, padding: 6 }}
          />
          <input
            type="number"
            name="valorUnitario"
            placeholder="Valor Unitário (R$)"
            value={novoPneu.valorUnitario}
            onChange={handleChange}
            style={{ flex: 1, minWidth: 120, padding: 6 }}
          />
          <input
            type="number"
            name="quantidade"
            placeholder="Qtd"
            value={novoPneu.quantidade}
            onChange={handleChange}
            style={{ width: 80, padding: 6 }}
          />
          <input
            type="text"
            name="notaFiscal"
            placeholder="Nº NF"
            value={novoPneu.notaFiscal}
            onChange={handleChange}
            style={{ flex: 1, minWidth: 100, padding: 6 }}
          />
          <input
            type="number"
            name="desconto"
            placeholder="Desconto (R$)"
            value={novoPneu.desconto}
            onChange={handleChange}
            style={{ width: 120, padding: 6 }}
          />
          <input
            type="date"
            name="dataFabricacao"
            placeholder="Data Fabricação"
            value={novoPneu.dataFabricacao}
            onChange={handleChange}
            style={{ width: 160, padding: 6 }}
          />
        </div>

        <button
          onClick={handleCadastrar}
          disabled={salvando}
          style={{
            padding: "6px 12px",
            backgroundColor: salvando ? "#999" : "#2c7be5",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: salvando ? "not-allowed" : "pointer",
          }}
        >
          {salvando ? "Salvando..." : "Cadastrar"}
        </button>
      </div>

      <h4>Estoque Disponível</h4>
      {pneusEstoque.length === 0 ? (
        <p>Nenhum pneu disponível com medida aceita.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pneusEstoque.map((pneu, index) => (
            <li
              key={pneu.id || index}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", JSON.stringify(pneu));
                if (onArrastarPneu) onArrastarPneu(pneu);
              }}
              style={{
                border: "1px solid #aaa",
                padding: 8,
                marginBottom: 6,
                cursor: "grab",
                backgroundColor: "#f0f0f0",
              }}
              title={`NF: ${pneu.notaFiscal} | Fornecedor: ${pneu.fornecedor} | Valor: R$ ${pneu.valorUnitario}`}
            >
              {pneu.marcaFogo} {pneu.marca} {pneu.modelo} - {pneu.medida}{" "}
              (Fabricação: {pneu.dataFabricacao})
            </li>
          ))}
        </ul>
      )}

      <h4>Pneus em Uso</h4>
      {!pneusUsados || pneusUsados.length === 0 ? (
        <p>Nenhum pneu está sendo utilizado.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pneusUsados.map((pneu, index) => (
            <li
              key={pneu.id || index}
              style={{
                border: "1px solid green",
                padding: 8,
                marginBottom: 6,
                backgroundColor: "#eaffea",
              }}
            >
              <strong>
                {pneu.marca} {pneu.modelo} - {pneu.medida}
              </strong>
              <br />
              Placa: {pneu.placa} | Posição: {pneu.posicao} | KM:{" "}
              {pneu.kmInstalacao}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
