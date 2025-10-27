// VARIÁVEL GLOBAL PARA GERENCIAR CONFIRMAÇÕES PENDENTES (privada ao módulo)
let currentConfirmationResolve = null;

/**
 * Exibe uma notificação simples (toast) no canto inferior da página.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - 'error', 'success', ou 'info'.
 */
export function showAlertNotification(message, type = "info") {
  const toast = document.getElementById("custom-notification");
  const msgEl = document.getElementById("notification-message");
  const actionsEl = document.getElementById("confirmation-actions");

  if (!toast || !msgEl || !actionsEl) return;

  if (currentConfirmationResolve) return;

  msgEl.textContent = message;
  actionsEl.innerHTML = ""; // Limpa botões de confirmação

  toast.className = `bottom-notification-bar show ${type}`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 5000);
}

/**
 * Exibe uma caixa de confirmação no canto inferior e retorna uma Promise.
 * @param {string} message - A mensagem de confirmação.
 * @returns {Promise<boolean>} Resolve para true se Sim, false se Não.
 */
export function showConfirmation(message) {
  return new Promise((resolve) => {
    const toast = document.getElementById("custom-notification");
    const msgEl = document.getElementById("notification-message");
    const actionsEl = document.getElementById("confirmation-actions");

    if (!toast || !msgEl || !actionsEl || currentConfirmationResolve) {
      resolve(false);
      return;
    }

    currentConfirmationResolve = resolve;

    msgEl.textContent = message;

    // Injeta os botões Sim/Não
    actionsEl.innerHTML = `
            <button class="confirm-yes">Sim</button>
            <button class="confirm-no">Não</button>
        `;

    // Usa a classe do canto inferior
    toast.className = "bottom-notification-bar show info";

    const cleanup = (result) => {
      toast.classList.remove("show");
      actionsEl.innerHTML = "";
      currentConfirmationResolve = null;
      resolve(result);
    };

    // Event listeners para os botões
    actionsEl.querySelector(".confirm-yes").onclick = () => cleanup(true);
    actionsEl.querySelector(".confirm-no").onclick = () => cleanup(false);
  });
}
