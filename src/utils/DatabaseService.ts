/**
 * DatabaseService - Frontend (SYNTHX Digital Game Store)
 * 
 * Camada de abstração sobre a API REST para operações de dados.
 * Replica a interface do DatabaseService original, mas usa HTTP em vez de SQL.
 * 
 * Este service NÃO acessa o banco diretamente - todas as operações passam pela API.
 */

import { projectId, publicAnonKey } from "./supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-23051d03`;

/**
 * Resultado de operações de escrita
 */
export interface RunResult {
  lastID?: string;
  changes: number;
  success: boolean;
  data?: any;
}

/**
 * Opções para requisições HTTP
 */
interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

/**
 * DatabaseService Frontend - Abstração da API REST
 * 
 * Fornece métodos convenientes para operações CRUD via API.
 * Requer autenticação para a maioria das operações.
 */
class DatabaseService {
  private token: string | null = null;

  /**
   * Define o token de autenticação para todas as requisições
   * 
   * @param token JWT token obtido no login
   * 
   * @example
   * dbService.setToken(loginResponse.token);
   */
  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * Obtém o token atual
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Faz uma requisição HTTP para a API
   * 
   * @param endpoint Endpoint da API (ex: '/games')
   * @param options Opções da requisição
   * @returns Promise com a resposta
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestOptions,
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Adicionar token de autenticação se disponível
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method: options.method,
      headers,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);

      // Tentar parsear JSON
      let data: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return data;
    } catch (error) {
      console.error(`DatabaseService request error - ${options.method} ${endpoint}:`, error);
      throw error;
    }
  }

  // ===== MÉTODOS CRUD GENÉRICOS =====

  /**
   * Cria um novo registro
   * 
   * @param resource Recurso da API (ex: 'games', 'companies')
   * @param data Dados do registro
   * @returns Promise com o resultado
   * 
   * @example
   * const result = await dbService.create('games', {
   *   name: 'The Witcher 3',
   *   price: 59.99,
   *   ...
   * });
   */
  async create(resource: string, data: any): Promise<RunResult> {
    try {
      const response = await this.request(`/${resource}`, {
        method: "POST",
        body: data,
      });

      return {
        lastID: response.game?.id || response.company?.id || response.category?.id,
        changes: 1,
        success: true,
        data: response,
      };
    } catch (error) {
      console.error(`DatabaseService.create error - Resource: ${resource}`, error);
      throw error;
    }
  }

  /**
   * Busca um único registro por ID
   * 
   * @param resource Recurso da API (ex: 'games', 'companies')
   * @param id ID do registro
   * @returns Promise com o registro ou null
   * 
   * @example
   * const game = await dbService.get('games', 'game-123');
   */
  async get<T = any>(resource: string, id: string): Promise<T | null> {
    try {
      const response = await this.request<any>(`/${resource}/${id}`, {
        method: "GET",
      });

      return response.game || response.company || response.category || response;
    } catch (error: any) {
      if (error.message.includes("404") || error.message.includes("not found")) {
        return null;
      }
      console.error(`DatabaseService.get error - Resource: ${resource}, ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Busca todos os registros de um recurso
   * 
   * @param resource Recurso da API (ex: 'games', 'companies')
   * @param query Parâmetros de query opcionais
   * @returns Promise com array de registros
   * 
   * @example
   * const games = await dbService.all('games', { category: 'RPG' });
   */
  async all<T = any>(
    resource: string,
    query?: Record<string, string>,
  ): Promise<T[]> {
    try {
      const queryString = query
        ? "?" + new URLSearchParams(query).toString()
        : "";

      const response = await this.request<any>(`/${resource}${queryString}`, {
        method: "GET",
      });

      return response.games || response.companies || response.categories || response || [];
    } catch (error) {
      console.error(`DatabaseService.all error - Resource: ${resource}`, error);
      throw error;
    }
  }

  /**
   * Atualiza um registro existente
   * 
   * @param resource Recurso da API (ex: 'games', 'companies')
   * @param id ID do registro
   * @param updates Dados a atualizar
   * @returns Promise com resultado
   * 
   * @example
   * await dbService.update('games', 'game-123', { price: 49.99 });
   */
  async update(
    resource: string,
    id: string,
    updates: any,
  ): Promise<RunResult> {
    try {
      const response = await this.request(`/${resource}/${id}`, {
        method: "PUT",
        body: updates,
      });

      return {
        changes: 1,
        success: true,
        data: response,
      };
    } catch (error) {
      console.error(
        `DatabaseService.update error - Resource: ${resource}, ID: ${id}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Deleta um registro
   * 
   * @param resource Recurso da API (ex: 'games', 'companies')
   * @param id ID do registro
   * @returns Promise com resultado
   * 
   * @example
   * await dbService.delete('games', 'game-123');
   */
  async delete(resource: string, id: string): Promise<RunResult> {
    try {
      await this.request(`/${resource}/${id}`, {
        method: "DELETE",
      });

      return {
        changes: 1,
        success: true,
      };
    } catch (error) {
      console.error(
        `DatabaseService.delete error - Resource: ${resource}, ID: ${id}`,
        error,
      );
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS DA API =====

  /**
   * Faz login e armazena o token
   * 
   * @param email Email do usuário
   * @param password Senha do usuário
   * @returns Promise com dados do usuário e token
   */
  async login(email: string, password: string): Promise<any> {
    try {
      const response = await this.request<any>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (response.token) {
        this.setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error("DatabaseService.login error", error);
      throw error;
    }
  }

  /**
   * Faz logout e remove o token
   */
  logout() {
    this.setToken(null);
    localStorage.removeItem("token");
  }

  /**
   * Registra um novo usuário
   * 
   * @param userData Dados do novo usuário
   * @returns Promise com dados do usuário
   */
  async signup(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<any> {
    try {
      const response = await this.request<any>("/auth/signup", {
        method: "POST",
        body: userData,
      });

      return response;
    } catch (error) {
      console.error("DatabaseService.signup error", error);
      throw error;
    }
  }

  /**
   * Verifica se o token ainda é válido
   * 
   * @returns Promise com dados do usuário ou null
   */
  async verifyToken(): Promise<any> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await this.request<any>("/auth/verify", {
        method: "GET",
      });

      return response.user;
    } catch (error) {
      console.error("DatabaseService.verifyToken error", error);
      this.setToken(null);
      return null;
    }
  }

  /**
   * Adiciona um jogo ao carrinho
   * 
   * @param gameId ID do jogo
   * @returns Promise com o carrinho atualizado
   */
  async addToCart(gameId: string): Promise<any> {
    try {
      const response = await this.request<any>("/cart/add", {
        method: "POST",
        body: { gameId },
      });

      return response;
    } catch (error) {
      console.error("DatabaseService.addToCart error", error);
      throw error;
    }
  }

  /**
   * Obtém o carrinho do usuário
   * 
   * @returns Promise com o carrinho
   */
  async getCart(): Promise<any> {
    try {
      const response = await this.request<any>("/cart", {
        method: "GET",
      });

      return response.cart;
    } catch (error) {
      console.error("DatabaseService.getCart error", error);
      throw error;
    }
  }

  /**
   * Remove um jogo do carrinho
   * 
   * @param gameId ID do jogo
   * @returns Promise com o carrinho atualizado
   */
  async removeFromCart(gameId: string): Promise<any> {
    try {
      const response = await this.request<any>(`/cart/${gameId}`, {
        method: "DELETE",
      });

      return response;
    } catch (error) {
      console.error("DatabaseService.removeFromCart error", error);
      throw error;
    }
  }

  /**
   * Finaliza a compra (checkout)
   * 
   * @param paymentMethod Método de pagamento
   * @returns Promise com dados da compra
   */
  async checkout(paymentMethod: string = "Cartão de Crédito"): Promise<any> {
    try {
      const response = await this.request<any>("/purchases/checkout", {
        method: "POST",
        body: { paymentMethod },
      });

      return response;
    } catch (error) {
      console.error("DatabaseService.checkout error", error);
      throw error;
    }
  }

  /**
   * Obtém o histórico de compras
   * 
   * @returns Promise com array de compras
   */
  async getPurchaseHistory(): Promise<any[]> {
    try {
      const response = await this.request<any>("/purchases/history", {
        method: "GET",
      });

      return response || [];
    } catch (error) {
      console.error("DatabaseService.getPurchaseHistory error", error);
      throw error;
    }
  }

  /**
   * Obtém os jogos do usuário (biblioteca)
   * 
   * @returns Promise com array de jogos
   */
  async getUserGames(): Promise<any[]> {
    try {
      const response = await this.request<any>("/usuarios/jogos", {
        method: "GET",
      });

      return response || [];
    } catch (error) {
      console.error("DatabaseService.getUserGames error", error);
      throw error;
    }
  }

  /**
   * Cria uma avaliação
   * 
   * @param reviewData Dados da avaliação
   * @returns Promise com a avaliação criada
   */
  async createReview(reviewData: {
    jogoId: string;
    nota: number;
    comentario: string;
  }): Promise<any> {
    try {
      const response = await this.request<any>("/avaliacoes", {
        method: "POST",
        body: reviewData,
      });

      return response;
    } catch (error) {
      console.error("DatabaseService.createReview error", error);
      throw error;
    }
  }

  /**
   * Obtém as avaliações de um jogo
   * 
   * @param gameId ID do jogo (opcional)
   * @returns Promise com array de avaliações
   */
  async getReviews(gameId?: string): Promise<any[]> {
    try {
      const endpoint = gameId ? `/avaliacoes?jogoId=${gameId}` : "/avaliacoes";
      const response = await this.request<any>(endpoint, {
        method: "GET",
      });

      return response || [];
    } catch (error) {
      console.error("DatabaseService.getReviews error", error);
      throw error;
    }
  }

  /**
   * Obtém a média de avaliações de um jogo
   * 
   * @param gameId ID do jogo
   * @returns Promise com a média
   */
  async getAverageRating(gameId: string): Promise<any> {
    try {
      const response = await this.request<any>(`/avaliacoes/media/${gameId}`, {
        method: "GET",
      });

      return response;
    } catch (error) {
      console.error("DatabaseService.getAverageRating error", error);
      throw error;
    }
  }

  /**
   * Adiciona um jogo à lista de desejos
   * 
   * @param gameId ID do jogo
   * @returns Promise com a wishlist atualizada
   */
  async addToWishlist(gameId: string): Promise<any> {
    try {
      const response = await this.request<any>("/lista-desejos", {
        method: "POST",
        body: { jogoId: gameId },
      });

      return response;
    } catch (error) {
      console.error("DatabaseService.addToWishlist error", error);
      throw error;
    }
  }

  /**
   * Obtém a lista de desejos
   * 
   * @returns Promise com array de jogos
   */
  async getWishlist(): Promise<any[]> {
    try {
      const response = await this.request<any>("/lista-desejos", {
        method: "GET",
      });

      return response || [];
    } catch (error) {
      console.error("DatabaseService.getWishlist error", error);
      throw error;
    }
  }

  /**
   * Remove um jogo da lista de desejos
   * 
   * @param gameId ID do jogo
   * @returns Promise com resultado
   */
  async removeFromWishlist(gameId: string): Promise<any> {
    try {
      const response = await this.request<any>("/lista-desejos", {
        method: "DELETE",
        body: { jogoId: gameId },
      });

      return response;
    } catch (error) {
      console.error("DatabaseService.removeFromWishlist error", error);
      throw error;
    }
  }

  /**
   * Obtém relatório de jogos mais vendidos
   * 
   * @param top Quantidade de jogos (padrão: 10)
   * @param empresaId ID da empresa (opcional)
   * @returns Promise com array de jogos
   */
  async getTopSellers(top: number = 10, empresaId?: string): Promise<any[]> {
    try {
      const query: Record<string, string> = { top: top.toString() };
      if (empresaId) {
        query.empresa = empresaId;
      }

      const queryString = new URLSearchParams(query).toString();
      const response = await this.request<any>(
        `/relatorios/jogos-mais-vendidos?${queryString}`,
        { method: "GET" },
      );

      return response || [];
    } catch (error) {
      console.error("DatabaseService.getTopSellers error", error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const dbService = new DatabaseService();

// Exportar classe para casos onde múltiplas instâncias são necessárias
export default DatabaseService;
