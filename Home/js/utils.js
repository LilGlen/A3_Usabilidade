/**
 * Debounce function para limitar a frequência de chamadas da função de busca.
 * @param {function} func - A função a ser limitada.
 * @param {number} delay - O atraso em milissegundos.
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
