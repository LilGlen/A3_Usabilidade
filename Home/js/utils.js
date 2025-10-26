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
/**
 * Carrega e injeta conteúdo HTML de um arquivo template em um elemento placeholder.
 * @param {string} templatePath - Caminho relativo para o arquivo HTML (ex: 'src/templates/header.html').
 * @param {string} elementSelector - Seletor do elemento (header, footer, etc.) que receberá o HTML.
 * @returns {Promise<void>}
 */
export async function loadTemplate(templatePath, elementSelector) {
  try {
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Erro ao carregar template: ${response.statusText}`);
    }
    const html = await response.text();
    const targetElement = document.querySelector(elementSelector);

    if (targetElement) {
      targetElement.innerHTML = html;
    } else {
      console.error(
        `Elemento alvo não encontrado para o seletor: ${elementSelector}`
      );
    }
  } catch (error) {
    console.error("Falha ao carregar o template:", error);
  }
}
