import { format, parseISO, differenceInDays } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

export const useDate = () => {
  const formatar = (dataISO) => format(parseISO(dataISO), "dd/MM/yyyy", { locale: ptBR });
  const diasEntre = (data1, data2) => differenceInDays(new Date(data1), new Date(data2));

  return { formatar, diasEntre };
};