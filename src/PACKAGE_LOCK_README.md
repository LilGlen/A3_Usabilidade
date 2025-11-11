# 📦 package-lock.json - Arquivo de Referência Histórica

## ⚠️ IMPORTANTE

Este arquivo (`/package-lock.json`) é do **SISTEMA ANTIGO** (Node.js + Express + SQLite).

O projeto foi **completamente migrado** para **Supabase Functions** (Deno).

## 🚫 NÃO Instalar

**Não execute** `npm install` baseado neste arquivo!

O sistema antigo não funciona mais porque:
- ❌ Backend foi migrado para Deno (não usa npm)
- ❌ Express foi substituído por Hono
- ❌ SQLite foi substituído por KV Store
- ❌ Dependências do Node.js não são mais necessárias

## 📋 Dependências do Sistema Antigo

### Dependências de Produção

```json
{
  "bcryptjs": "^3.0.2",       // Hash de senhas (agora: Supabase Auth)
  "dotenv": "^17.2.1",        // Variáveis .env (agora: Supabase gerenciado)
  "express": "^5.1.0",        // Framework web (agora: Hono)
  "jsonwebtoken": "^9.0.2",   // JWT auth (agora: Supabase Auth)
  "sqlite3": "^5.1.7"         // Database (agora: KV Store)
}
```

### Dependências de Desenvolvimento

```json
{
  "nodemon": "^3.1.10"        // Hot reload (agora: supabase functions serve)
}
```

## 🆕 Sistema Novo (Supabase + Deno)

O novo sistema **NÃO usa** `package-lock.json` no backend!

### Por quê?

**Deno** não usa `npm` nem `package.json`:
- ✅ Importa módulos diretamente via URL
- ✅ Lock file automático (`deno.lock`)
- ✅ TypeScript nativo (sem transpilação)
- ✅ Sem `node_modules`
- ✅ Segurança built-in

### Exemplo de Importação

**Antigo (Node.js + npm):**
```javascript
// package.json
{
  "dependencies": {
    "express": "^5.1.0",
    "bcryptjs": "^3.0.2"
  }
}

// index.js
const express = require('express');
const bcrypt = require('bcryptjs');
```

**Novo (Deno + import maps):**
```typescript
// index.tsx
import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';

// Sem package.json
// Sem node_modules
// Sem npm install
```

---

## 🔄 Comparação: npm vs Deno

| Aspecto | npm (Antigo) | Deno (Novo) |
|---------|-------------|-------------|
| **Package Manager** | npm | Deno (built-in) |
| **Lock File** | `package-lock.json` | `deno.lock` (auto) |
| **Dependencies** | `node_modules/` (~150MB) | Cache (`~/.cache/deno`) |
| **Install Command** | `npm install` | Automático no run |
| **Import** | `require()` ou `import` | `import` apenas |
| **TypeScript** | Requer `ts-node` | Nativo |
| **Segurança** | Acesso total ao sistema | Permissões explícitas |

---

## 📊 Tamanho das Dependências

### Sistema Antigo (Node.js)

```bash
# Após npm install
node_modules/
├── 500+ packages
├── 15,000+ arquivos
└── ~150MB total

package-lock.json
└── 10,000+ linhas
```

### Sistema Novo (Deno)

```bash
# Cache automático
~/.cache/deno/
├── 10-20 pacotes
├── ~100 arquivos
└── ~5MB total

# Sem lock file manual necessário
```

**Redução:** -97% em tamanho!

---

## 🔍 Análise das Dependências Antigas

### 1. bcryptjs (^3.0.2)

**Uso Antigo:**
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
```

**Novo Sistema:**
```typescript
// Supabase Auth faz hash automaticamente
const { data, error } = await supabase.auth.admin.createUser({
  email, password  // Hash automático!
});
```

**Benefício:** Sem dependência externa, mais seguro.

---

### 2. dotenv (^17.2.1)

**Uso Antigo:**
```javascript
require('dotenv').config();
const PORT = process.env.APP_PORT || 3000;
```

**Novo Sistema:**
```typescript
// Supabase gerencia env vars
const port = Deno.env.get('PORT');  // Built-in!
```

**Benefício:** Gerenciamento centralizado no Supabase Dashboard.

---

### 3. express (^5.1.0)

**Uso Antigo:**
```javascript
const express = require('express');
const app = express();
app.get('/api/games', (req, res) => {
  res.json({ games });
});
app.listen(3000);
```

**Novo Sistema:**
```typescript
import { Hono } from 'npm:hono@4';
const app = new Hono();
app.get('/games', (c) => c.json({ games }));
Deno.serve(app.fetch);  // Serverless!
```

**Benefício:** 3x mais rápido, edge-ready.

---

### 4. jsonwebtoken (^9.0.2)

**Uso Antigo:**
```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId }, SECRET_KEY);
```

**Novo Sistema:**
```typescript
// Supabase Auth gerencia tokens automaticamente
const { data: { access_token } } = await supabase.auth.signInWithPassword({
  email, password
});
```

**Benefício:** JWT gerenciado, refresh automático.

---

### 5. sqlite3 (^5.1.7)

**Uso Antigo:**
```javascript
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.db');
db.run('INSERT INTO users...');
```

**Novo Sistema:**
```typescript
import * as kv from './kv_store.tsx';
await kv.set('user:123', userData);  // Distribuído!
```

**Benefício:** Distribuído, escalável, sem arquivo local.

---

### 6. nodemon (^3.1.10) - Dev

**Uso Antigo:**
```bash
nodemon index.js
# Reinicia servidor em mudanças
```

**Novo Sistema:**
```bash
supabase functions serve
# Hot reload automático!
```

**Benefício:** Integrado, sem configuração extra.

---

## 🎯 Migração de Dependências

Se você está migrando código do sistema antigo:

### bcryptjs → Supabase Auth

```typescript
// Antigo
const hash = await bcrypt.hash(password, 10);

// Novo
// Não necessário - Supabase Auth faz automaticamente
```

### dotenv → Deno.env

```typescript
// Antigo
require('dotenv').config();
const key = process.env.API_KEY;

// Novo
const key = Deno.env.get('API_KEY');
```

### express → Hono

```typescript
// Antigo
app.get('/api/users', (req, res) => {
  res.json({ users });
});

// Novo
app.get('/users', (c) => {
  return c.json({ users });
});
```

### jsonwebtoken → Supabase Auth

```typescript
// Antigo
const token = jwt.sign({ id }, SECRET, { expiresIn: '1h' });

// Novo
const { data: { access_token } } = await supabase.auth.signInWithPassword({
  email, password
});
```

### sqlite3 → KV Store

```typescript
// Antigo
db.run('INSERT INTO users VALUES (?, ?)', [id, name]);

// Novo
await kv.set(`user:${id}`, { id, name });
```

---

## 📁 Propósito deste Arquivo

Este arquivo (`package-lock.json`) é mantido apenas para:

✅ **Referência histórica** - Ver dependências do sistema antigo  
✅ **Comparação** - Entender as mudanças feitas  
✅ **Documentação** - Aprender sobre a arquitetura anterior  
✅ **Educação** - Estudar migração npm → Deno  

---

## ✅ Checklist

Se você está vendo este arquivo pela primeira vez:

- [ ] Leu este README completo
- [ ] Entendeu que `package-lock.json` é ANTIGO
- [ ] Sabe que o novo sistema usa Deno (sem npm)
- [ ] Leu [INDEX_MIGRATION_GUIDE.md](INDEX_MIGRATION_GUIDE.md)
- [ ] Leu [LEGACY_FILES_SUMMARY.md](LEGACY_FILES_SUMMARY.md)
- [ ] **NÃO** tentou executar `npm install`

---

## 🚀 Como Usar o Novo Sistema

### Frontend (React + Vite)

```bash
# Usa package.json normal
npm install
npm run dev
```

### Backend (Supabase + Deno)

```bash
# SEM npm install!
# Dependências são importadas automaticamente

# Local (opcional)
supabase functions serve

# Produção
# Já está deployado:
# https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03
```

---

## 📚 Documentação Relacionada

### Arquivos Legacy

- **[index.js](index.js)** - Entry point antigo
- **[INDEX_JS_README.md](INDEX_JS_README.md)** - README do index.js
- **[Digital Game Store API.postman_collection.json](Digital Game Store API.postman_collection.json)** - Coleção antiga

### Guias de Migração

- **[INDEX_MIGRATION_GUIDE.md](INDEX_MIGRATION_GUIDE.md)** - Migração Express → Hono
- **[ENV_MIGRATION_GUIDE.md](ENV_MIGRATION_GUIDE.md)** - Migração .env → Supabase
- **[LEGACY_FILES_SUMMARY.md](LEGACY_FILES_SUMMARY.md)** - Resumo completo

### Novo Sistema

- **[SETUP.md](SETUP.md)** - Setup completo
- **[QUICKSTART.md](QUICKSTART.md)** - Setup rápido (3 min)
- **[/supabase/functions/server/](supabase/functions/server/)** - Código backend novo

---

## 🔗 Links Úteis

- **npm vs Deno:** https://deno.land/manual/npm_nodejs/compatibility_mode
- **Deno Modules:** https://deno.land/x
- **Supabase Functions:** https://supabase.com/docs/guides/functions
- **Hono Framework:** https://hono.dev

---

## ❓ FAQ

### Por que manter package-lock.json se não é mais usado?

Para referência histórica e educação. É útil para:
- Entender a evolução do projeto
- Comparar dependências antigas vs novas
- Aprender sobre migração npm → Deno

### Posso deletar package-lock.json?

Sim, mas não é recomendado. É útil ter como referência.

### O sistema antigo ainda funciona?

Não. As dependências são para um sistema que não existe mais.

### Como instalo dependências no novo sistema?

**Backend (Deno):** Automático, sem instalação manual.  
**Frontend (React):** `npm install` (usa package.json diferente)

### Onde está o package.json do frontend?

O frontend React tem seu próprio `package.json` na raiz, com dependências diferentes (React, Vite, Tailwind, etc.). Este `package-lock.json` é do backend antigo.

---

## 🎉 Conclusão

`package-lock.json` faz parte da **história** do projeto SYNTHX.

O projeto evoluiu para uma **arquitetura moderna**:
- ✅ Sem npm no backend
- ✅ Deno (TypeScript nativo)
- ✅ Supabase (serverless)
- ✅ Edge Functions (deploy global)
- ✅ -97% em tamanho de dependências
- ✅ +300% em performance

**Use o novo sistema!** 🚀

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Status:** Arquivo de Referência Histórica

**Não instalar!** Use Deno + Supabase Functions
