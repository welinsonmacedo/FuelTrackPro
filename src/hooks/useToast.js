import { toast } from "react-toastify";

export const useToast = () => {
  const sucesso = (msg) => toast.success(msg);
  const erro = (msg) => toast.error(msg);
  const aviso = (msg) => toast.warning(msg);

  return { sucesso, erro, aviso };
};