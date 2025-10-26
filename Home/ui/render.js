import { getGameImageUrl, showDetails } from "./utils.js";
import { addToCart } from "../js/cart.js";
import { selectSuggestion } from "../js/games.js"; // Importa a função de busca
import { debouncedFilterGames } from "../js/config.js";

// ----------------------------------------------------
// FUNÇÕES DE RENDERIZAÇÃO
// ----------------------------------------------------

/**
 * Renderiza o jogo de destaque na Hero Section (renderHighlight).
 * @param {Object} jogo - Objeto do jogo a ser destacado.
 */
export function renderHighlight(jogo) {
  const highlightContainer =
    document.getElementById("hero-section") ||
    document.getElementById("main-highlight");

  if (!highlightContainer) return;

  if (!jogo) {
    highlightContainer.innerHTML =
      '<div class="hero-content"><p>Destaque principal indisponível.</p></div>';
    highlightContainer.style.backgroundImage = "none";
    return;
  }

  const imageUrl = getGameImageUrl(jogo);
  highlightContainer.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${imageUrl}')`;

  // Formatação de preço (ajuste para o R$ brasileiro, se necessário)
  const apiPrice = jogo.preco
    ? jogo.preco.toFixed(2).replace(".", ",")
    : "0,00";

  highlightContainer.innerHTML = `
        <div class="hero-content">
            <h2 id="hero-title" class="hero-title">${jogo.nome}</h2>
            <p id="hero-subtitle" class="hero-subtitle">${
              jogo.descricao || "Open-World RPG Masterpiece"
            }</p>
            
            <div class="price-action">
                <span class="current-price-highlight">R$ ${apiPrice}</span>
                <button id="hero-buy-btn" class="btn btn-buy-now">COMPRAR AGORA</button>
            </div>
        </div>
    `;

  // Anexar evento de clique ao botão de destaque
  const heroBuyBtn = document.getElementById("hero-buy-btn");
  if (heroBuyBtn) {
    heroBuyBtn.onclick = () => addToCart(jogo.id);
  }
}

/**
 * Cria o elemento DOM do card de jogo.
 * @param {Object} jogo - Objeto do jogo.
 * @returns {HTMLElement} O elemento do card de jogo.
 */
export function renderGameCard(jogo) {
  const card = document.createElement("div");
  card.classList.add("game-card");
  card.setAttribute("data-jogo-id", jogo.id);

  // Clique no card abre os detalhes
  card.onclick = () => showDetails(jogo.id);

  const imageUrl = getGameImageUrl(jogo);
  const apiPrice = jogo.preco
    ? jogo.preco.toFixed(2).replace(".", ",")
    : "0,00";

  card.innerHTML = `
        <div class="game-cover" style="background-image: url('${imageUrl}');"></div>
        <h3 class="game-title">${jogo.nome}</h3>
        <div class="price-info">
            <span class="current-price">R$ ${apiPrice}</span>
        </div>
        <button class="add-cart-btn">
            Comprar
        </button>
    `;

  // Anexa o listener de Add to Cart ao botão específico
  card.querySelector(".add-cart-btn").addEventListener("click", (e) => {
    e.stopPropagation(); // Impede o clique no card (showDetails)
    addToCart(jogo.id);
  });

  return card;
}

/**
 * Renderiza uma seção inteira de jogos no container.
 * @param {HTMLElement} container - O elemento DOM do container (ex: popularContainer).
 * @param {Array<object>} games - Lista de jogos para renderizar.
 */
export function renderSection(container, games) {
  if (!container) return;

  container.innerHTML = "";

  if (games.length === 0) {
    container.innerHTML = "<p>Nenhum jogo encontrado nesta seção.</p>";
    return;
  }

  games.forEach((jogo) => {
    container.appendChild(renderGameCard(jogo));
  });
}

/**
 * Renderiza a lista de sugestões de nomes de jogos.
 * @param {Array<object>} games - Lista de jogos filtrados.
 * @param {string} searchTerm - Termo de busca.
 */
export function renderSuggestions(games, searchTerm) {
  const suggestionContainer = document.getElementById(
    "searchSuggestionsContainer"
  );
  if (!suggestionContainer) return;

  if (searchTerm.length < 4 || games.length === 0) {
    suggestionContainer.innerHTML = "";
    suggestionContainer.style.display = "none";
    return;
  }

  const topSuggestions = games.slice(0, 5);

  suggestionContainer.innerHTML = topSuggestions
    .map(
      (jogo) => `
                <div class="suggestion-item p-2 hover:bg-gray-700 cursor-pointer text-white border-b border-gray-700" 
                      data-game-name="${jogo.nome.replace(/"/g, "&quot;")}"
                      >
                    ${jogo.nome}
                </div>
            `
    )
    .join("");

  suggestionContainer.style.display = "block";

  // Anexa o listener de clique dinamicamente para a função de seleção
  suggestionContainer.querySelectorAll(".suggestion-item").forEach((item) => {
    item.addEventListener("click", () => {
      selectSuggestion(item.getAttribute("data-game-name"));
    });
  });
}

/**
 * Atualiza o estado da UI do cabeçalho com base no status de autenticação.
 * @param {boolean} isLoggedIn - True se o usuário estiver logado, false caso contrário.
 * @param {string} userName - Nome do usuário logado (opcional).
 */
export function renderLoginState(isLoggedIn, userName = "Usuário") {
  const authButtons = document.querySelector(".auth-buttons");
  if (!authButtons) return;

  if (isLoggedIn) {
    // Estado de logado
    authButtons.innerHTML = `
            <span class="welcome-message">Olá, ${userName}!</span>
            <button class="btn btn-profile">
                <i class="fas fa-user-circle"></i> Meu Perfil
            </button>
            <button class="btn btn-logout" id="logoutButton">
                <i class="fas fa-sign-out-alt"></i> Sair
            </button> 
            <a href="#" id="cart-link" class="btn cart-btn" aria-label="Carrinho de Compras">
                <i class="fas fa-shopping-cart"></i>
                <span id="cart-counter" class="cart-counter">0</span>
            </a>
        `;
  } else {
    // Renderiza o estado de deslogado (botões Entrar/Cadastrar)
    authButtons.innerHTML = `
            <button class="btn btn-login" onclick="window.location.href='Login/login.html'">
                <i class="fas fa-user"></i> Entrar
            </button>
            <button class="btn btn-register" onclick="window.location.href='Login/register.html'">
                <i class="fas fa-sign-in-alt"></i> Cadastrar
            </button>
            <a href="#" id="cart-link" class="btn cart-btn" aria-label="Carrinho de Compras">
                <i class="fas fa-shopping-cart"></i>
                <span id="cart-counter" class="cart-counter">0</span>
            </a>
        `;
  }
}

// ----------------------------------------------------
// FUNÇÃO DE INPUT DE BUSCA
// ----------------------------------------------------

/**
 * Lida com o evento 'input' na barra de busca (para debouncing e sugestões).
 * Deve ser exportada para uso no main.js.
 */
export function handleSearchInput() {
  // 🚨 FUNÇÃO AGORA EXPORTADA AQUI
  const searchInput = document.getElementById("searchInput");
  const searchSuggestionsContainer = document.getElementById(
    "searchSuggestionsContainer"
  );
  if (!searchInput) return;

  const searchTerm = searchInput.value.trim().toLowerCase();

  // Importamos filterGames de games.js para evitar dependência cíclica
  import("../js/games.js").then(({ filterGames }) => {
    if (searchTerm === "") {
      filterGames(true);
      return;
    }

    if (searchTerm.length >= 4 && searchSuggestionsContainer) {
      searchSuggestionsContainer.innerHTML =
        '<div class="p-2 text-center text-gray-500">Buscando sugestões...</div>';
      searchSuggestionsContainer.style.display = "block";
    } else if (searchTerm.length < 4 && searchSuggestionsContainer) {
      searchSuggestionsContainer.innerHTML = "";
      searchSuggestionsContainer.style.display = "none";
    }

    // Chama a função de debounce configurada em config.js
    if (debouncedFilterGames) {
      debouncedFilterGames();
    }
  });
}
