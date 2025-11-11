# SYNTHX - Loja Digital de Jogos

![SYNTHX Logo](https://via.placeholder.com/1200x400/9146FF/FFFFFF?text=SYNTHX+Game+Store)

## 🎮 Sobre o Projeto

SYNTHX é uma loja digital de jogos completa com estética dark/cyberpunk, desenvolvida com React, TypeScript, Tailwind CSS e Supabase. O sistema oferece funcionalidades completas de e-commerce incluindo autenticação JWT, gerenciamento de produtos, carrinho de compras, checkout e relatórios administrativos.

## ✨ Características Principais

### 🎨 Design
- **Estética Dark/Cyberpunk** com paleta de cores personalizada
  - Fundo Principal: `#121212`
  - Fundo Secundário: `#1E1E1E`
  - Cor de Destaque: `#9146FF` (Roxo)
- **Tipografia**: Poppins (títulos) e Inter (corpo de texto)
- **Totalmente Responsivo**: Adaptado para desktop, tablet e mobile

### 🛒 Funcionalidades E-commerce
- **Catálogo de Jogos**: Navegação por categorias e empresas
- **Detalhes de Produtos**: Informações completas, galeria de imagens, vídeos
- **Carrinho de Compras**: Adicionar, remover e modificar quantidades
- **Checkout**: Processo completo de finalização de compra
- **Histórico de Compras**: Visualização de pedidos anteriores
- **Sistema de Avaliações**: Usuários podem avaliar jogos com notas e comentários

### 👤 Autenticação & Perfil
- **Sistema de Login/Registro**: Autenticação JWT via Supabase
- **Perfil de Usuário**: Gerenciamento de dados pessoais
- **Histórico Personalizado**: Compras e avaliações do usuário

### 🔧 Área Administrativa
- **Gerenciamento de Empresas**: CRUD completo de desenvolvedoras/publishers
- **Gerenciamento de Categorias**: Organização de jogos por gênero
- **Gerenciamento de Jogos**: Adicionar, editar e remover produtos
- **Relatórios Visuais**: Gráficos com Recharts
  - Vendas por período
  - Jogos mais vendidos
  - Receita total
  - Produtos em estoque

### ♿ Acessibilidade
- **Seguindo Heurísticas de Nielsen**
- **Navegação por Teclado**: Suporte completo
- **ARIA Labels**: Para leitores de tela
- **Notificações Toast**: Feedback visual para ações do usuário

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS v4.0** para estilização
- **Shadcn/UI** para componentes
- **Lucide React** para ícones
- **Recharts** para gráficos e visualizações
- **Motion/React** para animações
- **Sonner** para notificações toast

### Backend
- **Supabase Edge Functions** (Hono server)
- **Supabase Auth** para autenticação
- **Supabase Storage** para armazenamento de imagens
- **PostgreSQL** via Supabase (tabela KV Store)

### Bibliotecas Adicionais
- React Hook Form para formulários
- React Slick para carrosséis
- date-fns para manipulação de datas

## 📦 Estrutura do Projeto

```
├── App.tsx                          # Componente principal com roteamento
├── components/
│   ├── AuthContext.tsx              # Context para autenticação
│   ├── CartContext.tsx              # Context para carrinho de compras
│   ├── AuthModal.tsx                # Modal de login/registro
│   ├── Header.tsx                   # Cabeçalho da aplicação
│   ├── Footer.tsx                   # Rodapé da aplicação
│   ├── HomePage.tsx                 # Página inicial
│   ├── GameDetailsPageNew.tsx       # Detalhes do jogo
│   ├── CheckoutPageNew.tsx          # Página de checkout
│   ├── UserProfilePageNew.tsx       # Perfil do usuário
│   ├── ManagementPageNew.tsx        # Gerenciamento admin
│   ├── AdminPageComplete.tsx        # Relatórios administrativos
│   ├── Avatar.tsx                   # Componente de avatar customizado
│   ├── MiniCart.tsx                 # Mini carrinho lateral
│   ├── ToastProvider.tsx            # Provider de notificações
│   └── ui/                          # Componentes Shadcn/UI
├── styles/
│   └── globals.css                  # Estilos globais e tokens
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx            # Servidor Hono
│           ├── kv_store.tsx         # Utilitários KV Store
│           └── seed.tsx             # Dados de seed
└── utils/
    └── supabase/
        └── info.tsx                 # Configuração Supabase
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- Conta no Supabase
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/synthx.git
cd synthx
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` com as seguintes variáveis:
```env
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

4. **Configure o Supabase**

- Crie um projeto no [Supabase](https://supabase.com)
- A tabela `kv_store_23051d03` será criada automaticamente
- Deploy das Edge Functions (veja seção abaixo)

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🌐 Deploy das Edge Functions

1. **Instale o Supabase CLI**
```bash
npm install -g supabase
```

2. **Login no Supabase**
```bash
supabase login
```

3. **Link com seu projeto**
```bash
supabase link --project-ref seu-project-ref
```

4. **Deploy das functions**
```bash
supabase functions deploy server
```

## 📊 API Endpoints

### Autenticação
- `POST /make-server-23051d03/signup` - Cadastro de usuário
- `POST /make-server-23051d03/login` - Login (via Supabase Auth)

### Empresas
- `GET /make-server-23051d03/companies` - Listar empresas
- `POST /make-server-23051d03/companies` - Criar empresa (admin)
- `PUT /make-server-23051d03/companies/:id` - Atualizar empresa (admin)
- `DELETE /make-server-23051d03/companies/:id` - Deletar empresa (admin)

### Categorias
- `GET /make-server-23051d03/categories` - Listar categorias
- `POST /make-server-23051d03/categories` - Criar categoria (admin)
- `PUT /make-server-23051d03/categories/:id` - Atualizar categoria (admin)
- `DELETE /make-server-23051d03/categories/:id` - Deletar categoria (admin)

### Jogos
- `GET /make-server-23051d03/games` - Listar jogos
- `GET /make-server-23051d03/games/:id` - Detalhes do jogo
- `POST /make-server-23051d03/games` - Criar jogo (admin)
- `PUT /make-server-23051d03/games/:id` - Atualizar jogo (admin)
- `DELETE /make-server-23051d03/games/:id` - Deletar jogo (admin)

### Carrinho & Checkout
- `POST /make-server-23051d03/checkout` - Finalizar compra (autenticado)

### Avaliações
- `GET /make-server-23051d03/reviews/:gameId` - Obter avaliações de um jogo
- `POST /make-server-23051d03/reviews` - Criar avaliação (autenticado)

### Relatórios (Admin)
- `GET /make-server-23051d03/reports/sales` - Relatório de vendas
- `GET /make-server-23051d03/reports/top-games` - Jogos mais vendidos

## 👥 Usuários de Teste

O sistema inclui dados de seed com os seguintes usuários:

**Administrador:**
- Email: `admin@synthx.com`
- Senha: `Admin123!`

**Usuário Normal:**
- Email: `user@synthx.com`
- Senha: `User123!`

## 🎯 Regras de Negócio

- Usuários devem estar autenticados para realizar compras
- Apenas administradores podem gerenciar empresas, categorias e jogos
- Usuários só podem avaliar jogos que compraram
- Avaliações têm notas de 1 a 5
- Preços são armazenados em centavos (ex: R$ 59,99 = 5999)
- Jogos podem ter múltiplas imagens e vídeos
- Estoque é decrementado automaticamente após compra

## 🔐 Segurança

- Autenticação JWT via Supabase Auth
- Tokens de acesso em headers Authorization
- Validação de permissões no backend
- Service Role Key nunca exposta no frontend
- Buckets de storage privados com signed URLs

## 📱 Responsividade

A aplicação é totalmente responsiva com breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com 💜 por [Seu Nome]

## 📧 Contato

- Email: seu-email@exemplo.com
- LinkedIn: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)
- GitHub: [@seu-usuario](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- [Shadcn/UI](https://ui.shadcn.com/) pelos componentes
- [Supabase](https://supabase.com/) pela infraestrutura backend
- [Lucide](https://lucide.dev/) pelos ícones
- [Recharts](https://recharts.org/) pelos gráficos
- Comunidade React e TypeScript

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!
