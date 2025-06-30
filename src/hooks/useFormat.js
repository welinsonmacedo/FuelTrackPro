export const useFormat = () => {
  const moeda = (valor) => `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
  const km = (valor) => `${Number(valor)} km`;
  const litros = (valor) => `${Number(valor)} L`;

  return { moeda, km, litros };
};