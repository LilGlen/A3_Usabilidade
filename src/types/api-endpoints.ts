export const API_URL = "http://localhost:5000/api/v1"; 

// ==========================================================
// ENDPOINTS DE AUTENTICAÇÃO E USUÁRIO
// ==========================================================
export const LOGIN_ENDPOINT = "/auth/login";
export const REGISTER_ENDPOINT = "/auth/register";
export const CHANGE_PASSWORD_ENDPOINT = "/auth/change-password";
export const PROFILE_ENDPOINT = "/profiles";

// ==========================================================
// ENDPOINTS DE JOGOS E PRODUTOS
// ==========================================================
export const GAME_ENDPOINT_PUBLIC = "/public/jogos"; // (Postman: Game/All (public))
export const GAME_ENDPOINT = "/jogos"; // (Postman: Game/All e Game/Create/Update/Delete - Base)


// ==========================================================
// ENDPOINTS DE CARRINHO
// ==========================================================
export const CART_BASE_ENDPOINT = "/carrinho"; // (Postman: Cart/Show - GET)
export const CART_ACTIVE_ENDPOINT = "/carrinho/ativo";
export const CART_ADD_ENDPOINT = "/carrinho/add"; // (Postman: Cart/Add - POST)

// ==========================================================
// ENDPOINTS DE CHECKOUT E PEDIDOS/VENDAS
// ==========================================================
export const CHECKOUT_ENDPOINT = "/vendas/checkout"; // (Postman: Purchases/Checkout)
// CORREÇÃO: A coleção usa /vendas para histórico de pedidos (GET)
export const ORDERS_ENDPOINT = "/vendas"; // (Postman: Purchases/History)

// ==========================================================
// ENDPOINTS DE CATEGORIAS, EMPRESAS E LISTA DE DESEJO
// ==========================================================
export const CATEGORIES_BASE_ENDPOINT = "/categorias";
export const ENTERPRISE_BASE_ENDPOINT = "/empresas"; 
export const WISHLIST_BASE_ENDPOINT = "/lista-desejo"; 

// ==========================================================
// ENDPOINTS DE AVALIAÇÃO (RATE)
// ==========================================================
export const RATE_BASE_ENDPOINT = "/avaliacoes"; 
export const RATE_AVERAGE_ENDPOINT = "/avaliacoes/media"; 

// ==========================================================
// ENDPOINTS DE ADMIN/GERENCIAMENTO E RELATÓRIOS
// ==========================================================
export const MANAGEMENT_USERS_ENDPOINT = "/usuarios";
export const MANAGEMENT_GAMES_ENDPOINT = "/admin/jogos";
export const REPORT_SALES_ENDPOINT = "/relatorios/jogos-mais-vendidos";