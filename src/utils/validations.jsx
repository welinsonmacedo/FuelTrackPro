

export function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarSenha(senha) {
  return senha.length >= 6; 
}
