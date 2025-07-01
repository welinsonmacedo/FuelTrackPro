import * as yup from "yup";

export const viagensSchema = yup.object().shape({
  placa: yup
    .string()
    .required("Veículo (placa) é obrigatório")
    .min(3, "Informe uma placa válida"),
  motorista: yup.string().required("Motorista é obrigatório"),
  dataInicio: yup
    .date()
    .required("Data início é obrigatória")
    .typeError("Informe uma data válida"),
  dataFim: yup
    .date()
    .required("Data fim é obrigatória")
    .typeError("Informe uma data válida")
    .min(yup.ref("dataInicio"), "Data fim não pode ser antes da data início"),
 
  rota: yup.string().required("Rota é obrigatória"),

  // campo para armazenar ids de abastecimentos vinculados (array de strings)
  abastecimentosVinculados: yup.array().of(yup.string()),
});
