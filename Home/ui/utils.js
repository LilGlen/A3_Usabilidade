/**
 * Função utilitária para determinar a URL da imagem do jogo.
 * Se o jogo não tiver imagemUrl, usa o placeholder ('assets/placeholder.jpg').
 * @param {Object} jogo - Objeto do jogo.
 * @returns {string} URL da imagem.
 */
export function getGameImageUrl(jogo) {
  // Caminho da imagem de placeholder
  const fallbackImage = "assets/Bloodborne.jpg";
  return jogo && jogo.imagemUrl ? jogo.imagemUrl : fallbackImage;
}

/**
 * Redireciona para a página de detalhes do jogo.
 * @param {number} jogoId - ID do jogo.
 */
export function showDetails(jogoId) {
  // Caminho que estava no seu código original (ajuste se necessário)
  window.location.href = `../Jogo/jogo.html?id=${jogoId}`;
}
