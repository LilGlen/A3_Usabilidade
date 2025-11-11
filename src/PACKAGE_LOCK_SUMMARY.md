# 📦 package-lock.json - Resumo Executivo

Resumo rápido sobre o arquivo `package-lock.json` do sistema antigo.

## ⚠️ Aviso Importante

Este arquivo é do **SISTEMA ANTIGO** (Node.js).  
**NÃO execute** `npm install` baseado nele!

O projeto usa **Deno** no backend (sem npm).

---

## 📋 O Que Era

Lock file de dependências npm do sistema Node.js + Express + SQLite.

**Dependências:**
- `bcryptjs` - Hash de senhas
- `dotenv` - Variáveis de ambiente
- `express` - Framework web
- `jsonwebtoken` - Autenticação JWT
- `sqlite3` - Banco de dados
- `nodemon` - Hot reload (dev)

**Tamanho original:** ~10,000 linhas (versão simplificada: ~400 linhas)

---

## 🔄 O Que É Agora

### Backend (Deno + Supabase)

```typescript
// Sem package.json
// Sem package-lock.json
// Sem npm install
// Sem node_modules/

// Imports diretos
import { Hono } from 'npm:hono@4';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Deno gerencia automaticamente!
```

### Frontend (React + Vite)

```json
// Frontend TEM package.json próprio
{
  "dependencies": {
    "react": "^18.2.0",
    "tailwindcss": "^3.4.0",
    ...
  }
}
```

**Importante:** O `package-lock.json` na raiz é do backend antigo, não do frontend!

---

## 📊 Comparação Rápida

| Aspecto | Node.js (Antigo) | Deno (Novo) |
|---------|------------------|-------------|
| Package manager | npm | Deno |
| Lock file | package-lock.json | deno.lock (auto) |
| Install | `npm install` (30s) | Automático (1s) |
| Size | 150MB | 5MB |
| Packages | 500+ | 10-20 |

**Redução:** -97% em tamanho!

---

## 🚫 NÃO Faça Isso

```bash
# ❌ NÃO
npm install  # (baseado no package-lock.json antigo)
node index.js

# ❌ TAMBÉM NÃO
npm start
npm run dev  # (se configurado para backend antigo)
```

---

## ✅ Faça Isso

```bash
# Frontend (React)
npm install  # Usa package.json do frontend
npm run dev

# Backend (Supabase - já em produção)
# Não precisa de nada!
# URL: https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03

# Ou localmente (opcional):
supabase functions serve make-server-23051d03
```

---

## 📚 Documentação Completa

- **[PACKAGE_LOCK_README.md](PACKAGE_LOCK_README.md)** - README detalhado (200+ linhas)
- **[NODE_TO_DENO_MIGRATION.md](NODE_TO_DENO_MIGRATION.md)** - Guia completo de migração
- **[LEGACY_FILES_SUMMARY.md](LEGACY_FILES_SUMMARY.md)** - Todos os arquivos legacy
- **[INDEX_MIGRATION_GUIDE.md](INDEX_MIGRATION_GUIDE.md)** - Migração Express → Hono

---

## 🎯 Status

| Item | Status |
|------|--------|
| **Arquivo** | ✅ Criado (referência) |
| **Documentação** | ✅ Completa |
| **Sistema Antigo** | ❌ Não funciona |
| **Sistema Novo** | ✅ Funcionando em produção |

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Arquivo:** Referência Histórica  
**NÃO instalar!**
