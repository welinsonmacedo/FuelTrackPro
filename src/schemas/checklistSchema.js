import * as yup from "yup";

export const checklistSchema = yup.object().shape({
  rota: yup.string().required(),
  tipo: yup.string().oneOf(["inicio", "fim"]).required(),
  respostas: yup.object().required(),
  observacoesGerais: yup.string(),
  dataRegistro: yup.date().required(),
});
