# 🔧 SYNTHX - Troubleshooting Guide

## Erro 500 - Internal Server Error

### ⚠️ Problema 1: Tslib Module Not Found (CORRIGIDO ✅)

**Erro:** 
```
Cannot find module 'tslib'
Error loading @supabase/supabase-js
```

**Causa Raiz:** Importação incorreta do Supabase usando `npm:` ao invés de `jsr:` no Deno Edge Functions.

**Solução Aplicada:**
1. ✅ Alterado de `npm:@supabase/supabase-js` para `jsr:@supabase/supabase-js@2.49.8`
2. ✅ Aplicado em todos os arquivos do servidor (index.tsx, routes.tsx)
3. ✅ Usado versão específica para consistência

**Código Correto:**
```typescript
// ❌ ERRADO (não funciona no Deno)
import { createClient } from "npm:@supabase/supabase-js";

// ✅ CORRETO (funciona no Deno Edge Functions)
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
```

### Problema 2: API 500 após Versionamento (CORRIGIDO ✅)

**Erro:** API retornando erro 500 após implementação de versionamento.

**Causa Raiz:** Middleware de versionamento criava requisições recursivas que causavam loops infinitos.

**Solução Aplicada:**
1. ✅ Removido middleware problemático de `/api/v1/*`
2. ✅ Adicionado global error handler com logging detalhado
3. ✅ Adicionado 404 handler para rotas não encontradas
4. ✅ Documentado versionamento como padrão recomendado sem implementação de redirecionamento

### Verificações de Saúde

#### 1. Testar Health Check
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-23051d03/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T..."
}
```

#### 2. Verificar Logs do Servidor

Os logs agora incluem informações detalhadas:
```
Global error handler caught: <erro>
Error stack: <stack trace>
Request path: <caminho>
Request method: <método>
```

#### 3. Testar Autenticação

```bash
# Login
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-23051d03/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@synthx.com","password":"admin123"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "token": "eyJ...",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@synthx.com",
    "role": "admin"
  }
}
```

## Erros Comuns

### 1. Erro 401 - Unauthorized

**Causa:** Token JWT inválido ou expirado.

**Solução:**
```bash
# 1. Fazer login novamente para obter novo token
# 2. Verificar se o header Authorization está correto:
Authorization: Bearer <seu-token-aqui>
```

### 2. Erro 403 - Forbidden

**Causa:** Usuário não tem permissão para acessar o recurso.

**Soluções:**
- ✅ Verificar se o usuário é admin (para rotas admin)
- ✅ Verificar se o usuário está tentando acessar seus próprios dados
- ✅ Conferir o campo `role` no metadata do usuário

### 3. Erro 404 - Not Found

**Causa:** Rota não existe ou ID do recurso não encontrado.

**Soluções:**
- ✅ Verificar se a URL está correta
- ✅ Conferir se o prefixo `/make-server-23051d03` está presente
- ✅ Verificar se o ID do recurso existe no banco

### 4. Banco de Dados Vazio

**Causa:** Seed não foi executado.

**Solução:**
```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-23051d03/seed
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "stats": {
    "companies": 15,
    "categories": 13,
    "games": 20,
    "users": 2
  }
}
```

### 5. CORS Errors

**Causa:** Problemas de CORS no navegador.

**Verificação:**
```javascript
// As headers CORS estão configuradas:
allowHeaders: ["Content-Type", "Authorization"]
allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
origin: "*"
```

**Solução:**
- ✅ Verificar se o servidor está respondendo com headers CORS
- ✅ Conferir se OPTIONS preflight está funcionando

## Comandos Úteis de Debug

### 1. Testar Todas as Rotas Principais

```bash
# Health check
curl https://{projectId}.supabase.co/functions/v1/make-server-23051d03/health

# Companies (público)
curl https://{projectId}.supabase.co/functions/v1/make-server-23051d03/companies

# Categories (público)
curl https://{projectId}.supabase.co/functions/v1/make-server-23051d03/categories

# Games com paginação (público)
curl "https://{projectId}.supabase.co/functions/v1/make-server-23051d03/games?page=1&limit=5"

# Login
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-23051d03/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Verificar token (autenticado)
curl https://{projectId}.supabase.co/functions/v1/make-server-23051d03/auth/verify \
  -H "Authorization: Bearer <seu-token>"
```

### 2. Verificar Paginação

```bash
# Página 1
curl "https://{projectId}.supabase.co/functions/v1/make-server-23051d03/games?page=1&limit=5"

# Página 2
curl "https://{projectId}.supabase.co/functions/v1/make-server-23051d03/games?page=2&limit=5"

# Ordenação
curl "https://{projectId}.supabase.co/functions/v1/make-server-23051d03/games?sortBy=name&order=asc"

# Busca
curl "https://{projectId}.supabase.co/functions/v1/make-server-23051d03/games?search=witcher"
```

### 3. Verificar Spoilers em Reviews

```bash
# Criar review com spoiler
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-23051d03/avaliacoes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jogoId": "game-1",
    "nota": 5,
    "comentario": "Final incrível!",
    "hasSpoilers": true
  }'

# Listar sem spoilers
curl "https://{projectId}.supabase.co/functions/v1/make-server-23051d03/avaliacoes?excludeSpoilers=true" \
  -H "Authorization: Bearer <token>"
```

## Problemas de Performance

### 1. Muitos Jogos Carregando Lentamente

**Causa:** Muitos jogos no banco sem paginação.

**Solução:** ✅ Já implementado! Use paginação:
```
GET /games?page=1&limit=20
```

### 2. Reviews Carregando Lentamente

**Causa:** Muitas reviews sendo buscadas.

**Solução:** 
- ✅ Implementar paginação em `/avaliacoes` (opcional)
- ✅ Usar filtro `?jogoId=<id>` para reviews de um jogo específico

## Logs de Debug

### Global Error Handler

O servidor agora loga todas as informações importantes:

```typescript
app.onError((err, c) => {
  console.error('Global error handler caught:', err);
  console.error('Error stack:', err.stack);
  console.error('Request path:', c.req.path);
  console.error('Request method:', c.req.method);
  
  return c.json({
    error: 'Internal server error',
    message: err.message,
    path: c.req.path,
    method: c.req.method
  }, 500);
});
```

### 404 Handler

```typescript
app.notFound((c) => {
  console.log('404 Not Found:', c.req.path);
  return c.json({
    error: 'Not Found',
    message: `Route ${c.req.path} not found`,
    path: c.req.path
  }, 404);
});
```

## Checklist de Verificação

Quando encontrar um erro:

- [ ] Verificar health check está respondendo
- [ ] Conferir se seed foi executado
- [ ] Validar token JWT (se aplicável)
- [ ] Verificar permissões do usuário
- [ ] Conferir logs do servidor
- [ ] Testar com curl para isolar problemas de frontend
- [ ] Verificar se a rota existe na documentação
- [ ] Confirmar formato do JSON enviado
- [ ] Validar IDs de recursos (games, companies, etc.)

## Contato e Suporte

Se o problema persistir:

1. ✅ Verificar `IMPLEMENTATION_COMPLETE.md` para conformidade
2. ✅ Consultar `API_ENDPOINTS.md` para lista completa de rotas
3. ✅ Ver `DATABASE_STRUCTURE.md` para estrutura de dados
4. ✅ Revisar logs do servidor no Supabase Dashboard

## Frontend Warnings

### 1. Duplicate Keys in React

**Warning:**
```
Warning: Encountered two children with the same key
Keys should be unique so that components maintain their identity
```

**Causa:** Arrays com items duplicados sendo renderizados com mesma `key`.

**Solução Aplicada:**
1. ✅ Filtrar duplicatas usando `Map` antes de renderizar
2. ✅ Adicionar índice nas keys: `key={`item-${item.id}-${index}`}`

**Código Correto:**
```typescript
// Remover duplicatas por ID
const uniqueCompanies = Array.from(
  new Map(companies.map((c: any) => [c.id, c])).values()
);

// Usar key única com índice
{uniqueCompanies.map((company, index) => (
  <SelectItem key={`company-${company.id}-${index}`} value={company.name}>
    {company.name}
  </SelectItem>
))}
```

**Arquivos Corrigidos:**
- ✅ `/components/ManagementPageNew.tsx`
- ✅ `/components/ManagementPage.tsx`

---

**Última Atualização:** 2025-01-20  
**Status:** ✅ Todos os erros conhecidos corrigidos
