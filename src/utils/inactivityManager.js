let timeout;

export const startInactivityTimer = (onLogout, timeoutMs = 300000) => {
  resetTimer(onLogout, timeoutMs);

  window.addEventListener("mousemove", () => resetTimer(onLogout, timeoutMs));
  window.addEventListener("keydown", () => resetTimer(onLogout, timeoutMs));
  window.addEventListener("click", () => resetTimer(onLogout, timeoutMs));
};

export const stopInactivityTimer = () => {
  clearTimeout(timeout);
  window.removeEventListener("mousemove", resetTimer);
  window.removeEventListener("keydown", resetTimer);
  window.removeEventListener("click", resetTimer);
};

function resetTimer(onLogout, timeoutMs) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    onLogout();
    alert("Você foi desconectado por inatividade.");
  }, timeoutMs);
}
