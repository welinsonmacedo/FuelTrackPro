import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase"; // sua instância do Firestore

export async function calcularMediaGeral() {
  const mediasRef = collection(db, "medias");
  const snapshot = await getDocs(mediasRef);

  if (snapshot.empty) return 0;

  let somaMedias = 0;
  let count = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (typeof data.media === "number") {
      somaMedias += data.media;
      count++;
    }
  });

  return count > 0 ? somaMedias / count : 0;
}
