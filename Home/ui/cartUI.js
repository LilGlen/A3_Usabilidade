import { formatCurrency } from "../utils/helpers.js";
import { removeFromCart } from "../js/cart.js";
import { showAlertNotification } from "./notifications.js";
import { getGameImageUrl } from "../ui/utils.js";

const cartPanel = document.getElementById("cart-off-canvas");
const cartItemsList = document.getElementById("cart-items-list");
const cartTotalDisplay = document.getElementById("cart-total");
const cartCounter = document.getElementById("cart-counter");

/**
 * Abre o painel lateral do carrinho e carrega os itens.
 * @param {function} loadCartItemsFn - Função assíncrona para carregar os dados do carrinho.
 */
export async function openCart(loadCartItemsFn) {
  if (!cartPanel) return;

  // Adiciona a classe que move o painel para a tela
  cartPanel.classList.add("open");

  // Adiciona uma classe ao body para evitar o scroll da página de fundo
  document.body.classList.add("cart-open");

  // Chama a função de carregamento de dados (que está em cartAPI.js)
  if (loadCartItemsFn) {
    await loadCartItemsFn();
  }
}

/**
 * Fecha o painel lateral do carrinho.
 */
export function closeCart() {
  if (cartPanel) {
    cartPanel.classList.remove("open");
  }
  document.body.classList.remove("cart-open");
}

/**
 * Renderiza um único item do carrinho.
 * @param {object} item - Objeto do item do carrinho enriquecido.
 * @returns {string} O HTML do item.
 */
function renderCartItem(item) {
  const { jogo, quantidade } = item;

  if (!jogo) {
    return `<div class="p-2 text-red-400">Erro: Detalhes do jogo ausentes.</div>`;
  }

  const imageUrl = getGameImageUrl(jogo);
  const precoUnitario = formatCurrency(jogo.preco);
  const subTotal = formatCurrency(jogo.preco * quantidade);

  return `
        <div class="cart-item" id="cart-item-${jogo.id}">
            <div class="item-cover" style="background-image: url('${imageUrl}');"></div>
            <div class="item-details">
                <span class="item-title">${jogo.nome}</span>
                <span class="item-quantity">Qtd: ${quantidade}</span>
                <span class="item-price">${precoUnitario} un.</span>
            </div>
            <div class="item-actions">
                <span class="item-subtotal">${subTotal}</span>
                <button class="remove-btn" 
                    onclick="window.globalRemoveFromCart(${jogo.id})" title="Remover Jogo">
                    &times;
                </button>
            </div>
        </div>
    `;
}

/**
 * Renderiza a lista de itens e o total.
 * @param {Array<object>} enrichedItems - Lista de itens enriquecidos.
 */
export function renderCart(enrichedItems) {
  if (!cartItemsList || !cartTotalDisplay) return;

  if (enrichedItems.length === 0) {
    cartItemsList.innerHTML =
      "<p class='empty-cart'>Seu carrinho está vazio. Adicione jogos incríveis!</p>";
    cartTotalDisplay.textContent = formatCurrency(0);
    updateCartCounter(0);
    return;
  }

  // Renderiza a lista de itens
  cartItemsList.innerHTML = enrichedItems.map(renderCartItem).join("");

  // Calcula e renderiza o total
  const total = enrichedItems.reduce(
    (acc, item) => acc + item.jogo.preco * item.quantidade,
    0
  );
  cartTotalDisplay.textContent = formatCurrency(total);
  updateCartCounter(enrichedItems.length);
}

/**
 * Atualiza o contador de itens no ícone do carrinho no cabeçalho.
 * @param {number} count - O número total de itens únicos no carrinho.
 */
export function updateCartCounter(count) {
  if (cartCounter) {
    cartCounter.textContent = count;
    if (count > 0) {
      cartCounter.classList.add("active");
    } else {
      cartCounter.classList.remove("active");
    }
  }
}

/**
 * Inicializa os event listeners do carrinho (botão de abrir/fechar).
 * @param {function} loadCartItemsFn - Função para recarregar os dados do carrinho.
 */
export function setupCartEventListeners(loadCartItemsFn) {
  const cartLink = document.getElementById("cart-link");
  const closeBtn = cartPanel.querySelector(".close-btn");

  // Adiciona a função de remover ao objeto global window para que o onclick no HTML funcione
  // Isso é uma solução de UI que interage com a API, mas fica no escopo da UI.
  window.globalRemoveFromCart = (jogoId) =>
    removeFromCart(jogoId, loadCartItemsFn);

  if (cartLink) {
    cartLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Passa a função de carregamento para ser chamada ao abrir
      openCart(loadCartItemsFn);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeCart);
  }

  const checkoutButton = document.getElementById("checkout-button-id");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      showAlertNotification(
        "Funcionalidade de Checkout ainda será implementada!",
        "info"
      );
    });
  }
}
