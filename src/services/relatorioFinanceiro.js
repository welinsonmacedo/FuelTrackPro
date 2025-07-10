import {
  collection,
  getDocs,
  addDoc,
  
} from "firebase/firestore";
import { db } from "./firebase";

export async function gerarRelatorioFinanceiro(mesReferencia) {
  try {
    const filtros = [
      { nome: "manutencoes", campoData: "data", campoValor: "valor", tipo: "manutencao" },
      { nome: "pedagios", campoData: "data", campoValor: "valor", tipo: "pedagio" },
      { nome: "diarias", campoData: "data", campoValor: "valor", tipo: "diaria" },
      { nome: "despesasGerais", campoData: "data", campoValor: "valor", tipo: "outras" },
    ];

    const veiculoMap = {};
    const totais = {
      totalGasto: 0,
      totalManutencao: 0,
      totalPedagio: 0,
      totalDiarias: 0,
      totalOutrasDespesas: 0,
    };

    for (const filtro of filtros) {
      const colRef = collection(db, filtro.nome);
      const snap = await getDocs(colRef);

      snap.docs.forEach((doc) => {
        const data = doc.data();
        const dataDoc = data[filtro.campoData]?.toDate?.() || new Date(data[filtro.campoData]);
        const valor = parseFloat(data[filtro.campoValor]) || 0;

        const mesDoc = `${dataDoc.getFullYear()}-${String(dataDoc.getMonth() + 1).padStart(2, "0")}`;
        if (mesDoc !== mesReferencia) return;

        const placa = data.placa || "DESCONHECIDO";
        if (!veiculoMap[placa]) {
          veiculoMap[placa] = {
            placa,
            total: 0,
            manutencao: 0,
            pedagio: 0,
            diarias: 0,
            outras: 0,
          };
        }

        veiculoMap[placa][filtro.tipo] += valor;
        veiculoMap[placa].total += valor;
        totais[`total${filtro.tipo.charAt(0).toUpperCase() + filtro.tipo.slice(1)}`] += valor;
        totais.totalGasto += valor;
      });
    }

    const relatorio = {
      mesReferencia,
      ...totais,
      veiculos: Object.values(veiculoMap),
    };

    await addDoc(collection(db, "relatoriosFinanceiros"), relatorio);

    return { sucesso: true, relatorio };
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return { sucesso: false, erro: error.message };
  }
}
