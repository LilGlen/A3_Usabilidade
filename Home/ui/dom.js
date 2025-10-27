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
    btnLogin.innerHTML = `<i class="fas fa-sign-out-alt"></i> Sair`;
    btnRegister.style.display = "none";
  } else {
    btnLogin.innerHTML = `<i class="fas fa-user"></i> Entrar`;
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

  const cartButton = card.querySelector(".add-to-cart-btn");
  if (game.id) {
    cartButton.dataset.gameId = game.id;
  }

  cartButton.addEventListener("click", () => {
    const gameId = parseInt(cartButton.dataset.gameId);
    if (gameId) {
      addToCart(gameId);
    } else {
      alert("ID do jogo não encontrado.");
    }
  });

  return card;
}

/**
 * Renderiza os dados do jogo na seção Hero.
 * @param {Object} game - O objeto do jogo a ser destacado.
 */
export function renderHeroSection(game) {
  const heroSection = document.getElementById("hero-section");
  const heroTitle = document.getElementById("hero-title");
  const heroSubtitle = document.getElementById("hero-subtitle");
  const heroBuyBtn = document.getElementById("hero-buy-btn");

  const fallbackImage = "../Home/assets/imgs/HalfLife_Alyx.jpg";

  const imageUrl = game && game.imagemUrl ? game.imagemUrl : fallbackImage;

  if (heroSection) {
    heroSection.style.backgroundImage = `url('${imageUrl}')`;
  }

  if (game) {
    if (heroTitle) {
      heroTitle.textContent = game.nome || "Jogo em Destaque";
    }
    if (heroSubtitle) {
      heroSubtitle.textContent =
        game.descricao || "Um novo mundo aguarda você.";
    }

    // 3. Botão Comprar Agora
    if (heroBuyBtn) {
      heroBuyBtn.textContent = "COMPRAR AGORA";
      heroBuyBtn.onclick = () => {
        addToCart(game.id);
      };
    }
  } else {
    if (heroTitle) heroTitle.textContent = "CYBERNIGHT2077";
    if (heroSubtitle) heroSubtitle.textContent = "Open-World RPG Masterpiece";
    if (heroBuyBtn)
      heroBuyBtn.onclick = () => alert("Nenhum jogo selecionado para compra.");
  }
}
