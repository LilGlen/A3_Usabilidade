// ============================================
// TYPES INDEX - SYNTHX Digital Game Store
// ============================================
// Central export file for all types, models, validators, and helpers

// ============================================
// MODELS
// ============================================

export type {
  // Core Models
  Avaliacao,
  Carrinho,
  Categoria,
  Empresa,
  ItemCarrinho,
  Jogo,
  ListaDesejo,
  Perfil,
  Usuario,
  Venda,
  
  // DTOs
  JogoMaisVendidoDTO,
  JogoUsuarioDTO,
  
  // API Response Models
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
  
  // Utility Types
  UserRole,
  CartStatus,
  Rating,
} from './models';

export {
  // Model Classes
  AvaliacaoModel,
  CarrinhoModel,
  CategoriaModel,
  EmpresaModel,
  ItemCarrinhoModel,
  JogoModel,
  ListaDesejoModel,
  PerfilModel,
  UsuarioModel,
  VendaModel,
  JogoMaisVendidoDTOModel,
  JogoUsuarioDTOModel,
  
  // Type Guards
  isValidRating,
  isValidCartStatus,
  isValidUserRole,
  
  // Mappers
  Mappers,
} from './models';

// ============================================
// VALIDATORS
// ============================================

export {
  // Validation Error Class
  ValidationError,
  
  // Validators Object
  Validators,
  
  // Model Validators
  validateAvaliacao,
  validateJogo,
  validateUsuario,
  validateVenda,
  validateCarrinho,
  
  // Request Validators
  validateSignupRequest,
  validateLoginRequest,
  validateCreateGameRequest,
  validateCreateReviewRequest,
  validateAddToCartRequest,
  validateChangePasswordRequest,
} from './validators';

export type {
  // Request Types
  SignupRequest,
  LoginRequest,
  CreateGameRequest,
  CreateReviewRequest,
  AddToCartRequest,
  ChangePasswordRequest,
} from './validators';

// ============================================
// HELPERS
// ============================================

export {
  // Helper Modules
  Formatters,
  Calculators,
  Generators,
  Sorters,
  Filters,
  Checkers,
  Statistics,
} from './helpers';

// ============================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================

// Common utilities that are frequently used together
export const Utils = {
  // From Formatters
  formatPrice: (price: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price),
  formatDate: (date: string) => 
    new Intl.DateTimeFormat('pt-BR').format(new Date(date)),
  formatRating: (rating: number) => `${rating.toFixed(1)} ⭐`,
  
  // From Generators
  generateId: (prefix?: string) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
  },
  generateActivationKey: () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = [];
    for (let i = 0; i < 4; i++) {
      let segment = '';
      for (let j = 0; j < 5; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments.push(segment);
    }
    return segments.join('-');
  },
  
  // From Validators
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidPassword: (password: string) => password.length >= 6,
  isValidRating: (rating: number) => Number.isInteger(rating) && rating >= 1 && rating <= 5,
  
  // From Calculators
  calculateCartTotal: (games: { price: number }[]) => 
    games.reduce((sum, game) => sum + game.price, 0),
  calculateAverageRating: (ratings: number[]) => 
    ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
};

// ============================================
// CONSTANTS
// ============================================

export const CONSTANTS = {
  // User Roles
  ROLES: {
    USER: 'user' as const,
    ADMIN: 'admin' as const,
  },
  
  // Cart Status
  CART_STATUS: {
    ACTIVE: 'A' as const,
    FINALIZED: 'F' as const,
    CANCELLED: 'C' as const,
  },
  
  // Rating Range
  RATING: {
    MIN: 1,
    MAX: 5,
  },
  
  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    COMMENT_MAX_LENGTH: 1000,
    NAME_MAX_LENGTH: 255,
    YEAR_MIN: 1970,
    YEAR_MAX: new Date().getFullYear() + 2,
  },
  
  // Formatting
  LOCALE: 'pt-BR',
  CURRENCY: 'BRL',
  
  // Default Values
  DEFAULTS: {
    REPORT_TOP_LIMIT: 10,
    PAGE_SIZE: 20,
    MIN_PRICE: 0,
    MAX_PRICE: 1000,
  },
};

// ============================================
// TYPE ALIASES FOR COMMON PATTERNS
// ============================================

export type ID = string;
export type ISODateString = string;
export type Price = number;
export type Email = string;
export type Password = string;

// API Response wrapper
export type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Paginated response
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// Sort options
export type SortOrder = 'asc' | 'desc';
export type SortField = 'name' | 'price' | 'rating' | 'sales' | 'year';

// Filter options
export type PriceRange = {
  min: number;
  max: number;
};

export type YearRange = {
  start: number;
  end: number;
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  Utils,
  CONSTANTS,
};
