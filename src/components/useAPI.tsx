import { useState, useCallback, useMemo } from "react";
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
  perfilId: number; // O Postman usa 'perfilId: 2' como default
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(
    async <T,>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T | null> => {
      // ⚠️ IMPORTANTE: Não chamamos setLoading(true) ou setError(null) aqui.
      // Essa responsabilidade é do componente (HomePage) para que ele controle seu próprio estado de loading,
      // pois makeRequest é usado por múltiplas chamadas (login, getCompanies, etc.).

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
          // Clona a resposta para poder ler o corpo mais de uma vez em caso de debugging
          const responseClone = response.clone();
          data = await responseClone.json();
        } catch (e) {
          // Se falhar ao ler JSON, mas o status é 204 (No Content), é sucesso.
          if (response.status === 204) {
            return null as T; // Retorna null para requisições sem conteúdo (DELETE, por exemplo)
          }
          // Se falhar ao ler JSON e o status não é 204, algo deu errado.
          data = null;
        }

        // 3. Trata a resposta HTTP (status code)
        if (!response.ok) {
          let errorMsg = "Erro na requisição";

          if (data && (data as APIError).error) {
            errorMsg = (data as APIError).error;
          } else if (response.statusText) {
            errorMsg = response.statusText; // Ex: Bad Request, Unauthorized
          } else {
            errorMsg = `Erro HTTP ${response.status}`;
          }

          // Define o estado de erro global
          setError(errorMsg);
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
        setError(null);
        return data as T;
      } catch (err) {
        // Erro de rede (Failed to fetch, Timeout, CORS). Este é o erro persistente.
        const errorMsg =
          err instanceof Error ? err.message : "Erro de rede desconhecido";

        if (
          errorMsg.includes("Failed to fetch") ||
          errorMsg.includes("net::ERR_")
        ) {
          // Este é o cenário que estamos tentando diagnosticar.
          setError(
            "Não foi possível conectar ao servidor (Servidor offline ou configuração de rede/CORS incorreta)."
          );
          console.error("ERRO CRÍTICO DE CONEXÃO:", err, "URL Base:", API_URL);
        } else {
          setError(errorMsg);
        }

        console.error("Request error:", errorMsg, err);
        return null;
      }
    },
    [token]
  );

  // ----------------------------------------------------------------------
  // 🔑 Auth (Autenticação) - NOVAS FUNÇÕES
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
  // 🏭 Empresas (Enterprise) - Rotas Corrigidas: /empresas
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
  // 👤 Perfis (Profiles) - Rotas Corrigidas: /profiles
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
  // 🎮 Jogos (Games) - /jogos
  // ----------------------------------------------------------------------

  async function getGames({ page = 1, limit = 20 }): Promise<any> {
    // 1. Constrói os parâmetros de busca
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString();

    // 2. Monta o endpoint. O makeRequest irá anexar API_URL.
    // Confirme se GAME_ENDPOINT_PUBLIC é "/public/jogos"
    const endpoint = `${GAME_ENDPOINT_PUBLIC}?${params}`;

    // 3. Realiza a requisição, esperando a estrutura de dados bruta da API.
    // Se a API retornar um Array ou um Objeto, makeRequest trata.
    const apiResult = await makeRequest<any>(endpoint, {
      method: "GET",
    });

    // makeRequest retorna 'null' se houver um erro de rede/API.
    if (apiResult === null) {
      // Retorna 'null' para que o HomePage possa tratar como erro/falha.
      return null;
    }

    // 4. Retorna a resposta bruta (pode ser o array, ou {data, pagination})
    return apiResult;
  }

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
  // 🛒 Carrinho (Cart) - Rotas Corrigidas: /carrinho
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
        body: JSON.stringify({ jogoId }), // Postman usa 'jogoId'
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
  // 💰 Compras (Purchases) - Rotas Corrigidas: /vendas
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
    () => makeRequest<{ success: boolean; purchases: any[] }>("/vendas"), // Rota /vendas lista o histórico.
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // ⭐ Avaliações (Reviews) - Rotas Corrigidas: /avaliacoes
  // ----------------------------------------------------------------------

  const getGameReviews = useCallback(
    (jogoId: string) =>
      makeRequest<{ success: boolean; reviews: any[] }>(
        `/avaliacoes?jogoId=${jogoId}`
      ), // List by Game usa query param
    [makeRequest]
  );

  const createReview = useCallback(
    (data: { jogoId: number; nota: number; comentario?: string }) =>
      makeRequest<{ success: boolean; review: any }>("/avaliacoes", {
        method: "POST",
        body: JSON.stringify(data), // Postman usa 'jogoId', 'nota', 'comentario'
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
  // 📊 Relatórios (Reports) - Rotas Corrigidas: /relatorios
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
        }` // Usa 'empresa' query param
      ),
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // 👤 Usuários (Users) - Rotas Corrigidas: /usuarios
  // ----------------------------------------------------------------------

  const getUserById = useCallback(
    (id: string) =>
      makeRequest<{ success: boolean; user: any }>(`/usuarios/${id}`),
    [makeRequest]
  );

  // ----------------------------------------------------------------------
  // 💖 Lista de Desejos (Wishlist) - Rotas Corrigidas: /lista-desejo
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
        body: JSON.stringify({ jogoId }), // DELETE com body (JSON)
      }),
    [makeRequest]
  );

  return useMemo(
    () => ({
      loading,
      error,
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
      getGames, // ⬅️ A função getGames é retornada aqui.
      getGame,
      createGame,
      updateGame,
      deleteGame,
      // ... (o resto das funções)
    }),
    [
      loading, // Dependência de estado
      error, // Dependência de estado
      // Inclua *todas* as funções de API que são dependentes de makeRequest
      // e que, por sua vez, dependem do token, como login, getGames, etc.
      // Como todas elas usam useCallback e makeRequest (que depende do token),
      // só precisamos listar as que são de estado (loading, error)
      // e as que são as funções callback, garantindo que o useMemo só seja reavaliado
      // se algo nelas mudar.
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
