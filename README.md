# 🎮 SYNTHX.COM - Digital Game Store Frontend

Este é o repositório do **frontend da SYNTHX.COM**, uma loja de jogos digitais construída em **HTML**, **CSS (Puro)** e **JavaScript (ES Modules)**.  
O objetivo deste projeto é fornecer uma **interface de usuário moderna e funcional** que se comunica com a **API backend** para gerenciar catálogos, autenticação e compras.

---

## ✨ Funcionalidades Principais

- **Autenticação Modular:** Login e Logout de usuários com gerenciamento de estado via JavaScript.  
- **Catálogo Dinâmico:** Carregamento e exibição de jogos em seções (Destaques, Promoções, Populares, etc.).  
- **Busca Controlada:** Exibe sugestões de jogos após 4 caracteres e permite que o usuário dispare a busca principal manualmente (Enter ou Lupa), priorizando o Controle do Usuário.  
- **Carrinho de Compras:** Adição, remoção e visualização de itens em um painel lateral (*off-canvas*).  

---

## 🚀 Como Executar o Projeto Localmente

Siga estas etapas para configurar e rodar o frontend no seu ambiente de desenvolvimento.

### 🔧 Pré-requisitos
- **Node.js** e **npm** instalados.  
- Uma instância do **backend da API** (necessária para as requisições, rodando geralmente em `http://localhost:3000/api/v1`).

---

### ⚙️ Configuração

#### Clone o Repositório

git clone: https://www.youtube.com/watch?v=UvmgcBv9BtQ

```bash
cd Synthx
````

#### Instale as Dependências
```bash
npm install
````

#### Configure a API
```bash
Certifique-se de que a **URL base da API** esteja configurada corretamente no seu código JS  
(geralmente em `Home/js/config.js` ou similar).
````

---

### ▶️ Inicialização

```bash
npm start
````

O servidor será iniciado na **porta 5500** (ou outra porta livre) e seu navegador abrirá em:
http://localhost:5500

---

## 📂 Estrutura de Arquivos

A organização modular do projeto é baseada em **ES Modules** e separada por módulos de página na raiz.

```plaintext
.
├── .gitignore               # Ignora node_modules, package-lock.json, etc.
├── package.json             # Dependências e scripts de inicialização
├── Readme.md                # Este arquivo
├── index.html               # Página principal (carrega Header, Footer e Main Content)

# MÓDULOS DA APLICAÇÃO
├── api-vendas-jogos-digitais/ # (Backend/API - fora do Frontend)
├── Cadastro/                # Módulo de Cadastro de novo usuário
├── Checkout/                # Módulo de Finalização da Compra
├── Conta/                   # Módulo de Perfil/Configurações do usuário
├── Home/                    # Módulo de visualização da Homepage/carrinho
├── Jogo/                    # Módulo de Detalhes de um Jogo Específico
├── Login/                   # Módulo de Autenticação/Login
├── Pedido/                  # Módulo de Histórico de Pedidos/Compras
├── Relatórios/              # Módulo que contém a apresentação, telas de modelagem(figma)
                               e relatório do estudo de caso e análise da usabilidade do sistema


# MÓDULO HOME (Base principal da loja)
├── Home/
│   ├── assets/              # Arquivos estáticos e mídia
│   │   ├── imgs/            # Capas dos jogos (.jpg)
│   ├── js/                  # Lógica de negócio e API
│   │   ├── auth.js          # Lógica de login, logout e token (API: /auth/*)
│   │   ├── cart.js          # Lógica da API do carrinho (adicionar, remover, checkout)
│   │   ├── config.js        # Configurações globais (API URL, debounce settings)
│   │   ├── games.js         # Lógica de fetch, cache e filtragem
│   │   └── utils.js         # Funções genéricas (debounce, getGameImageUrl, loadTemplate)
│   ├── styles/
│   │   ├── styles.css       # Estilos principais
│   │   ├── components.css   # Estilos de componentes (cards, botões)
│   │   └── utils.css        # Estilos utilitários (notificações, confirmações, etc)
│   ├── templates/
│   │   ├── header.html      # Conteúdo HTML do Header (carregado dinamicamente)
│   │   └── footer.html      # Conteúdo HTML do Footer (carregado dinamicamente)
│   ├── ui/                  
│   │   ├── cartUI.js        # Renderização do painel do carrinho
│   │   ├── dom.js           # Manipulação de elementos DOM
│   │   ├── notifications.js # Notificações customizadas
│   │   ├── render.js        # Renderização de UI (cards, sugestões, login)
│   │   └── utils/
│   │       └── helpers.js   # Funções auxiliares diversas
│   └── main.js              # Ponto de entrada da aplicação
````

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**  
- **CSS3 (Puro)**  
- **JavaScript (ES Modules)**  
- **Font Awesome** (ícones)  
- **http-server** (servidor estático local)

---

## 📌 Próximos Passos (Sugestões de Melhoria)

- **Rotas (SPA):** Implementar um sistema de roteamento para simular uma Single Page Application (SPA), evitando recarregamentos.  
- **Tratamento de Erros:** Melhorar mensagens de erro específicas para o usuário (ex.: “Falha ao conectar à API”, “Jogo não encontrado”).  
- **Tipagem:** Adicionar **JSDoc** ou considerar migração para **TypeScript** para maior robustez.

---
 
📅 **Data:** 27 de Outubro de 2025  
📜 **Licença:** MIT
