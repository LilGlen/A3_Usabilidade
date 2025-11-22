// useAPI.tsx
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
} from "../types/api-endpoints";

// Tipos conforme backend REAL
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

export function useAPI() {
  const { token } = useAuth();

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

        const resp = await fetch(url, { ...options, headers });

        // tenta pegar JSON SEMPRE
        let data: any = null;
        try {
          data = await resp.clone().json();
        } catch (_) {
          if (resp.status === 204) return null;
        }

        // --- CORREÇÃO MAIOR: não retornar null em erros ---
        if (!resp.ok) {
          console.error("API ERROR:", { url, status: resp.status, body: data });

          // se backend retornar mensagem, devolvemos ela ao chamador
          if (data?.message) {
            return data as T;
          }

          throw { status: resp.status, body: data };
        }

        return data as T;
      } catch (err: any) {
        console.error("CONNECTION ERROR:", err);

        // se o erro tiver mensagem do backend, retorne ela
        if (err?.body?.message) {
          return err.body as T;
        }

        return null;
      }
    },
    [token]
  );

  // Retorna TODOS os jogos (rota privada, com ID)
  const getAllGames = useCallback(
    () => makeRequest<any>(GAME_ENDPOINT),
    [makeRequest]
  );

  // JOGOS
  const getGames = useCallback(
    ({ page = 1, limit = 20 }) =>
      makeRequest<any>(`${GAME_ENDPOINT_PUBLIC}?page=${page}&limit=${limit}`),
    [makeRequest]
  );

  // backend retorna: { jogo: {...} }
  const getGame = useCallback(
    (id: string) => makeRequest<{ jogo: any }>(`${GAME_ENDPOINT}/${id}`),
    [makeRequest]
  );

  // CARRINHO
  const getCart = useCallback(
    () => makeRequest<GetCartResponse>(CART_ACTIVE_ENDPOINT),
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

  // AVALIAÇÕES
  const getGameReviews = useCallback(
    (jogoId: string) =>
      makeRequest<{ reviews: any[] }>(`${RATE_BASE_ENDPOINT}?jogoId=${jogoId}`),
    [makeRequest]
  );

  // POST { jogoId, nota, comentario }
  const createReview = useCallback(
    (data: { jogoId: number; nota: number; comentario?: string }) =>
      makeRequest<{ review: any }>(RATE_BASE_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  // WISHLIST
  const getWishlist = useCallback(
    () => makeRequest<{ wishlist: any[] }>(WISHLIST_BASE_ENDPOINT),
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

  return useMemo(
    () => ({
      getGames,
      getGame,
      getAllGames,

      getCart,
      addToCart,
      removeFromCart,

      getGameReviews,
      createReview,

      getWishlist,
      addToWishlist,
      removeFromWishlist,
    }),
    [
      getGames,
      getGame,
      getAllGames,

      getCart,
      addToCart,
      removeFromCart,

      getGameReviews,
      createReview,

      getWishlist,
      addToWishlist,
      removeFromWishlist,
    ]
  );
}
