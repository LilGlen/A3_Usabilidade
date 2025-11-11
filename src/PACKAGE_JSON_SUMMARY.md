# 📦 package.json - Resumo Executivo

Resumo rápido sobre o arquivo `package.json` do sistema antigo.

## ⚠️ Aviso Importante

Este arquivo é do **BACKEND ANTIGO** (Node.js).  
**NÃO execute** `npm install` ou `npm start`!

O backend atual usa **Deno** (sem package.json).

---

## 📋 O Que Era

Configuração npm do backend Node.js + Express + SQLite.

**Informações:**
- Nome: `vendas-api`
- Versão: `1.0.0`
- Main: `index.js`
- Autor: Adailton de Jesus Cerqueira Junior

**Scripts:**
```json
{
  "start": "nodemon index.js",
  "generate:jwt-secret": "node -e \"...\""
}
```

**Dependências:** 6 (express, sqlite3, bcryptjs, jsonwebtoken, dotenv, nodemon)

---

## 🔄 O Que É Agora

### Backend (Deno + Supabase)

**SEM package.json!**

```typescript
// Imports diretos
import { Hono } from 'npm:hono@4';

// Sem npm install
// Sem configuração
// TypeScript nativo
```

### Frontend (React + Vite)

**Frontend TEM package.json próprio** (diferente deste!)

```json
{
  "name": "synthx-frontend",
  "dependencies": {
    "react": "^18.2.0",
    "tailwindcss": "^3.4.0",
    ...
  }
}
```

**Importante:** Este `package.json` na raiz é do backend antigo, NÃO do frontend!

---

## 📊 Comparação Rápida

### Scripts

| Script Antigo | Comando Novo | Status |
|---------------|--------------|--------|
| `npm start` | `supabase functions serve` | ✅ Substituído |
| `npm run generate:jwt-secret` | Não necessário (Supabase Auth) | ✅ Removido |
| `npm test` | Testes via Postman | ⚠️ Não tinha |

### Dependências

| Antigo | Novo | Benefício |
|--------|------|-----------|
| express | Hono | +200% performance |
| sqlite3 | KV Store | Distribuído |
| bcryptjs | Supabase Auth | Hash automático |
| jsonwebtoken | Supabase Auth | JWT gerenciado |
| dotenv | Deno.env | Built-in |
| nodemon | supabase serve | Integrado |

**Total:** 6 deps → 0 deps npm!

---

## 🚫 NÃO Faça Isso

```bash
# ❌ NÃO
npm install
npm start
npm run generate:jwt-secret
node index.js
```

**Por quê?**
- Backend migrado para Deno
- Scripts não funcionam
- Dependências antigas
- index.js é apenas referência

---

## ✅ Faça Isso

```bash
# Backend (Supabase - já em produção)
curl https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03/health

# Ou localmente (opcional)
supabase functions serve make-server-23051d03

# Frontend (React)
npm install  # Usa package.json do frontend
npm run dev
```

---

## 📚 Documentação Completa

- **[PACKAGE_JSON_README.md](PACKAGE_JSON_README.md)** - README detalhado (400+ linhas)
- **[NODE_TO_DENO_MIGRATION.md](NODE_TO_DENO_MIGRATION.md)** - Migração npm → Deno
- **[LEGACY_FILES_SUMMARY.md](LEGACY_FILES_SUMMARY.md)** - Todos os arquivos legacy
- **[PACKAGE_LOCK_README.md](PACKAGE_LOCK_README.md)** - Sobre package-lock.json

---

## 🎯 Status

| Item | Status |
|------|--------|
| **Arquivo** | ✅ Criado (referência) |
| **Documentação** | ✅ Completa (400+ linhas) |
| **Sistema Antigo** | ❌ Não funciona |
| **Sistema Novo** | ✅ Funcionando (Deno) |

---

## 💡 Notas Importantes

### 1. Backend vs Frontend

- **Este package.json:** Backend antigo (Node.js)
- **Frontend:** Pode ter package.json próprio (React/Vite)
- **Backend atual:** SEM package.json (usa Deno)

### 2. Comandos npm

- **Frontend:** `npm install`, `npm run dev` ✅ OK
- **Backend:** NÃO use npm! Use Deno/Supabase ❌

### 3. Confusão Comum

```bash
# Se você ver package.json na raiz:
cat package.json

# Se tiver "express", "sqlite3" → Backend antigo (este)
# Se tiver "react", "vite" → Frontend atual
```

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Arquivo:** Referência Histórica (Backend Antigo)  
**NÃO executar!** Backend usa Deno
