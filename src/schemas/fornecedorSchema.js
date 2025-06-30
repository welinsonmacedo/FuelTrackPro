import * as yup from "yup";

export const fornecedorSchema = yup.object().shape({
  nome: yup.string().required("Nome é obrigatório"),
  cnpj: yup
    .string()
    .required("CNPJ é obrigatório")
    .matches(/^\d{14}$/, "CNPJ deve conter 14 dígitos numéricos"),
  rua: yup.string().required("Rua é obrigatória"),
  numero: yup.string().required("Número é obrigatório"),
  bairro: yup.string().required("Bairro é obrigatório"),
  cidade: yup.string().required("Cidade é obrigatória"),
  estado: yup.string().required("Estado é obrigatório"),
  cep: yup
    .string()
    .required("CEP é obrigatório")
    .matches(/^\d{8}$/, "CEP deve conter 8 dígitos numéricos"),
  tipo: yup
    .string()
    .oneOf(["Oficina", "Postos", "Outros"], "Tipo inválido")
    .required("Tipo é obrigatório"),
});
