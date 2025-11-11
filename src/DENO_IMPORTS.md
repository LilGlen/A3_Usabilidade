# 📦 DENO Imports Guide - NPM vs JSR

## Visão Geral

No Deno Edge Functions (usado pelo Supabase), existem diferentes formas de importar pacotes. É crucial usar a forma correta para cada pacote.

## Tipos de Importação

### 1. JSR (JavaScript Registry) - Recomendado ✅

JSR é o registry nativo do Deno, otimizado para o ecossistema Deno.

**Sintaxe:**
```typescript
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
```

**Quando usar:**
- ✅ Pacotes Supabase (`@supabase/*`)
- ✅ Pacotes nativos do Deno
- ✅ Pacotes que têm versões JSR específicas

**Vantagens:**
- ✅ Compatibilidade total com Deno
- ✅ Sem dependências extras (como tslib)
- ✅ Melhor performance
- ✅ Tree-shaking automático

### 2. NPM (Node Package Manager)

NPM permite usar pacotes do Node.js no Deno, mas nem sempre funciona perfeitamente.

**Sintaxe:**
```typescript
import { Hono } from "npm:hono";
```

**Quando usar:**
- ✅ Pacotes que não têm versão JSR
- ✅ Pacotes simples sem muitas dependências Node.js
- ⚠️ Usar com cautela

**Desvantagens:**
- ⚠️ Pode ter problemas com dependências (como tslib, process, etc.)
- ⚠️ Pode não funcionar em Edge Runtime
- ⚠️ Performance inferior

### 3. HTTPS (Imports Diretos)

Deno permite importar diretamente via URL.

**Sintaxe:**
```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
```

**Quando usar:**
- ✅ Módulos Deno Standard Library
- ✅ Pacotes hospedados em CDN (deno.land, esm.sh)
- ⚠️ Evitar em produção (preferir JSR ou NPM)

## Guia de Pacotes SYNTHX

### ✅ Usar JSR

| Pacote | Importação Correta | Motivo |
|--------|-------------------|--------|
| Supabase Client | `jsr:@supabase/supabase-js@2.49.8` | Pacote oficial Deno |
| Supabase Auth | `jsr:@supabase/auth-js@2` | Nativo Deno |

### ✅ Usar NPM

| Pacote | Importação Correta | Motivo |
|--------|-------------------|--------|
| Hono | `npm:hono` | Framework web, compatível |
| Hono CORS | `npm:hono/cors` | Middleware Hono |
| Hono Logger | `npm:hono/logger` | Middleware Hono |

## Erros Comuns e Soluções

### ❌ Erro: Cannot find module 'tslib'

**Problema:**
```typescript
import { createClient } from "npm:@supabase/supabase-js";
```

**Solução:**
```typescript
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
```

### ❌ Erro: Cannot find module 'process'

**Problema:** Pacote NPM tentando usar `process` do Node.js

**Solução 1 - Usar JSR se disponível:**
```typescript
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
```

**Solução 2 - Importar process manualmente:**
```typescript
import process from "node:process";
```

### ❌ Erro: Module not found

**Problema:** Versão não especificada

**Solução:** Sempre especificar versão:
```typescript
// ❌ Errado
import { createClient } from "jsr:@supabase/supabase-js";

// ✅ Correto
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
```

## Arquivos do Servidor SYNTHX

### `/supabase/functions/server/index.tsx`

```typescript
// ✅ CORRETO
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
```

### `/supabase/functions/server/routes.tsx`

```typescript
// ✅ CORRETO
import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
```

### `/supabase/functions/server/kv_store.tsx`

```typescript
// ✅ CORRETO (já estava correto)
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
```

## Checklist de Importações

Ao adicionar novas dependências:

- [ ] Verificar se existe versão JSR (preferir sempre)
- [ ] Se usar NPM, verificar se funciona no Deno Edge Runtime
- [ ] Especificar versão exata
- [ ] Testar localmente antes de deploy
- [ ] Verificar logs de erro no Supabase Dashboard

## Referências

- 🔗 [JSR - JavaScript Registry](https://jsr.io/)
- 🔗 [Deno - NPM Compatibility](https://deno.land/manual/node/npm_specifiers)
- 🔗 [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- 🔗 [Hono Documentation](https://hono.dev/)

## Histórico de Problemas

### 2025-01-20: Erro tslib module not found ✅ RESOLVIDO

**Erro:**
```
Cannot find module 'tslib'
Require stack:
- @supabase/functions-js/2.76.0/dist/main/FunctionsClient.js
```

**Causa:** Uso de `npm:@supabase/supabase-js` ao invés de JSR

**Solução:** Alterado para `jsr:@supabase/supabase-js@2.49.8` em todos os arquivos

**Arquivos Corrigidos:**
1. ✅ `/supabase/functions/server/index.tsx`
2. ✅ `/supabase/functions/server/routes.tsx`

---

**Última Atualização:** 2025-01-20  
**Status:** ✅ Todas as importações corretas e funcionando
