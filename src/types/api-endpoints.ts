// Verifique se a porta 5000 está correta, caso contrário, use 3000 (padrão do Postman)
export const API_URL = "http://localhost:5000/api/v1"; 

// ==========================================================
// ENDPOINTS DE AUTENTICAÇÃO E USUÁRIO
// ==========================================================
export const LOGIN_ENDPOINT = "/auth/login";
export const REGISTER_ENDPOINT = "/auth/register";
export const PROFILE_ENDPOINT = "/usuario/perfil"; // Exemplo: para buscar dados do perfil

// ==========================================================
// ENDPOINTS DE JOGOS E PRODUTOS
// ==========================================================

// Rota de jogos pública
export const GAME_ENDPOINT_PUBLIC = "/public/jogos";

// Endpoint para buscar todos os jogos (com paginação/filtros)
export const GAME_ENDPOINT = "/jogos"; 

// Endpoint para buscar detalhes de um jogo específico (ex: /jogos/{id})
export const GAME_DETAILS_BASE = "/jogos"; 

// ==========================================================
// ENDPOINTS DE CARRINHO E COMPRA
// ==========================================================
// Endpoint para adicionar item ao carrinho (ou simplesmente /carrinho)
export const CART_ADD_ENDPOINT = "/carrinho/adicionar"; 
// Endpoint base para manipulação do carrinho (ex: GET, PUT, DELETE)
export const CART_BASE_ENDPOINT = "/carrinho"; 

// ==========================================================
// ENDPOINTS DE CHECKOUT E PEDIDOS
// ==========================================================
// Endpoint para finalizar a compra e criar um novo pedido
export const CHECKOUT_ENDPOINT = "/pedidos";
// Endpoint para listar os pedidos do usuário
export const ORDERS_ENDPOINT = "/pedidos";

// ==========================================================
// ENDPOINTS DE ADMIN/GERENCIAMENTO (Exemplos)
// ==========================================================
export const MANAGEMENT_GAMES_ENDPOINT = "/admin/jogos";
export const MANAGEMENT_USERS_ENDPOINT = "/admin/usuarios";
export const REPORT_SALES_ENDPOINT = "/relatorios/vendas";

