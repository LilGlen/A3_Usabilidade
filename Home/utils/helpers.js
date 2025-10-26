/**
 * Formata um valor numérico para o formato de moeda brasileira (R$).
 * @param {number} value - O valor a ser formatado.
 * @returns {string} O valor formatado como "R$ X.XX".
 */
export function formatCurrency(value) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

