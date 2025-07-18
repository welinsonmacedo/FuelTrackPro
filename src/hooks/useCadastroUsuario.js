import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export function useCadastroUsuario() {
  async function cadastrarUsuario(dados) {
    if (!dados) throw new Error("Dados inválidos");

    console.log("Dados recebidos no hook:", dados); // DEBUG

    const { nome, email, senha, tipo, motoristaId } = dados;

    if (!email || !senha || !nome || !tipo) {  
      throw new Error("Preencha todos os campos obrigatórios");
    }

    // Cria usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = userCredential.user.uid;

    // Salva dados adicionais no Firestore na coleção "usuarios"
   await setDoc(doc(db, "usuarios", uid), {
  uid,
  nome,
  email,
  tipo,
  motoristaId: motoristaId || null,
  criadoEm: new Date(),
  ativo: true,
});
  }

  return { cadastrarUsuario };
}
