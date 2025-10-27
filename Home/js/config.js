export const BASE_URL = "http://localhost:3000/api/v1";
export const LOGIN_ENDPOINT = `${BASE_URL}/auth/login`;
export const GAME_ENDPOINT = `${BASE_URL}/jogos`;
export const CART_ENDPOINT = `${BASE_URL}/carrinho/adicionar`;
export const CHECKOUT_ENDPOINT = `${BASE_URL}/pedidos`;

export const CLIENT_EMAIL = "cliente@avjd.com";
export const CLIENT_PASSWORD = "cliente123";

export let GENERIC_TOKEN_VALUE = null;
export let allGames = [];
export let debouncedFilterGames = null;

export function setGenericToken(token) {
  GENERIC_TOKEN_VALUE = token;
}

export function setAllGames(games) {
  allGames = games;
}

export function setDebouncedFilterGames(func) {
  debouncedFilterGames = func;
}
