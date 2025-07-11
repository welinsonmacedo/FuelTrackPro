import * as yup from "yup";

export const itemUsadoSchema = yup.object().shape({
  descricao: yup.string().required("Descrição do item é obrigatória"),
  quantidade: yup
    .number()
    .typeError("Quantidade deve ser um número")
    .required("Quantidade é obrigatória")
    .min(1, "Quantidade mínima é 1"),
  valorUnitario: yup
    .number()
    .typeError("Valor unitário deve ser um número")
    .required("Valor unitário é obrigatório")
    .min(0, "Valor unitário não pode ser negativo"),
});

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

  // Ajuste para não ter dependência cíclica:
  dataRealizacao: yup
    .date()
    .nullable()
    .notRequired(),

  kmRealizacao: yup
    .number()
    .typeError("KM da realização deve ser número")
    .nullable()
    .notRequired()
    .when("dataRealizacao", {
      is: (val) => val != null && val !== "",
      then: yup.number().required("KM da realização é obrigatório quando data de realização é informada"),
    }),

  fornecedorRealizacao: yup
    .string()
    .nullable()
    .notRequired()
    .when("dataRealizacao", {
      is: (val) => val != null && val !== "",
      then: yup.string().required("Fornecedor da realização é obrigatório quando data de realização é informada"),
    }),

  valorServico: yup
    .number()
    .typeError("Valor do serviço deve ser um número")
    .nullable()
    .min(0, "Valor do serviço não pode ser negativo")
    .notRequired(),

  numeroNF: yup.string().nullable().notRequired(),

  itensUsados: yup
    .array()
    .of(itemUsadoSchema)
    .nullable()
    .notRequired(),

  desconto: yup
    .number()
    .typeError("Desconto deve ser um número")
    .nullable()
    .min(0, "Desconto não pode ser negativo")
    .notRequired(),

  valorTotal: yup
    .number()
    .typeError("Valor total deve ser um número")
    .nullable()
    .min(0, "Valor total não pode ser negativo")
    .notRequired(),
});
