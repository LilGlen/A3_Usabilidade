import { BASE_URL } from "./config.js"; // O BASE_URL deve ser definido no main.js
import { getToken, clearToken, loginAndGetToken } from "./auth.js"; // O arquivo auth.js deve existir em src/api/
import {
  showAlertNotification,
  showConfirmation,
} from "../ui/notifications.js";
import {
  renderCart,
  updateCartCounter as updateUiCartCounter,
} from "../ui/cartUI.js"; // Funções de UI

// Variável para cache de todos os jogos, usada para "enriquecer" os itens do carrinho
let allGamesCache = [];

/**
 * Define o cache de todos os jogos disponíveis para enriquecimento.
 * Chamado pelo main.js após o fetch inicial de todos os jogos.
 * @param {Array<object>} games - Lista de todos os jogos.
 */
export function setGamesCache(games) {
  allGamesCache = games;
}

// ----------------------------------------------------
// FUNÇÕES DE BUSCA E ENRIQUECIMENTO DE DADOS
// ----------------------------------------------------

/**
 * Busca o carrinho ativo na API, cruza os IDs com o cache de jogos e renderiza a UI.
 */
export async function loadCartItems() {
  const token = getToken();

  // Se não houver token, limpa a UI e o contador
  if (!token) {
    renderCart([]); // Limpa a lista de itens
    updateUiCartCounter(0); // Zera o contador
    return;
  }

  if (allGamesCache.length === 0) {
    // Renderiza vazio e notifica, mas não impede a busca do contador
    console.warn("Cache de jogos vazio. Renderizando apenas o carrinho vazio.");
  }

  try {
    const url = `${BASE_URL}/carrinho/ativo`;
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Logout automático em caso de token inválido/expirado
        clearToken();
        showAlertNotification(
          "Sua sessão expirou. Faça login novamente.",
          "error"
        );
      }
      // Zera o contador em caso de falha na busca, mas não lança erro fatal
      renderCart([]);
      updateCartCounter(0);
      return;
    }

    const data = await response.json();
    const cartItemsAPI = data.carrinho?.itens || [];

    // ENRIQUECIMENTO DOS DADOS
    const gamesMap = new Map(allGamesCache.map((game) => [game.id, game]));
    const enrichedItems = cartItemsAPI
      .map((item) => {
        const gameDetails = gamesMap.get(item.fkJogo);
        // Retorna o objeto completo que renderCartItem espera
        return gameDetails
          ? { jogo: gameDetails, quantidade: item.quantidade || 1 }
          : null;
      })
      .filter((item) => item !== null);

    // Renderiza a UI completa (lista + total)
    renderCart(enrichedItems);
  } catch (error) {
    console.error("Erro ao processar o carrinho:", error);
    showAlertNotification(
      `Erro de conexão ao buscar carrinho: ${error.message}.`,
      "error"
    );
    renderCart([]);
    updateUiCartCounter(0);
  }
}

/**
 * Atualiza o contador de itens no cabeçalho.
 * Este é o seu antigo updateCartCounter, mas agora chama a função de UI no final.
 */
export async function updateCartCounter() {
  const token = getToken();

  if (!token) {
    updateUiCartCounter(0); // Chama a função de UI para zerar
    return;
  }

  try {
    const url = `${BASE_URL}/carrinho/ativo`;
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearToken();
      }
      updateUiCartCounter(0); // Chama a função de UI para zerar
      return;
    }

    const data = await response.json();
    const itemCount = data.carrinho?.itens?.length || 0;

    // ✅ Chamar a função de UI: updateCartCounter (do ui/cartUI.js)
    updateUiCartCounter(itemCount);
  } catch (error) {
    console.error("Erro ao atualizar contador do carrinho:", error);
    updateUiCartCounter(0); // Chama a função de UI para zerar
  }
}

// ----------------------------------------------------
// FUNÇÕES DE AÇÃO (ADICIONAR/REMOVER)
// ----------------------------------------------------

/**
 * Adiciona um item ao carrinho usando o token disponível.
 * @param {number} jogoId - O ID do jogo a ser adicionado.
 */
export async function addToCart(jogoId) {
  const token = getToken();

  if (!token) {
    showAlertNotification(
      "Você precisa estar logado para adicionar itens ao carrinho.",
      "error"
    );
    return;
  }

  try {
    // Assumindo que o endpoint para adicionar é /carrinho/item/{jogoId} ou similar
    const response = await fetch(`${BASE_URL}/carrinho/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ jogoId: jogoId, quantidade: 1 }),
    });

    if (response.ok) {
      await updateCartCounter();
      showAlertNotification("Jogo adicionado ao carrinho!", "success");

      // ✅ REMOVEMOS showCart() aqui. O main.js/UI deve decidir abrir o carrinho
    } else {
      if (response.status === 401 || response.status === 403) {
        clearToken();
        await loginAndGetToken(); // Tenta reautenticar
        showAlertNotification(
          "Sua sessão expirou. Tentando reconectar...",
          "info"
        );
        return;
      }

      const errorData = await response.json();
      const errorMessage =
        errorData.message || "Erro desconhecido ao adicionar ao carrinho.";

      showAlertNotification(`Falha: ${errorMessage}`, "error");
    }
  } catch (error) {
    showAlertNotification(
      "Erro de conexão ao tentar adicionar ao carrinho.",
      "error"
    );
  }
}

/**
 * Remove um item do carrinho.
 * @param {number} jogoId - O ID do jogo a ser removido (fkJogo).
 */
export async function removeFromCart(jogoId) {
  const token = getToken();
  if (!token) {
    showAlertNotification(
      "Você precisa estar logado para remover itens.",
      "info"
    );
    return;
  }

  const confirmed = await showConfirmation(
    `Tem certeza que deseja remover o jogo ID ${jogoId} do carrinho?`
  );

  if (!confirmed) {
    return;
  }

  try {
    // Assumindo que o endpoint para remover é DELETE /carrinho/{jogoId}
    const url = `${BASE_URL}/carrinho/${jogoId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      await loadCartItems(); // Recarrega o carrinho para atualizar a UI (lista e total)
      showAlertNotification(`Jogo removido com sucesso!`, "success");
    } else {
      const errorData = await response.json();
      showAlertNotification(
        `Falha ao remover item: ${errorData.message || "Erro desconhecido."}`,
        "error"
      );
    }
  } catch (error) {
    showAlertNotification("Erro de conexão ao remover item.", "error");
    console.error("Erro ao remover do carrinho:", error);
  }
}

/**
 * Inicia o processo de Finalização de Compra (Checkout). (Mantida)
 * @param {string} isGenericClientToken - Uma função que verifica se o token é genérico.
 */
export async function startCheckout(isGenericClientTokenFn) {
  const token = getToken();

  if (isGenericClientTokenFn(token)) {
    showAlertNotification(
      "Você não pode finalizar a compra usando uma sessão de navegação genérica. Por favor, faça login.",
      "info"
    );
    clearToken();
    return;
  }
  // ... (restante da lógica de checkout) ...
  showAlertNotification(
    "Funcionalidade de Checkout ainda será implementada!",
    "info"
  );
}
