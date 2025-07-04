// utils/exportCsv.js
export function exportarParaCSV(dados, colunas, nomeArquivo) {
    const csv = [
      colunas.join(","),
      ...dados.map((item) =>
        colunas.map((col) => JSON.stringify(item[col] ?? "")).join(",")
      ),
    ].join("\n");
  
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${nomeArquivo}.csv`;
    link.click();
  }
  