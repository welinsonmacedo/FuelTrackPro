import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyCHRvBAY3PvN9P_QQJA6XUEEAEwVUWQogE",
   authDomain: "fueltrackpro-a4856.firebaseapp.com",
   projectId: "fueltrackpro-a4856",
   storageBucket: "fueltrackpro-a4856.appspot.com",
   messagingSenderId: "22618337014",
   appId: "1:22618337014:web:42234d4ea94d44a7b186d7",
   measurementId: "G-91ESV42JR3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const motoristas = [
  { id: "B5Uqk4erSRXyJaRakITT", nome: "JOÃO SILVA", placa: "ZXC4321" },
  { id: "M2OaBx9s7ZVqLdRHFGYr", nome: "MARIA OLIVEIRA", placa: "PWI9055" },
  { id: "C3RqLp48tXKmnSYwBHJu", nome: "CARLOS ALMEIDA", placa: "QWE1234" },
  { id: "A9NxSv2zDYPbJKrOTWCL", nome: "ANA SOUZA", placa: "ASD5678" },
  { id: "V7UYbIqnfMGXEsZChRLJ", nome: "PEDRO LIMA", placa: "RTY9876" },
  { id: "X0HLReysJINWMCVUbDAQ", nome: "LUCAS FERNANDES", placa: "FGH6543" },
  { id: "Q5OPr8cyFzSNXelWdKTV", nome: "RAFAELA COSTA", placa: "JKL3210" },
  { id: "B8SMTvyZJQlcNwEUpFHD", nome: "FERNANDO MOURA", placa: "BNM0987" },
  { id: "O2NqSzvXPeUJMtbCVYFG", nome: "JULIANA PINHEIRO", placa: "UIO7654" },
  { id: "R9YKwNcGlTMOJdaVXBHS", nome: "TIAGO RAMOS", placa: "PAS1234" },
];

const rotas = [
  "SP-URA-UDI",
  "BHZ-UDI",
  "UDI-BSB",
  "SP-BHZ",
  "BHZ-SP",
  "UDI-ARC-SP",
  "UDI-URA-SP",
  "UDI-BHZ",
  "GYN-UDI",
  "UDI-GYN",
  "SP-UDI",
  "UDI-SP",
  "SP-URA-UDI",
  "BHZ-UDI",
  "UDI-BSB",
  "SP-BHZ",
  "BHZ-SP",
  "UDI-ARC-SP",
  "UDI-URA-SP",
  "UDI-BHZ"
];

async function seedViagens() {
  const ref = collection(db, "viagens");
  let kmBase = 100;

  for (let i = 0; i < 20; i++) {
    const motorista = motoristas[i % motoristas.length];
    const rota = rotas[i];
    
    const dataInicio = new Date(2025, 6, i + 1); // mês 6 = julho (0-index)
    const dataFim = new Date(2025, 6, i + 2);    // dia seguinte
    
    const km = (kmBase + i * 500).toString();

    const docRef = await addDoc(ref, {
      motoristaId: motorista.id,
      motoristaNome: motorista.nome,
      placa: motorista.placa,
      rota,
      dataInicio: dataInicio,
      dataFim: dataFim,
      km,
      criadoEm: serverTimestamp(),
    });

    console.log(`✅ Viagem ${i + 1} criada com ID: ${docRef.id}`);
  }

  console.log("✅ Seed de viagens finalizado.");
}

seedViagens().catch(console.error);
