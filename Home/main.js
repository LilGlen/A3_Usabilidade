import { setDebouncedFilterGames } from "./js/config.js";
import { debounce } from "./js/utils.js";
// Garantindo que 'logout' está importado, como solicitado.
import { loginAndGetToken, logout, checkAuthStatus } from "./js/auth.js";
import { fetchAllGames, loadGames, filterGames } from "./js/games.js";
import {
  loadCartItems,
  setGamesCache,
  updateCartCounter as updateApiCartCounter,
  removeFromCart,
  startCheckout,
} from "./js/cart.js";
import {
  renderLoginState,
  renderHighlight,
  handleSearchInput,
} from "./ui/render.js";
import {
  setupCartEventListeners,
  openCart, // Importa a função de UI para abrir o painel
  updateCartCounter as updateUiCartCounter, // Atualiza o contador no DOM
} from "./ui/cartUI.js";

/**
 * Função principal para inicializar toda a aplicação.
 */
async function init() {
  await loginAndGetToken();

  const user = checkAuthStatus();
  const allGames = await fetchAllGames();

  if (allGames && allGames.length > 0) {
    setGamesCache(allGames);
    const featuredGame = await loadGames(allGames);

    if (featuredGame) {
      renderHighlight(featuredGame);
    }
  }
  // 1. Renderiza o estado de login, o que CRIA o botão de logout (se logado)
  renderLoginState(user.loggedIn, user.name);

  await updateApiCartCounter();
  // 2. Configura os listeners, que agora ENCONTRAM o botão de logout
  setupGlobalEventListeners();
}

/**
 * Configura todos os Event Listeners globais.
 */
function setupGlobalEventListeners() {
  // --- Elementos DOM ---
  // const btnLogin = document.querySelector(".btn-login"); // Removido: Não é mais necessário para a lógica de logout.
  const cartLink = document.getElementById("cart-link");
  const checkoutButton = document.getElementById("checkout-button-id");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");

  // NOVO: Elemento do botão de logout criado dinamicamente em render.js
  const logoutButton = document.getElementById("logoutButton");

  // 1. Inicialização do Debounce para a busca (filterGames deve vir de src/api/games.js)
  const debouncedFilterFn = debounce(() => filterGames(true), 500);
  setDebouncedFilterGames(debouncedFilterFn);

  // 2. Botão de Logout (Implementação limpa e modular)
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      // Chama a função 'logout' do módulo auth.js.
      // Esta função deve limpar o token e RECARREGAR/REDIRECIONAR a página.
      logout();
    });
  }
  // NOTA: O clique nos botões "Entrar" e "Cadastrar" (quando deslogado)
  // é tratado pelo atributo 'onclick' injetado diretamente em render.js.

  // 3. Link/Botão do Carrinho
  setupCartEventListeners(loadCartItems, startCheckout);
  window.globalRemoveFromCart = removeFromCart;
  window.globalStartCheckout = startCheckout;

  // 4. Event Listeners para a busca (searchInput e searchButton)
  if (searchButton) {
    searchButton.addEventListener("click", () => filterGames(false)); // Busca imediata
  }

  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
    searchInput.addEventListener("input", debouncedFilterFn);

    // Ação de Enter
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        filterGames(false); // Busca imediata
      }
    });
  }
}

// --- PONTO DE ENTRADA ---
document.addEventListener("DOMContentLoaded", init);
