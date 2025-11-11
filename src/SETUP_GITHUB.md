# 🚀 Guia Completo: Criar Repositório no GitHub

Este guia mostra como criar um repositório no GitHub e fazer o upload do projeto SYNTHX.

## 📋 Pré-requisitos

- Conta no GitHub (crie em [github.com](https://github.com))
- Git instalado no seu computador ([download aqui](https://git-scm.com/downloads))
- Projeto SYNTHX baixado/exportado do Figma Make

## 🎯 Método 1: Criar Repositório via GitHub Web

### Passo 1: Criar o Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Preencha os campos:
   - **Repository name**: `synthx` (ou o nome que preferir)
   - **Description**: "Loja digital de jogos com estética cyberpunk - React + TypeScript + Supabase"
   - **Visibility**: Escolha **Public** (público) ou **Private** (privado)
   - ❌ **NÃO** marque "Add a README file" (já temos um)
   - ❌ **NÃO** adicione .gitignore (já temos um)
   - ❌ **NÃO** escolha uma licença agora
5. Clique em **"Create repository"**

### Passo 2: Preparar o Projeto Localmente

1. **Baixe/exporte o projeto** do Figma Make para uma pasta no seu computador
2. Abra o **Terminal** (Mac/Linux) ou **Git Bash** (Windows)
3. Navegue até a pasta do projeto:
   ```bash
   cd caminho/para/pasta/synthx
   ```

### Passo 3: Inicializar Git e Fazer Upload

Execute os seguintes comandos no terminal:

```bash
# 1. Inicializar o repositório Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer o primeiro commit
git commit -m "🎮 Initial commit: SYNTHX Game Store - Complete e-commerce platform"

# 4. Renomear branch para main (se necessário)
git branch -M main

# 5. Adicionar o repositório remoto (substitua SEU-USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU-USUARIO/synthx.git

# 6. Fazer push dos arquivos
git push -u origin main
```

**⚠️ IMPORTANTE**: No passo 5, substitua `SEU-USUARIO` pelo seu nome de usuário do GitHub!

Exemplo:
```bash
git remote add origin https://github.com/joaosilva/synthx.git
```

### Passo 4: Verificar o Upload

1. Acesse `https://github.com/SEU-USUARIO/synthx` no navegador
2. Você deverá ver todos os arquivos do projeto
3. O README.md será exibido automaticamente na página inicial

## 🎯 Método 2: Usar GitHub Desktop (Mais Fácil)

### Passo 1: Instalar GitHub Desktop

1. Baixe em [desktop.github.com](https://desktop.github.com)
2. Instale e faça login com sua conta GitHub

### Passo 2: Adicionar o Projeto

1. No GitHub Desktop, vá em **File → Add Local Repository**
2. Selecione a pasta do projeto SYNTHX
3. Clique em **"Create a repository"** se ainda não for um repositório Git

### Passo 3: Configurar e Publicar

1. **Name**: `synthx`
2. **Description**: "Loja digital de jogos com estética cyberpunk"
3. **Git Ignore**: None (já temos um)
4. **License**: None
5. Clique em **"Create Repository"**
6. Clique em **"Publish repository"**
7. Escolha se será **Public** ou **Private**
8. Clique em **"Publish Repository"**

Pronto! Seu projeto está no GitHub.

## 🔐 Configurar Secrets (Variáveis de Ambiente)

Para garantir segurança, você deve configurar as secrets no GitHub:

### Passo 1: Acessar Settings

1. No seu repositório, clique em **"Settings"**
2. No menu lateral, clique em **"Secrets and variables"** → **"Actions"**

### Passo 2: Adicionar Secrets

Clique em **"New repository secret"** e adicione:

1. **SUPABASE_URL**
   - Value: URL do seu projeto Supabase

2. **SUPABASE_ANON_KEY**
   - Value: Chave anônima do Supabase

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Chave de serviço do Supabase

4. **SUPABASE_DB_URL**
   - Value: URL do banco de dados

## 📝 Comandos Git Úteis

### Atualizar o Repositório com Novas Mudanças

```bash
# 1. Adicionar arquivos modificados
git add .

# 2. Fazer commit com mensagem descritiva
git commit -m "✨ Adicionar nova funcionalidade"

# 3. Enviar para o GitHub
git push
```

### Ver Status dos Arquivos

```bash
git status
```

### Ver Histórico de Commits

```bash
git log --oneline
```

### Criar uma Nova Branch

```bash
git checkout -b feature/nova-funcionalidade
```

### Voltar para a Branch Main

```bash
git checkout main
```

## 🌟 Melhorar o README do Repositório

Depois de fazer o upload, você pode melhorar o README adicionando:

### 1. Badge de Status

```markdown
![GitHub repo size](https://img.shields.io/github/repo-size/SEU-USUARIO/synthx)
![GitHub contributors](https://img.shields.io/github/contributors/SEU-USUARIO/synthx)
![GitHub stars](https://img.shields.io/github/stars/SEU-USUARIO/synthx?style=social)
![GitHub forks](https://img.shields.io/github/forks/SEU-USUARIO/synthx?style=social)
```

### 2. Screenshots

Tire prints da aplicação e adicione na pasta `/screenshots`:

```markdown
## 📸 Screenshots

### Página Inicial
![Home Page](screenshots/home.png)

### Detalhes do Jogo
![Game Details](screenshots/game-details.png)

### Painel Admin
![Admin Dashboard](screenshots/admin-dashboard.png)
```

### 3. Demo Online

Se você fizer deploy (Vercel, Netlify, etc):

```markdown
## 🌐 Demo

Acesse a aplicação online: [SYNTHX Store](https://synthx.vercel.app)
```

## 🚀 Próximos Passos

1. ✅ Criar repositório no GitHub
2. ✅ Fazer upload do código
3. ✅ Configurar secrets
4. 📝 Adicionar screenshots
5. 🌐 Fazer deploy da aplicação
6. 📊 Configurar GitHub Actions (CI/CD)
7. 📄 Adicionar licença (MIT, Apache, etc)
8. 🎯 Criar GitHub Projects para gerenciar tarefas

## ❓ Problemas Comuns

### Erro: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/synthx.git
```

### Erro: "Permission denied (publickey)"

Configure SSH ou use HTTPS:
```bash
git remote set-url origin https://github.com/SEU-USUARIO/synthx.git
```

### Erro: "failed to push some refs"

```bash
git pull origin main --rebase
git push origin main
```

## 📚 Recursos Adicionais

- [GitHub Docs](https://docs.github.com)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub Desktop Manual](https://docs.github.com/en/desktop)
- [Markdown Guide](https://www.markdownguide.org/)

## 💡 Dicas Pro

1. **Commits Semânticos**: Use prefixos como:
   - `feat:` Nova funcionalidade
   - `fix:` Correção de bug
   - `docs:` Documentação
   - `style:` Formatação
   - `refactor:` Refatoração
   - `test:` Testes
   - `chore:` Manutenção

2. **Branch Protection**: Configure regras para proteger a branch main

3. **Pull Requests**: Use PRs para revisar código antes de mergear

4. **Issues**: Use GitHub Issues para rastrear bugs e features

5. **Wiki**: Use GitHub Wiki para documentação extensa

---

✅ Após seguir este guia, seu projeto SYNTHX estará no GitHub e pronto para colaboração!

🎮 Boa sorte com seu projeto!
