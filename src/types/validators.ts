// ============================================
// VALIDATORS - SYNTHX Digital Game Store
// ============================================
// Validation functions for models and API requests

import type {
  Avaliacao,
  Jogo,
  Usuario,
  Venda,
  Carrinho,
  Rating,
  UserRole,
} from './models';

// ============================================
// VALIDATION ERRORS
// ============================================

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================
// FIELD VALIDATORS
// ============================================

export const Validators = {
  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password validation (min 6 characters)
  isValidPassword(password: string): boolean {
    return password.length >= 6;
  },

  // Rating validation (1-5)
  isValidRating(rating: number): rating is Rating {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
  },

  // Price validation (positive number)
  isValidPrice(price: number): boolean {
    return typeof price === 'number' && price >= 0 && !isNaN(price);
  },

  // Year validation (reasonable game release year)
  isValidYear(year: number): boolean {
    const currentYear = new Date().getFullYear();
    return Number.isInteger(year) && year >= 1970 && year <= currentYear + 2;
  },

  // Date validation
  isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  },

  // User role validation
  isValidUserRole(role: string): role is UserRole {
    return role === 'user' || role === 'admin';
  },

  // Cart status validation
  isValidCartStatus(status: string): boolean {
    return status === 'A' || status === 'F' || status === 'C';
  },

  // Name validation (not empty, reasonable length)
  isValidName(name: string): boolean {
    return typeof name === 'string' && name.trim().length > 0 && name.length <= 255;
  },

  // Description validation
  isValidDescription(description: string): boolean {
    return typeof description === 'string' && description.trim().length > 0;
  },

  // Comment validation
  isValidComment(comment: string): boolean {
    return typeof comment === 'string' && comment.trim().length > 0 && comment.length <= 1000;
  },

  // ID validation (non-empty string)
  isValidId(id: string): boolean {
    return typeof id === 'string' && id.trim().length > 0;
  },
};

// ============================================
// MODEL VALIDATORS
// ============================================

export function validateAvaliacao(avaliacao: Partial<Avaliacao>): void {
  if (!avaliacao.fkJogo || !Validators.isValidId(avaliacao.fkJogo)) {
    throw new ValidationError('ID do jogo inválido', 'fkJogo');
  }

  if (!avaliacao.fkUsuario || !Validators.isValidId(avaliacao.fkUsuario)) {
    throw new ValidationError('ID do usuário inválido', 'fkUsuario');
  }

  if (!avaliacao.nota || !Validators.isValidRating(avaliacao.nota)) {
    throw new ValidationError('Nota deve ser entre 1 e 5', 'nota');
  }

  if (!avaliacao.comentario || !Validators.isValidComment(avaliacao.comentario)) {
    throw new ValidationError(
      'Comentário deve ter entre 1 e 1000 caracteres',
      'comentario'
    );
  }
}

export function validateJogo(jogo: Partial<Jogo>): void {
  if (!jogo.nome || !Validators.isValidName(jogo.nome)) {
    throw new ValidationError('Nome do jogo inválido', 'nome');
  }

  if (!jogo.descricao || !Validators.isValidDescription(jogo.descricao)) {
    throw new ValidationError('Descrição do jogo inválida', 'descricao');
  }

  if (!jogo.ano || !Validators.isValidYear(jogo.ano)) {
    throw new ValidationError('Ano de lançamento inválido', 'ano');
  }

  if (jogo.preco === undefined || !Validators.isValidPrice(jogo.preco)) {
    throw new ValidationError('Preço deve ser um número positivo', 'preco');
  }

  if (!jogo.fkEmpresa || !Validators.isValidId(jogo.fkEmpresa)) {
    throw new ValidationError('ID da empresa inválido', 'fkEmpresa');
  }

  if (!jogo.fkCategoria || !Validators.isValidId(jogo.fkCategoria)) {
    throw new ValidationError('ID da categoria inválido', 'fkCategoria');
  }
}

export function validateUsuario(usuario: Partial<Usuario>): void {
  if (!usuario.nome || !Validators.isValidName(usuario.nome)) {
    throw new ValidationError('Nome inválido', 'nome');
  }

  if (!usuario.email || !Validators.isValidEmail(usuario.email)) {
    throw new ValidationError('Email inválido', 'email');
  }

  if (usuario.senha && !Validators.isValidPassword(usuario.senha)) {
    throw new ValidationError('Senha deve ter pelo menos 6 caracteres', 'senha');
  }

  if (usuario.dataNascimento && !Validators.isValidDate(usuario.dataNascimento)) {
    throw new ValidationError('Data de nascimento inválida', 'dataNascimento');
  }

  if (!usuario.fkPerfil || !Validators.isValidId(usuario.fkPerfil)) {
    throw new ValidationError('ID do perfil inválido', 'fkPerfil');
  }
}

export function validateVenda(venda: Partial<Venda>): void {
  if (venda.valorTotal === undefined || !Validators.isValidPrice(venda.valorTotal)) {
    throw new ValidationError('Valor total inválido', 'valorTotal');
  }

  if (!venda.quantidade || venda.quantidade < 1) {
    throw new ValidationError('Quantidade deve ser maior que zero', 'quantidade');
  }

  if (!venda.data || !Validators.isValidDate(venda.data)) {
    throw new ValidationError('Data da venda inválida', 'data');
  }

  if (!venda.fkUsuario || !Validators.isValidId(venda.fkUsuario)) {
    throw new ValidationError('ID do usuário inválido', 'fkUsuario');
  }
}

export function validateCarrinho(carrinho: Partial<Carrinho>): void {
  if (!carrinho.fkUsuario || !Validators.isValidId(carrinho.fkUsuario)) {
    throw new ValidationError('ID do usuário inválido', 'fkUsuario');
  }

  if (carrinho.status && !Validators.isValidCartStatus(carrinho.status)) {
    throw new ValidationError('Status do carrinho inválido', 'status');
  }

  if (!Array.isArray(carrinho.itens)) {
    throw new ValidationError('Itens do carrinho devem ser um array', 'itens');
  }
}

// ============================================
// REQUEST VALIDATORS
// ============================================

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  role?: UserRole;
}

export function validateSignupRequest(req: Partial<SignupRequest>): void {
  if (!req.name || !Validators.isValidName(req.name)) {
    throw new ValidationError('Nome inválido', 'name');
  }

  if (!req.email || !Validators.isValidEmail(req.email)) {
    throw new ValidationError('Email inválido', 'email');
  }

  if (!req.password || !Validators.isValidPassword(req.password)) {
    throw new ValidationError('Senha deve ter pelo menos 6 caracteres', 'password');
  }

  if (req.birthDate && !Validators.isValidDate(req.birthDate)) {
    throw new ValidationError('Data de nascimento inválida', 'birthDate');
  }

  if (req.role && !Validators.isValidUserRole(req.role)) {
    throw new ValidationError('Perfil inválido (user ou admin)', 'role');
  }
}

export interface LoginRequest {
  email: string;
  password: string;
}

export function validateLoginRequest(req: Partial<LoginRequest>): void {
  if (!req.email || !Validators.isValidEmail(req.email)) {
    throw new ValidationError('Email inválido', 'email');
  }

  if (!req.password || !req.password.trim()) {
    throw new ValidationError('Senha é obrigatória', 'password');
  }
}

export interface CreateGameRequest {
  name: string;
  description: string;
  year: number;
  price: number;
  companyId: string;
  categoryId: string;
}

export function validateCreateGameRequest(req: Partial<CreateGameRequest>): void {
  if (!req.name || !Validators.isValidName(req.name)) {
    throw new ValidationError('Nome do jogo inválido', 'name');
  }

  if (!req.description || !Validators.isValidDescription(req.description)) {
    throw new ValidationError('Descrição do jogo inválida', 'description');
  }

  if (!req.year || !Validators.isValidYear(req.year)) {
    throw new ValidationError('Ano de lançamento inválido', 'year');
  }

  if (req.price === undefined || !Validators.isValidPrice(req.price)) {
    throw new ValidationError('Preço deve ser um número positivo', 'price');
  }

  if (!req.companyId || !Validators.isValidId(req.companyId)) {
    throw new ValidationError('ID da empresa inválido', 'companyId');
  }

  if (!req.categoryId || !Validators.isValidId(req.categoryId)) {
    throw new ValidationError('ID da categoria inválido', 'categoryId');
  }
}

export interface CreateReviewRequest {
  gameId: string;
  rating: number;
  comment: string;
}

export function validateCreateReviewRequest(req: Partial<CreateReviewRequest>): void {
  if (!req.gameId || !Validators.isValidId(req.gameId)) {
    throw new ValidationError('ID do jogo inválido', 'gameId');
  }

  if (!req.rating || !Validators.isValidRating(req.rating)) {
    throw new ValidationError('Nota deve ser entre 1 e 5', 'rating');
  }

  if (!req.comment || !Validators.isValidComment(req.comment)) {
    throw new ValidationError(
      'Comentário deve ter entre 1 e 1000 caracteres',
      'comment'
    );
  }
}

export interface AddToCartRequest {
  gameId: string;
}

export function validateAddToCartRequest(req: Partial<AddToCartRequest>): void {
  if (!req.gameId || !Validators.isValidId(req.gameId)) {
    throw new ValidationError('ID do jogo inválido', 'gameId');
  }
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export function validateChangePasswordRequest(req: Partial<ChangePasswordRequest>): void {
  if (!req.currentPassword || !req.currentPassword.trim()) {
    throw new ValidationError('Senha atual é obrigatória', 'currentPassword');
  }

  if (!req.newPassword || !Validators.isValidPassword(req.newPassword)) {
    throw new ValidationError(
      'Nova senha deve ter pelo menos 6 caracteres',
      'newPassword'
    );
  }

  if (req.currentPassword === req.newPassword) {
    throw new ValidationError(
      'Nova senha deve ser diferente da senha atual',
      'newPassword'
    );
  }
}

// ============================================
// EXPORT ALL
// ============================================

export {
  Validators,
  validateAvaliacao,
  validateJogo,
  validateUsuario,
  validateVenda,
  validateCarrinho,
  validateSignupRequest,
  validateLoginRequest,
  validateCreateGameRequest,
  validateCreateReviewRequest,
  validateAddToCartRequest,
  validateChangePasswordRequest,
};
