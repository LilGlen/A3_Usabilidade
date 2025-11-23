# SYNTHX - Loja Digital de Jogos

![SYNTHXLogo](https://res.cloudinary.com/duu2yjyc7/image/upload/v1763853194/51b39ac868a401500b18dd358f02e1e4ae10abe0_jwbdgd.png)

## 🎮 Sobre o Projeto

SYNTHX é uma loja digital de jogos com estética dark/cyberpunk, desenvolvida em React + TypeScript, consumindo uma **API externa de terceiros** para fornecer funcionalidades completas de e-commerce.

A aplicação conta com catálogo, carrinho, checkout, sistema de avaliações, área administrativa e autenticação via tokens fornecidos pela API.

---

## 🌐 Sobre a API Utilizada

Este projeto utiliza uma **API externa de terceiros**, disponibilizada exclusivamente para fins acadêmicos e demonstrativos.  
Nenhuma parte da API foi desenvolvida por mim — apenas consumida para simular um backend real.

A API fornece endpoints para:

- Jogos  
- Categorias  
- Empresas  
- Carrinho  
- Checkout  
- Autenticação  
- Avaliações  
- Relatórios administrativos  

### ⚠️ Avisos Importantes
- Não sou responsável pela disponibilidade, manutenção ou conteúdo retornado pela API.  
- Os dados podem mudar ou ficar indisponíveis sem aviso prévio.  
- O projeto serve apenas como demonstração funcional de um e-commerce consumindo uma API REST externa.

---

<br>


## ✨ Características Principais

### 🎨 Design

-   Estética **Dark/Cyberpunk** com paleta personalizada:
    -   Fundo Principal: `#121212`
    -   Fundo Secundário: `#1E1E1E`
    -   Cor de Destaque: `#9146FF`
-   Tipografia: **Poppins** e **Inter**
-   Totalmente responsivo

### 🛒 Funcionalidades E-commerce

-   Catálogo com busca, filtro e categorias
-   Página do jogo com descrição, preço, imagens e avaliações
-   Mini-carrinho lateral (MiniCart)
-   Adicionar / remover itens do carrinho
-   Checkout com cálculo de total
-   Histórico de compras do usuário
-   Sistema de avaliações (nota + comentário)

### 👤 Autenticação & Perfil

-   Login e Registro com token JWT
-   Tokens armazenados de forma segura no navegador
-   Perfil do usuário com:
    -   dados pessoais\
    -   jogos adquiridos\
    -   avaliações feitas

### 🔧 Área Administrativa

-   CRUD completo:
    -   Empresas
    -   Categorias
    -   Jogos

-   Relatórios visuais com **Recharts**:
    -   Top jogos
    -   Vendas
    -   Receita
    -   Estoque

### ♿ Acessibilidade

-   ARIA labels
-   Navegação por teclado
-   Sistema de toasts acessível
-   Feedback visual para ações (sucesso, erro, info)

---

## 🚀 Tecnologias Utilizadas

### **Frontend**

-   React 18 + TypeScript
-   Tailwind CSS (tema customizado)
-   Shadcn/UI
-   Lucide React
-   Recharts
-   Motion / Framer Motion
-   Customized **ToastProvider** + Sonner
-   Context API (Auth + Cart + Toast)

### **Backend**

-   API REST JSON
-   Token JWT para autenticação
-   Banco relacional
-   Endpoints REST tradicionais:
    -   `/auth`
    -   `/games`
    -   `/categories`
    -   `/companies`
    -   `/carrinho`
    -   `/checkout`
    -   `/reviews`
    -   `/reports`

## 📂 Estrutura do Projeto

```plaintext

  ├── API Externa
  ├── Relatórios
  ├── src
  │  ├── App.tsx
  │  ├── main.tsx
  │  ├── index.css
  │  ├── components/
  │  │   ├── AuthContext.tsx
  │  │   ├── CartContext.tsx
  │  │   ├── AuthModal.tsx
  │  │   ├── Header.tsx
  │  │   ├── Footer.tsx
  │  │   ├── HomePage.tsx
  │  │   ├── GameDetailsPageNew.tsx
  │  │   ├── CheckoutPageNew.tsx
  │  │   ├── UserProfilePageNew.tsx
  │  │   ├── ManagementPageNew.tsx
  │  │   ├── AdminPageComplete.tsx
  │  │   ├── Avatar.tsx
  │  │   ├── MiniCart.tsx
  │  │   ├── ToastProvider.tsx
  │  │   ├── useAPI.tsx
  │  │   ├── figma/
  │  │   └── ui/
  │  └── styles/
  │       └── globals.css
  
````
  
 

## 🛠️ Instalação e Configuração

### Pré-requisitos

-   Node.js 18+
-   Git
-   API Backend rodando localmente

### 1. Clone o repositório

``` bash
git clone https://github.com/LilGlen/A3_Usabilidade.git
cd synthx
```

### 2. Instale as dependências

``` bash
npm install
```

### 4. Inicie o servidor

``` bash
npm run dev
```

A aplicação estará em:

    http://localhost:3000


## 🌐 API Endpoints

### Autenticação

-   POST `/auth/login`
-   POST  `/auth/register`

### Empresas

-   GET  `/companies`
-   POST  `/companies` 
-   PUT  `/companies/:id`
-   DELETE `/companies/:id `

### Categorias

-   GET ``/categories``
-   POST ``/categories``
-   PUT ``/categories/:id``
-   DELETE ``/categories/:id``

### Jogos

-   GET ``/games``
-   GET ``/games/:id``
-   POST ``/games``
-   PUT ``/games/:id``
-   DELETE ``/games/:id``

### Carrinho

-   GET ``/carrinho``
-   POST ``/carrinho/add/:id``
-   DELETE ``/carrinho/remove/:id``

### Checkout

-   POST ``/checkout``

### Avaliações

-   GET ``/reviews/:gameId``
-   POST ``/reviews``

### Relatórios (Admin)

-   GET ``/reports/sales``
-   GET ``/reports/top-games``


## 🎯 Regras de Negócio

-   Necessário login para comprar
-   Apenas admins gerenciam empresas, categorias e jogos
-   Usuários só avaliam jogos comprados
-   Estoque decrementa após compra
-   Imagens dos jogos são locais no frontend
-   Carrinho vinculado ao usuário logado

## 🔐 Segurança

-   JWT
-   Authorization Bearer
-   Controle de permissões
-   Sanitização de inputs

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

➡️ [Acessar LICENSE](./LICENSE/)


## 👨‍💻 Autor

Desenvolvido com 💜 por **Glenda Souza**, **Isaac Dias**, **Jorge Gandolfi**, **Marcus Vinicius**, **Victor Oliveira**, **Guilherme Ornellas**, **João Victor**
