# ⚡ SYNTHX - Quickstart Guide

Setup rápido em 3 minutos para começar a desenvolver!

## 🚀 Setup em 3 Passos

### 1️⃣ Instalar Dependências (1 min)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/synthx.git
cd synthx

# Instale dependências
npm install
```

### 2️⃣ Configurar Ambiente (1 min)

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite com suas credenciais Supabase
nano .env  # ou use seu editor preferido
```

**Preencha:**
```env
SUPABASE_URL=https://ceevveuntlqasbiwrlcb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> 💡 **Dica:** Você pode usar as credenciais em `.env.development.example` para testar rapidamente!

### 3️⃣ Executar (30 seg)

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Abra no navegador: http://localhost:5173
```

✅ **Pronto!** A aplicação está rodando!

---

## 🎯 Primeiros Passos

### Criar Usuário Admin

1. Acesse: http://localhost:5173
2. Clique em **"Entrar"** no header
3. Clique em **"Criar conta"**
4. Preencha:
   - Nome: `Admin`
   - Email: `admin@synthx.com`
   - Senha: `admin123`

### Popular o Banco de Dados

```bash
# Execute o seed para popular jogos, categorias e empresas
curl -X POST https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03/seed
```

Ou acesse no navegador:
```
https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03/seed
```

Isso criará:
- ✅ 13 categorias
- ✅ 15 empresas
- ✅ 22 jogos

### Explorar a Loja

1. **Página Inicial:** Navegue pelos jogos
2. **Detalhes:** Clique em um jogo para ver detalhes
3. **Carrinho:** Adicione jogos ao carrinho
4. **Checkout:** Finalize a compra
5. **Perfil:** Veja suas compras e chaves

---

## 📁 Estrutura do Projeto

```
synthx/
├── App.tsx                 # Componente principal
├── components/             # Componentes React
│   ├── HomePage.tsx       # Página inicial
│   ├── GameDetailsPage.tsx # Detalhes do jogo
│   ├── CheckoutPage.tsx   # Checkout
│   ├── AdminPage.tsx      # Admin dashboard
│   └── ...
├── utils/                  # Utilitários
│   ├── DatabaseService.ts # Client API
│   ├── crypto.ts          # Funções de criptografia
│   └── supabase/          # Configuração Supabase
├── supabase/functions/     # Backend (Hono server)
│   └── server/
│       ├── routes.tsx     # Endpoints da API
│       └── seed.tsx       # Seed do banco
├── types/                  # TypeScript types
└── styles/                 # Estilos globais
```

---

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar dev server
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint (verificar código)
npm run lint
```

### Backend (Supabase)

```bash
# Deploy do backend
supabase functions deploy make-server-23051d03

# Ver logs em tempo real
supabase functions logs make-server-23051d03 --tail

# Configurar secrets
supabase secrets set SUPABASE_URL=https://...
```

### Git

```bash
# Verificar status
git status

# Ver arquivos ignorados
git status --ignored

# Commitar mudanças
git add .
git commit -m "feat: sua mensagem"
git push origin main
```

---

## 🎮 Funcionalidades Principais

### Para Usuários

- ✅ Navegação de jogos por categoria
- ✅ Busca e filtros
- ✅ Carrinho de compras
- ✅ Checkout com múltiplos jogos
- ✅ Histórico de compras
- ✅ Chaves de ativação
- ✅ Sistema de avaliações

### Para Admins

- ✅ Gerenciar jogos (CRUD)
- ✅ Gerenciar categorias
- ✅ Gerenciar empresas
- ✅ Relatórios e gráficos
- ✅ Dashboard administrativo

---

## 🐛 Problemas Comuns

### Erro: "CORS policy"

**Solução:** Verifique se `SUPABASE_URL` está correto no `.env`

```bash
# Deve começar com https://
SUPABASE_URL=https://ceevveuntlqasbiwrlcb.supabase.co
```

### Erro: "401 Unauthorized"

**Solução:** Verifique se `SUPABASE_ANON_KEY` está correto

```bash
# Copie a chave completa do Supabase Dashboard
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Erro: "Failed to fetch"

**Solução:** Verifique se o backend está funcionando

```bash
# Teste o health check
curl https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

### Banco de dados vazio

**Solução:** Execute o seed

```bash
curl -X POST https://ceevveuntlqasbiwrlcb.supabase.co/functions/v1/make-server-23051d03/seed
```

---

## 📚 Documentação Completa

Para guias mais detalhados:

- **Setup Completo:** [SETUP.md](SETUP.md)
- **API Endpoints:** [/supabase/functions/server/API_ENDPOINTS.md](supabase/functions/server/API_ENDPOINTS.md)
- **Types System:** [/types/README.md](types/README.md)
- **Crypto Utils:** [/utils/CRYPTO_GUIDE.md](utils/CRYPTO_GUIDE.md)
- **Environment Vars:** [ENV_MIGRATION_GUIDE.md](ENV_MIGRATION_GUIDE.md)
- **Gitignore Guide:** [GITIGNORE_GUIDE.md](GITIGNORE_GUIDE.md)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commite: `git commit -m 'feat: adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/seu-usuario/synthx/issues)
- **Documentação:** [SETUP.md](SETUP.md)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Stack:** React + TypeScript + Tailwind CSS + Supabase

**Tempo de setup:** ~3 minutos ⚡
