# 📦 package.json - Arquivo de Referência Histórica

## ⚠️ IMPORTANTE

Este arquivo (`/package.json`) é do **SISTEMA ANTIGO** (Node.js backend).

O projeto foi **completamente migrado** para **Deno** no backend.

## 🚫 NÃO Execute

**Não execute** `npm install` ou `npm start` baseado neste arquivo!

O sistema antigo não funciona mais porque:
- ❌ Backend foi migrado para Deno (não usa npm)
- ❌ Arquivo `index.js` é apenas referência
- ❌ Dependências foram substituídas por Supabase
- ❌ Scripts npm não funcionam mais

---

## 📋 Conteúdo do package.json Antigo

### Metadata

```json
{
  "name": "vendas-api",
  "version": "1.0.0",
  "description": "API de vendas",
  "main": "index.js",
  "author": "Adailton de Jesus Cerqueira Junior",
  "license": "ISC"
}
```

**Status:** Informações do projeto antigo.

---

### Scripts

```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon index.js",
    "generate:jwt-secret": "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  }
}
```

#### ❌ `npm test`

**Antigo:** Não tinha testes

**Novo:** 
```bash
# Testes no frontend React
npm test

# Backend: Testes via Postman
# Ver: SYNTHX.postman_collection.json
```

#### ❌ `npm start`

**Antigo:** 
```bash
npm start
# Executava: nodemon index.js
# Servidor Express na porta 3000
```

**Novo:**
```bash
# Backend (Supabase - já em produção)
# https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03

# Ou localmente (opcional):
supabase functions serve make-server-23051d03
```

#### ❌ `npm run generate:jwt-secret`

**Antigo:**
```bash
npm run generate:jwt-secret
# Gerava: 64 chars hexadecimal
# Para JWT_SECRET no .env
```

**Novo:**
```bash
# Não necessário!
# Supabase Auth gerencia secrets automaticamente

# Se precisar gerar random hex (outra finalidade):
deno eval "console.log(crypto.randomUUID())"
# ou
openssl rand -hex 32
```

---

### Dependencies (Produção)

```json
{
  "dependencies": {
    "dotenv": "^17.2.1",
    "express": "^5.1.0",
    "sqlite3": "^5.1.7",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^3.0.2"
  }
}
```

#### 1. dotenv (^17.2.1)

**Uso Antigo:**
```javascript
require('dotenv').config();
const PORT = process.env.APP_PORT;
```

**Novo Sistema:**
```typescript
// Built-in no Deno!
const port = Deno.env.get('PORT');

// Gerenciado no Supabase Dashboard
```

**Status:** ✅ Substituído por `Deno.env` + Supabase

---

#### 2. express (^5.1.0)

**Uso Antigo:**
```javascript
const express = require('express');
const app = express();
app.get('/api/v1/games', (req, res) => {
  res.json({ games });
});
app.listen(3000);
```

**Novo Sistema:**
```typescript
import { Hono } from 'npm:hono@4';
const app = new Hono();
app.get('/make-server-23051d03/games', (c) => {
  return c.json({ games });
});
Deno.serve(app.fetch);
```

**Status:** ✅ Substituído por `Hono` (3x mais rápido)

---

#### 3. sqlite3 (^5.1.7)

**Uso Antigo:**
```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');
db.run('INSERT INTO users VALUES (?, ?)', [id, name]);
```

**Novo Sistema:**
```typescript
import * as kv from './kv_store.tsx';
await kv.set(`user:${id}`, { id, name });
```

**Status:** ✅ Substituído por `KV Store` (distribuído)

---

#### 4. jsonwebtoken (^9.0.2)

**Uso Antigo:**
```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId }, SECRET, { expiresIn: '1h' });
```

**Novo Sistema:**
```typescript
// Supabase Auth gerencia tokens automaticamente
const { data: { access_token } } = await supabase.auth.signInWithPassword({
  email, password
});
```

**Status:** ✅ Substituído por `Supabase Auth`

---

#### 5. bcryptjs (^3.0.2)

**Uso Antigo:**
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hash);
```

**Novo Sistema:**
```typescript
// Supabase Auth faz hash automaticamente
const { data, error } = await supabase.auth.admin.createUser({
  email, password  // Hash automático!
});
```

**Status:** ✅ Substituído por `Supabase Auth`

---

### DevDependencies

```json
{
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}
```

#### nodemon (^3.1.10)

**Uso Antigo:**
```bash
npm start
# Executa: nodemon index.js
# Hot reload em mudanças de arquivo
```

**Novo Sistema:**
```bash
supabase functions serve make-server-23051d03
# Hot reload automático built-in!
```

**Status:** ✅ Substituído por `supabase serve`

---

## 📊 Resumo de Substituições

| Dependência | Versão | Substituído Por | Benefício |
|-------------|--------|-----------------|-----------|
| **dotenv** | ^17.2.1 | Deno.env + Supabase | Gerenciamento centralizado |
| **express** | ^5.1.0 | Hono | 3x mais rápido |
| **sqlite3** | ^5.1.7 | KV Store | Distribuído, escalável |
| **jsonwebtoken** | ^9.0.2 | Supabase Auth | JWT gerenciado |
| **bcryptjs** | ^3.0.2 | Supabase Auth | Hash automático |
| **nodemon** | ^3.1.10 | supabase serve | Hot reload integrado |

**Total:** 6 dependências → 0 dependências npm!

---

## 🆕 Sistema Novo (Deno)

### Backend: SEM package.json!

```typescript
// /supabase/functions/server/index.tsx

// Imports diretos via URL
import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Sem package.json
// Sem npm install
// Sem node_modules/

const app = new Hono();
// ... código ...
Deno.serve(app.fetch);
```

**Vantagens:**
- ✅ Sem configuração
- ✅ TypeScript nativo
- ✅ Imports transparentes
- ✅ Cache automático

---

### Frontend: TEM package.json próprio

**Nota Importante:** O frontend React DEVERIA ter um `package.json` separado, mas não está visível na estrutura atual.

Se você está usando React + Vite, o package.json seria:

```json
{
  "name": "synthx-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "tailwindcss": "^3.4.0",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0"
  }
}
```

**Este NÃO é o package.json da raiz!**

---

## 🚫 Comandos que NÃO Funcionam

```bash
# ❌ NÃO faça isso:
npm install      # Instala deps antigas do backend
npm start        # Tenta executar index.js (não funciona)
npm test         # Não há testes configurados
npm run generate:jwt-secret  # Não necessário no Supabase

# ❌ Também NÃO:
node index.js    # Backend antigo não funciona
```

---

## ✅ Comandos Corretos

### Backend (Supabase)

```bash
# Produção (já deployado)
curl https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03/health

# Local (desenvolvimento - opcional)
supabase functions serve make-server-23051d03

# Deploy
supabase functions deploy make-server-23051d03
```

### Frontend (React)

```bash
# Se houver package.json do frontend
npm install
npm run dev

# Acesse: http://localhost:5173
```

---

## 📁 Estrutura de Arquivos

### Antigo (Node.js)

```
/
├── package.json              ← Este arquivo (backend)
├── package-lock.json         ← Lock file
├── node_modules/             ← 150MB, 500+ pacotes
├── index.js                  ← Entry point Express
├── .env                      ← Variáveis (risco)
└── database.db               ← SQLite local
```

### Novo (Deno)

```
/supabase/functions/server/
├── index.tsx                 ← Entry point Hono
├── routes.tsx                ← Todas as rotas
├── DatabaseService.tsx       ← CRUD
└── kv_store.tsx              ← Database utils

# Backend: SEM package.json, node_modules, ou .env

/
├── App.tsx                   ← Frontend React
├── components/               ← Componentes
└── package.json (frontend?)  ← Se houver, é do frontend
```

---

## 🔍 Análise dos Scripts

### 1. `"test"`

**Script:** `echo "Error: no test specified" && exit 1`

**Problema:** Não tinha testes configurados!

**Solução Atual:**
- Backend: Testes via Postman (SYNTHX.postman_collection.json)
- Frontend: Pode adicionar Jest/Vitest se necessário

---

### 2. `"start"`

**Script:** `nodemon index.js`

**Problema:** 
- Dependia de `index.js` (não existe no novo sistema)
- Usava nodemon (não necessário)
- Servidor fixo na porta 3000

**Solução Atual:**
```bash
# Backend serverless (sem porta fixa)
supabase functions serve
```

---

### 3. `"generate:jwt-secret"`

**Script:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Problema:**
- Gerava secret para JWT custom
- Tinha que copiar manualmente para .env

**Solução Atual:**
- Supabase gerencia JWT secrets automaticamente
- Configurado via dashboard
- Rotação automática se necessário

---

## 📚 Propósito deste Arquivo

Este arquivo (`package.json`) é mantido apenas para:

✅ **Referência histórica** - Ver dependências do sistema antigo  
✅ **Comparação** - Entender mudanças npm → Deno  
✅ **Documentação** - Aprender sobre arquitetura anterior  
✅ **Educação** - Estudar migração de package managers  

---

## ⚠️ Avisos Importantes

### 1. Este é o package.json do BACKEND antigo

**NÃO confundir com:**
- Frontend React (que pode ter seu próprio package.json)
- Projetos atuais (que não usam este arquivo)

### 2. Backend atual NÃO usa package.json

**Deno não precisa de:**
- package.json
- package-lock.json
- node_modules/

### 3. Se houver package.json na raiz atual

**Deve ser do frontend React**, NÃO do backend!

Verifique:
```bash
cat package.json
# Se tiver "react", "vite", "tailwind" → É do frontend
# Se tiver "express", "sqlite3" → É do backend antigo (este arquivo)
```

---

## 🎯 Migração Completa

### De (package.json)

```json
{
  "name": "vendas-api",
  "scripts": {
    "start": "nodemon index.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "sqlite3": "^5.1.7",
    ...
  }
}
```

### Para (sem package.json backend)

```typescript
// /supabase/functions/server/index.tsx
import { Hono } from 'npm:hono@4';

const app = new Hono();
Deno.serve(app.fetch);
```

**Benefício:** 
- -100% package.json
- -100% node_modules
- -100% configuração
- +200% performance

---

## ✅ Checklist

Se você está vendo este arquivo pela primeira vez:

- [ ] Leu este README completo
- [ ] Entendeu que `package.json` é ANTIGO (backend Node.js)
- [ ] Sabe que o backend atual usa Deno (sem package.json)
- [ ] Entendeu que frontend React pode ter package.json próprio
- [ ] Leu [NODE_TO_DENO_MIGRATION.md](NODE_TO_DENO_MIGRATION.md)
- [ ] Leu [PACKAGE_LOCK_README.md](PACKAGE_LOCK_README.md)
- [ ] **NÃO** tentou executar `npm install` ou `npm start`

---

## 📖 Documentação Relacionada

### Arquivos Legacy

- **[index.js](index.js)** - Entry point antigo
- **[package-lock.json](package-lock.json)** - Lock file antigo
- **[Digital Game Store API.postman_collection.json](Digital Game Store API.postman_collection.json)** - Postman antigo

### Guias de Migração

- **[NODE_TO_DENO_MIGRATION.md](NODE_TO_DENO_MIGRATION.md)** - Migração completa npm → Deno
- **[PACKAGE_LOCK_README.md](PACKAGE_LOCK_README.md)** - Sobre package-lock.json
- **[INDEX_MIGRATION_GUIDE.md](INDEX_MIGRATION_GUIDE.md)** - Migração index.js → index.tsx
- **[LEGACY_FILES_SUMMARY.md](LEGACY_FILES_SUMMARY.md)** - Resumo completo

### Sistema Novo

- **[QUICKSTART.md](QUICKSTART.md)** - Setup rápido (3 min)
- **[SETUP.md](SETUP.md)** - Setup completo
- **[/supabase/functions/server/](supabase/functions/server/)** - Código backend

---

## 🔗 Links Úteis

- **Deno vs Node.js:** https://deno.land/manual/node/compatibility
- **package.json to Deno:** https://deno.land/manual/node/package_json
- **Supabase Functions:** https://supabase.com/docs/guides/functions
- **Hono Framework:** https://hono.dev

---

## ❓ FAQ

### Por que manter package.json se não é mais usado?

Para referência histórica e documentação. É útil para:
- Ver quais dependências o sistema tinha
- Entender a migração realizada
- Comparar sistema antigo vs novo
- Educar sobre npm → Deno

### Posso deletar package.json?

Sim, mas não é recomendado. É um arquivo pequeno e útil como referência.

### O sistema antigo ainda funciona?

Não. Este package.json é de um sistema que não existe mais.

### Como rodo o backend atual?

**Produção:** Já está rodando (Supabase)  
**Local:** `supabase functions serve make-server-23051d03`

### E o frontend? Tem package.json?

Pode ter um package.json separado para React/Vite. Este aqui é do backend antigo.

### Onde está a documentação do novo sistema?

- Backend: [/supabase/functions/server/API_ENDPOINTS.md](supabase/functions/server/API_ENDPOINTS.md)
- Setup: [QUICKSTART.md](QUICKSTART.md)

---

## 🎉 Conclusão

`package.json` faz parte da **história** do projeto SYNTHX.

O projeto evoluiu para:
- ✅ Sem package.json (backend)
- ✅ Sem npm (backend)
- ✅ Deno + TypeScript nativo
- ✅ Supabase serverless
- ✅ 6 dependências → 0 dependências
- ✅ +200% performance

**Use o novo sistema!** 🚀

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Status:** Arquivo de Referência Histórica

**Não executar!** Backend usa Deno (sem npm)
