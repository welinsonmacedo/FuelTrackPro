import * as yup from 'yup';

export const viagemSchema = yup.object().shape({
  motorista: yup.string().required("Selecione um motorista"),
  caminhao: yup.string().required("Selecione um caminhão"),
  dataInicio: yup.date().required("Data de início obrigatória"),
  dataFim: yup.date().required("Data de fim obrigatória"),
  tipoCarga: yup.string().required("Tipo de carga obrigatório"),
  status: yup.string().required("Status obrigatório"),
});