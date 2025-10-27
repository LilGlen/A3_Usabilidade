import {
  GAME_ENDPOINT,
  allGames,
  setAllGames,
  debouncedFilterGames,
} from "./config.js";
import { getToken, clearToken, loginAndGetToken } from "./auth.js";
import {
  renderHighlight,
  renderSection,
  renderSuggestions,
  renderGameCard,
} from "../ui/render.js";

// ----------------------------------------------------
// FUNÇÃO DE BUSCA DE DADOS (NOVA FUNÇÃO EXPORTADA)
// ----------------------------------------------------

/**
 * Busca todos os jogos da API.
 * @returns {Promise<Array<object> | null>} A lista completa de jogos ou null em caso de falha.
 */
export async function fetchAllGames() {
  const token = getToken();
  const headers = {}; // Inicializa o objeto de cabeçalhos

  // 🔑 CORREÇÃO PRINCIPAL: Adiciona o cabeçalho 'Authorization' APENAS SE o token existir.
  // A requisição ocorrerá mesmo sem o token.
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Opcional: Adiciona o cabeçalho Content-Type, que é boa prática
  headers["Content-Type"] = "application/json";

  try {
    const url = `${GAME_ENDPOINT}`;
    const response = await fetch(url, {
      method: "GET",
      headers: headers, // Usa o objeto headers, que pode ou não conter Authorization
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Se a API retornar 401/403, significa que o token é obrigatório ou inválido.
        // Limpamos o token e tentamos fazer login novamente.
        console.warn("Token inválido ou expirado. Limpando token.");
        clearToken();

        // 🚨 Opcional: Você pode querer forçar o login aqui ou apenas retornar null.
        // Já que você está chamando essa função no init(), retornar null é mais seguro.
      }
      // Se for 401/403 (e você limpou), ou outro erro (e.g., 500), ainda lançamos a falha.
      throw new Error("Falha ao buscar jogos. Status: " + response.status);
    }

    const games = await response.json();

    // Armazena a lista de jogos no módulo config e globalmente para ser usada no filtro/cache
    setAllGames(games);
    window.allGames = games;

    return games;
  } catch (error) {
    console.error("Erro ao listar jogos:", error);
    return null;
  }
}

// ----------------------------------------------------
// FUNÇÃO PRINCIPAL DE CARREGAMENTO (AJUSTADA)
// ----------------------------------------------------

/**
 * Recebe a lista de jogos, inicializa o estado de carregamento e distribui para as seções.
 * Esta função agora é chamada pelo main.js DEPOIS que ele chama fetchAllGames.
 * @param {Array<object>} games - A lista de jogos (allGames).
 * @returns {Object | null} O jogo de destaque.
 */
export async function loadGames(games) {
  const highlightContainer =
    document.getElementById("hero-section") ||
    document.getElementById("main-highlight");
  const promoContainer = document.getElementById("promotionsContainer");

  // 1. Limpa e mostra estado de carregamento (apenas nos containers)
  if (highlightContainer) highlightContainer.innerHTML = "";
  if (promoContainer) promoContainer.innerHTML = "<p>Carregando...</p>";
  // ... (Inicialização de loading para outros containers) ...

  if (!games || games.length === 0) {
    const message = "<p>Nenhum jogo encontrado no momento.</p>";
    if (promoContainer) promoContainer.innerHTML = message;
    return null;
  }

  // 2. Distribui e renderiza as seções
  distributeAndRenderGames(games);

  // 3. Retorna o destaque (o primeiro jogo da lista, por convenção)
  return games[0] || null;
}

// ----------------------------------------------------
// FUNÇÃO DE DISTRIBUIÇÃO E RENDERIZAÇÃO
// ----------------------------------------------------

/**
 * Distribui os jogos para as seções (Destaque, Promoções, Populares, etc.) e os renderiza.
 */
export function distributeAndRenderGames(gamesToRender) {
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput ? searchInput.value.trim() : "";

  const searchResultContainer = document.getElementById(
    "searchResultContainer"
  );
  const mainStoreContent = document.getElementById("mainStoreContent");
  const heroSection = document.getElementById("hero-section"); // 🚨 NOVO: Obtém a seção do herói (VERIFIQUE SE ESTE ID ESTÁ CORRETO NO SEU HTML)

  if (!searchResultContainer || !mainStoreContent || !heroSection) return; // 🚨 Adiciona verificação para heroSection

  // Se a busca estiver vazia, renderiza o layout da dashboard
  if (searchTerm === "") {
    searchResultContainer.style.display = "none";
    mainStoreContent.style.display = "block";
    heroSection.style.display = "block"; // 🟢 MOSTRA o herói na homepage

    const games = gamesToRender;

    // Simulação de categorias
    const promotions = games
      .filter((g, index) => g.preco > 50 && index % 2 === 0)
      .slice(0, 4);
    const popular = [...games].sort((a, b) => b.id - a.id).slice(0, 4);
    const newReleases = [...games].sort((a, b) => b.ano - a.ano).slice(0, 4);

    renderSection(document.getElementById("promotionsContainer"), promotions);
    renderSection(document.getElementById("popularContainer"), popular);
    renderSection(document.getElementById("newReleasesContainer"), newReleases);
  } else {
    // Modo de Busca: Esconde as seções e mostra apenas os resultados
    mainStoreContent.style.display = "none";
    searchResultContainer.style.display = "block";
    heroSection.style.display = "none"; // 🔴 ESCONDE o herói na busca

    const searchContainer = document.getElementById("searchResultGrid");
    if (!searchContainer) return;

    if (gamesToRender.length === 0) {
      searchContainer.innerHTML = `<p class="error">Nenhum resultado encontrado para "${searchTerm}".</p>`;
    } else {
      searchContainer.innerHTML = "";
      gamesToRender.forEach((jogo) => {
        searchContainer.appendChild(renderGameCard(jogo));
      });
    }
  }
}

// ----------------------------------------------------
// FUNÇÕES DE BUSCA E FILTRO
// ----------------------------------------------------

/**
 * Lida com o clique na sugestão de jogo.
 */
export function selectSuggestion(gameName) {
  const searchInput = document.getElementById("searchInput");
  const suggestionContainer = document.getElementById(
    "searchSuggestionsContainer"
  );

  if (searchInput) {
    searchInput.value = gameName;
  }
  if (suggestionContainer) {
    suggestionContainer.innerHTML = "";
    suggestionContainer.style.display = "none";
  }
  filterGames(false);
}

/**
 * Função principal de busca e filtragem.
 */
export function filterGames(isFromInput = false) {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  const searchTerm = searchInput.value.trim().toLowerCase();
  const searchContainer = document.getElementById("searchResultGrid");
  const mainStoreContent = document.getElementById("mainStoreContent");
  const searchResultContainer = document.getElementById(
    "searchResultContainer"
  );
  const searchSuggestionsContainer = document.getElementById(
    "searchSuggestionsContainer"
  );

  // 1. Limpa Sugestões e retorna ao modo Dashboard se a busca estiver vazia
  if (searchTerm === "") {
    if (searchSuggestionsContainer) {
      searchSuggestionsContainer.innerHTML = "";
      searchSuggestionsContainer.style.display = "none";
    }
    distributeAndRenderGames(allGames);
    return;
  }

  // 2. FILTRAGEM
  const filtered = allGames.filter(
    (jogo) =>
      jogo.nome.toLowerCase().includes(searchTerm) ||
      jogo.descricao?.toLowerCase().includes(searchTerm)
  );

  // 3. Lidar com Sugestões (Input) vs. Busca Completa (Enter/Botão)
  if (isFromInput) {
    renderSuggestions(filtered, searchTerm);

    if (searchTerm.length < 4) {
      if (searchResultContainer) searchResultContainer.style.display = "none";
      if (mainStoreContent) mainStoreContent.style.display = "block";
      return;
    }
  }

  // 4. Execução da Busca Completa
  if (searchSuggestionsContainer) {
    searchSuggestionsContainer.innerHTML = "";
    searchSuggestionsContainer.style.display = "none";
  }

  if (mainStoreContent) mainStoreContent.style.display = "none";
  if (searchResultContainer) searchResultContainer.style.display = "block";
  if (searchContainer) {
    searchContainer.innerHTML =
      '<p class="loading-search text-center p-8 text-white-400 font-bold">🔍 Buscando...</p>';
  }

  setTimeout(() => {
    distributeAndRenderGames(filtered);
  }, 100);
}
