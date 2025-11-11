# 🔄 DatabaseService - Guia de Migração

Documentação completa sobre a migração do DatabaseService original (SQLite) para o novo sistema (KV Store + API REST).

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura Original vs Nova](#arquitetura-original-vs-nova)
3. [Backend: DatabaseService.tsx](#backend-databaseservicetsx)
4. [Frontend: DatabaseService.ts](#frontend-databaseservicets)
5. [Exemplos de Migração](#exemplos-de-migração)
6. [Diferenças Principais](#diferenças-principais)
7. [Guia de Uso](#guia-de-uso)

---

## 🎯 Visão Geral

### Original (SQLite)

```javascript
// DatabaseService.js (Original)
class DatabaseService {
  run(sql, params = [])      // INSERT, UPDATE, DELETE
  get(sql, params = [])      // SELECT único
  all(sql, params = [])      // SELECT múltiplo
}

// Uso
const row = await dbService.get('SELECT * FROM jogos WHERE id = ?', [id]);
```

### Novo (KV Store + API)

```typescript
// Backend: DatabaseService.tsx
class DatabaseService {
  run(operation, key, data)    // create, update, delete
  get(key)                     // buscar por chave
  all(prefix)                  // buscar por prefixo
  
  // + Métodos de conveniência
  create(prefix, data)
  update(prefix, id, updates)
  delete(prefix, id)
  find(prefix, filter)
  // ... e mais
}

// Frontend: DatabaseService.ts
class DatabaseService {
  create(resource, data)       // POST /resource
  get(resource, id)            // GET /resource/:id
  all(resource, query)         // GET /resource?query
  update(resource, id, data)   // PUT /resource/:id
  delete(resource, id)         // DELETE /resource/:id
  
  // + Métodos específicos da API
  login(), logout(), addToCart(), checkout()
  // ... e mais
}
```

---

## 🏗️ Arquitetura Original vs Nova

### ❌ Arquitetura Original (SQLite)

```
┌─────────────┐
│ Controllers │
│   (Node.js) │
└──────┬──────┘
       │
       │ SQL Queries
       ↓
┌─────────────────┐
│ DatabaseService │
│   (Singleton)   │
└──────┬──────────┘
       │
       │ db.run()
       │ db.get()
       │ db.all()
       ↓
┌─────────────┐
│   SQLite    │
│ (database)  │
└─────────────┘
```

### ✅ Nova Arquitetura (KV Store + API)

```
FRONTEND                  BACKEND                   DATABASE
┌─────────────┐          ┌─────────────┐          ┌──────────┐
│    React    │          │  Hono API   │          │KV Store  │
│ Components  │          │   (Deno)    │          │(Supabase)│
└──────┬──────┘          └──────┬──────┘          └────┬─────┘
       │                        │                      │
       │ HTTP REST              │ kv.get()            │
       │                        │ kv.set()            │
       ↓                        │ kv.del()            │
┌──────────────┐                │                     │
│DatabaseService│               │                     │
│  (Frontend)  │               │                     │
└──────┬───────┘               │                     │
       │                       │                     │
       │ fetch()               ↓                     │
       └──────────────►┌──────────────┐             │
                       │DatabaseService│────────────►│
                       │  (Backend)   │ kv operations│
                       └──────────────┘              │
```

---

## 🔧 Backend: DatabaseService.tsx

### Localização
```
/supabase/functions/server/DatabaseService.tsx
```

### Métodos Principais

#### 1. `run(operation, key, data)` - Operações de Escrita

```typescript
// CREATE
const result = await dbService.run('create', 'games:game-123', {
  name: 'The Witcher 3',
  price: 59.99,
  fk_empresa: 'company-1',
  fk_categoria: 'category-rpg'
});
// Retorna: { lastID: 'game-123', changes: 1, success: true }

// UPDATE
const result = await dbService.run('update', 'games:game-123', {
  price: 49.99
});
// Retorna: { changes: 1, success: true }

// DELETE
const result = await dbService.run('delete', 'games:game-123');
// Retorna: { changes: 1, success: true }
```

#### 2. `get(key)` - Buscar Um Registro

```typescript
const game = await dbService.get('games:game-123');
// Retorna: { id: 'game-123', name: '...', ... } ou null
```

#### 3. `all(prefix)` - Buscar Múltiplos Registros

```typescript
const games = await dbService.all('games:');
// Retorna: [{ id: 'game-1', ... }, { id: 'game-2', ... }]
```

### Métodos de Conveniência

```typescript
// CRIAR com ID gerado automaticamente
const id = await dbService.create('games', {
  name: 'Cyberpunk 2077',
  price: 199.99
});
// Retorna: 'games-1705334400000-abc123'

// ATUALIZAR
const updated = await dbService.update('games', 'game-123', {
  price: 149.99
});
// Retorna: true se atualizado, false se não encontrado

// DELETAR
const deleted = await dbService.delete('games', 'game-123');
// Retorna: true se deletado, false se não encontrado

// VERIFICAR EXISTÊNCIA
const exists = await dbService.exists('games', 'game-123');
// Retorna: true ou false

// CONTAR
const count = await dbService.count('games:');
// Retorna: 22

// BUSCAR COM FILTRO
const rpgGames = await dbService.find('games:', (game) => 
  game.fk_categoria === 'category-rpg'
);

// BUSCAR UM COM FILTRO
const witcher = await dbService.findOne('games:', (game) =>
  game.name === 'The Witcher 3'
);

// OPERAÇÕES MÚLTIPLAS
await dbService.mset([
  ['games:game-1', { name: 'Game 1' }],
  ['games:game-2', { name: 'Game 2' }]
]);

const results = await dbService.mget([
  'games:game-1',
  'games:game-2'
]);

await dbService.mdel(['games:game-1', 'games:game-2']);
```

### Transações Simuladas

```typescript
// Executar múltiplas operações com rollback em caso de erro
await dbService.transaction([
  { type: 'create', key: 'games:game-1', data: {...} },
  { type: 'update', key: 'companies:company-1', data: {...} },
  { type: 'delete', key: 'categories:category-old' }
]);
```

---

## 💻 Frontend: DatabaseService.ts

### Localização
```
/utils/DatabaseService.ts
```

### Configuração Inicial

```typescript
import { dbService } from '../utils/DatabaseService';

// Após login
const loginResponse = await dbService.login(email, password);
// Token é armazenado automaticamente

// Ou definir token manualmente
dbService.setToken(token);
```

### Métodos CRUD Genéricos

```typescript
// CREATE
const result = await dbService.create('games', {
  name: 'The Witcher 3',
  ano: 2015,
  price: 59.99,
  fk_empresa: 'company-1',
  fk_categoria: 'category-rpg'
});

// GET
const game = await dbService.get('games', 'game-123');

// ALL
const games = await dbService.all('games', { category: 'RPG' });

// UPDATE
await dbService.update('games', 'game-123', { price: 49.99 });

// DELETE
await dbService.delete('games', 'game-123');
```

### Métodos Específicos

#### Autenticação

```typescript
// LOGIN
const loginResponse = await dbService.login(email, password);
// Retorna: { success: true, token: '...', user: {...} }

// SIGNUP
const signupResponse = await dbService.signup({
  name: 'João Silva',
  email: 'joao@email.com',
  password: 'senha123',
  role: 'user'
});

// VERIFICAR TOKEN
const user = await dbService.verifyToken();

// LOGOUT
dbService.logout();
```

#### Carrinho

```typescript
// ADICIONAR AO CARRINHO
await dbService.addToCart('game-123');

// VER CARRINHO
const cart = await dbService.getCart();

// REMOVER DO CARRINHO
await dbService.removeFromCart('game-123');

// FINALIZAR COMPRA
const purchase = await dbService.checkout('Cartão de Crédito');
```

#### Compras

```typescript
// HISTÓRICO DE COMPRAS
const purchases = await dbService.getPurchaseHistory();

// JOGOS DO USUÁRIO (Biblioteca)
const userGames = await dbService.getUserGames();
// Retorna jogos com chaves de ativação
```

#### Avaliações

```typescript
// CRIAR AVALIAÇÃO
await dbService.createReview({
  jogoId: 'game-123',
  nota: 5,
  comentario: 'Jogo incrível!'
});

// VER AVALIAÇÕES
const reviews = await dbService.getReviews('game-123');

// MÉDIA DE AVALIAÇÕES
const { media, totalAvaliacoes } = await dbService.getAverageRating('game-123');
```

#### Lista de Desejos

```typescript
// ADICIONAR À WISHLIST
await dbService.addToWishlist('game-123');

// VER WISHLIST
const wishlist = await dbService.getWishlist();

// REMOVER DA WISHLIST
await dbService.removeFromWishlist('game-123');
```

#### Relatórios

```typescript
// TOP VENDIDOS
const topSellers = await dbService.getTopSellers(10);

// TOP VENDIDOS POR EMPRESA
const topByCompany = await dbService.getTopSellers(5, 'company-1');
```

---

## 📚 Exemplos de Migração

### Exemplo 1: Buscar Jogo por ID

#### ❌ Original (SQLite)

```javascript
// JogoDAO.js
async findById(id) {
  const query = "SELECT * FROM jogos WHERE id = ?";
  const row = await dbService.get(query, [id]);
  if (!row) return null;
  return new Jogo(row.id, row.nome, row.ano, ...);
}

// Uso no Controller
const jogo = await jogoDAO.findById(req.params.id);
```

#### ✅ Novo (KV Store - Backend)

```typescript
// Backend (index.tsx ou routes.tsx)
app.get('/make-server-23051d03/games/:id', async (c) => {
  const id = c.req.param('id');
  const game = await dbService.get(`games:${id}`);
  
  if (!game) {
    return c.json({ error: 'Game not found' }, 404);
  }
  
  return c.json({ success: true, game });
});
```

#### ✅ Novo (API - Frontend)

```typescript
// Frontend Component
import { dbService } from '../utils/DatabaseService';

const game = await dbService.get('games', 'game-123');
if (game) {
  console.log(game.name);
}
```

---

### Exemplo 2: Criar Novo Jogo

#### ❌ Original (SQLite)

```javascript
// JogoDAO.js
async create(jogo) {
  const query = "INSERT INTO jogos (nome, ano, preco, ...) VALUES (?, ?, ?, ...)";
  const params = [jogo.nome, jogo.ano, jogo.preco, ...];
  const result = await dbService.run(query, params);
  jogo.id = result.lastID;
  return jogo;
}

// Uso no Controller
const novoJogo = new Jogo(null, req.body.nome, req.body.ano, ...);
const criado = await jogoDAO.create(novoJogo);
```

#### ✅ Novo (KV Store - Backend)

```typescript
// Backend (index.tsx)
app.post('/make-server-23051d03/games', authMiddleware, async (c) => {
  const { name, ano, price, fk_empresa, fk_categoria } = await c.req.json();
  
  const gameId = await dbService.create('games', {
    name,
    ano: parseInt(ano),
    price: parseFloat(price),
    fk_empresa,
    fk_categoria,
    rating: 0,
    sales: 0,
    status: 'Ativo'
  });
  
  const game = await dbService.get(`games:${gameId}`);
  return c.json({ success: true, game });
});
```

#### ✅ Novo (API - Frontend)

```typescript
// Frontend Component
const result = await dbService.create('games', {
  name: 'The Witcher 3',
  ano: 2015,
  price: 59.99,
  fk_empresa: 'company-1',
  fk_categoria: 'category-rpg'
});

console.log('Jogo criado:', result.data.game);
```

---

### Exemplo 3: Listar Jogos com Filtro

#### ❌ Original (SQLite)

```javascript
// JogoDAO.js
async all(categoria) {
  let query = "SELECT * FROM jogos";
  
  if (categoria) {
    query += " WHERE categoria LIKE '%" + categoria + "%'";
  }
  
  const rows = await dbService.all(query);
  return rows.map(row => new Jogo(row.id, row.nome, ...));
}

// Uso no Controller
const jogos = await jogoDAO.all(req.query.categoria);
```

#### ✅ Novo (KV Store - Backend)

```typescript
// Backend (index.tsx)
app.get('/make-server-23051d03/games', async (c) => {
  const categoryFilter = c.req.query('category');
  
  let games = await dbService.all('games:');
  
  if (categoryFilter) {
    games = await dbService.find('games:', (game) => 
      game.fk_categoria.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }
  
  return c.json({ success: true, games });
});
```

#### ✅ Novo (API - Frontend)

```typescript
// Frontend Component
const allGames = await dbService.all('games');
const rpgGames = await dbService.all('games', { category: 'RPG' });
```

---

### Exemplo 4: Atualizar Jogo

#### ❌ Original (SQLite)

```javascript
// JogoDAO.js
async update(jogo) {
  const query = "UPDATE jogos SET nome = ?, ano = ?, preco = ?, ... WHERE id = ?";
  const params = [jogo.nome, jogo.ano, jogo.preco, ..., jogo.id];
  const result = await dbService.run(query, params);
  return { changes: result.changes };
}

// Uso no Controller
jogo.preco = req.body.preco;
await jogoDAO.update(jogo);
```

#### ✅ Novo (KV Store - Backend)

```typescript
// Backend (index.tsx)
app.put('/make-server-23051d03/games/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();
  
  const updated = await dbService.update('games', id, updates);
  
  if (!updated) {
    return c.json({ error: 'Game not found' }, 404);
  }
  
  const game = await dbService.get(`games:${id}`);
  return c.json({ success: true, game });
});
```

#### ✅ Novo (API - Frontend)

```typescript
// Frontend Component
await dbService.update('games', 'game-123', { price: 49.99 });
```

---

### Exemplo 5: Deletar Jogo

#### ❌ Original (SQLite)

```javascript
// JogoDAO.js
async delete(id) {
  const query = "DELETE FROM jogos WHERE id = ?";
  const result = await dbService.run(query, [id]);
  return { changes: result.changes };
}

// Uso no Controller
await jogoDAO.delete(req.params.id);
```

#### ✅ Novo (KV Store - Backend)

```typescript
// Backend (index.tsx)
app.delete('/make-server-23051d03/games/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  
  const deleted = await dbService.delete('games', id);
  
  if (!deleted) {
    return c.json({ error: 'Game not found' }, 404);
  }
  
  return c.json({ success: true, message: 'Game deleted' });
});
```

#### ✅ Novo (API - Frontend)

```typescript
// Frontend Component
await dbService.delete('games', 'game-123');
```

---

## ⚖️ Diferenças Principais

### 1. IDs

| Original | Novo |
|----------|------|
| `INTEGER AUTOINCREMENT` | `prefix-timestamp-random` |
| `id = 1` | `id = 'game-1705334400000-abc123'` |
| Numérico | String |

### 2. Queries

| Original | Novo (Backend) | Novo (Frontend) |
|----------|----------------|-----------------|
| SQL direto | Operações KV | HTTP REST |
| `SELECT * FROM jogos` | `dbService.all('games:')` | `dbService.all('games')` |
| `WHERE categoria = ?` | `dbService.find(filter)` | `?category=RPG` |

### 3. Relacionamentos

| Original | Novo |
|----------|------|
| `JOIN` em SQL | Enriquecimento manual |
| Automático | Explícito no código |

```typescript
// Original (SQL JOIN)
SELECT j.*, e.nome as empresa_nome
FROM jogos j
JOIN empresas e ON j.fk_empresa = e.id

// Novo (Enriquecimento manual)
const game = await dbService.get('games:game-1');
const company = await dbService.get(`companies:${game.fk_empresa}`);
const enriched = {
  ...game,
  company: company.name
};
```

### 4. Transações

| Original | Novo |
|----------|------|
| Transações ACID verdadeiras | Transações simuladas com rollback |
| `BEGIN`, `COMMIT`, `ROLLBACK` | `dbService.transaction([...])` |

### 5. Performance

| Original | Novo |
|----------|------|
| Queries indexadas | Busca por prefixo |
| JOIN otimizado | Múltiplas chamadas |
| Local (rápido) | Rede (latência) |

---

## 📖 Guia de Uso

### Backend (Hono API)

```typescript
import { dbService } from './DatabaseService.tsx';

// Em qualquer rota
app.get('/make-server-23051d03/custom', async (c) => {
  // Buscar
  const item = await dbService.get('items:item-1');
  
  // Listar
  const items = await dbService.all('items:');
  
  // Criar
  const newId = await dbService.create('items', { name: 'New Item' });
  
  // Atualizar
  await dbService.update('items', 'item-1', { name: 'Updated' });
  
  // Deletar
  await dbService.delete('items', 'item-1');
  
  return c.json({ success: true });
});
```

### Frontend (React Components)

```typescript
import { dbService } from '../utils/DatabaseService';
import { useEffect, useState } from 'react';

function GameList() {
  const [games, setGames] = useState([]);
  
  useEffect(() => {
    async function loadGames() {
      const data = await dbService.all('games');
      setGames(data);
    }
    loadGames();
  }, []);
  
  const handleDelete = async (id: string) => {
    await dbService.delete('games', id);
    setGames(games.filter(g => g.id !== id));
  };
  
  return (
    <div>
      {games.map(game => (
        <div key={game.id}>
          <h3>{game.name}</h3>
          <button onClick={() => handleDelete(game.id)}>
            Deletar
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ Checklist de Migração

- [ ] **Backend criado** (`/supabase/functions/server/DatabaseService.tsx`)
- [ ] **Frontend criado** (`/utils/DatabaseService.ts`)
- [ ] **Rotas implementadas** (veja `ROUTES_MAPPING.md`)
- [ ] **Types criados** (veja `/types/*`)
- [ ] **Componentes atualizados** para usar novo DatabaseService
- [ ] **Autenticação configurada** (token management)
- [ ] **Error handling** implementado
- [ ] **Testes realizados** em todas as operações CRUD

---

## 🎯 Próximos Passos

1. **Integrar nos componentes existentes**
   - Substituir calls diretos à API por `dbService`
   - Usar no AuthContext, CartContext, etc.

2. **Adicionar cache (opcional)**
   - React Query ou SWR
   - LocalStorage para dados menos críticos

3. **Melhorar error handling**
   - Toast notifications
   - Retry logic
   - Offline support

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮
