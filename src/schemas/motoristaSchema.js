import * as yup from 'yup';

export const motoristaSchema = yup.object().shape({
  nome: yup.string().required("Nome é obrigatório"),
  cnh: yup.string().required("CNH é obrigatória"),
  categoria: yup.string().required("Categoria é obrigatória"),
  dataEmissao: yup.date().required("Data de emissão obrigatória"),
  dataValidade: yup.date().required("Data de validade obrigatória"),
  cpf: yup
    .string()
    .required("CPF obrigatório")
    .matches(/^\d{11}$/, "CPF deve conter 11 dígitos"),
});