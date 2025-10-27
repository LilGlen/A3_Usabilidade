import { setDebouncedFilterGames } from "./js/config.js";
import { debounce, loadTemplate } from "./js/utils.js";
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
  updateCartCounter as updateUiCartCounter,
} from "./ui/cartUI.js";

/**
 * Função principal para inicializar toda a aplicação.
 */
async function init() {
  await loadTemplate("Home/templates/header.html", "header");
  await loadTemplate("Home/templates/footer.html", "footer");

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
  // 2. Configura os listeners
  setupGlobalEventListeners();
}

/**
 * Configura todos os Event Listeners globais.
 */
function setupGlobalEventListeners() {
  // --- Elementos DOM ---
  const cartLink = document.getElementById("cart-link");
  const checkoutButton = document.getElementById("checkout-button-id");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const logoutButton = document.getElementById("logoutButton");

  // 1. Inicialização do Debounce para a busca
  const debouncedFilterFn = debounce(() => filterGames(true), 500);
  setDebouncedFilterGames(debouncedFilterFn);

  // 2. Botão de Logout
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }


  // 3. Link/Botão do Carrinho
  setupCartEventListeners(loadCartItems, startCheckout);
  window.globalRemoveFromCart = removeFromCart;
  window.globalStartCheckout = startCheckout;

  // 4. Event Listeners para a busca
  if (searchButton) {
    searchButton.addEventListener("click", () => filterGames(false));
  }

  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
    searchInput.addEventListener("input", debouncedFilterFn);

    // Ação de Enter
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        filterGames(false);
      }
    });
  }
}

// --- PONTO DE ENTRADA ---
document.addEventListener("DOMContentLoaded", init);
