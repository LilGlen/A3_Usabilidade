import { useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import {
  API_URL,
  GAME_ENDPOINT_PUBLIC,
  GAME_ENDPOINT,
  CART_BASE_ENDPOINT,
  CART_ADD_ENDPOINT,
  CART_ACTIVE_ENDPOINT,
  WISHLIST_BASE_ENDPOINT,
  RATE_BASE_ENDPOINT,
  ORDERS_ENDPOINT,
  ENTERPRISE_BASE_ENDPOINT,
  CATEGORIES_BASE_ENDPOINT,
  REPORT_SALES_ENDPOINT,
} from "../types/api-endpoints";

// --- INTERFACES ---

export interface CarrinhoItem {
  id: number;
  fkJogo: number;
  fkCarrinho: number;
  chave_ativacao?: string | null;
}

export interface Carrinho {
  id: number;
  fk_usuario: number;
  fk_venda: number | null;
  status: string;
  itens: CarrinhoItem[];
}

export interface GetCartResponse {
  message?: string;
  carrinho?: Carrinho;
}

export interface AddToCartResponse {
  message: string;
  carrinho: Carrinho;
}

export interface RemoveFromCartResponse {
  message: string;
}

export interface CheckoutResponse {
  success?: boolean;
  message: string;
  venda?: {
    id: number | string;
  };
  purchase?: {
    id: string;
  };
}

export interface Review {
  id: number;
  fk_jogo: number;
  fk_usuario: number;
  nota: number;
  comentario: string;
  spoilers: boolean;
  data_criacao: string;
  usuario?: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface WishlistItem {
  id: number;
  fk_jogo: number;
  fk_usuario: number;
  data_adicao: string;
  jogo: {
    id: number;
    nome: string;
    preco: number;
    imagem_url: string;
    desconto?: number;
  };
}

// --- HOOK PRINCIPAL ---

export function useAPI() {
  const { token, user } = useAuth();

  const makeRequest = useCallback(
    async <T,>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T | null> => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string>),
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const normalizedEndpoint = endpoint.startsWith("/")
          ? endpoint
          : `/${endpoint}`;
        const url = `${API_URL}${normalizedEndpoint}`;

        // console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);

        const resp = await fetch(url, { ...options, headers });

        if (resp.status === 204) return null;

        let data: any = null;
        try {
          data = await resp.clone().json();
        } catch (_) {
          // Ignora erro de parse caso não seja JSON
        }

        if (!resp.ok) {
          console.error("API ERROR:", { url, status: resp.status, body: data });
          if (data?.message) return data as T;
          return (data || null) as T;
        }

        // Tratamento de sucesso para garantir compatibilidade com estruturas do backend
        if (
          resp.ok &&
          typeof data === "object" &&
          data !== null &&
          !Array.isArray(data)
        ) {
          return { success: true, ...data } as T;
        }

        return data as T;
      } catch (err: any) {
        console.error("CONNECTION ERROR:", err);
        if (err?.body?.message) return err.body as T;
        return null;
      }
    },
    [token]
  );

  // --- JOGOS (PUBLICO & DETALHES) ---
  const getGames = useCallback(
    ({ page = 1, limit = 20 }) =>
      makeRequest<any>(`${GAME_ENDPOINT_PUBLIC}?page=${page}&limit=${limit}`),
    [makeRequest]
  );

  const getGame = useCallback(
    (id: string | number) => makeRequest<any>(`${GAME_ENDPOINT}/${id}`),
    [makeRequest]
  );

  // --- JOGOS (ADMINISTRATIVO) ---
  const getAllGames = useCallback(
    () => makeRequest<any>(GAME_ENDPOINT),
    [makeRequest]
  );

  const createGame = useCallback(
    (data: any) =>
      makeRequest<any>(GAME_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const updateGame = useCallback(
    (id: number, data: any) =>
      makeRequest<any>(`${GAME_ENDPOINT}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const deleteGame = useCallback(
    (id: number | string) =>
      makeRequest<any>(`${GAME_ENDPOINT}/${id}`, { method: "DELETE" }),
    [makeRequest]
  );

  // --- EMPRESAS ---
  const getCompanies = useCallback(
    () => makeRequest<any>(ENTERPRISE_BASE_ENDPOINT || "/empresas"),
    [makeRequest]
  );

  const getCompany = useCallback(
    (id: string | number) =>
      makeRequest<any>(`${ENTERPRISE_BASE_ENDPOINT || "/empresas"}/${id}`),
    [makeRequest]
  );

  const createCompany = useCallback(
    (data: any) =>
      makeRequest<any>(ENTERPRISE_BASE_ENDPOINT || "/empresas", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const updateCompany = useCallback(
    (id: number, data: any) =>
      makeRequest<any>(`${ENTERPRISE_BASE_ENDPOINT || "/empresas"}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const deleteCompany = useCallback(
    (id: number | string) =>
      makeRequest<any>(`${ENTERPRISE_BASE_ENDPOINT || "/empresas"}/${id}`, {
        method: "DELETE",
      }),
    [makeRequest]
  );

  // --- CATEGORIAS ---
  const getCategories = useCallback(
    () => makeRequest<any>(CATEGORIES_BASE_ENDPOINT || "/categorias"),
    [makeRequest]
  );

  const createCategory = useCallback(
    (data: any) =>
      makeRequest<any>(CATEGORIES_BASE_ENDPOINT || "/categorias", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const updateCategory = useCallback(
    (id: number, data: any) =>
      makeRequest<any>(`${CATEGORIES_BASE_ENDPOINT || "/categorias"}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const deleteCategory = useCallback(
    (id: number | string) =>
      makeRequest<any>(`${CATEGORIES_BASE_ENDPOINT || "/categorias"}/${id}`, {
        method: "DELETE",
      }),
    [makeRequest]
  );

  // --- CARRINHO ---

  const getCart = useCallback(
    () => makeRequest<GetCartResponse>(CART_ACTIVE_ENDPOINT),
    [makeRequest]
  );

  // A ROTA DE FUGA: Pega o histórico de carrinhos (que contém as chaves)
  const getCartHistory = useCallback(
    () => makeRequest<{ carrinhosComItens: any[] }>(CART_BASE_ENDPOINT),
    [makeRequest]
  );

  const addToCart = useCallback(
    (jogoId: number) =>
      makeRequest<AddToCartResponse>(CART_ADD_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({ jogoId, quantidade: 1 }),
      }),
    [makeRequest]
  );

  const removeFromCart = useCallback(
    (jogoId: number) =>
      makeRequest<RemoveFromCartResponse>(`${CART_BASE_ENDPOINT}/${jogoId}`, {
        method: "DELETE",
      }),
    [makeRequest]
  );

  const checkout = useCallback(
    (paymentMethod: string) =>
      makeRequest<CheckoutResponse>("/vendas/checkout", {
        method: "POST",
        body: JSON.stringify({ formaPagamento: paymentMethod }),
      }),
    [makeRequest]
  );

  // --- AVALIAÇÕES ---
  const getGameReviews = useCallback(
    (jogoId: string | number) =>
      makeRequest<any>(`${RATE_BASE_ENDPOINT}/media/${jogoId}`),
    [makeRequest]
  );

  const getAllReviews = useCallback(
    () => makeRequest<any[]>(RATE_BASE_ENDPOINT),
    [makeRequest]
  );

  const getUserReviews = useCallback(async () => {
    try {
      const allReviews = await makeRequest<any[]>(RATE_BASE_ENDPOINT);
      if (!Array.isArray(allReviews)) return [];

      const userReviews = allReviews.filter(
        (review) =>
          String(review.fk_usuario) === String(user?.id) ||
          String(review.fkUsuario) === String(user?.id)
      );
      return userReviews;
    } catch (error) {
      console.error("Erro ao buscar avaliações do usuário:", error);
      return [];
    }
  }, [makeRequest, user?.id]);

  const createReview = useCallback(
    (data: { jogoId: number; nota: number; comentario?: string }) =>
      makeRequest<{ review: any }>(RATE_BASE_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  // --- LISTA DE DESEJOS ---
  const getWishlist = useCallback(
    () => makeRequest<any[]>(WISHLIST_BASE_ENDPOINT),
    [makeRequest]
  );

  const addToWishlist = useCallback(
    (jogoId: number) =>
      makeRequest<{ item: any }>(WISHLIST_BASE_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({ jogoId }),
      }),
    [makeRequest]
  );

  const removeFromWishlist = useCallback(
    (jogoId: number) =>
      makeRequest<{ message: string }>(WISHLIST_BASE_ENDPOINT, {
        method: "DELETE",
        body: JSON.stringify({ jogoId }),
      }),
    [makeRequest]
  );

  // --- HISTÓRICO DE COMPRAS / VENDAS ---
  const getPurchaseHistory = useCallback(
    () => makeRequest<any[]>(ORDERS_ENDPOINT),
    [makeRequest]
  );

  const getAllSales = useCallback(
    () => makeRequest<any[]>(ORDERS_ENDPOINT),
    [makeRequest]
  );

  // --- RELATÓRIOS ---
  const getMostSoldGames = (top = 10) =>
    makeRequest(`${REPORT_SALES_ENDPOINT}?top=${top}`);

  const getMostSoldGamesByCompany = (companyId: number, top = 5) =>
    makeRequest(`${REPORT_SALES_ENDPOINT}?top=${top}&empresa=${companyId}`);

  return useMemo(
    () => ({
      // Jogos
      getGames,
      getGame,
      getAllGames,
      createGame,
      updateGame,
      deleteGame,
      // Empresas
      getCompanies,
      getCompany,
      createCompany,
      updateCompany,
      deleteCompany,
      // Categorias
      getCategories,
      createCategory,
      updateCategory,
      deleteCategory,
      // Carrinho
      getCart,
      getCartHistory,
      addToCart,
      removeFromCart,
      checkout, // AQUI: getCartHistory está exportado
      // Avaliações
      getGameReviews,
      getUserReviews,
      getAllReviews,
      createReview,
      // Wishlist
      getWishlist,
      addToWishlist,
      removeFromWishlist,
      // Histórico
      getPurchaseHistory,
      getAllSales,
      getAllPurchases: getAllSales,
      // Relatórios
      getMostSoldGames,
      getMostSoldGamesByCompany,
    }),
    [
      getGames,
      getGame,
      getAllGames,
      createGame,
      updateGame,
      deleteGame,
      getCompanies,
      getCompany,
      createCompany,
      updateCompany,
      deleteCompany,
      getCategories,
      createCategory,
      updateCategory,
      deleteCategory,
      getCart,
      getCartHistory,
      addToCart,
      removeFromCart,
      checkout, // AQUI TAMBÉM
      getGameReviews,
      getUserReviews,
      getAllReviews,
      createReview,
      getWishlist,
      addToWishlist,
      removeFromWishlist,
      getPurchaseHistory,
      getAllSales,
      getMostSoldGames,
      getMostSoldGamesByCompany,
    ]
  );
}
