import * as yup from "yup";

export const abastecimentoSchema = yup.object().shape({
  placa: yup.string().required("Placa é obrigatória"),
  motorista: yup.string().required("Motorista é obrigatório"),
  fornecedor: yup.string().required("Fornecedor é obrigatório"),
  km: yup.number().required("KM é obrigatório").typeError("KM inválido"),
  data: yup.date().required("Data é obrigatória"),
  litros: yup.number().required("Litros são obrigatórios").typeError("Litros inválidos"),
  valorLitro: yup.number().required("Valor por litro é obrigatório").typeError("Valor inválido"),
  tipoCombustivel: yup.string().required("Tipo de combustível é obrigatório"),
});
