/**
 * Supabase Configuration - SYNTHX Digital Game Store
 * 
 * Configuração centralizada do Supabase com suporte a variáveis de ambiente.
 * 
 * Ordem de prioridade:
 * 1. Variáveis de ambiente (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * 2. Valores do arquivo info.tsx (auto-gerado)
 */

import { projectId as defaultProjectId, publicAnonKey as defaultAnonKey } from './info';

// ============================================
// CONFIGURATION
// ============================================

/**
 * Obtém URL do Supabase
 * 
 * Prioridade:
 * 1. VITE_SUPABASE_URL (variável de ambiente)
 * 2. Construído a partir de projectId do info.tsx
 */
export const getSupabaseUrl = (): string => {
  // Tentar obter de variável de ambiente primeiro
  if (import.meta.env.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  
  // Fallback: construir a partir do projectId
  return `https://${defaultProjectId}.supabase.co`;
};

/**
 * Obtém chave pública do Supabase
 * 
 * Prioridade:
 * 1. VITE_SUPABASE_ANON_KEY (variável de ambiente)
 * 2. publicAnonKey do info.tsx
 */
export const getSupabaseAnonKey = (): string => {
  // Tentar obter de variável de ambiente primeiro
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  
  // Fallback: usar valor do info.tsx
  return defaultAnonKey;
};

/**
 * Obtém URL completa da API
 */
export const getApiUrl = (): string => {
  const baseUrl = getSupabaseUrl();
  return `${baseUrl}/functions/v1/make-server-23051d03`;
};

/**
 * Obtém Project ID
 */
export const getProjectId = (): string => {
  // Se houver VITE_SUPABASE_URL, extrair project ID dela
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl) {
    const match = envUrl.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
    if (match) {
      return match[1];
    }
  }
  
  // Fallback: usar projectId do info.tsx
  return defaultProjectId;
};

// ============================================
// EXPORTS
// ============================================

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey = getSupabaseAnonKey();
export const apiUrl = getApiUrl();
export const projectId = getProjectId();

// ============================================
// CONFIGURATION OBJECT
// ============================================

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  apiUrl: apiUrl,
  projectId: projectId,
};

// Default export
export default supabaseConfig;

// ============================================
// ENVIRONMENT INFO (Development only)
// ============================================

if (import.meta.env.DEV) {
  console.log('🔧 Supabase Configuration:');
  console.log('  Project ID:', projectId);
  console.log('  URL:', supabaseUrl);
  console.log('  API URL:', apiUrl);
  console.log('  Using env vars:', {
    url: !!import.meta.env.VITE_SUPABASE_URL,
    anonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  });
}
