import * as yup from "yup";

export const veiculoSchema = yup.object().shape({
  placa: yup.string().required("Placa é obrigatória"),
  marca: yup.string().required("Marca é obrigatória"),
  modelo: yup.string().required("Modelo é obrigatório"),
  ano: yup
    .number()
    .typeError("Ano deve ser um número")
    .required("Ano é obrigatório")
    .min(1900, "Ano inválido")
    .max(new Date().getFullYear(), "Ano inválido"),
  tipo: yup.string().required("Tipo é obrigatório"),
  chassi: yup.string(),
  renavam: yup.string(),
  cor: yup.string(),
  filial: yup.string(),
  capacidadeTanque: yup
    .number()
    .typeError("Capacidade do tanque deve ser um número")
    .required("Capacidade do tanque é obrigatória")
    .positive("Capacidade do tanque deve ser maior que zero"),
});
