import React from "react";
import { formatData } from "../utils/data";

export default function ResumoModal({ dados, onClose }) {
  if (!dados) return null;

  // Média por tanque cheio depende do próximo abastecimento, aqui só mostramos mensagem
  const calcularMediaPorTanqueCheio = () => {
    if (!dados.km || dados.tanqueCheio === undefined) return "-";
    return "Depende do próximo abastecimento";
  };

  const dataParaExibir = dados.data || dados.criadoEm || null;

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
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            border: "none",
            background: "none",
            fontSize: "18px",
            cursor: "pointer",
          }}
          aria-label="Fechar"
        >
          ✖
        </button>

        <h3>Resumo do Abastecimento</h3>
        <p>
          <strong>Motorista:</strong> {dados.motorista || "-"}
        </p>
        <p>
          <strong>Placa:</strong> {dados.placa || "-"}
        </p>
        <p>
          <strong>Data:</strong> {dataParaExibir ? formatData(dataParaExibir) : "-"}
        </p>

        <p>
          <strong>KM:</strong> {dados.km || "-"}
        </p>
        <p>
          <strong>Litros:</strong> {dados.litros || "-"} L
        </p>
        <p>
          <strong>Tanque Cheio:</strong> {dados.tanqueCheio ? "Sim" : "Não"}
        </p>
        <p>
          <strong>Fornecedor:</strong> {dados.fornecedor || "-"}
        </p>
        <p>
          <strong>Valor por Litro:</strong>{" "}
          {dados.valorLitro ? `R$ ${dados.valorLitro}` : "-"}
        </p>

        <hr />
        <p>
          <strong>Média por Tanque Cheio:</strong> {calcularMediaPorTanqueCheio()}
        </p>
      </div>
    </div>
  );
}
