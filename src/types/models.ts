// ============================================
// MODELS - SYNTHX Digital Game Store
// ============================================
// TypeScript models based on original JavaScript models
// These are used across frontend and backend

// ============================================
// CORE MODELS
// ============================================

export interface Avaliacao {
  id: string;
  fkJogo: string;
  fkUsuario: string;
  nota: number; // 1-5 rating
  comentario: string;
  data: string; // ISO date string
}

export class AvaliacaoModel implements Avaliacao {
  constructor(
    public id: string,
    public fkJogo: string,
    public fkUsuario: string,
    public nota: number,
    public comentario: string,
    public data: string = new Date().toISOString()
  ) {}
}

// ============================================

export interface Carrinho {
  id: string;
  fkUsuario: string;
  status: 'A' | 'F' | 'C'; // A=Ativo, F=Finalizado, C=Cancelado
  fkVenda?: string | null;
  itens: ItemCarrinho[];
}

export class CarrinhoModel implements Carrinho {
  constructor(
    public id: string,
    public fkUsuario: string,
    public status: 'A' | 'F' | 'C' = 'A',
    public fkVenda: string | null = null,
    public itens: ItemCarrinho[] = []
  ) {}
}

// ============================================

export interface Empresa {
  id: string;
  nome: string;
}

export class EmpresaModel implements Empresa {
  constructor(
    public id: string,
    public nome: string
  ) {}
}

// ============================================

export interface Categoria {
  id: string;
  nome: string;
}

export class CategoriaModel implements Categoria {
  constructor(
    public id: string,
    public nome: string
  ) {}
}

// ============================================

export interface ItemCarrinho {
  id: string;
  fkJogo: string;
  fkCarrinho: string;
  chave_ativacao?: string;
}

export class ItemCarrinhoModel implements ItemCarrinho {
  constructor(
    public id: string,
    public fkJogo: string,
    public fkCarrinho: string,
    public chave_ativacao?: string
  ) {}
}

// ============================================

export interface Jogo {
  id: string;
  nome: string;
  descricao: string;
  ano: number;
  preco: number;
  fkEmpresa: string;
  fkCategoria: string;
}

export class JogoModel implements Jogo {
  constructor(
    public id: string,
    public nome: string,
    public ano: number,
    public preco: number,
    public descricao: string,
    public fkEmpresa: string,
    public fkCategoria: string
  ) {}

  static fromRequest(body: any): JogoModel {
    return new JogoModel(
      body.id,
      body.nome,
      body.ano,
      body.preco,
      body.descricao,
      body.fkEmpresa,
      body.fkCategoria
    );
  }
}

// ============================================

export interface ListaDesejo {
  id: string;
  fk_usuario: string;
  fk_jogo: string;
}

export class ListaDesejoModel implements ListaDesejo {
  constructor(
    public id: string,
    public fk_usuario: string,
    public fk_jogo: string
  ) {}
}

// ============================================

export interface Perfil {
  id: string;
  nome: string;
}

export class PerfilModel implements Perfil {
  constructor(
    public id: string,
    public nome: string
  ) {}
}

// ============================================

export interface Usuario {
  id?: string;
  nome: string;
  email: string;
  senha?: string; // Only used during creation, never returned from API
  dataNascimento: string; // ISO date string
  fkPerfil: string;
}

export class UsuarioModel implements Usuario {
  constructor(
    public nome: string,
    public email: string,
    public senha: string,
    public dataNascimento: string,
    public fkPerfil: string,
    public id?: string
  ) {}
}

// ============================================

export interface Venda {
  id: string;
  valorTotal: number;
  quantidade: number;
  data: string; // ISO date string
  fkUsuario: string;
}

export class VendaModel implements Venda {
  constructor(
    public id: string,
    public valorTotal: number,
    public quantidade: number,
    public data: string,
    public fkUsuario: string
  ) {}
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export interface JogoMaisVendidoDTO {
  nome: string;
  empresa: string;
  total: number;
}

export class JogoMaisVendidoDTOModel implements JogoMaisVendidoDTO {
  constructor(
    public nome: string,
    public empresa: string,
    public total: number
  ) {}
}

// ============================================

export interface JogoUsuarioDTO {
  chaveAtivacao: string;
  jogo: Jogo;
}

export class JogoUsuarioDTOModel implements JogoUsuarioDTO {
  constructor(
    public chaveAtivacao: string,
    public jogo: Jogo
  ) {}
}

// ============================================
// API RESPONSE MODELS (from current backend)
// ============================================

export interface GameResponse {
  id: string;
  name: string;
  description: string;
  year: number;
  price: number;
  company: string;
  companyId: string;
  category: string;
  categoryId: string;
  rating?: number;
  sales?: number;
  reviewCount?: number;
}

export interface CompanyResponse {
  id: string;
  name: string;
  gameCount?: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
  gameCount?: number;
}

export interface PurchaseResponse {
  id: string;
  userId: string;
  date: string;
  totalAmount: number;
  itemCount: number;
  items: PurchaseItemResponse[];
}

export interface PurchaseItemResponse {
  gameId: string;
  gameName: string;
  price: number;
  activationKey: string;
}

export interface ReviewResponse {
  id: string;
  gameId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface WishlistItemResponse {
  id: string;
  gameId: string;
  gameName: string;
  price: number;
  company: string;
  category: string;
}

export interface CartResponse {
  items: CartItemResponse[];
  totalAmount: number;
  itemCount: number;
}

export interface CartItemResponse {
  gameId: string;
  gameName: string;
  price: number;
  company: string;
  category: string;
}

export interface UserGameResponse {
  id: string;
  name: string;
  price: number;
  company: string;
  category: string;
  activationKey: string;
  purchaseDate?: string;
}

export interface ReportRankingResponse {
  id: string;
  name: string;
  company: string;
  sales: number;
  revenue: number;
  rating: number;
  price: number;
}

export interface ReportStatisticsResponse {
  totalGames: number;
  totalUsers: number;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  topCategory: {
    name: string;
    gameCount: number;
  };
  topCompany: {
    name: string;
    gameCount: number;
  };
}

// ============================================
// UTILITY TYPES
// ============================================

export type UserRole = 'user' | 'admin';

export type CartStatus = 'A' | 'F' | 'C'; // Ativo, Finalizado, Cancelado

export type Rating = 1 | 2 | 3 | 4 | 5;

// ============================================
// TYPE GUARDS
// ============================================

export function isValidRating(rating: number): rating is Rating {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export function isValidCartStatus(status: string): status is CartStatus {
  return status === 'A' || status === 'F' || status === 'C';
}

export function isValidUserRole(role: string): role is UserRole {
  return role === 'user' || role === 'admin';
}

// ============================================
// MAPPERS (Convert between API responses and Models)
// ============================================

export const Mappers = {
  // Game Response -> Jogo Model
  gameResponseToJogo(game: GameResponse): Jogo {
    return {
      id: game.id,
      nome: game.name,
      descricao: game.description,
      ano: game.year,
      preco: game.price,
      fkEmpresa: game.companyId,
      fkCategoria: game.categoryId,
    };
  },

  // Jogo Model -> Game Response
  jogoToGameResponse(
    jogo: Jogo,
    companyName: string,
    categoryName: string,
    rating?: number,
    sales?: number,
    reviewCount?: number
  ): GameResponse {
    return {
      id: jogo.id,
      name: jogo.nome,
      description: jogo.descricao,
      year: jogo.ano,
      price: jogo.preco,
      company: companyName,
      companyId: jogo.fkEmpresa,
      category: categoryName,
      categoryId: jogo.fkCategoria,
      rating,
      sales,
      reviewCount,
    };
  },

  // Company Response -> Empresa Model
  companyResponseToEmpresa(company: CompanyResponse): Empresa {
    return {
      id: company.id,
      nome: company.name,
    };
  },

  // Empresa Model -> Company Response
  empresaToCompanyResponse(empresa: Empresa, gameCount?: number): CompanyResponse {
    return {
      id: empresa.id,
      name: empresa.nome,
      gameCount,
    };
  },

  // Category Response -> Categoria Model
  categoryResponseToCategoria(category: CategoryResponse): Categoria {
    return {
      id: category.id,
      nome: category.name,
    };
  },

  // Categoria Model -> Category Response
  categoriaToCategor yResponse(categoria: Categoria, gameCount?: number): CategoryResponse {
    return {
      id: categoria.id,
      name: categoria.nome,
      gameCount,
    };
  },

  // Review Response -> Avaliacao Model
  reviewResponseToAvaliacao(review: ReviewResponse): Avaliacao {
    return {
      id: review.id,
      fkJogo: review.gameId,
      fkUsuario: review.userId,
      nota: review.rating,
      comentario: review.comment,
      data: review.date,
    };
  },

  // Avaliacao Model -> Review Response
  avaliacaoToReviewResponse(avaliacao: Avaliacao, userName: string): ReviewResponse {
    return {
      id: avaliacao.id,
      gameId: avaliacao.fkJogo,
      userId: avaliacao.fkUsuario,
      userName,
      rating: avaliacao.nota,
      comment: avaliacao.comentario,
      date: avaliacao.data,
    };
  },
};

// ============================================
// EXPORT ALL
// ============================================

export type {
  GameResponse,
  CompanyResponse,
  CategoryResponse,
  PurchaseResponse,
  PurchaseItemResponse,
  ReviewResponse,
  WishlistItemResponse,
  CartResponse,
  CartItemResponse,
  UserGameResponse,
  ReportRankingResponse,
  ReportStatisticsResponse,
};
