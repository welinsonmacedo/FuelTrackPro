import * as yup from 'yup';

export const abastecimentoSchema = yup.object().shape({
  placa: yup.string().required('Selecione a placa'),
  motorista: yup.string().required('Selecione o motorista'),
  fornecedor: yup.string().required('Informe o fornecedor'),
  data: yup.date().required('Informe a data'),
  km: yup
    .number()
    .required('Informe o KM')
    .min(0, 'KM não pode ser negativo'),
  litros: yup
    .number()
    .required('Informe a quantidade de litros')
    .min(0.1, 'Litros devem ser maior que zero'),
  valorLitro: yup
    .number()
    .required('Informe o valor do litro')
    .min(0.01, 'Valor litro deve ser positivo'),
});
