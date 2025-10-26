import { addToCart } from "../js/cart.js";
import { getToken, isGenericClientToken } from "../js/auth.js";

const cartCounter = document.getElementById("cart-counter");
const btnLogin = document.querySelector(".btn-login");
const btnRegister = document.querySelector(".btn-register");

/**
 * Atualiza o número exibido no contador do carrinho.
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
 * Atualiza a exibição dos botões no header (Entrar/Cadastrar vs. Sair).
 */
export function renderLoginState() {
  const token = getToken();

  if (token && !isGenericClientToken(token)) {
    // Usuário autenticado (não genérico)
    btnLogin.innerHTML = `<i class="fas fa-sign-out-alt"></i> Sair`;
    // O event listener para Sair deve ser anexado no main.js
    btnRegister.style.display = "none";
  } else {
    // Usuário não autenticado ou usando token genérico
    btnLogin.innerHTML = `<i class="fas fa-user"></i> Entrar`;
    // O event listener para Entrar deve ser anexado no main.js
    btnRegister.style.display = "inline-flex";
  }
}

/**
 * Cria o card de jogo.
 * @param {Object} game - Objeto do jogo.
 * @param {boolean} isDiscounted - Se deve exibir desconto.
 * @returns {HTMLElement} O elemento do card de jogo.
 */
export function createGameCard(game, isDiscounted = false) {
  const card = document.createElement("div");
  card.classList.add("game-card");

  // ... (Seu código de formatação e cálculo de preço permanece aqui) ...
  const originalPrice = game.preco || 0;
  const discountPercentage = 0.4;
  const finalPrice = isDiscounted
    ? originalPrice * (1 - discountPercentage)
    : originalPrice;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);

  const originalPriceFormatted = formatCurrency(originalPrice);
  const finalPriceFormatted = formatCurrency(finalPrice);

  const cardHtml = `
        ${isDiscounted ? '<div class="discount-badge">40%</div>' : ""}
        <div class="game-card-image" style="background-image: url('${
          game.imagemUrl || "placeholder.jpg"
        }');"></div>
        <div class="game-info">
            <h4>${game.nome || "Título Desconhecido"}</h4>
            <div class="game-price">
                ${
                  isDiscounted
                    ? `<span class="original-price">${originalPriceFormatted}</span>`
                    : ""
                }
                <span class="final-price">${finalPriceFormatted}</span>
            </div>
            <button class="btn btn-buy-now add-to-cart-btn">ADICIONAR AO CARRINHO</button>
        </div>
    `;

  card.innerHTML = cardHtml;

  // Anexa o evento de clique que chama a função de API importada!
  const cartButton = card.querySelector(".add-to-cart-btn");
  if (game.id) {
    cartButton.dataset.gameId = game.id;
  }

  cartButton.addEventListener("click", () => {
    const gameId = parseInt(cartButton.dataset.gameId);
    if (gameId) {
      addToCart(gameId); // 🔑 Chama a função do módulo 'cart.js'
    } else {
      alert("ID do jogo não encontrado.");
    }
  });

  return card;
}

/**
 * 🔑 NOVA FUNÇÃO: Renderiza os dados do jogo na seção Hero.
 * @param {Object} game - O objeto do jogo a ser destacado.
 */
export function renderHeroSection(game) {
  const heroSection = document.getElementById("hero-section");
  const heroTitle = document.getElementById("hero-title");
  const heroSubtitle = document.getElementById("hero-subtitle");
  const heroBuyBtn = document.getElementById("hero-buy-btn");

  // Caminho para a imagem de fallback da Hero Section, caso o jogo não tenha uma
  const fallbackImage = "assets/placeholder-cybernight.jpg";

  // Usa a imagem da API ou o fallback
  const imageUrl = game && game.imagemUrl ? game.imagemUrl : fallbackImage;

  if (heroSection) {
    // 1. Imagem de Fundo (via CSS)
    heroSection.style.backgroundImage = `url('${imageUrl}')`;
  }

  if (game) {
    // 2. Título e Subtítulo
    if (heroTitle) {
      heroTitle.textContent = game.nome || "Jogo em Destaque";
    }
    if (heroSubtitle) {
      // Usamos a descrição como subtítulo (ajuste o campo se sua API tiver um campo melhor)
      heroSubtitle.textContent =
        game.descricao || "Um novo mundo aguarda você.";
    }

    // 3. Botão Comprar Agora
    if (heroBuyBtn) {
      heroBuyBtn.textContent = "COMPRAR AGORA";
      // 🔑 Vincula o clique do botão à função de adicionar ao carrinho
      heroBuyBtn.onclick = () => {
        addToCart(game.id);
      };
    }
  } else {
    // Fallback UI se nenhum jogo for buscado
    if (heroTitle) heroTitle.textContent = "CYBERNIGHT2077";
    if (heroSubtitle) heroSubtitle.textContent = "Open-World RPG Masterpiece";
    if (heroBuyBtn)
      heroBuyBtn.onclick = () => alert("Nenhum jogo selecionado para compra.");
  }
}
