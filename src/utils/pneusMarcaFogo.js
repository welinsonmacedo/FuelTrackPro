import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase"; // seu arquivo de configuração Firebase

export async function buscarTodasMarcasFogo() {
  const pneusRef = collection(db, "pneus"); // nome da coleção, ajuste se necessário
  const querySnapshot = await getDocs(pneusRef);

  const marcas = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.marcaFogo) {
      marcas.push(data.marcaFogo.toUpperCase()); // armazenar maiúsculo para facilitar comparação
    }
  });

  return marcas;
}
