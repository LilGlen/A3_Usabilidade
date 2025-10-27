/**
 * Mapeia o nome do jogo para o caminho da imagem local,
 * já que a API não fornece o URL completo.
 * @param {Object} jogo - Objeto do jogo com a propriedade 'nome'.
 * @returns {string} O caminho local da imagem ou um placeholder.
 */
export function getGameImageUrl(jogo) {
  if (!jogo || !jogo.nome) {
    return "/Home/assets/imgs/Bloodborne.jpg"; // Placeholder genérico
  }

  // 1. Normaliza o nome do jogo (remove espaços, caracteres especiais, converte para minúsculas)
  const nomeNormalizado = jogo.nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s]/g, "") // Remove caracteres não alfanuméricos (exceto espaço)
    .replace(/\s/g, "_"); // Substitui espaços por underline

  
  const mapeamento = {
    Half_life_alyx: "Half_Life_Alyx.jpg",
    sekiro_shadows_die_twice: "Sekiro_Shadows_Die_Twice.jpg",
    
  };

  // 3. Tenta encontrar a imagem no mapeamento
  const nomeDoArquivo = mapeamento[nomeNormalizado];
  if (nomeDoArquivo) {
    return `/Home/assets/imgs/${nomeDoArquivo}`;
  }

  // 4. Se não encontrar no mapeamento, tenta o formato padrão: Nome_Com_Underscores.jpg
  // Você pode tentar reconstruir o nome do arquivo a partir da lista de imagens que você tem.

  // Tentativa 1: Normaliza e usa o nome original 
  let nomePadrao =
    jogo.nome.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s/g, "_") + ".jpg";


  // Tentativa 2
  const fileBaseName = jogo.nome.replace(/[\:\-\.]/g, "").replace(/\s/g, "_");

  // Simplesmente retorna o nome normalizado para o caminho, esperando que o nome da API seja similar
  // aos seus arquivos (ex: "Half-Life: Alyx" -> "Half_Life_Alyx.jpg" (se a API retornar o nome original))
  return `/Home/assets/imgs/${fileBaseName}.jpg`;
}


/**
 * Redireciona para a página de detalhes do jogo.
 * @param {number} jogoId - ID do jogo.
 */
export function showDetails(jogoId) {
  
  window.location.href = `../Jogo/index.html?id=${jogoId}`;
}
