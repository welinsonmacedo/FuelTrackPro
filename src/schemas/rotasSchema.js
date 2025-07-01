import * as yup from "yup";

export const rotasSchema = yup.object().shape({
  nome: yup.string().required("Nome da rota é obrigatório"),
  origem: yup.string().required("Origem é obrigatória"),
  destino: yup.string().required("Destino é obrigatório"),
  // Você pode adicionar mais campos conforme sua estrutura
});
