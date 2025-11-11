# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o SYNTHX! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Guia de Estilo](#guia-de-estilo)
- [Commits](#commits)
- [Pull Requests](#pull-requests)

## 📜 Código de Conduta

Este projeto segue um Código de Conduta. Ao participar, espera-se que você siga estas diretrizes:

- Use linguagem acolhedora e inclusiva
- Respeite diferentes pontos de vista e experiências
- Aceite críticas construtivas graciosamente
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## 🎯 Como Posso Contribuir?

### 🐛 Reportando Bugs

Antes de criar um relatório de bug:

- Verifique se o bug já não foi reportado nas [Issues](https://github.com/seu-usuario/synthx/issues)
- Use a versão mais recente do código

Ao criar um relatório de bug, inclua:

- **Título claro e descritivo**
- **Passos para reproduzir** o problema
- **Comportamento esperado** vs **comportamento atual**
- **Screenshots** se aplicável
- **Ambiente** (navegador, SO, versão do Node, etc)

Exemplo:

```markdown
## Descrição

O botão de adicionar ao carrinho não funciona em jogos sem estoque

## Passos para Reproduzir

1. Vá para a página de um jogo sem estoque
2. Clique no botão "Adicionar ao Carrinho"
3. Observe que nada acontece

## Comportamento Esperado

Deveria exibir uma mensagem informando que o jogo está fora de estoque

## Comportamento Atual

Nada acontece, sem feedback visual

## Ambiente

- Navegador: Chrome 120.0
- SO: Windows 11
- Node: 18.17.0
```

### 💡 Sugerindo Melhorias

Para sugerir melhorias:

- Use um **título claro e descritivo**
- Forneça uma **descrição detalhada** da melhoria sugerida
- Explique **por que** essa melhoria seria útil
- Inclua **exemplos** ou **mockups** se possível

### 🔧 Contribuindo com Código

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie uma branch** para sua feature/fix
4. **Desenvolva** e teste suas mudanças
5. **Commit** suas mudanças
6. **Push** para seu fork
7. Abra um **Pull Request**

## 🛠️ Processo de Desenvolvimento

### 1️⃣ Setup do Ambiente

```bash
# Clone seu fork
git clone https://github.com/seu-usuario/synthx.git
cd synthx

# Adicione o repositório original como upstream
git remote add upstream https://github.com/original-usuario/synthx.git

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

### 2️⃣ Criar uma Branch

Use nomes descritivos para branches:

```bash
# Features
git checkout -b feature/adicionar-filtro-preco

# Bugs
git checkout -b fix/corrigir-calculo-desconto

# Documentação
git checkout -b docs/atualizar-readme

# Refatoração
git checkout -b refactor/melhorar-performance-lista
```

### 3️⃣ Desenvolver

- Escreva código limpo e bem comentado
- Siga as convenções de código do projeto
- Teste suas mudanças localmente
- Certifique-se de que não há erros no console

### 4️⃣ Testar

```bash
# Execute a aplicação
npm run dev

# Verifique:
- [ ] Funcionalidade funciona como esperado
- [ ] Não quebra funcionalidades existentes
- [ ] Responsividade (mobile, tablet, desktop)
- [ ] Acessibilidade (navegação por teclado, ARIA labels)
- [ ] Performance (sem lentidão)
```

### 5️⃣ Commit

Siga o padrão de commits semânticos:

```bash
git add .
git commit -m "feat: adicionar filtro de preço na listagem de jogos"
```

## 📝 Guia de Estilo

### TypeScript

```typescript
// ✅ BOM
interface Game {
  id: string;
  title: string;
  price: number;
}

const formatPrice = (cents: number): string => {
  return `R$ ${(cents / 100).toFixed(2)}`;
};

// ❌ RUIM
const formatPrice = (cents) => {
  return "R$ " + (cents / 100).toFixed(2);
};
```

### React Components

```typescript
// ✅ BOM - Componente funcional com TypeScript
interface GameCardProps {
  game: Game;
  onAddToCart: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onAddToCart }) => {
  return (
    <div className="rounded-lg bg-[#1E1E1E] p-4">
      <h3>{game.title}</h3>
      <button onClick={() => onAddToCart(game.id)}>
        Adicionar ao Carrinho
      </button>
    </div>
  );
};

// ❌ RUIM - Sem tipos
export const GameCard = ({ game, onAddToCart }) => {
  // ...
};
```

### Tailwind CSS

```typescript
// ✅ BOM - Classes organizadas
<div className="flex items-center justify-between rounded-lg bg-[#1E1E1E] p-4 hover:bg-[#2A2A2A]">

// ❌ RUIM - Classes desorganizadas
<div className="p-4 bg-[#1E1E1E] flex rounded-lg items-center hover:bg-[#2A2A2A] justify-between">
```

### Nomenclatura

```typescript
// ✅ BOM
const userProfile = getUserProfile();
const isAuthenticated = checkAuth();
const handleSubmit = () => {
  /* ... */
};

// ❌ RUIM
const up = getUserProfile();
const auth = checkAuth();
const submit = () => {
  /* ... */
};
```

## 💾 Commits

### Formato

```
tipo(escopo): descrição curta

Descrição mais detalhada se necessário.

- Item relevante 1
- Item relevante 2
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula faltando, etc
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adição de testes
- `chore`: Manutenção, atualização de dependências

### Exemplos

```bash
# Feature
git commit -m "feat(cart): adicionar botão de remover item"

# Bug fix
git commit -m "fix(checkout): corrigir cálculo de desconto"

# Documentação
git commit -m "docs: atualizar instruções de instalação no README"

# Refatoração
git commit -m "refactor(api): simplificar lógica de autenticação"
```

## 🔀 Pull Requests

### Antes de Abrir um PR

- [ ] Código está funcionando localmente
- [ ] Sem erros no console
- [ ] Código segue o guia de estilo
- [ ] Commits seguem o padrão
- [ ] Branch está atualizada com main

```bash
# Atualizar sua branch
git fetch upstream
git rebase upstream/main
```

### Template do PR

```markdown
## 📝 Descrição

Breve descrição das mudanças

## 🎯 Tipo de Mudança

- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## ✅ Checklist

- [ ] Código segue o guia de estilo
- [ ] Comentários foram adicionados onde necessário
- [ ] Documentação foi atualizada
- [ ] Sem warnings no console
- [ ] Funciona em mobile/tablet/desktop

## 📸 Screenshots

Se aplicável, adicione screenshots

## 🔗 Issues Relacionadas

Resolve #123
```

### Processo de Revisão

1. Mantenedor revisa o código
2. Feedback é fornecido
3. Você atualiza baseado no feedback
4. PR é aprovado e mergeado

## 🏗️ Estrutura do Projeto

Ao adicionar novos arquivos, siga a estrutura:

```
components/
  ├── NomeDoComponente.tsx    # Componente principal
  ui/
    └── shadcn-component.tsx   # Apenas componentes Shadcn

supabase/
  └── functions/
      └── server/
          ├── index.tsx         # Rotas principais
          └── utils.tsx         # Utilitários do servidor

styles/
  └── globals.css              # Estilos globais

utils/
  └── helpers.tsx              # Funções utilitárias
```

## 🎨 Design System

Ao criar novos componentes, use as cores do design system:

```css
--background-primary: #121212 --background-secondary: #1e1e1e
  --accent-purple: #9146ff --text-primary: #ffffff
  --text-secondary: #b0b0b0;
```

## 🔒 Segurança

- **Nunca** commite credenciais ou secrets
- Use variáveis de ambiente para dados sensíveis
- Não exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend
- Valide inputs do usuário
- Sanitize dados antes de exibir

## ❓ Dúvidas?

Se tiver dúvidas sobre como contribuir:

1. Verifique as [Issues](https://github.com/seu-usuario/synthx/issues)
2. Abra uma [Discussion](https://github.com/seu-usuario/synthx/discussions)
3. Entre em contato: seu-email@exemplo.com

## 🙏 Obrigado!

Toda contribuição é bem-vinda, seja grande ou pequena. Obrigado por dedicar seu tempo para melhorar o SYNTHX! 💜

---

**Feito com 💜 pela comunidade SYNTHX**