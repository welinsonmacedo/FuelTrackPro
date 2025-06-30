import * as yup from "yup";

export const tipoManutencaoSchema = yup.object().shape({
  nome: yup.string().required("O nome é obrigatório"),
  marca: yup.string().required("A marca é obrigatória"),
  modelo: yup.string().required("O modelo é obrigatório"),
  tempoDias: yup
    .number()
    .typeError("Informe um número")
    .min(0, "Deve ser no mínimo 0")
    .required("Tempo em dias é obrigatório"),
  tempoKm: yup
    .number()
    .typeError("Informe um número")
    .min(0, "Deve ser no mínimo 0")
    .required("Tempo em KM é obrigatório"),
  avisoDiasAntes: yup
    .number()
    .typeError("Informe um número")
    .min(0, "Deve ser no mínimo 0")
    .required("Aviso de dias antes é obrigatório"),
  avisoKmAntes: yup
    .number()
    .typeError("Informe um número")
    .min(0, "Deve ser no mínimo 0")
    .required("Aviso de KM antes é obrigatório"),
});
