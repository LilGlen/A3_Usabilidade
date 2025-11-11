# 🔄 Postman Collection - Guia de Migração

Guia completo para migrar da coleção antiga do Postman para a nova coleção Supabase.

## 📋 Resumo das Mudanças

| Aspecto | Antes (Node.js) | Depois (Supabase) | Status |
|---------|----------------|-------------------|--------|
| **Base URL** | `http://localhost:3000/api/v1` | `https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03` | ✅ |
| **Autenticação** | JWT custom | Supabase Auth | ✅ |
| **Header** | `Authorization: Bearer <token>` | Mesmo formato | ✅ |
| **Estrutura** | 10 grupos, ~30 requests | 10 grupos, 50+ requests | ✅ |
| **Endpoints** | `/jogos`, `/empresas`, etc. | `/games`, `/companies`, etc. | ✅ |
| **Response** | Português | Inglês (padronizado) | ✅ |

---

## 🚀 Quick Start

### 1. Importar Nova Coleção

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo: `SYNTHX.postman_collection.json`
4. Clique em **Import**

### 2. Configurar Variáveis

A coleção já vem com as variáveis configuradas:

```json
{
  "baseUrl": "https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03",
  "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "",        // Preenchido automaticamente no login
  "adminToken": "",   // Preenchido automaticamente no login admin
  "userId": ""        // Preenchido automaticamente no login
}
```

### 3. Testar Conexão

Execute: **Health & Seed** > **Health Check**

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T10:30:00.000Z"
}
```

### 4. Popular Banco de Dados

Execute: **Health & Seed** > **Seed Database**

Isso criará:
- ✅ 13 categorias
- ✅ 15 empresas
- ✅ 22 jogos

### 5. Fazer Login

Execute: **Auth** > **Login** ou **Login (Admin)**

O token será salvo automaticamente na variável `{{token}}`.

---

## 🔄 Mapeamento de Endpoints

### Auth

| Antigo | Novo | Método | Mudanças |
|--------|------|--------|----------|
| `/auth/register` | `/auth/signup` | POST | Nome do endpoint mudou |
| `/auth/login` | `/auth/login` | POST | Sem mudanças |
| `/auth/change-password` | `/users/me` | PUT | Agora parte de update user |
| - | `/auth/logout` | POST | **Novo** |
| - | `/auth/validate` | GET | **Novo** |

**Exemplo - Signup:**

```javascript
// Antigo
POST /auth/register
{
  "nome": "John Doe",
  "email": "john@example.com",
  "senha": "password123",
  "perfilId": 2
}

// Novo
POST /auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // ou "admin"
}
```

---

### Games (Jogos)

| Antigo | Novo | Método | Mudanças |
|--------|------|--------|----------|
| `/jogos` | `/games` | GET | Tradução para inglês |
| `/jogos/:id` | `/games/:id` | GET | Tradução para inglês |
| `/jogos` | `/games` | POST | Tradução para inglês |
| `/jogos/:id` | `/games/:id` | PUT | Tradução para inglês |
| `/jogos/:id` | `/games/:id` | DELETE | Tradução para inglês |
| - | `/games/search?q=term` | GET | **Novo** - Busca |
| - | `/games?categoryId=1` | GET | **Novo** - Filtro |

**Exemplo - Create Game:**

```javascript
// Antigo
POST /jogos
{
  "nome": "Cyberpunk 2077",
  "descricao": "...",
  "preco": 59.99,
  "ano": 2020,
  "fkCategoria": 1,
  "fkEmpresa": 1
}

// Novo
POST /games
{
  "name": "Cyberpunk 2077",
  "description": "...",
  "price": 59.99,
  "releaseYear": 2020,
  "categoryId": 1,
  "companyId": 1,
  "imageUrl": "https://..."  // Opcional, novo campo
}
```

---

### Categories (Categorias)

| Antigo | Novo | Método | Mudanças |
|--------|------|--------|----------|
| - | `/categories` | GET | **Novo** - Listar todas |
| - | `/categories/:id` | GET | **Novo** - Por ID |
| - | `/categories` | POST | **Novo** - Criar |
| - | `/categories/:id` | PUT | **Novo** - Atualizar |
| - | `/categories/:id` | DELETE | **Novo** - Deletar |

**Nota:** Sistema antigo não tinha CRUD de categorias.

---

### Companies (Empresas)

| Antigo | Novo | Método | Mudanças |
|--------|------|--------|----------|
| `/empresas` | `/companies` | GET | Tradução para inglês |
| `/empresas/:id` | `/companies/:id` | GET | Tradução para inglês |
| `/empresas` | `/companies` | POST | Tradução para inglês |
| `/empresas/:id` | `/companies/:id` | PUT | Tradução para inglês |
| `/empresas/:id` | `/companies/:id` | DELETE | Tradução para inglês |

**Exemplo - Create Company:**

```javascript
// Antigo
POST /empresas
{
  "nome": "CD Projekt Red"
}

// Novo
POST /companies
{
  "name": "CD Projekt Red"
}
```

---

### Cart (Carrinho)

| Antigo | Novo | Método | Mudanças |
|--------|------|--------|----------|
| `/carrinho` | `/cart` | GET | Tradução para inglês |
| `/carrinho/add` | `/cart` | POST | Rota simplificada |
| `/carrinho/:gameId` | `/cart/:gameId` | DELETE | Tradução para inglês |
| - | `/cart` | DELETE | **Novo** - Limpar carrinho |

**Exemplo - Add to Cart:**

```javascript
// Antigo
POST /carrinho/add
{
  "jogoId": 1
}

// Novo
POST /cart
{
  "gameId": 1
}
```

---

### Purchases (Vendas/Compras)

| Antigo | Novo | Método | Mudanças |
|--------|------|--------|----------|
| `/vendas/checkout` | `/purchases/checkout` | POST | Tradução para inglês |
| `/vendas` | `/purchases` | GET | Tradução para inglês |
| - | `/purchases/:id` | GET | **Novo** - Por ID |
| - | `/purchases/:id/keys` | GET | **Novo** - Ver chaves |

**Exemplo - Checkout:**

```javascript
// Antigo
POST /vendas/checkout
// Sem body

// Novo
POST /purchases/checkout
// Sem body (usa carrinho do usuário)

// Resposta
{
  "id": "purchase-123",
  "total": 119.98,
  "games": [
    {
      "gameId": 1,
      "name": "Cyberpunk 2077",
      "activationKey": "ABCD-EFGH-IJKL-MNOP"
    }
  ],
  "createdAt": "2025-01-20T10:30:00.000Z"
}
```

---

### Reviews (Avaliações)

| Antigo | Novo | Método | Mudanças |
|--------|------|--------|----------|
| `/avaliacoes` | `/reviews` | GET | Tradução para inglês |
| `/avaliacoes?jogoId=1` | `/reviews?gameId=1` | GET | Tradução para inglês |
| `/avaliacoes/media/:jogoId` | `/reviews/:gameId/average` | GET | Rota simplificada |
| `/avaliacoes` | `/reviews` | POST | Tradução para inglês |
| `/avaliacoes` | `/reviews/:id` | PUT | Agora usa ID da review |
| - | `/reviews/:id` | DELETE | **Novo** |

**Exemplo - Create Review:**

```javascript
// Antigo
POST /avaliacoes
{
  "jogoId": 1,
  "comentario": "Excelente!",
  "nota": 5
}

// Novo
POST /reviews
{
  "gameId": 1,
  "comment": "Excelente!",
  "rating": 5
}
```

---

### Users (Usuários)

| Antigo | Novo | Método | Mudanças |
|--------|------|--------|----------|
| `/usuarios/:id` | `/users/:id` | GET | Tradução para inglês |
| - | `/users/me` | GET | **Novo** - Usuário atual |
| - | `/users/me` | PUT | **Novo** - Atualizar perfil |
| - | `/users` | GET | **Novo** - Listar (admin) |

---

### Reports (Relatórios)

| Antigo | Novo | Método | Mudanças |
|--------|------|--------|----------|
| `/relatorios/games-most-sell?top=5` | `/reports/top-games?limit=10` | GET | Parâmetro mudou |
| `/relatorios/jogos-mais-vendidos?empresa=1` | `/reports/top-games` | GET | Simplificado |
| - | `/reports/sales` | GET | **Novo** |
| - | `/reports/categories` | GET | **Novo** |
| - | `/reports/revenue` | GET | **Novo** |

---

### Wishlist (Lista de Desejos)

| Antigo | Novo | Mudanças |
|--------|------|----------|
| `/lista-desejo` | `/wishlist` | Tradução (futuro) |
| - | - | Não implementado ainda |

**Nota:** Wishlist será implementado em versão futura.

---

## 🔐 Autenticação

### Sistema Antigo (JWT Custom)

```javascript
// 1. Login
POST /auth/login
{
  "email": "user@example.com",
  "senha": "password123"
}

// Resposta
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// 2. Usar token
GET /jogos
Headers: {
  "Authorization": "Bearer eyJhbGci..."
}
```

### Sistema Novo (Supabase Auth)

```javascript
// 1. Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Resposta
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}

// 2. Usar token
GET /games
Headers: {
  "Authorization": "Bearer eyJhbGci..."
}
```

**Mudanças:**
- `token` → `access_token`
- `senha` → `password`
- Resposta inclui dados do usuário
- Token gerenciado pelo Supabase

---

## 📊 Estrutura de Pastas Postman

### Antiga
```
Digital Game Store API
├── Auth (4 requests)
├── Cart (3 requests)
├── Game (5 requests)
├── Profiles (2 requests)
├── Purchases (2 requests)
├── Users (1 request)
├── Enterprise (5 requests)
├── Rate (5 requests)
├── Wishlist (3 requests)
├── Report (2 requests)
└── Check (1 request)
```

### Nova
```
SYNTHX - Digital Game Store (Supabase)
├── Auth (5 requests) ✅ +1 novo
├── Games (7 requests) ✅ +2 novos
├── Categories (5 requests) ✅ Novo grupo
├── Companies (5 requests) ✅ Renomeado
├── Cart (4 requests) ✅ +1 novo
├── Purchases (4 requests) ✅ +2 novos
├── Reviews (5 requests) ✅ Renomeado
├── Users (4 requests) ✅ +3 novos
├── Reports (4 requests) ✅ +2 novos
└── Health & Seed (2 requests) ✅ Novo grupo
```

**Resumo:**
- 10 grupos → 10 grupos
- ~30 requests → 50+ requests
- +20 novos endpoints

---

## 🧪 Testes Automatizados

### Scripts de Teste (Tests Tab)

A nova coleção inclui scripts de teste automáticos:

**Exemplo - Login:**

```javascript
// Test script (aba Tests)
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Has access token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('access_token');
    pm.expect(jsonData.access_token).not.eq(undefined);
    
    // Salva token automaticamente
    pm.collectionVariables.set("token", jsonData.access_token);
    
    // Salva userId
    if (jsonData.user && jsonData.user.id) {
        pm.collectionVariables.set("userId", jsonData.user.id);
    }
});
```

**Benefícios:**
- ✅ Token salvo automaticamente
- ✅ Validação de resposta
- ✅ Assertions de dados
- ✅ Variáveis preenchidas

---

## 📝 Exemplos de Uso

### Fluxo Completo: Do Login ao Checkout

```javascript
// 1. Health Check
GET {{baseUrl}}/health
// Status: 200 OK

// 2. Seed Database (primeira vez)
POST {{baseUrl}}/seed
// Status: 200, cria jogos/categorias/empresas

// 3. Login
POST {{baseUrl}}/auth/login
{
  "email": "cliente@synthx.com",
  "password": "cliente123"
}
// Salva token automaticamente em {{token}}

// 4. Listar Jogos
GET {{baseUrl}}/games
Authorization: Bearer {{token}}
// Retorna lista de jogos

// 5. Ver Detalhes de um Jogo
GET {{baseUrl}}/games/1
Authorization: Bearer {{token}}

// 6. Adicionar ao Carrinho
POST {{baseUrl}}/cart
Authorization: Bearer {{token}}
{
  "gameId": 1
}

// 7. Ver Carrinho
GET {{baseUrl}}/cart
Authorization: Bearer {{token}}

// 8. Fazer Checkout
POST {{baseUrl}}/purchases/checkout
Authorization: Bearer {{token}}
// Retorna compra com chaves de ativação

// 9. Ver Histórico de Compras
GET {{baseUrl}}/purchases
Authorization: Bearer {{token}}

// 10. Ver Chaves de Ativação
GET {{baseUrl}}/purchases/1/keys
Authorization: Bearer {{token}}
```

---

## 🔧 Configuração Avançada

### Environments (Ambientes)

Crie environments para diferentes ambientes:

**Development:**
```json
{
  "baseUrl": "http://localhost:8000/functions/v1/make-server-23051d03",
  "anonKey": "local-dev-key"
}
```

**Staging:**
```json
{
  "baseUrl": "https://staging.supabase.co/functions/v1/make-server-23051d03",
  "anonKey": "staging-key"
}
```

**Production:**
```json
{
  "baseUrl": "https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03",
  "anonKey": "production-key"
}
```

### Pre-request Scripts

Adicione validações antes da requisição:

```javascript
// Pre-request Script
const token = pm.collectionVariables.get("token");
if (!token) {
    console.log("⚠️  Token não encontrado. Faça login primeiro!");
}

// Adicionar timestamp
pm.request.headers.add({
    key: "X-Request-Time",
    value: new Date().toISOString()
});
```

---

## 🐛 Troubleshooting

### Erro: "401 Unauthorized"

**Causa:** Token expirado ou inválido

**Solução:**
1. Execute **Auth** > **Login** novamente
2. Verifique se `{{token}}` foi preenchido
3. Verifique se `Authorization` header está correto

### Erro: "CORS policy"

**Causa:** URL do baseUrl está incorreta

**Solução:**
1. Verifique se baseUrl tem `https://`
2. Verifique se está usando o URL correto do Supabase

### Erro: "404 Not Found"

**Causa:** Endpoint não existe

**Solução:**
1. Verifique se usou `/games` em vez de `/jogos`
2. Consulte [API_ENDPOINTS.md](supabase/functions/server/API_ENDPOINTS.md)

### Erro: "Database is empty"

**Causa:** Banco de dados não foi populado

**Solução:**
1. Execute **Health & Seed** > **Seed Database**
2. Aguarde resposta de sucesso
3. Tente novamente

---

## ✅ Checklist de Migração

### Antes de Migrar

- [ ] Backup da coleção antiga
- [ ] Leu este guia completo
- [ ] Entende as mudanças principais

### Durante Migração

- [ ] Importou nova coleção
- [ ] Verificou variáveis (baseUrl, anonKey)
- [ ] Testou Health Check
- [ ] Executou Seed
- [ ] Fez login com sucesso
- [ ] Token salvo automaticamente

### Após Migração

- [ ] Testou todos os endpoints principais
- [ ] Atualizou scripts/automações
- [ ] Documentou mudanças específicas do projeto
- [ ] Treinou equipe nas mudanças

---

## 📚 Recursos Adicionais

### Documentação

- **API Endpoints:** [/supabase/functions/server/API_ENDPOINTS.md](supabase/functions/server/API_ENDPOINTS.md)
- **Routes Mapping:** [/supabase/functions/server/ROUTES_MAPPING.md](supabase/functions/server/ROUTES_MAPPING.md)
- **Database Service:** [/utils/DATABASE_SERVICE_MIGRATION.md](utils/DATABASE_SERVICE_MIGRATION.md)

### Coleções Postman

- **Antiga:** `Digital Game Store API.postman_collection.json`
- **Nova:** `SYNTHX.postman_collection.json`

### Links Externos

- **Postman Docs:** https://learning.postman.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **API Testing Guide:** https://www.postman.com/api-testing

---

## 🎯 Comparação Final

| Aspecto | Antiga | Nova | Melhoria |
|---------|--------|------|----------|
| **Requests** | ~30 | 50+ | +66% |
| **Testes Automáticos** | ❌ Poucos | ✅ Todos | 100% |
| **Documentação** | ❌ Básica | ✅ Completa | ∞ |
| **Variáveis** | 3 | 5 | +66% |
| **Organização** | ⚠️ Boa | ✅ Excelente | Melhorada |
| **Idioma** | 🇧🇷 Português | 🇺🇸 Inglês | Padronizado |

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Migração:** Completa e Documentada

**Última atualização:** 2025-01-20
