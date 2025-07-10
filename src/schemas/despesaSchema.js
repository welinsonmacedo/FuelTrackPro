export const despesaSchema = {
  tipo: "abastecimento", // ou "manutencao", "pedagio", "diaria", "outro"
  descricao: "Troca de óleo",
  valor: 180,
  data: new Date(),
  placa: "ABC1234",
  motorista: "João",
  categoria: "Preventiva",
  vinculado: "idViagemOuOS",
  observacoes: "Troca feita após checklist",
  criadoPor: "admin@empresa.com",
  criadoEm: new Date(),
};