import * as yup from "yup";

export const veiculoSchema = yup.object().shape({
  placa: yup.string().required("Placa é obrigatória"),
  marca: yup.string().required("Marca é obrigatória"),
  modelo: yup.string().required("Modelo é obrigatória"),
  ano: yup.number().required("Ano é obrigatório").positive().integer(),
  tipo: yup.string().required("Tipo é obrigatório"),
  chassi: yup.string().nullable(), // Tornado opcional
  renavam: yup.string().nullable(), // Tornado opcional
  cor: yup.string().required("Cor é obrigatória"),
  filial: yup.string().required("Filial é obrigatória"),
  capacidadeTanque: yup
    .number()
    .nullable()
    .when("tipo", {
      is: (tipo) => tipo && tipo !== "Carreta",
      then: (schema) => schema.required("Capacidade do tanque é obrigatória").min(1, "Mínimo 1 litro"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  capacidadeCarga: yup
    .number()
    .nullable()
    .when("tipo", {
      is: "Carreta",
      then: (schema) => schema.required("Capacidade de carga é obrigatória").min(1, "Mínimo 1 kg"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  tipoCombustivel: yup
    .string()
    .nullable()
    .when("tipo", {
      is: (tipo) => tipo && tipo !== "Carreta",
      then: (schema) => schema.required("Tipo de combustível obrigatório"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
});