# 📝 .gitignore - Guia de Referência

Guia rápido sobre arquivos ignorados no Git para o projeto SYNTHX.

## 🎯 Arquivos Principais Ignorados

### 🔒 **1. Environment Variables (CRÍTICO)**

```gitignore
.env
.env.local
.env.*.local
```

**Por quê?**
- Contém credenciais sensíveis (Supabase keys)
- Nunca deve ser commitado
- Diferente para cada desenvolvedor/ambiente

**✅ Permitido:**
```gitignore
!.env.example  # Template sem valores reais
```

---

### 📦 **2. Dependencies**

```gitignore
node_modules/
```

**Por quê?**
- Milhares de arquivos (ocupa muito espaço)
- Gerado automaticamente via `npm install`
- Pode causar conflitos entre sistemas operacionais

**Como recuperar:**
```bash
npm install  # Usa package.json para reinstalar
```

---

### 💾 **3. Database Files (Legacy)**

```gitignore
*.db
*.sqlite
*.sqlite3
vendas_api.db
```

**Por quê?**
- Sistema antigo usava SQLite local
- Novo sistema usa Supabase (remoto)
- Evita commitar dados sensíveis

**Nota:** No novo sistema, esses arquivos não são mais gerados.

---

## 📋 Categorias Completas

### 🔐 Environment & Secrets

| Arquivo | Status | Observação |
|---------|--------|------------|
| `.env` | ❌ Ignorado | Credenciais locais |
| `.env.local` | ❌ Ignorado | Override local |
| `.env.production` | ❌ Ignorado | Produção local |
| `.env.example` | ✅ **Commitado** | Template sem valores |

---

### 📦 Dependencies & Build

| Arquivo/Pasta | Status | Observação |
|---------------|--------|------------|
| `node_modules/` | ❌ Ignorado | Dependências npm |
| `dist/` | ❌ Ignorado | Build output |
| `build/` | ❌ Ignorado | Build alternativo |
| `.vite/` | ❌ Ignorado | Cache do Vite |

---

### 💾 Databases

| Arquivo | Status | Observação |
|---------|--------|------------|
| `*.db` | ❌ Ignorado | SQLite files |
| `vendas_api.db` | ❌ Ignorado | DB do sistema antigo |
| `*.sqlite` | ❌ Ignorado | SQLite alternativo |

---

### 🖥️ IDE & Editors

| Arquivo/Pasta | Status | Observação |
|---------------|--------|------------|
| `.vscode/` | ❌ Ignorado | Configuração VSCode |
| `.idea/` | ❌ Ignorado | IntelliJ/WebStorm |
| `*.swp` | ❌ Ignorado | Vim temp files |

**Exceções:**
```gitignore
!.vscode/extensions.json  # Lista de extensões recomendadas
!.vscode/settings.json    # Configurações compartilhadas
```

---

### 🍎 OS Files

| Arquivo | Status | Observação |
|---------|--------|------------|
| `.DS_Store` | ❌ Ignorado | macOS metadata |
| `Thumbs.db` | ❌ Ignorado | Windows thumbnails |
| `Desktop.ini` | ❌ Ignorado | Windows config |

---

## 🚨 Arquivos Críticos (NUNCA Commitar)

### ⚠️ **Nível CRÍTICO - Risco de Segurança**

```gitignore
# Credenciais e secrets
.env
.env.local
.env.production
*.key
*.pem
secrets/

# Service role key do Supabase (acesso total!)
# Exemplo de conteúdo perigoso:
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Se você commitou acidentalmente:**

```bash
# 1. Remover do histórico (difícil!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 2. Forçar push (cuidado!)
git push origin --force --all

# 3. ROTAR AS CHAVES IMEDIATAMENTE
# Vá em: https://app.supabase.com/project/_/settings/api
# Clique em "Rotate" nas chaves comprometidas
```

---

## ✅ Arquivos Commitados (Importantes)

Estes arquivos **DEVEM** ser commitados:

```bash
# Configuração
✅ .env.example          # Template (sem valores reais)
✅ .gitignore            # Este arquivo!
✅ package.json          # Dependências
✅ tsconfig.json         # Config TypeScript

# Código fonte
✅ /components/**/*.tsx  # Componentes React
✅ /utils/**/*.ts        # Utilitários
✅ /types/**/*.ts        # Types TypeScript
✅ /supabase/functions/  # Backend

# Documentação
✅ README.md
✅ SETUP.md
✅ *.md                  # Todos os docs
```

---

## 🔍 Como Verificar

### Verificar arquivos ignorados

```bash
# Listar todos os arquivos ignorados
git status --ignored

# Verificar se arquivo específico está ignorado
git check-ignore -v .env
```

### Verificar o que será commitado

```bash
# Ver arquivos staged
git status

# Ver diff antes de commitar
git diff --cached
```

### Forçar adicionar arquivo ignorado (cuidado!)

```bash
# Apenas se REALMENTE necessário
git add -f arquivo-ignorado.txt
```

---

## 🛠️ Troubleshooting

### Problema: `.env` está sendo rastreado

**Solução:**

```bash
# 1. Remover do tracking (mas manter arquivo local)
git rm --cached .env

# 2. Commitar a remoção
git commit -m "Remove .env from tracking"

# 3. Verificar se .env está no .gitignore
cat .gitignore | grep .env
```

---

### Problema: `node_modules/` foi commitado

**Solução:**

```bash
# 1. Remover do tracking
git rm -r --cached node_modules

# 2. Commitar a remoção
git commit -m "Remove node_modules from tracking"

# 3. Verificar se está no .gitignore
cat .gitignore | grep node_modules
```

---

### Problema: Arquivo no .gitignore ainda aparece no Git

**Causas:**
1. Arquivo foi adicionado antes de estar no .gitignore
2. Arquivo foi adicionado com `git add -f`

**Solução:**

```bash
# Remover do tracking
git rm --cached arquivo-problema.txt

# Commitar
git commit -m "Remove arquivo-problema.txt"
```

---

## 📚 Boas Práticas

### ✅ **DO (Faça)**

1. **Sempre adicione .env ao .gitignore ANTES de criar o arquivo**
   ```bash
   # Ordem correta:
   echo ".env" >> .gitignore
   cp .env.example .env
   ```

2. **Commite .env.example sem valores reais**
   ```env
   # ✅ Correto
   SUPABASE_URL=https://your-project-id.supabase.co
   
   # ❌ Errado
   SUPABASE_URL=https://ceevveuntlqasbiwrlcb.supabase.co
   ```

3. **Verifique antes de commitar**
   ```bash
   git status
   git diff --cached
   ```

---

### ❌ **DON'T (Não faça)**

1. **Nunca commite arquivos com credenciais**
   ```bash
   # ❌ Perigoso!
   git add .env
   ```

2. **Nunca use `git add .` sem verificar**
   ```bash
   # ❌ Pode adicionar arquivos indesejados
   git add .
   
   # ✅ Melhor: adicione específico
   git add src/component.tsx
   ```

3. **Nunca ignore arquivos de código fonte**
   ```gitignore
   # ❌ Não faça isso!
   *.tsx
   *.ts
   ```

---

## 🔄 Workflow Recomendado

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/synthx.git
cd synthx

# 2. Verificar .gitignore
cat .gitignore

# 3. Copiar .env.example para .env
cp .env.example .env

# 4. Preencher credenciais (NÃO commitar!)
nano .env

# 5. Instalar dependências (NÃO commitar!)
npm install

# 6. Fazer mudanças no código
# ... editar arquivos ...

# 7. Verificar o que será commitado
git status
git diff

# 8. Adicionar apenas arquivos relevantes
git add src/component.tsx

# 9. Commitar
git commit -m "feat: add new component"

# 10. Push
git push origin main
```

---

## 📊 Estatísticas do .gitignore

### Arquivos Ignorados por Categoria

```
🔒 Secrets & Env Vars:    7 patterns
📦 Dependencies:          10 patterns
💾 Databases:            4 patterns
🏗️  Build Output:         8 patterns
🗑️  Cache & Temp:        12 patterns
🍎 OS Files:             6 patterns
🖥️  IDE Configs:          15 patterns
🧪 Testing:              6 patterns
📚 Misc:                 10 patterns
─────────────────────────────────────
   TOTAL:               78 patterns
```

---

## 📖 Referências

- **Git Docs:** https://git-scm.com/docs/gitignore
- **GitHub Gitignore Templates:** https://github.com/github/gitignore
- **Toptal Gitignore Generator:** https://www.toptal.com/developers/gitignore

---

## ✅ Checklist de Segurança

Antes de commitar:

- [ ] `.env` está no .gitignore
- [ ] `.env` não está no `git status`
- [ ] `node_modules/` não está sendo rastreado
- [ ] Nenhum arquivo `*.db` está sendo commitado
- [ ] Verificou `git diff --cached`
- [ ] `.env.example` não contém valores reais
- [ ] Nenhum secret/key está em arquivos commitados

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮

**Documentação:** Guia de .gitignore e Segurança
