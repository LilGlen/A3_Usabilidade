# ✅ Ações para Conformidade Completa com Escopo

Checklist de ações para atingir 100% de conformidade com o escopo definido.

**Status Atual:** 93% conforme  
**Meta:** 100% conforme

---

## 🔴 Alta Prioridade

### 1. RF15 - Implementar Lógica de Spoilers

**Status:** ⚠️ 60% implementado (campo existe)

**Backend - Adicionar Filtro** (10 min)

```typescript
// /supabase/functions/server/routes.tsx

// Adicionar query param ao GET /reviews
app.get('/make-server-23051d03/reviews', async (c) => {
  const gameId = c.req.query('gameId');
  const excludeSpoilers = c.req.query('excludeSpoilers') === 'true';
  
  let reviews = await db.getReviews(gameId);
  
  // Filtrar spoilers se solicitado
  if (excludeSpoilers) {
    reviews = reviews.filter(r => !r.hasSpoilers);
  }
  
  return c.json({ success: true, reviews });
});
```

**Frontend - Exibir com Cuidado** (15 min)

```typescript
// components/GameDetailsPage.tsx ou GameDetailsPageNew.tsx

{review.hasSpoilers ? (
  <details className="border border-yellow-500/30 p-4 rounded-lg bg-yellow-500/10">
    <summary className="cursor-pointer text-yellow-500 font-semibold">
      ⚠️ Este comentário contém spoilers (clique para revelar)
    </summary>
    <p className="mt-4 text-gray-300">{review.comment}</p>
  </details>
) : (
  <p className="text-gray-300">{review.comment}</p>
)}
```

**Checkbox ao Criar Review** (10 min)

```typescript
// components/GameDetailsPage.tsx - Formulário de review

<label className="flex items-center gap-2 mt-4">
  <input 
    type="checkbox" 
    checked={hasSpoilers}
    onChange={(e) => setHasSpoilers(e.target.checked)}
    className="w-4 h-4"
  />
  <span className="text-sm text-gray-400">
    Este comentário contém spoilers
  </span>
</label>
```

**Tempo Estimado:** 35 minutos  
**Impacto:** Alto (completa RF15)

---

### 2. RNF04 - Implementar Paginação

**Status:** ⚠️ 50% implementado (ordenação existe)

**Backend - GET /games** (20 min)

```typescript
// /supabase/functions/server/routes.tsx

app.get('/make-server-23051d03/games', async (c) => {
  // Query params
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const sortBy = c.req.query('sortBy') || 'name';
  const order = c.req.query('order') || 'asc';
  const categoria = c.req.query('categoria');
  const search = c.req.query('search');
  
  let games = await db.getAllGames();
  
  // Filtros existentes
  if (categoria) {
    games = games.filter(g => g.category === categoria);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    games = games.filter(g => 
      g.name.toLowerCase().includes(searchLower) ||
      g.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Ordenação
  games.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
  
  // Total antes de paginar
  const total = games.length;
  
  // Paginação
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedGames = games.slice(start, end);
  
  return c.json({
    success: true,
    games: paginatedGames,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: end < total,
      hasPrevious: page > 1
    }
  });
});
```

**Backend - Outros Endpoints** (30 min)

Aplicar mesma lógica em:
- `GET /reviews?gameId=...`
- `GET /purchases/history`
- `GET /companies`
- `GET /categories`

**Frontend - Componente de Paginação** (45 min)

```typescript
// components/Pagination.tsx

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-purple-600 disabled:opacity-50 rounded"
      >
        ← Anterior
      </button>
      
      <span className="text-gray-300">
        Página {currentPage} de {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-purple-600 disabled:opacity-50 rounded"
      >
        Próxima →
      </button>
    </div>
  );
}

// Uso em HomePage.tsx
const [page, setPage] = useState(1);
const limit = 20;

const { data } = await fetch(`/games?page=${page}&limit=${limit}`);

<Pagination 
  currentPage={data.pagination.page}
  totalPages={data.pagination.totalPages}
  onPageChange={setPage}
/>
```

**Tempo Estimado:** 95 minutos  
**Impacto:** Alto (completa RNF04)

---

### 3. Versionamento - Adicionar Alias /api/v1

**Status:** ⚠️ Usa `/make-server-23051d03` ao invés de `/api/v1`

**Backend - Adicionar Alias** (5 min)

```typescript
// /supabase/functions/server/index.tsx

import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';

const app = new Hono();

app.use('*', cors());

// Alias /api/v1 → /make-server-23051d03
app.all('/api/v1/*', async (c) => {
  const path = c.req.path.replace('/api/v1', '/make-server-23051d03');
  const url = new URL(c.req.url);
  url.pathname = path;
  
  // Fazer request interno
  return fetch(url.toString(), {
    method: c.req.method,
    headers: c.req.header(),
    body: c.req.method !== 'GET' ? await c.req.raw.clone().text() : undefined
  });
});

// Importar rotas existentes
import { setupRoutes } from './routes.tsx';
setupRoutes(app);

Deno.serve(app.fetch);
```

**Documentação - Atualizar** (10 min)

```markdown
<!-- API_ENDPOINTS.md -->

## Base URLs

**Produção (recomendado):**
- Principal: `https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/api/v1`
- Legacy: `https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03`

**Local:**
- Principal: `http://localhost:54321/functions/v1/api/v1`
- Legacy: `http://localhost:54321/functions/v1/make-server-23051d03`

**Nota:** Ambos os prefixos funcionam identicamente. Use `/api/v1` para seguir padrão RESTful.
```

**Tempo Estimado:** 15 minutos  
**Impacto:** Médio (conformidade com padrão)

---

## 🟡 Média Prioridade

### 4. RF01 - Tornar Birth Date Obrigatório

**Tempo:** 5 minutos

```typescript
// types/validators.ts

export const SignupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  birthDate: z.string().min(1, "Birth date is required"), // Tornar obrigatório
  role: z.enum(["user", "admin"]).optional()
});
```

**Frontend - Adicionar Campo**

```typescript
// components/AuthModal.tsx - Signup form

<input
  type="date"
  placeholder="Data de Nascimento"
  value={birthDate}
  onChange={(e) => setBirthDate(e.target.value)}
  required
  className="w-full px-4 py-2 bg-gray-800 rounded"
/>
```

---

### 5. Busca Avançada

**Tempo:** 30 minutos

```typescript
// Backend - GET /games com mais filtros

app.get('/make-server-23051d03/games', async (c) => {
  const minPrice = parseFloat(c.req.query('minPrice') || '0');
  const maxPrice = parseFloat(c.req.query('maxPrice') || '999999');
  const minYear = parseInt(c.req.query('minYear') || '1900');
  const maxYear = parseInt(c.req.query('maxYear') || '2100');
  const minRating = parseFloat(c.req.query('minRating') || '0');
  
  let games = await db.getAllGames();
  
  // Filtros de preço
  games = games.filter(g => g.price >= minPrice && g.price <= maxPrice);
  
  // Filtros de ano
  games = games.filter(g => g.ano >= minYear && g.ano <= maxYear);
  
  // Filtro de rating
  games = games.filter(g => g.rating >= minRating);
  
  return c.json({ success: true, games });
});

// Exemplo de uso:
// GET /games?minPrice=0&maxPrice=50&minYear=2020&minRating=4
```

---

## 🟢 Baixa Prioridade

### 6. Rate Limiting

**Tempo:** 60 minutos

```typescript
// /supabase/functions/server/middleware/rateLimit.tsx

const requestCounts = new Map<string, { count: number, resetAt: number }>();

export function rateLimit(limit = 100, windowMs = 60000) {
  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    const record = requestCounts.get(ip);
    
    if (!record || now > record.resetAt) {
      requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }
    
    if (record.count >= limit) {
      return c.json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((record.resetAt - now) / 1000)} seconds.`
      }, 429);
    }
    
    record.count++;
    await next();
  };
}

// Uso:
app.use('*', rateLimit(100, 60000)); // 100 req/min
```

---

### 7. Logs Estruturados

**Tempo:** 45 minutos

```typescript
// /supabase/functions/server/utils/logger.tsx

export function log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };
  
  console.log(JSON.stringify(logEntry));
}

// Uso:
log('info', 'User signed up', { userId: user.id, email: user.email });
log('error', 'Failed to create game', { error: error.message });
```

---

### 8. Testes Automatizados

**Tempo:** 4-8 horas

```typescript
// /supabase/functions/server/tests/auth.test.ts

import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";

Deno.test("POST /auth/signup - should create user", async () => {
  const response = await fetch('http://localhost:54321/functions/v1/api/v1/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test1234',
      birthDate: '1990-01-01'
    })
  });
  
  const data = await response.json();
  
  assertEquals(response.status, 201);
  assertEquals(data.success, true);
  assertEquals(data.user.name, 'Test User');
});

// Executar:
// deno test --allow-net
```

---

## 📋 Checklist Completo

### Alta Prioridade (145 min)

- [ ] RF15 - Spoilers no backend (10 min)
- [ ] RF15 - Spoilers no frontend (25 min)
- [ ] RNF04 - Paginação em /games (20 min)
- [ ] RNF04 - Paginação em outros endpoints (30 min)
- [ ] RNF04 - Componente Pagination no frontend (45 min)
- [ ] Versionamento - Alias /api/v1 (15 min)

### Média Prioridade (35 min)

- [ ] RF01 - Birth date obrigatório (5 min)
- [ ] Busca avançada (30 min)

### Baixa Prioridade (5-9 horas)

- [ ] Rate limiting (60 min)
- [ ] Logs estruturados (45 min)
- [ ] Testes automatizados (4-8h)

---

## 🎯 Plano de Execução Recomendado

### Fase 1: Conformidade (145 min = 2.5h)

Implementar todos os itens de alta prioridade.

**Resultado:** 100% de conformidade com escopo.

### Fase 2: Melhorias (35 min)

Implementar itens de média prioridade.

**Resultado:** API mais robusta e user-friendly.

### Fase 3: Qualidade (5-9h)

Implementar itens de baixa prioridade.

**Resultado:** API production-ready com monitoramento e testes.

---

## 📊 Impacto por Ação

| Ação | Tempo | Impacto | Prioridade |
|------|-------|---------|------------|
| RF15 Spoilers | 35 min | +7% conformidade | 🔴 Alta |
| RNF04 Paginação | 95 min | +5% conformidade | 🔴 Alta |
| Versionamento /api/v1 | 15 min | +5% conformidade | 🔴 Alta |
| Birth date obrigatório | 5 min | +1% conformidade | 🟡 Média |
| Busca avançada | 30 min | UX melhorado | 🟡 Média |
| Rate limiting | 60 min | Segurança | 🟢 Baixa |
| Logs | 45 min | Debugging | 🟢 Baixa |
| Testes | 4-8h | Qualidade | 🟢 Baixa |

---

## ✅ Resultado Esperado

**Após Fase 1:**
- Conformidade: 93% → 100% ✅
- Tempo: 2.5 horas
- Status: TOTALMENTE CONFORME

**Após Fase 2:**
- Conformidade: 100% + melhorias
- Tempo: +35 minutos
- Status: OTIMIZADO

**Após Fase 3:**
- Conformidade: 100% + melhorias + qualidade
- Tempo: +5-9 horas
- Status: PRODUCTION-READY

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Próximo passo:** Executar Fase 1 (alta prioridade) para atingir 100% de conformidade
