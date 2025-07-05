 
import { useAuth } from '../contexts/AuthContext';
import { registrarAuditoria } from '../services/auditoria';

export function useAuditoria() {
  const { usuario } = useAuth();

  async function log(colecao, acao, descricao, dadosAntes, dadosDepois, pagina) {
    if (!usuario || !usuario.uid) {
      console.warn("Usuário não autenticado. Auditoria não registrada.");
     
      return;
    }
    await registrarAuditoria(
      colecao,
      dadosAntes?.id || null,
      dadosAntes,
      dadosDepois,
      acao,
      usuario.uid,
      descricao,
      pagina,
      usuario.nome || usuario.email
    );
  }

  return { log };
}
