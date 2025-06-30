import * as yup from "yup";

export const manutencaoSchema = yup.object().shape({
  placa: yup.string().required("A placa é obrigatória"),
  tipoManutencao: yup.string().required("O tipo de manutenção é obrigatório"),
  fornecedor: yup.string().required("O fornecedor é obrigatório"),
  observacao: yup.string().optional(),
  km: yup
  .number()
  .typeError("O KM deve ser um número")
  .required("O KM é obrigatório"),
  proximaRevisaoData: yup.date().nullable(),
proximaRevisaoKm: yup.number().nullable(),

});
