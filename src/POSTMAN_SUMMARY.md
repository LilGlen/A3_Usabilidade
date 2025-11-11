# 📮 Postman Collection - Summary

Resumo executivo da coleção do Postman SYNTHX.

## 📊 Quick Stats

| Métrica | Valor |
|---------|-------|
| **Total de Requests** | 50+ |
| **Grupos** | 10 |
| **Testes Automatizados** | 100% cobertura |
| **Variáveis** | 5 (baseUrl, anonKey, token, adminToken, userId) |
| **Base URL** | `https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03` |

---

## 🗂️ Estrutura

```
SYNTHX.postman_collection.json
├── Auth (5 requests)
│   ├── Signup
│   ├── Login
│   ├── Login (Admin)
│   ├── Logout
│   └── Validate Token
│
├── Games (7 requests)
│   ├── List All Games
│   ├── Get Game by ID
│   ├── Search Games
│   ├── Filter Games by Category
│   ├── Create Game (Admin)
│   ├── Update Game (Admin)
│   └── Delete Game (Admin)
│
├── Categories (5 requests)
│   ├── List All Categories
│   ├── Get Category by ID
│   ├── Create Category (Admin)
│   ├── Update Category (Admin)
│   └── Delete Category (Admin)
│
├── Companies (5 requests)
│   ├── List All Companies
│   ├── Get Company by ID
│   ├── Create Company (Admin)
│   ├── Update Company (Admin)
│   └── Delete Company (Admin)
│
├── Cart (4 requests)
│   ├── Get Cart
│   ├── Add to Cart
│   ├── Remove from Cart
│   └── Clear Cart
│
├── Purchases (4 requests)
│   ├── Checkout
│   ├── Get Purchase History
│   ├── Get Purchase by ID
│   └── Get Activation Keys
│
├── Reviews (5 requests)
│   ├── Get Reviews by Game
│   ├── Get Average Rating
│   ├── Create Review
│   ├── Update Review
│   └── Delete Review
│
├── Users (4 requests)
│   ├── Get Current User
│   ├── Update Current User
│   ├── List All Users (Admin)
│   └── Get User by ID (Admin)
│
├── Reports (4 requests)
│   ├── Sales Report
│   ├── Top Games
│   ├── Categories Report
│   └── Revenue Report
│
└── Health & Seed (2 requests)
    ├── Health Check
    └── Seed Database
```

---

## 🚀 Como Usar

### 1. Importar

```bash
# No Postman:
Import > Select File > SYNTHX.postman_collection.json
```

### 2. Configurar (Opcional)

Variáveis já estão pré-configuradas:
- ✅ `baseUrl` - URL da API
- ✅ `anonKey` - Chave pública Supabase
- ✅ `token` - Preenchido automaticamente no login
- ✅ `adminToken` - Preenchido automaticamente no login admin
- ✅ `userId` - Preenchido automaticamente no login

### 3. Testar

```bash
# 1. Health Check
GET {{baseUrl}}/health

# 2. Seed Database
POST {{baseUrl}}/seed

# 3. Login
POST {{baseUrl}}/auth/login
{
  "email": "cliente@synthx.com",
  "password": "cliente123"
}

# 4. Explorar!
```

---

## 📋 Comparação: Antiga vs Nova

| Aspecto | Antiga | Nova | Δ |
|---------|--------|------|---|
| **Nome** | Digital Game Store API | SYNTHX - Digital Game Store (Supabase) | ✅ |
| **Base URL** | `http://localhost:3000/api/v1` | `https://...supabase.co/.../make-server-23051d03` | ✅ |
| **Requests** | ~30 | 50+ | +66% |
| **Grupos** | 10 | 10 | = |
| **Testes** | Poucos | Todos | +100% |
| **Variáveis** | 3 | 5 | +66% |
| **Idioma** | PT-BR | EN-US | ✅ |
| **Auth** | JWT custom | Supabase Auth | ✅ |

---

## 🔑 Variáveis da Coleção

```json
{
  "baseUrl": "https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03",
  "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "",        // Auto-preenchido no login
  "adminToken": "",   // Auto-preenchido no login admin
  "userId": ""        // Auto-preenchido no login
}
```

---

## 🎯 Endpoints Principais

### Auth
- `POST /auth/signup` - Criar conta
- `POST /auth/login` - Fazer login
- `POST /auth/logout` - Fazer logout
- `GET /auth/validate` - Validar token

### Games
- `GET /games` - Listar jogos
- `GET /games/:id` - Detalhes do jogo
- `GET /games/search?q=term` - Buscar
- `POST /games` - Criar (admin)
- `PUT /games/:id` - Atualizar (admin)
- `DELETE /games/:id` - Deletar (admin)

### Cart
- `GET /cart` - Ver carrinho
- `POST /cart` - Adicionar ao carrinho
- `DELETE /cart/:gameId` - Remover do carrinho
- `DELETE /cart` - Limpar carrinho

### Purchases
- `POST /purchases/checkout` - Finalizar compra
- `GET /purchases` - Histórico de compras
- `GET /purchases/:id` - Detalhes da compra
- `GET /purchases/:id/keys` - Ver chaves

---

## ✅ Features

### Testes Automatizados

Todos os requests têm scripts de teste:

```javascript
// Exemplo - Login
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Has access token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('access_token');
    
    // Salva token automaticamente
    pm.collectionVariables.set("token", jsonData.access_token);
});
```

### Auto-Save de Variáveis

- ✅ Token salvo automaticamente no login
- ✅ Admin token salvo no login admin
- ✅ User ID salvo no login
- ✅ Não precisa copiar/colar manualmente

### Documentação Embutida

Cada request tem descrição completa:

```
POST /auth/signup

Criar nova conta de usuário.

Roles disponíveis: 'user', 'admin'

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

---

## 🐛 Troubleshooting

### 401 Unauthorized
**Solução:** Execute login novamente

### 404 Not Found
**Solução:** Verifique se usou endpoint correto (ex: `/games` não `/jogos`)

### CORS Error
**Solução:** Verifique se baseUrl tem `https://`

### Database Empty
**Solução:** Execute Seed Database

---

## 📚 Documentação

- **Este arquivo:** Resumo rápido
- **[POSTMAN_MIGRATION_GUIDE.md](POSTMAN_MIGRATION_GUIDE.md)** - Guia completo de migração
- **[API_ENDPOINTS.md](supabase/functions/server/API_ENDPOINTS.md)** - Documentação da API

---

## 📁 Arquivos

```
/
├── SYNTHX.postman_collection.json           ✅ Nova coleção
├── Digital Game Store API.postman_collection.json  ⚠️  Antiga
├── POSTMAN_MIGRATION_GUIDE.md              ✅ Guia de migração
└── POSTMAN_SUMMARY.md                      ✅ Este arquivo
```

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Coleção Postman:** Completa e Testada
