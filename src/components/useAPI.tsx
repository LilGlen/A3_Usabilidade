import { useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { API_URL, GAME_ENDPOINT_PUBLIC } from "../types/api-endpoints";

interface APIError {
  error: string;
}

// Tipagens para os dados de autenticação
interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  perfilId: number;
}

interface LoginData {
  email: string;
  senha: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export function useAPI() {
  const { token } = useAuth();
  // ❌ REMOVIDO: const [loading, setLoading] = useState(false);
  // ❌ REMOVIDO: const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(
    async <T,>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T | null> => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...((options.headers as Record<string, string>) || {}),
        };

        // Lógica de Autorização
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const url = `${API_URL}${endpoint}`;

        // 1. Realiza a requisição
        const response = await fetch(url, {
          ...options,
          headers,
        });

        // 2. Tenta processar o corpo da resposta
        let data: any;
        try {
          const responseClone = response.clone();
          data = await responseClone.json();
        } catch (e) {
          if (response.status === 204) {
            return null as T;
          }
          data = null;
        }

        // 3. Trata a resposta HTTP (status code)
        if (!response.ok) {
          let errorMsg = "Erro na requisição";

          if (data && (data as APIError).error) {
            errorMsg = (data as APIError).error;
          } else if (response.statusText) {
            errorMsg = response.statusText;
          } else {
            errorMsg = `Erro HTTP ${response.status}`;
          }

          // Apenas loga o erro, o componente chamador lida com o retorno null
          console.error(
            "API Error:",
            errorMsg,
            "Status:",
            response.status,
            "URL:",
            url
          );
          return null;
        }

        // 4. Sucesso
        return data as T;
      } catch (err) {
        // Erro de rede (Failed to fetch, Timeout, CORS).
        const errorMsg =
          err instanceof Error ? err.message : "Erro de rede desconhecido";

        console.error("ERRO CRÍTICO DE CONEXÃO OU REDE:", errorMsg, err);

        // Retorna null em caso de erro de rede, o componente chamador trata.
        return null;
      }
    },
    [token]
  );

  // ----------------------------------------------------------------------
  // 🔑 Auth (Autenticação)
  // ----------------------------------------------------------------------

  const login = useCallback(
    (data: LoginData) =>
      makeRequest<{ success: boolean; token: string; user: any }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    [makeRequest]
  );

  const register = useCallback(
    (data: RegisterData) =>
      makeRequest<{ success: boolean; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const changePassword = useCallback(
    (data: ChangePasswordData) =>
      makeRequest<{ success: boolean; message: string }>(
        "/auth/change-password",
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // 🏭 Empresas (Enterprise)
  // ----------------------------------------------------------------------

  const getCompanies = useCallback(
    () => makeRequest<{ success: boolean; companies: any[] }>("/empresas"),
    [makeRequest]
  );

  const getCompany = useCallback(
    (id: string) =>
      makeRequest<{ success: boolean; company: any }>(`/empresas/${id}`),
    [makeRequest]
  );

  const createCompany = useCallback(
    (data: { nome: string }) =>
      makeRequest<{ success: boolean; company: any }>("/empresas", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const updateCompany = useCallback(
    (id: string, data: { nome: string }) =>
      makeRequest<{ success: boolean; company: any }>(`/empresas/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const deleteCompany = useCallback(
    (id: string) =>
      makeRequest<{ success: boolean; message: string }>(`/empresas/${id}`, {
        method: "DELETE",
      }),
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // 👤 Perfis (Profiles)
  // ----------------------------------------------------------------------

  const getProfiles = useCallback(
    () => makeRequest<{ success: boolean; profiles: any[] }>("/profiles"),
    [makeRequest]
  );

  const createProfile = useCallback(
    (data: { nome: string }) =>
      makeRequest<{ success: boolean; profile: any }>("/profiles", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // 🎮 Jogos (Games) - 🏆 CORREÇÃO: Usando useCallback
  // ----------------------------------------------------------------------

  const getGames = useCallback(
    async ({ page = 1, limit = 20 }): Promise<any> => {
      // 1. Constrói os parâmetros de busca
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      }).toString();

      // 2. Monta o endpoint. Usando a rota pública para listar jogos.
      const endpoint = `${GAME_ENDPOINT_PUBLIC}?${params}`;

      // 3. Realiza a requisição
      const apiResult = await makeRequest<any>(endpoint, {
        method: "GET",
      });

      // makeRequest retorna 'null' se houver um erro de rede/API, o que o HomePage.tsx irá tratar.
      return apiResult;
    },
    [makeRequest] // Depende apenas de makeRequest
  );

  const getGame = useCallback(
    (id: string) =>
      makeRequest<{ success: boolean; game: any }>(`/jogos/${id}`),
    [makeRequest]
  );

  const createGame = useCallback(
    (data: {
      nome: string;
      descricao: string;
      preco: number;
      ano: number;
      fkCategoria: number;
      fkEmpresa: number;
    }) =>
      makeRequest<{ success: boolean; game: any }>("/jogos", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const updateGame = useCallback(
    (
      id: string,
      data: {
        nome?: string;
        descricao?: string;
        preco?: number;
        ano?: number;
        fkCategoria?: number;
        fkEmpresa?: number;
      }
    ) =>
      makeRequest<{ success: boolean; game: any }>(`/jogos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const deleteGame = useCallback(
    (id: string) =>
      makeRequest<{ success: boolean; message: string }>(`/jogos/${id}`, {
        method: "DELETE",
      }),
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // 🛒 Carrinho (Cart)
  // ----------------------------------------------------------------------

  const getCart = useCallback(
    () => makeRequest<{ success: boolean; cart: any }>("/carrinho"),
    [makeRequest]
  );

  const addToCart = useCallback(
    (jogoId: number) =>
      makeRequest<{
        success: boolean;
        cart?: any;
        message?: string;
        alreadyInCart?: boolean;
      }>("/carrinho/add", {
        method: "POST",
        body: JSON.stringify({ jogoId }),
      }),
    [makeRequest]
  );

  const removeFromCart = useCallback(
    (gameId: string) =>
      makeRequest<{ success: boolean; cart: any }>(`/carrinho/${gameId}`, {
        method: "DELETE",
      }),
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // 💰 Compras (Purchases)
  // ----------------------------------------------------------------------

  const checkout = useCallback(
    (paymentMethod?: string) =>
      makeRequest<{ success: boolean; purchase: any }>("/vendas/checkout", {
        method: "POST",
        body: JSON.stringify({ paymentMethod }),
      }),
    [makeRequest]
  );

  const getPurchaseHistory = useCallback(
    () => makeRequest<{ success: boolean; purchases: any[] }>("/vendas"),
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // ⭐ Avaliações (Reviews)
  // ----------------------------------------------------------------------

  const getGameReviews = useCallback(
    (jogoId: string) =>
      makeRequest<{ success: boolean; reviews: any[] }>(
        `/avaliacoes?jogoId=${jogoId}`
      ),
    [makeRequest]
  );

  const createReview = useCallback(
    (data: { jogoId: number; nota: number; comentario?: string }) =>
      makeRequest<{ success: boolean; review: any }>("/avaliacoes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const updateReview = useCallback(
    (data: { jogoId: number; nota: number; comentario?: string }) =>
      makeRequest<{ success: boolean; review: any }>("/avaliacoes", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    [makeRequest]
  );

  const getAllReviews = useCallback(
    () => makeRequest<{ success: boolean; reviews: any[] }>("/avaliacoes"),
    [makeRequest]
  );

  const getGameRatingAverage = useCallback(
    (jogoId: string) =>
      makeRequest<{ success: boolean; rating: number }>(
        `/avaliacoes/media/${jogoId}`
      ),
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // 📊 Relatórios (Reports)
  // ----------------------------------------------------------------------

  const getTopGames = useCallback(
    (top: number = 5) =>
      makeRequest<{ success: boolean; topGames: any[] }>(
        `/relatorios/games-most-sell?top=${top}`
      ),
    [makeRequest]
  );

  const getTopGamesByCompany = useCallback(
    (top: number = 5, empresaId?: string) =>
      makeRequest<{ success: boolean; topGamesByCompany: any[] }>(
        `/relatorios/jogos-mais-vendidos?top=${top}${
          empresaId ? `&empresa=${empresaId}` : ""
        }`
      ),
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // 👤 Usuários (Users)
  // ----------------------------------------------------------------------

  const getUserById = useCallback(
    (id: string) =>
      makeRequest<{ success: boolean; user: any }>(`/usuarios/${id}`),
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // 💖 Lista de Desejos (Wishlist)
  // ----------------------------------------------------------------------

  const getWishlist = useCallback(
    () => makeRequest<{ success: boolean; wishlist: any[] }>("/lista-desejo"),
    [makeRequest]
  );

  const addToWishlist = useCallback(
    (jogoId: number) =>
      makeRequest<{ success: boolean; item: any }>("/lista-desejo", {
        method: "POST",
        body: JSON.stringify({ jogoId }),
      }),
    [makeRequest]
  );

  const removeFromWishlist = useCallback(
    (jogoId: number) =>
      makeRequest<{ success: boolean; message: string }>("/lista-desejo", {
        method: "DELETE",
        body: JSON.stringify({ jogoId }),
      }),
    [makeRequest]
  );

  // Retorna todas as funções encapsuladas em useMemo para garantir que o objeto seja estável
  return useMemo(
    () => ({
      // Autenticação
      login,
      register,
      changePassword,
      // Empresas
      getCompanies,
      getCompany,
      createCompany,
      updateCompany,
      deleteCompany,
      // Perfis (Profiles)
      getProfiles,
      createProfile,
      // Jogos
      getGames, // Agora estável graças ao useCallback
      getGame,
      createGame,
      updateGame,
      deleteGame,
      // Carrinho
      getCart,
      addToCart,
      removeFromCart,
      // Compras
      checkout,
      getPurchaseHistory,
      // Avaliações
      getGameReviews,
      createReview,
      updateReview,
      getAllReviews,
      getGameRatingAverage,
      // Relatórios
      getTopGames,
      getTopGamesByCompany,
      // Usuários
      getUserById,
      // Lista de Desejos
      getWishlist,
      addToWishlist,
      removeFromWishlist,
    }),
    [
      login,
      register,
      changePassword,
      getCompanies,
      getCompany,
      createCompany,
      updateCompany,
      deleteCompany,
      getProfiles,
      createProfile,
      getGames,
      getGame,
      createGame,
      updateGame,
      deleteGame,
      getCart,
      addToCart,
      removeFromCart,
      checkout,
      getPurchaseHistory,
      getGameReviews,
      createReview,
      updateReview,
      getAllReviews,
      getGameRatingAverage,
      getTopGames,
      getTopGamesByCompany,
      getUserById,
      getWishlist,
      addToWishlist,
      removeFromWishlist,
    ]
  );
}
