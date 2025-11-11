# 🔄 Environment Variables - Guia de Migração

Guia completo sobre variáveis de ambiente: do sistema antigo (Node.js + SQLite) para o novo (Supabase).

## 📋 Resumo das Mudanças

### ❌ Sistema Antigo (`.env` original)

```env
DB_NAME="vendas_api.db"
APP_PORT=3000
JWT_SECRET=your_jwt_secret
```

**Características:**
- 3 variáveis apenas
- Específico para Node.js
- JWT manual
- SQLite local

### ✅ Sistema Novo (`.env` Supabase)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Características:**
- Variáveis do Supabase
- Serverless
- JWT gerenciado pelo Supabase
- KV Store distribuído

---

## 🔄 Mapeamento de Variáveis

| Variável Antiga | Status | Equivalente Novo | Observações |
|----------------|--------|------------------|-------------|
| `DB_NAME` | ❌ Removida | - | Supabase KV Store gerencia automaticamente |
| `APP_PORT` | ❌ Removida | - | Supabase Functions são serverless |
| `JWT_SECRET` | ❌ Removida | - | Supabase Auth gerencia tokens |
| - | ✅ Nova | `SUPABASE_URL` | URL do projeto Supabase |
| - | ✅ Nova | `SUPABASE_ANON_KEY` | Chave pública (frontend) |
| - | ✅ Nova | `SUPABASE_SERVICE_ROLE_KEY` | Chave privada (backend) |

---

## 📦 Estrutura de Arquivos de Ambiente

### Arquivos Criados

```
/
├── .env.example          ✅ Template com todas as variáveis
├── .env                  ⚠️  Criado por você (não commitar!)
├── .env.local            ⚠️  Opcional (desenvolvimento local)
├── .gitignore            ✅ Ignora .env automaticamente
└── utils/
    └── supabase/
        ├── info.tsx      ✅ Auto-gerado (valores padrão)
        └── config.ts     ✅ Configuração com env vars
```

### Hierarquia de Prioridade

```typescript
// utils/supabase/config.ts

1. VITE_SUPABASE_URL      (variável de ambiente)
   ↓ (se não existir)
2. info.tsx               (valor padrão)
```

---

## 🚀 Setup Rápido

### 1. Copiar Template

```bash
cp .env.example .env
```

### 2. Preencher Credenciais

Edite `.env`:

```env
# Obtenha em: https://app.supabase.com/project/_/settings/api
SUPABASE_URL=https://ceevveuntlqasbiwrlcb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Verificar

```bash
# No terminal
npm run dev

# Deve mostrar no console:
# 🔧 Supabase Configuration:
#   Project ID: ceevveuntlqasbiwrlcb
#   URL: https://ceevveuntlqasbiwrlcb.supabase.co
#   Using env vars: { url: true, anonKey: true }
```

---

## 🔧 Configuração Detalhada

### Frontend (Vite)

Variáveis de ambiente no frontend devem ter prefixo `VITE_`:

```env
# ✅ Correto - exposto no frontend
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...

# ❌ Errado - não será acessível
SUPABASE_URL=https://...
```

**Uso no código:**

```typescript
// ✅ Correto
import.meta.env.VITE_SUPABASE_URL

// ❌ Errado (Node.js style)
process.env.VITE_SUPABASE_URL
```

### Backend (Supabase Functions/Deno)

No backend (Deno), use `Deno.env.get()`:

```typescript
// ✅ Correto
const url = Deno.env.get("SUPABASE_URL");

// ❌ Errado (Node.js style)
const url = process.env.SUPABASE_URL;
```

**Configurar no Supabase:**

```bash
supabase secrets set SUPABASE_URL=https://...
supabase secrets set SUPABASE_ANON_KEY=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🔒 Segurança

### ✅ Variáveis SEGURAS para Frontend

Podem ser expostas publicamente:

```env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=https://...
VITE_DEV_MODE=true
VITE_DEBUG=false
```

### ❌ Variáveis SECRETAS (Backend apenas)

**NUNCA** exponha no frontend:

```env
SUPABASE_SERVICE_ROLE_KEY=...  # ⚠️ MUITO PERIGOSO!
SUPABASE_DB_URL=...            # ⚠️ ACESSO DIRETO AO BANCO
STRIPE_SECRET_KEY=...          # ⚠️ PAGAMENTOS
```

### Checklist de Segurança

- [ ] `.env` está no `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` não está no frontend
- [ ] `.env.example` não contém valores reais
- [ ] Secrets de produção estão no Vercel/Netlify, não no código
- [ ] Chaves são rotacionadas periodicamente

---

## 🌍 Ambientes (Development, Staging, Production)

### Development (Local)

```env
# .env.local
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-key-...
VITE_DEV_MODE=true
VITE_DEBUG=true
```

### Staging

```env
# Configurado no Vercel/Netlify
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-key-...
VITE_DEV_MODE=false
VITE_DEBUG=true
```

### Production

```env
# Configurado no Vercel/Netlify
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-key-...
VITE_DEV_MODE=false
VITE_DEBUG=false
```

---

## 📚 Exemplos de Uso

### Exemplo 1: Usar no DatabaseService

```typescript
// utils/DatabaseService.ts
import { supabaseUrl, supabaseAnonKey } from './supabase/config';

const API_URL = `${supabaseUrl}/functions/v1/make-server-23051d03`;

class DatabaseService {
  private token: string | null = null;

  async request(endpoint: string, options: any) {
    const headers = {
      'Authorization': `Bearer ${this.token || supabaseAnonKey}`,
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    return response.json();
  }
}
```

### Exemplo 2: Criar Cliente Supabase

```typescript
// components/AuthContext.tsx
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '../utils/supabase/config';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useAuth() {
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  };
  
  return { login };
}
```

### Exemplo 3: Verificar Ambiente

```typescript
// utils/env.ts
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const debugMode = import.meta.env.VITE_DEBUG === 'true';

export function logIfDebug(...args: any[]) {
  if (debugMode) {
    console.log('[DEBUG]', ...args);
  }
}
```

---

## 🐛 Troubleshooting

### Problema: Variáveis não estão sendo lidas

**Sintoma:**
```
Error: SUPABASE_URL is undefined
```

**Soluções:**

1. **Frontend:** Verifique se tem prefixo `VITE_`
   ```env
   # ❌ Errado
   SUPABASE_URL=...
   
   # ✅ Correto
   VITE_SUPABASE_URL=...
   ```

2. **Reinicie o servidor de desenvolvimento:**
   ```bash
   # Pare (Ctrl+C) e reinicie
   npm run dev
   ```

3. **Verifique se `.env` existe:**
   ```bash
   ls -la .env
   ```

4. **Verifique se não está no `.gitignore`:**
   ```bash
   cat .gitignore | grep .env
   ```

### Problema: CORS Error

**Sintoma:**
```
Access to fetch has been blocked by CORS policy
```

**Solução:**
Verifique se `SUPABASE_URL` está correto:
```env
# ❌ Errado (sem https)
VITE_SUPABASE_URL=ceevveuntlqasbiwrlcb.supabase.co

# ✅ Correto
VITE_SUPABASE_URL=https://ceevveuntlqasbiwrlcb.supabase.co
```

### Problema: 401 Unauthorized

**Sintoma:**
```json
{ "error": "Invalid API key" }
```

**Soluções:**

1. Verifique se `SUPABASE_ANON_KEY` está correto
2. Regenere a chave no Supabase Dashboard
3. Limpe cache do navegador (`Ctrl+Shift+R`)
4. Verifique se não há espaços extras na variável

---

## 📖 Referências

### Documentação Oficial

- **Vite Env Vars:** https://vitejs.dev/guide/env-and-mode.html
- **Supabase Config:** https://supabase.com/docs/guides/getting-started
- **Vercel Env Vars:** https://vercel.com/docs/concepts/projects/environment-variables
- **Netlify Env Vars:** https://docs.netlify.com/configure-builds/environment-variables/

### Arquivos Relacionados

- `.env.example` - Template de variáveis
- `utils/supabase/config.ts` - Configuração com env vars
- `utils/supabase/info.tsx` - Valores padrão (auto-gerado)
- `SETUP.md` - Guia de setup completo
- `.gitignore` - Ignora arquivos sensíveis

---

## ✅ Checklist Final

Antes de fazer deploy:

- [ ] `.env` criado e preenchido
- [ ] `.env` está no `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` não está no frontend
- [ ] Variáveis de produção configuradas no Vercel/Netlify
- [ ] Testado em desenvolvimento local
- [ ] Testado em staging (se houver)
- [ ] Secrets do backend configurados: `supabase secrets set ...`
- [ ] Health check funciona: `GET /make-server-23051d03/health`
- [ ] Seed executado: `POST /make-server-23051d03/seed`
- [ ] Admin criado: `POST /make-server-23051d03/auth/signup`

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Sistema:** Variáveis de Ambiente Seguras e Escaláveis
