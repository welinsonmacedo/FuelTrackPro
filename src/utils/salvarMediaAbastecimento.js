// utils/salvarMediaAbastecimento.js
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export async function salvarMedia(abastecimentoAtual) {
  const { placa, motorista, km, litros, data } = abastecimentoAtual;

  if (!placa || !motorista || !km || !litros || !data) return;

  // Busca abastecimentos anteriores
  const q = query(
    collection(db, "abastecimentos"),
    where("placa", "==", placa),
    where("motorista", "==", motorista)
  );

  const snapshot = await getDocs(q);
  const abastecimentos = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((a) => a.id !== abastecimentoAtual.id && a.km < km)
    .sort((a, b) => b.km - a.km); // ordena do maior para o menor km

  const anterior = abastecimentos[0];
  if (!anterior) return;

  const kmRodado = km - anterior.km;
  if (kmRodado <= 0) return;

  const media = parseFloat((kmRodado / litros).toFixed(2));

  // Salva na coleção de médias
  await addDoc(collection(db, "medias"), {
    placa,
    motorista,
    data: data instanceof Date ? Timestamp.fromDate(data) : data,
    kmInicial: anterior.km,
    kmFinal: km,
    litros,
    media,
    criadoEm: Timestamp.now(),
  });
}
