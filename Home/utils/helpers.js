/**
 * Formata um valor numérico para o formato de moeda brasileira (R$).
 * @param {number} value - O valor a ser formatado.
 * @returns {string} O valor formatado como "R$ X.XX".
 */
export function formatCurrency(value) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

/**
 * Retorna o caminho da imagem do jogo.
 * @param {object} jogo - Objeto do jogo com a propriedade 'imagem'.
 * @returns {string} O caminho ajustado para a imagem.
 */
export function getGameImageUrl(jogo) {
  if (!jogo || !jogo.imagem) {
    return "placeholder.png"; // Garante um fallback
  }

  // Supondo que o caminho base da imagem é 'src/assets/capas/'
  let imageUrl = jogo.imagem;

  // Remove referências relativas para garantir o caminho correto (ex: ../../pasta -> /pasta)
  // No seu projeto, é mais seguro que o caminho da API já seja o correto.
  // Se a API retornar apenas o nome do arquivo (ex: 'cyber.png'), você precisa prefixar.

  // Exemplo: se a API retornar 'cyber.png', e a pasta for 'src/assets/capas/'
  // ATENÇÃO: Se a sua API já retorna o caminho completo (ex: http://servidor/assets/...), remova o prefixo.
  if (!imageUrl.startsWith("http")) {
    return `src/assets/capas/${imageUrl}`;
  }

  return imageUrl;
}
