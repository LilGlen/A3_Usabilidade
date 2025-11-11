# 🚀 SYNTHX - Guia de Setup Completo

Guia passo a passo para configurar e executar a loja digital SYNTHX.

## 📋 Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org))
- Conta Supabase ([Criar conta gratuita](https://supabase.com))
- Git ([Download](https://git-scm.com))

## 🏗️ Setup em 5 Passos

### 1️⃣ Clone o Repositório

```bash
# Clone o projeto
git clone https://github.com/seu-usuario/synthx.git
cd synthx

# Instale dependências
npm install
```

### 2️⃣ Configure o Supabase

#### 2.1. Crie um Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha:
   - **Name:** SYNTHX
   - **Database Password:** (salve essa senha!)
   - **Region:** Escolha a mais próxima
4. Aguarde ~2 minutos para o projeto ser criado

#### 2.2. Obtenha as Credenciais

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public** key
   - **service_role secret** key (⚠️ mantenha seguro!)

### 3️⃣ Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas credenciais
nano .env  # ou use seu editor preferido
```

Preencha as variáveis:

```bash
SUPABASE_URL=https://seu-projeto-id.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

**⚠️ IMPORTANTE:** NUNCA commite o arquivo `.env` no Git!

### 4️⃣ Configure o Backend (Supabase Functions)

#### 4.1. Instale o Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (via npm)
npm install -g supabase

# Verifique instalação
supabase --version
```

#### 4.2. Faça Login no Supabase

```bash
supabase login
```

Isso abrirá seu navegador para autenticação.

#### 4.3. Vincule ao Projeto

```bash
supabase link --project-ref seu-project-id
```

Encontre seu `project-id` na URL do Supabase: `https://app.supabase.com/project/[project-id]`

#### 4.4. Deploy do Backend

```bash
# Deploy da função do servidor
supabase functions deploy make-server-23051d03

# Configure as variáveis de ambiente no Supabase
supabase secrets set SUPABASE_URL=https://seu-projeto.supabase.co
supabase secrets set SUPABASE_ANON_KEY=sua-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-key
```

#### 4.5. Popule o Banco de Dados

```bash
# Use curl ou Postman para popular o banco
curl -X POST https://seu-projeto.supabase.co/functions/v1/make-server-23051d03/seed
```

Ou acesse: `https://seu-projeto.supabase.co/functions/v1/make-server-23051d03/seed` no navegador.

Isso criará:
- ✅ 13 categorias
- ✅ 15 empresas
- ✅ 22 jogos (do CSV original)

### 5️⃣ Execute o Frontend

```bash
# Modo desenvolvimento
npm run dev

# O app estará disponível em http://localhost:5173
```

## 🎯 Criar Usuário Admin

### Via API (Recomendado)

```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/make-server-23051d03/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@synthx.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Via Interface (Setup Wizard)

1. Acesse: http://localhost:5173
2. Clique em **Setup Wizard** (se disponível)
3. Siga os passos para criar admin

### Login

Após criar o admin:
1. Clique em **Login**
2. Email: `admin@synthx.com`
3. Senha: `admin123`

## 🧪 Testar a API

### Health Check

```bash
curl https://seu-projeto.supabase.co/functions/v1/make-server-23051d03/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Listar Jogos

```bash
curl https://seu-projeto.supabase.co/functions/v1/make-server-23051d03/games
```

### Login e Obter Token

```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/make-server-23051d03/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@synthx.com",
    "password": "admin123"
  }'
```

Salve o `token` retornado para usar em requisições autenticadas.

## 📦 Deploy em Produção

### Opção 1: Vercel (Recomendado para Frontend)

```bash
# Instale Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configure variáveis de ambiente no painel Vercel
```

Variáveis necessárias:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Opção 2: Netlify

```bash
# Instale Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Configure variáveis em Site Settings > Environment
```

### Backend (Supabase Functions)

O backend já está deployado no Supabase! Não é necessário deploy adicional.

## 🔧 Configuração Avançada

### Habilitar Auth Social (Google, GitHub, etc.)

1. No Supabase, vá em **Authentication** > **Providers**
2. Habilite o provider desejado (ex: Google)
3. Siga [este guia](https://supabase.com/docs/guides/auth/social-login/auth-google)
4. Configure as credenciais OAuth

### Configurar Email Templates

1. Vá em **Authentication** > **Email Templates**
2. Customize os templates de:
   - Confirmação de email
   - Reset de senha
   - Magic link

### Configurar Storage (para imagens de jogos)

1. Vá em **Storage** > **Create bucket**
2. Nome: `game-images`
3. Visibilidade: Public ou Private
4. Configure políticas RLS se necessário

## 🐛 Troubleshooting

### Problema: "CORS error" ao fazer requisições

**Solução:** Verifique se `SUPABASE_URL` está correto no `.env`

### Problema: "401 Unauthorized" em todas as rotas

**Solução:** 
1. Verifique se `SUPABASE_ANON_KEY` está correto
2. Faça login novamente e obtenha novo token
3. Verifique se o token está sendo enviado no header: `Authorization: Bearer <token>`

### Problema: "404 Not Found" na API

**Solução:**
1. Verifique se o backend foi deployado: `supabase functions list`
2. Teste o health check: `GET /make-server-23051d03/health`
3. Verifique logs: Supabase Dashboard > Functions > Logs

### Problema: Banco de dados vazio após seed

**Solução:**
1. Execute seed novamente: `POST /make-server-23051d03/seed`
2. Verifique logs no Supabase Dashboard
3. Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada

### Problema: "Invalid token" após login

**Solução:**
1. Limpe localStorage: `localStorage.clear()`
2. Faça logout e login novamente
3. Verifique se o token não expirou (24h por padrão)

## 📚 Documentação Adicional

- **API Endpoints:** [API_ENDPOINTS.md](/supabase/functions/server/API_ENDPOINTS.md)
- **Rotas Mapeadas:** [ROUTES_MAPPING.md](/supabase/functions/server/ROUTES_MAPPING.md)
- **Estrutura do Banco:** [DATABASE_STRUCTURE.md](/supabase/functions/server/DATABASE_STRUCTURE.md)
- **Crypto Utils:** [CRYPTO_GUIDE.md](/utils/CRYPTO_GUIDE.md)
- **Database Service:** [DATABASE_SERVICE_MIGRATION.md](/utils/DATABASE_SERVICE_MIGRATION.md)
- **Types System:** [README.md](/types/README.md)

## 🎯 Próximos Passos

Após o setup:

1. ✅ Explore a loja como usuário
2. ✅ Faça login como admin e gerencie jogos
3. ✅ Teste o fluxo de compra completo
4. ✅ Customize o design (cores, fontes em `styles/globals.css`)
5. ✅ Adicione mais jogos via painel admin
6. ✅ Configure email templates no Supabase
7. ✅ Deploy em produção (Vercel/Netlify)

## 💡 Dicas

### Desenvolvimento Local

```bash
# Frontend em modo watch
npm run dev

# Abrir em navegador automaticamente
npm run dev -- --open

# Expor na rede local
npm run dev -- --host
```

### Logs do Backend

```bash
# Visualizar logs em tempo real
supabase functions logs make-server-23051d03 --tail

# Logs específicos
supabase functions logs make-server-23051d03 --tail --filter "error"
```

### Resetar Banco de Dados

```bash
# CUIDADO: Isso apaga TODOS os dados!
# Limpar KV Store manualmente via Supabase Dashboard
# Depois execute seed novamente
curl -X POST https://seu-projeto.supabase.co/functions/v1/make-server-23051d03/seed
```

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes de contribuição.

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Issues:** [GitHub Issues](https://github.com/seu-usuario/synthx/issues)
- **Discussions:** [GitHub Discussions](https://github.com/seu-usuario/synthx/discussions)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Discord:** [Supabase Discord](https://discord.supabase.com)

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Stack:** React + TypeScript + Tailwind CSS + Supabase
