import {
  LOGIN_ENDPOINT,
  CLIENT_EMAIL,
  CLIENT_PASSWORD,
  GENERIC_TOKEN_VALUE,
  setGenericToken,
} from "./config.js";
import { renderLoginState } from "../ui/render.js";

// Constantes para as chaves do localStorage (Boa prática)
const AUTH_TOKEN_KEY = "authToken";
const USER_NAME_KEY = "userName";

/**
 * Retorna o token salvo localmente.
 * @returns {string | null} O token de autenticação.
 */
export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Limpa o token do localStorage e atualiza a UI.
 */
export function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_NAME_KEY); // Limpa o nome do usuário (se existir)
  renderLoginState();
}

/**
 * Verifica se o token fornecido (ou o atual) é o token genérico de navegação.
 * @param {string | null} token - O token a ser verificado.
 * @returns {boolean} True se for o token genérico.
 */
export function isGenericClientToken(token = getToken()) {
  return token && token === GENERIC_TOKEN_VALUE;
}

/**
 * VERIFICA O ESTADO DE AUTENTICAÇÃO (FUNÇÃO NECESSÁRIA PELO main.js)
 * Verifica o status de autenticação.
 * @returns {object} Um objeto com o status de login (boolean) e o nome do usuário (string).
 */
export function checkAuthStatus() {
  const token = getToken();
  // Se não há um nome salvo no localStorage (caso de login de usuário),
  // usamos "Cliente" ou "Usuário" como padrão.
  const userName = localStorage.getItem(USER_NAME_KEY) || "Cliente";

  return {
    loggedIn: !!token, // Converte a presença do token em true/false
    name: userName,
  };
}

/**
 * Tenta obter um token genérico e salvá-lo, ou usa um token existente.
 * @returns {Promise<boolean>} True se um token válido for obtido ou já existir.
 */
export async function loginAndGetToken() {
  console.log("Tentando fazer login como cliente genérico...");

  // Se já existe um token, apenas retornamos true para continuar.
  if (getToken()) {
    console.log("Token de sessão existente encontrado.");
    return true;
  }

  try {
    const response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: CLIENT_EMAIL, senha: CLIENT_PASSWORD }),
    });

    if (!response.ok) {
      let errorDetails = await response.text();
      throw new Error(
        `Falha no login: ${response.status} ${response.statusText} - ${errorDetails}`
      );
    }

    const data = await response.json();
    if (data.token) {
      // Salva o token genérico e define a referência.
      localStorage.setItem(AUTH_TOKEN_KEY, data.token); // Usando a constante
      setGenericToken(data.token);
      // Salva um nome padrão, já que é login genérico
      localStorage.setItem(USER_NAME_KEY, "Cliente");
      console.log("Login genérico bem-sucedido. Token salvo.");
      return true;
    } else {
      throw new Error(
        "Login bem-sucedido, mas nenhum token retornado pela API."
      );
    }
  } catch (error) {
    console.error("Erro fatal no processo de login:", error);
    return false;
  }
}

/**
 * Limpa o token do localStorage, o nome do usuário e atualiza a UI.
 * Esta função age como o 'handler' principal de logout.
 */
export function logout() {
  // Nomeando como 'logout' para maior clareza
  console.log("Iniciando processo de logout...");
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_NAME_KEY); // Limpa o nome do usuário

  // Atualiza a UI para o estado DESLOGADO
  // renderLoginState(false); // Essa chamada será feita no main.js para garantir a recarga.

  console.log("Logout foi");
  // Redireciona ou recarrega a página após a limpeza
  window.location.href = "../Login/login.html"; // Redireciona para a página inicial
}
