/**
 * Crypto Utilities - SYNTHX Digital Game Store
 * 
 * Funções de criptografia e geração de chaves.
 * 
 * IMPORTANTE: No novo sistema, Supabase Auth gerencia hashing de senhas
 * automaticamente. As funções hashPassword e verifyPassword aqui são
 * principalmente para compatibilidade e casos especiais.
 */

/**
 * Gera uma chave de ativação única no formato XXXX-XXXX-XXXX-XXXX
 * 
 * @returns String - Chave de ativação no formato XXXX-XXXX-XXXX-XXXX
 * 
 * @example
 * const key = generateActivationKey();
 * // Retorna: "A7B9-C3D2-E8F1-G4H6"
 */
export function generateActivationKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;

  const generateSegment = (): string => {
    let segment = '';
    for (let i = 0; i < segmentLength; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
  };

  const key = [];
  for (let i = 0; i < segments; i++) {
    key.push(generateSegment());
  }

  return key.join('-');
}

/**
 * Gera múltiplas chaves de ativação únicas
 * 
 * @param count Número de chaves a gerar
 * @returns Array de chaves de ativação
 * 
 * @example
 * const keys = generateMultipleActivationKeys(5);
 * // Retorna: ["A7B9-...", "C3D2-...", ...]
 */
export function generateMultipleActivationKeys(count: number): string[] {
  const keys = new Set<string>();
  
  while (keys.size < count) {
    keys.add(generateActivationKey());
  }
  
  return Array.from(keys);
}

/**
 * Valida formato de chave de ativação
 * 
 * @param key Chave a validar
 * @returns true se válida, false caso contrário
 * 
 * @example
 * validateActivationKey("A7B9-C3D2-E8F1-G4H6"); // true
 * validateActivationKey("invalid-key"); // false
 */
export function validateActivationKey(key: string): boolean {
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(key);
}

/**
 * Formata uma chave removendo caracteres inválidos
 * 
 * @param key Chave a formatar
 * @returns Chave formatada ou null se inválida
 * 
 * @example
 * formatActivationKey("a7b9c3d2e8f1g4h6");
 * // Retorna: "A7B9-C3D2-E8F1-G4H6"
 */
export function formatActivationKey(key: string): string | null {
  // Remove caracteres que não são alfanuméricos
  const cleaned = key.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Deve ter exatamente 16 caracteres
  if (cleaned.length !== 16) {
    return null;
  }
  
  // Adiciona hífens a cada 4 caracteres
  return cleaned.match(/.{1,4}/g)?.join('-') || null;
}

// ===== PASSWORD HASHING =====
// Nota: Supabase Auth gerencia senhas automaticamente.
// Estas funções são para casos especiais ou compatibilidade.

/**
 * Hash de senha usando Web Crypto API
 * 
 * IMPORTANTE: Esta função é para casos especiais.
 * Supabase Auth já gerencia hashing de senhas automaticamente.
 * 
 * @param password Senha em texto plano
 * @returns Promise<string> - Hash da senha em base64
 * 
 * @example
 * const hash = await hashPassword("senha123");
 */
export async function hashPassword(password: string): Promise<string> {
  // Usar Web Crypto API (disponível em browsers e Deno)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  try {
    // PBKDF2 é um algoritmo de hashing seguro para senhas
    const key = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Gerar salt aleatório
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Derivar hash usando PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );
    
    // Combinar salt + hash
    const hashArray = new Uint8Array(derivedBits);
    const combined = new Uint8Array(salt.length + hashArray.length);
    combined.set(salt);
    combined.set(hashArray, salt.length);
    
    // Converter para base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verifica senha contra hash
 * 
 * IMPORTANTE: Esta função é para casos especiais.
 * Supabase Auth já verifica senhas automaticamente.
 * 
 * @param password Senha em texto plano
 * @param hash Hash para comparar
 * @returns Promise<boolean> - true se senha corresponde ao hash
 * 
 * @example
 * const isValid = await verifyPassword("senha123", hash);
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    // Decodificar hash de base64
    const combined = Uint8Array.from(atob(hash), c => c.charCodeAt(0));
    
    // Extrair salt (primeiros 16 bytes)
    const salt = combined.slice(0, 16);
    const originalHash = combined.slice(16);
    
    // Hash da senha fornecida com o mesmo salt
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    const key = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );
    
    const newHash = new Uint8Array(derivedBits);
    
    // Comparar hashes
    if (newHash.length !== originalHash.length) {
      return false;
    }
    
    for (let i = 0; i < newHash.length; i++) {
      if (newHash[i] !== originalHash[i]) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Valida força da senha
 * 
 * @param password Senha a validar
 * @returns Objeto com score (0-4) e feedback
 * 
 * @example
 * const result = validatePasswordStrength("senha123");
 * // { score: 2, feedback: ["Adicione caracteres especiais", ...], isStrong: false }
 */
export function validatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  // Comprimento
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  else feedback.push('Use pelo menos 12 caracteres para maior segurança');

  // Letras minúsculas
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Adicione letras minúsculas');

  // Letras maiúsculas
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Adicione letras maiúsculas');

  // Números
  if (/[0-9]/.test(password)) score++;
  else feedback.push('Adicione números');

  // Caracteres especiais
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('Adicione caracteres especiais (!@#$%^&*)');

  // Padrões comuns (reduz score)
  const commonPatterns = [
    /^123/,
    /abc/i,
    /password/i,
    /qwerty/i,
    /admin/i,
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push('Evite padrões comuns ou palavras óbvias');
      break;
    }
  }

  // Normalizar score para 0-4
  const normalizedScore = Math.min(4, Math.max(0, Math.floor((score / 6) * 4)));

  return {
    score: normalizedScore,
    feedback,
    isStrong: normalizedScore >= 3,
  };
}

/**
 * Gera senha aleatória segura
 * 
 * @param length Comprimento da senha (padrão: 16)
 * @param options Opções de geração
 * @returns Senha aleatória
 * 
 * @example
 * const password = generateSecurePassword(20, { includeSymbols: true });
 */
export function generateSecurePassword(
  length: number = 16,
  options: {
    includeLowercase?: boolean;
    includeUppercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
  } = {}
): string {
  const {
    includeLowercase = true,
    includeUppercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  let chars = '';
  if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) chars += '0123456789';
  if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (chars.length === 0) {
    throw new Error('At least one character type must be included');
  }

  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += chars.charAt(array[i] % chars.length);
  }

  return password;
}

// ===== TOKEN GENERATION =====

/**
 * Gera token aleatório seguro
 * 
 * @param length Comprimento em bytes (padrão: 32)
 * @returns Token em formato hexadecimal
 * 
 * @example
 * const token = generateSecureToken(32);
 * // Retorna: "a7b9c3d2e8f1g4h6..."
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Gera UUID v4
 * 
 * @returns UUID no formato padrão
 * 
 * @example
 * const uuid = generateUUID();
 * // Retorna: "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateUUID(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback para ambientes que não suportam crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ===== SANITIZATION =====

/**
 * Sanitiza string para prevenir XSS
 * 
 * @param input String a sanitizar
 * @returns String sanitizada
 * 
 * @example
 * const safe = sanitizeInput("<script>alert('xss')</script>");
 * // Retorna: "<script>alert('xss')</script>"
 */
export function sanitizeInput(input: string): string {
  const map: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Remove caracteres não alfanuméricos
 * 
 * @param input String a limpar
 * @param allowSpaces Permitir espaços (padrão: true)
 * @returns String limpa
 * 
 * @example
 * const clean = cleanAlphanumeric("Hello! @World#123", false);
 * // Retorna: "HelloWorld123"
 */
export function cleanAlphanumeric(
  input: string,
  allowSpaces: boolean = true
): string {
  const pattern = allowSpaces ? /[^a-zA-Z0-9\s]/g : /[^a-zA-Z0-9]/g;
  return input.replace(pattern, '');
}

// ===== EXPORTS =====

export default {
  // Activation Keys
  generateActivationKey,
  generateMultipleActivationKeys,
  validateActivationKey,
  formatActivationKey,

  // Password Hashing (Supabase gerencia automaticamente)
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateSecurePassword,

  // Token Generation
  generateSecureToken,
  generateUUID,

  // Sanitization
  sanitizeInput,
  cleanAlphanumeric,
};
