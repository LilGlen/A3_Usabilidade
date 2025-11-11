# 📄 index.js - Arquivo de Referência Histórica

## ⚠️ IMPORTANTE

Este arquivo (`/index.js`) é do **SISTEMA ANTIGO** (Node.js + Express + SQLite).

O projeto foi **completamente migrado** para **Supabase Functions** (Deno + Hono + KV Store).

## 🚫 NÃO Executar

**Não execute** `node index.js`!

O servidor antigo não funciona mais porque:
- ❌ Rotas foram movidas para `/supabase/functions/server/routes.tsx`
- ❌ Controllers foram consolidados em `DatabaseService.tsx`
- ❌ SQLite foi substituído por KV Store
- ❌ Express foi substituído por Hono
- ❌ Node.js foi substituído por Deno

## ✅ Novo Entry Point

**Use o novo sistema:**

```bash
# Local (desenvolvimento)
supabase functions serve make-server-23051d03

# Produção
https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03
```

**Arquivo:** `/supabase/functions/server/index.tsx`

## 📚 Documentação

Para entender a migração:

1. **[INDEX_MIGRATION_GUIDE.md](INDEX_MIGRATION_GUIDE.md)** - Guia completo de migração
2. **[SETUP.md](SETUP.md)** - Como usar o novo sistema
3. **[QUICKSTART.md](QUICKSTART.md)** - Setup em 3 minutos
4. **[/supabase/functions/server/](supabase/functions/server/)** - Código do novo servidor

## 🔄 Comparação Rápida

| Aspecto | Antigo (index.js) | Novo (index.tsx) |
|---------|-------------------|------------------|
| **Arquivo** | `/index.js` | `/supabase/functions/server/index.tsx` |
| **Framework** | Express | Hono |
| **Runtime** | Node.js | Deno |
| **Database** | SQLite | KV Store |
| **Deploy** | VPS/Heroku | Supabase Edge |
| **URL** | `http://localhost:3000/api/v1` | `https://...supabase.co/.../make-server-23051d03` |

## 📋 Propósito deste Arquivo

Este arquivo (`index.js`) é mantido apenas para:

✅ **Referência histórica** - Ver como era o sistema antigo  
✅ **Comparação** - Entender as mudanças feitas  
✅ **Documentação** - Aprender sobre a arquitetura anterior  
✅ **Educação** - Estudar migração Express → Hono  

## 🎯 Como Usar o Novo Sistema

### 1. Setup Rápido (3 min)

```bash
# 1. Clone
git clone https://github.com/seu-usuario/synthx.git
cd synthx

# 2. Configure .env
cp .env.example .env
nano .env

# 3. Instale deps
npm install

# 4. Execute frontend
npm run dev

# Backend já está em produção!
# https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03
```

### 2. Testar API

```bash
# Health check
curl https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03/health

# Seed database
curl -X POST https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03/seed

# List games
curl https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03/games
```

### 3. Deploy (se modificar backend)

```bash
# Login
supabase login

# Deploy
supabase functions deploy make-server-23051d03

# Ver logs
supabase functions logs make-server-23051d03 --tail
```

## 📊 Estrutura de Arquivos

### Antigo (Sistema Node.js)

```
/
├── index.js              ← Entry point (ESTE ARQUIVO)
├── routes/
│   └── v1/
│       ├── index.js
│       ├── auth.js
│       ├── jogos.js
│       └── ...
├── controllers/
│   ├── AuthController.js
│   └── ...
└── dao/
    ├── JogoDAO.js
    └── ...
```

### Novo (Sistema Supabase)

```
/supabase/functions/server/
├── index.tsx             ← Novo entry point
├── routes.tsx            ← Todas as rotas (49 endpoints)
├── DatabaseService.tsx   ← CRUD unificado
├── kv_store.tsx          ← Database utilities
└── seed.tsx              ← Seed data
```

## 🔗 Links Úteis

### Documentação do Projeto

- **[INDEX_MIGRATION_GUIDE.md](INDEX_MIGRATION_GUIDE.md)** - Migração index.js → index.tsx
- **[SETUP.md](SETUP.md)** - Setup completo
- **[QUICKSTART.md](QUICKSTART.md)** - Setup rápido
- **[API_ENDPOINTS.md](supabase/functions/server/API_ENDPOINTS.md)** - 49 endpoints REST
- **[ROUTES_MAPPING.md](supabase/functions/server/ROUTES_MAPPING.md)** - Mapeamento de rotas

### Documentação Externa

- **Supabase Functions:** https://supabase.com/docs/guides/functions
- **Hono Framework:** https://hono.dev
- **Deno Runtime:** https://deno.land

## ❓ FAQ

### Por que manter index.js se não é mais usado?

Para referência histórica e educação. É útil para:
- Entender a evolução do projeto
- Comparar arquiteturas
- Aprender sobre migração de sistemas

### Posso deletar index.js?

Sim, mas não é recomendado. É útil ter como referência.

### O sistema antigo ainda funciona?

Não. As dependências (routes, controllers, DAOs) foram movidas/refatoradas.

### Como executar o novo sistema?

Veja [SETUP.md](SETUP.md) ou [QUICKSTART.md](QUICKSTART.md).

### Onde está o código do novo servidor?

Em `/supabase/functions/server/index.tsx` e `routes.tsx`.

## ✅ Checklist

Se você está vendo este arquivo pela primeira vez:

- [ ] Leu este README completo
- [ ] Entendeu que index.js é ANTIGO
- [ ] Sabe que o novo entry point é `/supabase/functions/server/index.tsx`
- [ ] Leu [INDEX_MIGRATION_GUIDE.md](INDEX_MIGRATION_GUIDE.md)
- [ ] Seguiu [SETUP.md](SETUP.md) ou [QUICKSTART.md](QUICKSTART.md)
- [ ] Testou o novo sistema
- [ ] **NÃO** tentou executar `node index.js`

## 🎉 Conclusão

`index.js` faz parte da **história** do projeto SYNTHX.

O projeto evoluiu para uma **arquitetura moderna**:
- ✅ TypeScript 100%
- ✅ Serverless (Supabase Edge Functions)
- ✅ Type-safe (Zod validation)
- ✅ Distribuído (KV Store)
- ✅ Escalável (auto-scaling)
- ✅ Rápido (Hono > Express)
- ✅ Seguro (Supabase managed secrets)

**Use o novo sistema!** 🚀

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Status:** Arquivo de Referência Histórica

**Não executar!** Use `/supabase/functions/server/index.tsx`
