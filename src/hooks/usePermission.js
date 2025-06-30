export const usePermission = (usuario) => {
  const isAdmin = usuario?.tipo === "admin";
  const isGestor = usuario?.tipo === "gestor";
  const isMotorista = usuario?.tipo === "motorista";

  return { isAdmin, isGestor, isMotorista };
};
