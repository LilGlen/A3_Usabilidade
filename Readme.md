🎮 SYNTHX.COM - Digital Game Store Frontend
Este é o repositório do frontend da SYNTHX.COM, uma loja de jogos digitais construída em HTML, CSS (Puro) e JavaScript (ES Modules). O objetivo deste projeto é fornecer uma interface de usuário moderna e funcional que se comunica com a API backend para gerenciar catálogos, autenticação e compras.

✨ Funcionalidades Principais
Autenticação Modular: Login e Logout de usuários com gerenciamento de estado via JavaScript.

Catálogo Dinâmico: Carregamento e exibição de jogos em seções (Destaques, Promoções, Populares, etc.).

Paginação: Implementação de paginação para navegação eficiente pelo catálogo completo de jogos.

Busca Controlada: Exibe sugestões de jogos após 4 caracteres e permite que o usuário dispare a busca principal manualmente (Enter ou Lupa), priorizando o Controle do Usuário.

Carrinho de Compras: Adição, remoção e visualização de itens em um painel lateral (off-canvas).

🚀 Como Executar o Projeto Localmente
Siga estas etapas para configurar e rodar o frontend no seu ambiente de desenvolvimento.

Pré-requisitos
Node.js e npm instalados.

Uma instância do backend da API (necessária para as requisições, rodando geralmente em http://localhost:3000/api/v1).

Configuração
Clone o Repositório:

Bash

git clone https://www.youtube.com/watch?v=UvmgcBv9BtQ
cd Synthx
Instale as Dependências: Instale o servidor estático http-server e a ferramenta para abrir o navegador (opn-cli).

Bash

npm install
Configurar o Servidor (API): Certifique-se de que a URL base da sua API esteja configurada corretamente no seu código JS (geralmente em Home/js/config.js ou similar).

Inicialização
Use o script start para iniciar o servidor estático e abrir o navegador automaticamente, sem recarregar a página em cada alteração.

Bash

npm start
O servidor será iniciado na porta 5500 (ou outra porta livre) e seu navegador abrirá em http://localhost:5500.

📂 Estrutura de Arquivos
A organização modular do projeto é baseada em ES Modules e separada por módulos de página na raiz.

.
├── .gitignore # Ignora node_modules, package-lock.json, etc.
├── package.json # Dependências e scripts de inicialização
├── Readme.md # Este arquivo
├── index.html # Página principal (carrega Header, Footer e Main Content)

# MÓDULOS DA APLICAÇÃO (páginas ou funcionalidades de nível superior)

├── api-vendas-jogos-digitais/ # (Backend/API - fora do Frontend)
├── Cadastro/ # Módulo de Cadastro de novo usuário
├── Checkout/ # Módulo de Finalização da Compra
├── Conta/ # Módulo de Perfil/Configurações do usuário
├── Jogo/ # Módulo de Detalhes de um Jogo Específico
├── Login/ # Módulo de Autenticação/Login
├── Pedido/ # Módulo de Histórico de Pedidos/Compras

# MÓDULO HOME (Antigo 'src' - Base principal da loja)

├── Home/
│ ├── assets/ # Arquivos estáticos e mídia
│ │ ├── imgs/ # Capas dos jogos (.jpg)
│ ├── js/ # Lógica de negócio e API
│ │ ├── auth.js # Lógica de login, logout e token (API: /auth/_)
│ │ ├── cart.js # Lógica da API do carrinho (adicionar, remover, checkout) (API: /carrinho/_)
│ │ ├── config.js # Configurações globais (API URL, debounce settings)
│ │ ├── games.js # Lógica de fetch, cache, filtragem principal e paginação (API: /jogos/\*)
│ │ └── utils.js # Funções genéricas (debounce, getGameImageUrl, loadTemplate)
│ ├── styles/
│ │ ├── styles.css # Estilos principais
│ │ ├── components.css # Estilos de componentes específicos (cards, botões)
│ │ └── utils.css # Estilos utilitários (notificações, confirmações, detalhes, etc)
│ ├── templates/
│ │ ├── header.html # Conteúdo HTML do Header (carregado dinamicamente)
│ │ └── footer.html # Conteúdo HTML do Footer (carregado dinamicamente)
│ ├── ui/ # Funções de manipulação do DOM e UI
│ │ ├── cartUI.js # Funções para renderizar o painel do carrinho
│ │ ├── dom.js # Funções de carregamento e manipulação dos DOM Elements.
│ │ ├── notifications.js # Funções de notificação customizadas
│ │ ├── render.js # Funções para construir e injetar elementos de UI (cards, sugestões, estado de login)
│ │ └── utils/ # Funções utilitárias de UI
│ │ └── helpers.js # Funções auxiliares diversas
│ └── main.js # Ponto de entrada da aplicação (inicializa tudo)
🛠️ Tecnologias Utilizadas
HTML5

CSS3 (Puro)

JavaScript ES Modules (para modularidade)

Font Awesome (Ícones)

http-server (Servidor estático local)

📌 Próximos Passos (Sugestões de Melhoria)
Rotas (SPA): Implementar um sistema de roteamento para fazer a aplicação parecer uma Single Page Application (SPA), eliminando a necessidade de carregar o main.js em múltiplas páginas.

Tratamento de Erros: Melhorar a exibição de mensagens de erro específicas para o usuário (e.g., "Falha ao conectar à API", "Jogo não encontrado").

Tipagem: Adicionar JSDoc ou considerar migração para TypeScript para maior robustez.
