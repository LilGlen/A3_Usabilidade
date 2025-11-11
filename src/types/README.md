# 📦 SYNTHX Types - Sistema de Tipos TypeScript

Sistema completo de tipos, models, validadores e helpers para a loja digital SYNTHX.

## 📁 Estrutura de Arquivos

```
/types/
├── index.ts          # Exportações centralizadas
├── models.ts         # Interfaces e classes dos modelos
├── validators.ts     # Funções de validação
├── helpers.ts        # Utilitários e helpers
└── README.md         # Esta documentação
```

## 🎯 Importações Recomendadas

### Importação Completa (Recomendado)
```typescript
import { 
  GameResponse, 
  Validators, 
  Formatters,
  Utils,
  CONSTANTS 
} from '../types';
```

### Importação Específica
```typescript
// Apenas models
import type { Jogo, Avaliacao, Venda } from '../types/models';

// Apenas validators
import { validateJogo, ValidationError } from '../types/validators';

// Apenas helpers
import { Formatters, Calculators } from '../types/helpers';
```

## 📚 Guia de Uso

### 1️⃣ **Models e Interfaces**

#### Usando Interfaces (Recomendado para Props)
```typescript
import type { GameResponse, Jogo } from '../types';

// Em componentes React
interface GameCardProps {
  game: GameResponse;
  onSelect: (game: GameResponse) => void;
}

// Em funções
function calculateDiscount(jogo: Jogo, percent: number): number {
  return jogo.preco * (1 - percent / 100);
}
```

#### Usando Classes (Para Instâncias)
```typescript
import { JogoModel, AvaliacaoModel } from '../types';

// Criar nova instância
const novoJogo = new JogoModel(
  'game-1',
  'The Witcher 3',
  2015,
  59.99,
  'Um RPG épico...',
  'company-1',
  'category-1'
);

// Usar método estático
const jogoFromAPI = JogoModel.fromRequest({
  id: 'game-1',
  nome: 'Cyberpunk 2077',
  ano: 2020,
  preco: 199.99,
  descricao: 'RPG futurístico...',
  fkEmpresa: 'company-2',
  fkCategoria: 'category-1'
});
```

### 2️⃣ **Validators**

#### Validação de Models
```typescript
import { validateJogo, ValidationError } from '../types';

try {
  validateJogo({
    nome: 'The Witcher 3',
    descricao: 'Um RPG épico...',
    ano: 2015,
    preco: 59.99,
    fkEmpresa: 'company-1',
    fkCategoria: 'category-1'
  });
  
  // Validação passou ✅
  console.log('Jogo válido!');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Erro no campo ${error.field}: ${error.message}`);
  }
}
```

#### Validação de Requests
```typescript
import { validateSignupRequest, validateLoginRequest } from '../types';

// Validar signup
try {
  validateSignupRequest({
    name: 'João Silva',
    email: 'joao@email.com',
    password: 'senha123',
    role: 'user'
  });
} catch (error) {
  console.error(error.message);
}

// Validar login
try {
  validateLoginRequest({
    email: 'joao@email.com',
    password: 'senha123'
  });
} catch (error) {
  console.error(error.message);
}
```

#### Validadores Individuais
```typescript
import { Validators } from '../types';

// Validar email
if (!Validators.isValidEmail('test@email.com')) {
  console.error('Email inválido');
}

// Validar senha
if (!Validators.isValidPassword('123')) {
  console.error('Senha muito curta (min 6 caracteres)');
}

// Validar nota
if (!Validators.isValidRating(5)) {
  console.error('Nota deve ser entre 1 e 5');
}

// Validar preço
if (!Validators.isValidPrice(-10)) {
  console.error('Preço não pode ser negativo');
}
```

### 3️⃣ **Formatters**

```typescript
import { Formatters } from '../types';

// Formatar preço
const preco = Formatters.formatPrice(59.99);
// Resultado: "R$ 59,99"

// Formatar data
const data = Formatters.formatDate('2024-01-15');
// Resultado: "15/01/2024"

// Formatar data e hora
const dataHora = Formatters.formatDateTime('2024-01-15T14:30:00');
// Resultado: "15/01/2024 14:30"

// Formatar rating
const rating = Formatters.formatRating(4.5);
// Resultado: "4.5 ⭐"

// Formatar status do carrinho
const status = Formatters.formatCartStatus('A');
// Resultado: "Ativo"

// Formatar chave de ativação
const key = Formatters.formatActivationKey('ABCDE12345FGHIJ67890');
// Resultado: "ABCDE-12345-FGHIJ-67890"

// Truncar texto
const descricao = Formatters.truncate('Um texto muito longo...', 20);
// Resultado: "Um texto muito lo..."
```

### 4️⃣ **Calculators**

```typescript
import { Calculators } from '../types';
import type { GameResponse, Avaliacao } from '../types';

// Calcular total do carrinho
const games: GameResponse[] = [
  { id: '1', price: 59.99, ... },
  { id: '2', price: 39.99, ... }
];
const total = Calculators.calculateCartTotal(games);
// Resultado: 99.98

// Calcular média de avaliações
const reviews: Avaliacao[] = [
  { nota: 5, ... },
  { nota: 4, ... },
  { nota: 5, ... }
];
const average = Calculators.calculateAverageRating(reviews);
// Resultado: 4.67

// Calcular desconto
const precoComDesconto = Calculators.calculateDiscount(100, 20);
// Resultado: 80 (20% de desconto)

// Calcular distribuição de ratings
const distribution = Calculators.calculateRatingDistribution(reviews);
// Resultado: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 }
```

### 5️⃣ **Generators**

```typescript
import { Generators } from '../types';

// Gerar ID único
const id = Generators.generateId();
// Resultado: "1705334400000-a7b3c9d"

const gameId = Generators.generateId('game');
// Resultado: "game-1705334400000-a7b3c9d"

// Gerar chave de ativação
const key = Generators.generateActivationKey();
// Resultado: "ABCDE-12345-FGHIJ-67890"

// Gerar preço aleatório
const preco = Generators.generateRandomPrice(10, 200);
// Resultado: 87.45 (entre 10 e 200)
```

### 6️⃣ **Sorters**

```typescript
import { Sorters } from '../types';
import type { GameResponse } from '../types';

const games: GameResponse[] = [ /* ... */ ];

// Ordenar por preço
const byPrice = Sorters.sortByPrice(games, 'asc'); // Crescente
const byPriceDesc = Sorters.sortByPrice(games, 'desc'); // Decrescente

// Ordenar por rating
const byRating = Sorters.sortByRating(games);

// Ordenar por vendas
const bySales = Sorters.sortBySales(games);

// Ordenar por nome (alfabético)
const byName = Sorters.sortByName(games);

// Ordenar por ano (mais recentes primeiro)
const byYear = Sorters.sortByYear(games);

// Ordenar reviews por data
const reviews: Avaliacao[] = [ /* ... */ ];
const byDate = Sorters.sortReviewsByDate(reviews);
```

### 7️⃣ **Filters**

```typescript
import { Filters } from '../types';
import type { GameResponse } from '../types';

const games: GameResponse[] = [ /* ... */ ];

// Filtrar por faixa de preço
const affordable = Filters.filterByPriceRange(games, 0, 50);

// Filtrar por rating mínimo
const highRated = Filters.filterByMinRating(games, 4.0);

// Filtrar por categoria
const rpgGames = Filters.filterByCategory(games, 'RPG');

// Filtrar por empresa
const cdprGames = Filters.filterByCompany(games, 'CD Projekt Red');

// Filtrar por ano
const recentGames = Filters.filterByYearRange(games, 2020, 2024);

// Buscar por nome/descrição
const searchResults = Filters.searchGames(games, 'witcher');
```

### 8️⃣ **Checkers**

```typescript
import { Checkers } from '../types';
import type { GameResponse } from '../types';

const userGames: GameResponse[] = [ /* jogos do usuário */ ];
const cart: GameResponse[] = [ /* carrinho */ ];
const wishlist: GameResponse[] = [ /* lista de desejos */ ];

// Verificar se usuário possui jogo
const owns = Checkers.userOwnsGame(userGames, 'game-1');

// Verificar se está na wishlist
const inWishlist = Checkers.isInWishlist(wishlist, 'game-1');

// Verificar se está no carrinho
const inCart = Checkers.isInCart(cart, 'game-1');

// Verificar se usuário já avaliou
const hasReviewed = Checkers.userHasReviewed(reviews, 'user-1', 'game-1');

// Verificar se carrinho está vazio
const isEmpty = Checkers.isCartEmpty(cart);

// Verificar se pode comprar
const canBuy = Checkers.canPurchase(cart, userGames);
```

### 9️⃣ **Statistics**

```typescript
import { Statistics } from '../types';
import type { GameResponse } from '../types';

const games: GameResponse[] = [ /* ... */ ];

// Top 10 mais populares
const popular = Statistics.getMostPopularGames(games, 10);

// Top 10 mais bem avaliados
const topRated = Statistics.getHighestRatedGames(games, 10);

// Top 10 mais recentes
const newest = Statistics.getNewestGames(games, 10);

// Contagem por categoria
const byCategory = Statistics.getGamesByCategory(games);
// Resultado: { "RPG": 15, "Ação": 20, "Aventura": 10 }

// Contagem por empresa
const byCompany = Statistics.getGamesByCompany(games);
// Resultado: { "CD Projekt Red": 5, "Bethesda": 8 }

// Estatísticas de preço
const priceStats = Statistics.getPriceStatistics(games);
// Resultado: { min: 9.99, max: 299.99, average: 79.99, median: 59.99 }
```

### 🔟 **Utils (Atalhos Convenientes)**

```typescript
import { Utils } from '../types';

// Formatação rápida
Utils.formatPrice(59.99);              // "R$ 59,99"
Utils.formatDate('2024-01-15');        // "15/01/2024"
Utils.formatRating(4.5);               // "4.5 ⭐"

// Geração rápida
Utils.generateId('game');              // "game-1705334400000-a7b3c9d"
Utils.generateActivationKey();         // "ABCDE-12345-FGHIJ-67890"

// Validação rápida
Utils.isValidEmail('test@email.com');  // true
Utils.isValidPassword('123');          // false (min 6 chars)
Utils.isValidRating(5);                // true

// Cálculos rápidos
Utils.calculateCartTotal(games);       // 199.98
Utils.calculateAverageRating([5,4,5]); // 4.67
```

## 🎨 Exemplo Completo em Componente React

```typescript
import React from 'react';
import type { GameResponse } from '../types';
import { 
  Formatters, 
  Checkers, 
  Validators,
  Utils 
} from '../types';

interface GameCardProps {
  game: GameResponse;
  userGames: GameResponse[];
  onAddToCart: (gameId: string) => void;
}

export function GameCard({ game, userGames, onAddToCart }: GameCardProps) {
  const userOwns = Checkers.userOwnsGame(userGames, game.id);
  
  const handleAddToCart = () => {
    if (Validators.isValidId(game.id)) {
      onAddToCart(game.id);
    }
  };
  
  return (
    <div className="game-card">
      <h3>{game.name}</h3>
      <p>{game.company} • {game.year}</p>
      <p>{Formatters.truncate(game.description, 100)}</p>
      
      <div className="price">
        {Utils.formatPrice(game.price)}
      </div>
      
      {game.rating && (
        <div className="rating">
          {Utils.formatRating(game.rating)}
          {game.reviewCount && ` (${game.reviewCount} avaliações)`}
        </div>
      )}
      
      {userOwns ? (
        <span>✓ Na sua biblioteca</span>
      ) : (
        <button onClick={handleAddToCart}>
          Adicionar ao Carrinho
        </button>
      )}
    </div>
  );
}
```

## 📊 Constantes Disponíveis

```typescript
import { CONSTANTS } from '../types';

// Roles
CONSTANTS.ROLES.USER;          // 'user'
CONSTANTS.ROLES.ADMIN;         // 'admin'

// Status do carrinho
CONSTANTS.CART_STATUS.ACTIVE;      // 'A'
CONSTANTS.CART_STATUS.FINALIZED;   // 'F'
CONSTANTS.CART_STATUS.CANCELLED;   // 'C'

// Rating
CONSTANTS.RATING.MIN;          // 1
CONSTANTS.RATING.MAX;          // 5

// Validação
CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH;  // 6
CONSTANTS.VALIDATION.COMMENT_MAX_LENGTH;   // 1000
CONSTANTS.VALIDATION.NAME_MAX_LENGTH;      // 255
CONSTANTS.VALIDATION.YEAR_MIN;             // 1970
CONSTANTS.VALIDATION.YEAR_MAX;             // 2027

// Defaults
CONSTANTS.DEFAULTS.REPORT_TOP_LIMIT;  // 10
CONSTANTS.DEFAULTS.PAGE_SIZE;         // 20
CONSTANTS.DEFAULTS.MIN_PRICE;         // 0
CONSTANTS.DEFAULTS.MAX_PRICE;         // 1000
```

## 🎓 Boas Práticas

### ✅ DO (Faça)
```typescript
// Use interfaces para props
interface Props { game: GameResponse; }

// Use type guards
if (Validators.isValidRating(nota)) { /* ... */ }

// Use helpers para formatação
const texto = Formatters.formatPrice(preco);

// Valide antes de processar
validateJogo(novoJogo);

// Use mappers para conversão
const jogo = Mappers.gameResponseToJogo(apiGame);
```

### ❌ DON'T (Não faça)
```typescript
// Não crie tipos duplicados
type MyGame = { name: string; price: number }; // ❌

// Não valide manualmente
if (email.includes('@')) { /* ... */ }  // ❌

// Não formate manualmente
const preco = `R$ ${price.toFixed(2)}`;  // ❌

// Não converta manualmente
const jogo = { id: game.id, nome: game.name, ... }; // ❌
```

## 📝 Notas Importantes

1. **Todos os models têm equivalência 1:1 com o backend original**
2. **Validadores seguem as mesmas regras de negócio da API**
3. **Helpers são puros (sem side effects)**
4. **Type guards garantem type safety em runtime**
5. **Mappers facilitam conversão entre formatos de API**

## 🚀 Próximos Passos

Agora você pode:
1. Importar os tipos em seus componentes
2. Usar validators antes de enviar dados à API
3. Usar formatters para exibição consistente
4. Usar helpers para lógica de negócio
5. Usar checkers para verificações condicionais

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮
