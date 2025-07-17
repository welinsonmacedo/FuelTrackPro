import React, { useState, useMemo, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../services/firebase"; // importe seu db configurado
import Card from "../components/Card";
import { formatCurrency, formatData } from "../utils/data";

const tipos = [
  "Combustível",
  "Manutenção",
  "Pedágio",
  "Diária",
  "Outros",
  "nota", // aqui está o tipo real
];

// Mapeamento para mostrar no texto ao usuário
const tiposDisplay = {
  Combustível: "Combustível",
  Manutenção: "Manutenção",
  Pedágio: "Pedágio",
  Diária: "Diária",
  Outros: "Outros",
  nota: "OS", // aqui troca o texto para o cliente
};

function useFinanceiro() {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "financeiro"), orderBy("data", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDespesas(list);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar despesas:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { despesas, loading };
}

function useAbastecimentos() {
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "abastecimentos"), orderBy("data", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAbastecimentos(list);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar abastecimentos:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { abastecimentos, loading };
}

const FinanceiroPage = () => {
  const { despesas = [], loading: loadingDespesas } = useFinanceiro();
  const { abastecimentos = [], loading: loadingAbastecimentos } =
    useAbastecimentos();

  // Começa com todos selecionados
  const [tiposSelecionados, setTiposSelecionados] = useState(tipos);

  const [placa, setPlaca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Normalize despesas
  const despesasNormalizadas = useMemo(() => {
    return despesas.map((d) => ({
      ...d,
      tipo: d.tipo || "Outros",
      placa: d.placa && d.placa.trim() !== "" ? d.placa : "—",
    }));
  }, [despesas]);

  // Converte abastecimentos para formato despesa
  const despesasAbastecimentos = useMemo(() => {
    return abastecimentos.map((a) => ({
      id: a.id,
      tipo: "Combustível",
      placa: a.placa && a.placa.trim() !== "" ? a.placa : "—",
      data: a.data,
      valor: a.valorLitro && a.litros ? a.valorLitro * a.litros : a.valor ?? 0,
      descricao: `${a.tipoCombustivel || "Combustível"} → ${
        a.fornecedor || "—"
      }`,
      posto: a.fornecedor || "—",
    }));
  }, [abastecimentos]);

  const todasDespesas = useMemo(
    () => [...despesasNormalizadas, ...despesasAbastecimentos],
    [despesasNormalizadas, despesasAbastecimentos]
  );

  const despesasFiltradas = useMemo(() => {
    if (tiposSelecionados.length === 0) return []; // Nenhum selecionado: não mostra nada

    return todasDespesas.filter((d) => {
      if (!tiposSelecionados.includes(d.tipo)) return false;

      if (placa) {
        if (
          d.placa === "—" ||
          !d.placa.toUpperCase().includes(placa.toUpperCase())
        )
          return false;
      }

      let data = d.data;
      if (data?.seconds) data = new Date(data.seconds * 1000);
      else if (typeof data === "string") data = new Date(data);

      if (dataInicio && new Date(data) < new Date(dataInicio)) return false;
      if (dataFim && new Date(data) > new Date(dataFim)) return false;

      return true;
    });
  }, [todasDespesas, tiposSelecionados, placa, dataInicio, dataFim]);

  const total = useMemo(() => {
    return despesasFiltradas.reduce((acc, d) => {
      const valor = d.valor ?? d.total ?? 0;
      return acc + valor;
    }, 0);
  }, [despesasFiltradas]);

  const totalPorPosto = useMemo(() => {
    const mapa = {};
    despesasFiltradas.forEach((d) => {
      if (d.tipo === "Combustível") {
        const posto = d.posto || "Não informado";
        mapa[posto] = (mapa[posto] || 0) + (d.valor ?? 0);
      }
    });
    return mapa;
  }, [despesasFiltradas]);

  const toggleTipo = (tipo) => {
    setTiposSelecionados((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  // Toggle todos
  const toggleTodos = () => {
    if (tiposSelecionados.length === tipos.length) setTiposSelecionados([]);
    else setTiposSelecionados([...tipos]);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    const html = `
      <html>
        <head>
          <title>Imprimir Despesas</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            td.valor { text-align: right; }
            h2 { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>Despesas Filtradas</h2>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Placa</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              ${despesasFiltradas
                .map((d) => {
                  const valor = d.valor ?? d.total ?? 0;
                  const descricao = d.descricao || "-";
                  const placa = d.placa || "—";
                  const tipo = d.tipo || "-";
                  const dataFormatada = formatData(d.data);
                  return `
                    <tr>
                      <td>${tipo}</td>
                      <td>${placa}</td>
                      <td>${dataFormatada}</td>
                      <td class="valor">${formatCurrency(valor)}</td>
                      <td>${descricao}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const loading = loadingDespesas || loadingAbastecimentos;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 20,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 20, textAlign: "center", color: "#004085" }}>
        💰 Controle Financeiro da Frota
      </h2>

      {/* Filtros */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 15,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 25,
          fontSize: 14,
        }}
      >
        {/* Checkbox Todos */}

        {/* Checkboxes individuais */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            maxWidth: 650,
          }}
        >
          <label
            style={{
              userSelect: "none",
              cursor: "pointer",
              fontWeight: "bold",
              padding: "6px 12px",
              borderRadius: 6,
              backgroundColor:
                tiposSelecionados.length === tipos.length
                  ? "#007bff"
                  : "#e0e0e0",
              color:
                tiposSelecionados.length === tipos.length ? "white" : "#333",
              border: "1px solid #ccc",
            }}
          >
            <input
              type="checkbox"
              checked={tiposSelecionados.length === tipos.length}
              onChange={toggleTodos}
              style={{ marginRight: 8 }}
            />
            Todos
          </label>
          {tipos.map((t) => (
            <label
              key={t}
              style={{
                userSelect: "none",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: 6,
                backgroundColor: tiposSelecionados.includes(t)
                  ? "#007bff"
                  : "#f0f0f0",
                color: tiposSelecionados.includes(t) ? "white" : "#555",
                border: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              <input
                type="checkbox"
                checked={tiposSelecionados.includes(t)}
                onChange={() => toggleTipo(t)}
                style={{ cursor: "pointer" }}
              />
              {tiposDisplay[t] || t}
            </label>
          ))}
        </div>

        {/* Outros filtros */}
        <div   style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            maxWidth: 650,
          }}>
          <input
            type="text"
            placeholder="Filtrar por placa"
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            style={{
              padding: 8,
              borderRadius: 5,
              border: "1px solid #ccc",
              minWidth: 140,
              flexGrow: 1,
              maxWidth: 200,
            }}
          />

          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 5,
              border: "1px solid #ccc",
              minWidth: 140,
            }}
            aria-label="Data Início"
          />
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 5,
              border: "1px solid #ccc",
              minWidth: 140,
            }}
            aria-label="Data Fim"
          />

          <button
            onClick={handlePrint}
            style={{
              padding: "8px 16px",
              fontSize: 14,
              borderRadius: 5,
              border: "none",
              backgroundColor: "#28a745",
              color: "#fff",
              cursor: "pointer",
              height: 36,
              alignSelf: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              transition: "background-color 0.3s ease",
            }}
            title="Imprimir despesas filtradas"
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#218838")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#28a745")
            }
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* Mensagem se nenhum tipo selecionado */}
      {tiposSelecionados.length === 0 && (
        <p
          style={{
            textAlign: "center",
            fontStyle: "italic",
            color: "#999",
            marginTop: 10,
            marginBottom: 20,
          }}
        >
          ⚠️ Nenhum tipo selecionado — nada será exibido.
        </p>
      )}

      {/* Total geral */}
      <div style={{
            display: "flex",
            justifyContent:"center",
            flexWrap: "wrap",
            gap: 5,
            maxWidth: "100%"
          }}>

 <Card
        title="Total Filtrado"
        style={{  margin: "0 auto 30px", textAlign: "center" }}
      >
        <p
          style={{
            fontSize: 24,
            fontWeight: "bold",
            margin: 0,
            color: "#343a40",
          }}
        >
          {formatCurrency(total)}
        </p>
      </Card>

      {/* Total por posto - só para combustível */}
      {(tiposSelecionados.includes("Combustível") ||
        tiposSelecionados.includes("Todos")) && (
        <Card
          title="Total por Posto (Combustível)"
          style={{  margin: "0 auto 30px", textAlign: "left" }}
        >
          {Object.entries(totalPorPosto).length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              Nenhum abastecimento encontrado.
            </p>
          ) : (
            Object.entries(totalPorPosto).map(([posto, valor]) => (
              <p
                key={posto}
                style={{ margin: "6px 0", fontWeight: "600", fontSize: 14 }}
              >
                {posto}:{" "}
                <span style={{ color: "#28a745" }}>
                  {formatCurrency(valor)}
                </span>
              </p>
            ))
          )}
        </Card>
      )}
          </div>
     

      {/* Lista de despesas */}
      <h3 style={{ marginBottom: 10, textAlign: "center", color: "#495057" }}>
        📋 Despesas
      </h3>
      {loading ? (
        <p style={{ textAlign: "center" }}>
          Carregando despesas e abastecimentos...
        </p>
      ) : despesasFiltradas.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>
          Nenhuma despesa encontrada.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: 14,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            borderRadius: 8,
            overflow: "hidden",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#007bff", color: "white" }}>
              <th style={{ padding: "12px 15px", textAlign: "left" }}>Tipo</th>
              <th style={{ padding: "12px 15px", textAlign: "left" }}>Placa</th>
              <th style={{ padding: "12px 15px", textAlign: "left" }}>Data</th>
              <th style={{ padding: "12px 15px", textAlign: "right" }}>
                Valor
              </th>
              <th style={{ padding: "12px 15px", textAlign: "left" }}>
                Descrição
              </th>
            </tr>
          </thead>
          <tbody>
            {despesasFiltradas.map((d, i) => {
              const valor = d.valor ?? d.total ?? 0;
              const descricao = d.descricao || "-";
              const placaExibir = d.placa || "—";
              const tipoExibir = tiposDisplay[d.tipo] || d.tipo || "-";

              return (
                <tr
                  key={d.id}
                  style={{
                    backgroundColor: i % 2 === 0 ? "white" : "#f9faff",
                    transition: "background-color 0.3s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e6f0ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      i % 2 === 0 ? "white" : "#f9faff")
                  }
                >
                  <td style={{ padding: "12px 15px" }}>{tipoExibir}</td>
                  <td style={{ padding: "12px 15px" }}>{placaExibir}</td>
                  <td style={{ padding: "12px 15px" }}>{formatData(d.data)}</td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "right",
                      fontWeight: "600",
                    }}
                  >
                    {formatCurrency(valor)}
                  </td>
                  <td style={{ padding: "12px 15px" }}>{descricao}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FinanceiroPage;
