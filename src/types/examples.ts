// ============================================
// EXAMPLES - SYNTHX Digital Game Store
// ============================================
// Exemplos práticos de uso dos types, validators e helpers

import {
  // Types
  type GameResponse,
  type Jogo,
  type Avaliacao,
  type PurchaseResponse,
  
  // Models
  JogoModel,
  AvaliacaoModel,
  
  // Validators
  validateJogo,
  validateSignupRequest,
  ValidationError,
  Validators,
  
  // Helpers
  Formatters,
  Calculators,
  Generators,
  Sorters,
  Filters,
  Checkers,
  Statistics,
  
  // Utils
  Utils,
  CONSTANTS,
  
  // Mappers
  Mappers,
} from './index';

// ============================================
// EXEMPLO 1: Criando e Validando um Jogo
// ============================================

export function example1_CreateAndValidateGame() {
  console.log('\n=== EXEMPLO 1: Criar e Validar Jogo ===\n');
  
  // Criar jogo usando classe
  const jogo = new JogoModel(
    Generators.generateId('game'),
    'The Witcher 3: Wild Hunt',
    2015,
    59.99,
    'Um RPG épico de mundo aberto da CD Projekt Red...',
    'company-1',
    'category-rpg'
  );
  
  console.log('Jogo criado:', jogo);
  
  // Validar jogo
  try {
    validateJogo(jogo);
    console.log('✅ Jogo válido!');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`❌ Erro: ${error.message} (campo: ${error.field})`);
    }
  }
  
  // Formatar para exibição
  console.log('\nFormatado para usuário:');
  console.log(`Nome: ${jogo.nome}`);
  console.log(`Ano: ${jogo.ano}`);
  console.log(`Preço: ${Formatters.formatPrice(jogo.preco)}`);
  console.log(`Descrição: ${Formatters.truncate(jogo.descricao, 50)}`);
}

// ============================================
// EXEMPLO 2: Sistema de Avaliações
// ============================================

export function example2_ReviewSystem() {
  console.log('\n=== EXEMPLO 2: Sistema de Avaliações ===\n');
  
  // Criar várias avaliações
  const reviews: Avaliacao[] = [
    new AvaliacaoModel('rev-1', 'game-1', 'user-1', 5, 'Jogo incrível!'),
    new AvaliacaoModel('rev-2', 'game-1', 'user-2', 4, 'Muito bom, mas tem bugs'),
    new AvaliacaoModel('rev-3', 'game-1', 'user-3', 5, 'Obra-prima!'),
    new AvaliacaoModel('rev-4', 'game-1', 'user-4', 3, 'Bom, mas esperava mais'),
    new AvaliacaoModel('rev-5', 'game-1', 'user-5', 4, 'Recomendo!'),
  ];
  
  // Calcular média
  const average = Calculators.calculateAverageRating(reviews);
  console.log(`Média de avaliações: ${Formatters.formatRating(average)}`);
  
  // Calcular distribuição
  const distribution = Calculators.calculateRatingDistribution(reviews);
  console.log('\nDistribuição de notas:');
  Object.entries(distribution).forEach(([rating, count]) => {
    console.log(`${'⭐'.repeat(Number(rating))}: ${count} avaliações`);
  });
  
  // Ordenar por data (mais recentes primeiro)
  const sortedReviews = Sorters.sortReviewsByDate(reviews);
  console.log('\nAvaliações mais recentes:');
  sortedReviews.slice(0, 3).forEach(review => {
    console.log(`- ${Formatters.formatRating(review.nota)}: "${review.comentario}"`);
  });
}

// ============================================
// EXEMPLO 3: Carrinho de Compras
// ============================================

export function example3_ShoppingCart() {
  console.log('\n=== EXEMPLO 3: Carrinho de Compras ===\n');
  
  // Jogos disponíveis
  const games: GameResponse[] = [
    {
      id: 'game-1',
      name: 'The Witcher 3',
      price: 59.99,
      company: 'CD Projekt Red',
      category: 'RPG',
      rating: 4.8,
      description: 'RPG épico',
      year: 2015,
      companyId: 'company-1',
      categoryId: 'cat-1',
    },
    {
      id: 'game-2',
      name: 'Cyberpunk 2077',
      price: 199.99,
      company: 'CD Projekt Red',
      category: 'RPG',
      rating: 4.2,
      description: 'RPG futurístico',
      year: 2020,
      companyId: 'company-1',
      categoryId: 'cat-1',
    },
    {
      id: 'game-3',
      name: 'GTA V',
      price: 89.99,
      company: 'Rockstar',
      category: 'Ação',
      rating: 4.5,
      description: 'Mundo aberto',
      year: 2013,
      companyId: 'company-2',
      categoryId: 'cat-2',
    },
  ];
  
  // Simular carrinho
  const cart: GameResponse[] = [games[0], games[2]];
  
  // Verificar se carrinho está vazio
  if (Checkers.isCartEmpty(cart)) {
    console.log('Carrinho vazio');
    return;
  }
  
  // Calcular total
  const total = Calculators.calculateCartTotal(cart);
  
  console.log('Itens no carrinho:');
  cart.forEach(game => {
    console.log(`- ${game.name}: ${Formatters.formatPrice(game.price)}`);
  });
  
  console.log(`\nTotal: ${Formatters.formatPrice(total)}`);
  
  // Verificar se pode comprar
  const userGames: GameResponse[] = [games[1]]; // Usuário já possui Cyberpunk
  const canPurchase = Checkers.canPurchase(cart, userGames);
  
  console.log(`\nPode finalizar compra? ${canPurchase ? '✅ Sim' : '❌ Não'}`);
}

// ============================================
// EXEMPLO 4: Filtros e Busca
// ============================================

export function example4_FiltersAndSearch() {
  console.log('\n=== EXEMPLO 4: Filtros e Busca ===\n');
  
  const games: GameResponse[] = [
    { id: '1', name: 'The Witcher 3', price: 59.99, rating: 4.8, year: 2015, category: 'RPG', company: 'CD Projekt Red', description: 'RPG épico', companyId: 'c1', categoryId: 'cat1' },
    { id: '2', name: 'Cyberpunk 2077', price: 199.99, rating: 4.2, year: 2020, category: 'RPG', company: 'CD Projekt Red', description: 'RPG futurístico', companyId: 'c1', categoryId: 'cat1' },
    { id: '3', name: 'GTA V', price: 89.99, rating: 4.5, year: 2013, category: 'Ação', company: 'Rockstar', description: 'Mundo aberto', companyId: 'c2', categoryId: 'cat2' },
    { id: '4', name: 'Red Dead Redemption 2', price: 149.99, rating: 4.9, year: 2018, category: 'Ação', company: 'Rockstar', description: 'Faroeste épico', companyId: 'c2', categoryId: 'cat2' },
    { id: '5', name: 'Minecraft', price: 29.99, rating: 4.6, year: 2011, category: 'Sandbox', company: 'Mojang', description: 'Criatividade infinita', companyId: 'c3', categoryId: 'cat3' },
  ];
  
  // Filtrar por faixa de preço
  console.log('Jogos até R$ 100:');
  const affordable = Filters.filterByPriceRange(games, 0, 100);
  affordable.forEach(g => console.log(`- ${g.name}: ${Formatters.formatPrice(g.price)}`));
  
  // Filtrar por rating mínimo
  console.log('\nJogos com nota >= 4.5:');
  const highRated = Filters.filterByMinRating(games, 4.5);
  highRated.forEach(g => console.log(`- ${g.name}: ${Formatters.formatRating(g.rating!)}`));
  
  // Filtrar por categoria
  console.log('\nJogos de RPG:');
  const rpgGames = Filters.filterByCategory(games, 'RPG');
  rpgGames.forEach(g => console.log(`- ${g.name}`));
  
  // Buscar por nome
  console.log('\nBusca por "red":');
  const searchResults = Filters.searchGames(games, 'red');
  searchResults.forEach(g => console.log(`- ${g.name}`));
  
  // Ordenar por preço (mais baratos primeiro)
  console.log('\nJogos ordenados por preço (crescente):');
  const byPrice = Sorters.sortByPrice(games, 'asc');
  byPrice.forEach(g => console.log(`- ${g.name}: ${Formatters.formatPrice(g.price)}`));
}

// ============================================
// EXEMPLO 5: Relatórios e Estatísticas
// ============================================

export function example5_ReportsAndStatistics() {
  console.log('\n=== EXEMPLO 5: Relatórios e Estatísticas ===\n');
  
  const games: GameResponse[] = [
    { id: '1', name: 'The Witcher 3', price: 59.99, rating: 4.8, year: 2015, category: 'RPG', company: 'CD Projekt Red', sales: 50000, description: '', companyId: 'c1', categoryId: 'cat1' },
    { id: '2', name: 'Cyberpunk 2077', price: 199.99, rating: 4.2, year: 2020, category: 'RPG', company: 'CD Projekt Red', sales: 30000, description: '', companyId: 'c1', categoryId: 'cat1' },
    { id: '3', name: 'GTA V', price: 89.99, rating: 4.5, year: 2013, category: 'Ação', company: 'Rockstar', sales: 80000, description: '', companyId: 'c2', categoryId: 'cat2' },
    { id: '4', name: 'Red Dead Redemption 2', price: 149.99, rating: 4.9, year: 2018, category: 'Ação', company: 'Rockstar', sales: 60000, description: '', companyId: 'c2', categoryId: 'cat2' },
    { id: '5', name: 'Minecraft', price: 29.99, rating: 4.6, year: 2011, category: 'Sandbox', company: 'Mojang', sales: 100000, description: '', companyId: 'c3', categoryId: 'cat3' },
  ];
  
  // Top 3 mais vendidos
  console.log('Top 3 Jogos Mais Vendidos:');
  const topSales = Statistics.getMostPopularGames(games, 3);
  topSales.forEach((g, i) => {
    console.log(`${i + 1}. ${g.name} - ${g.sales?.toLocaleString('pt-BR')} vendas`);
  });
  
  // Top 3 melhores avaliações
  console.log('\nTop 3 Melhores Avaliações:');
  const topRated = Statistics.getHighestRatedGames(games, 3);
  topRated.forEach((g, i) => {
    console.log(`${i + 1}. ${g.name} - ${Formatters.formatRating(g.rating!)}`);
  });
  
  // Jogos mais recentes
  console.log('\nTop 3 Lançamentos Mais Recentes:');
  const newest = Statistics.getNewestGames(games, 3);
  newest.forEach((g, i) => {
    console.log(`${i + 1}. ${g.name} (${g.year})`);
  });
  
  // Estatísticas por categoria
  console.log('\nJogos por Categoria:');
  const byCategory = Statistics.getGamesByCategory(games);
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`- ${cat}: ${count} jogos`);
  });
  
  // Estatísticas por empresa
  console.log('\nJogos por Empresa:');
  const byCompany = Statistics.getGamesByCompany(games);
  Object.entries(byCompany).forEach(([company, count]) => {
    console.log(`- ${company}: ${count} jogos`);
  });
  
  // Estatísticas de preço
  console.log('\nEstatísticas de Preço:');
  const priceStats = Statistics.getPriceStatistics(games);
  console.log(`- Mais barato: ${Formatters.formatPrice(priceStats.min)}`);
  console.log(`- Mais caro: ${Formatters.formatPrice(priceStats.max)}`);
  console.log(`- Média: ${Formatters.formatPrice(priceStats.average)}`);
  console.log(`- Mediana: ${Formatters.formatPrice(priceStats.median)}`);
}

// ============================================
// EXEMPLO 6: Validação de Formulários
// ============================================

export function example6_FormValidation() {
  console.log('\n=== EXEMPLO 6: Validação de Formulários ===\n');
  
  // Simular dados de signup
  const signupData = {
    name: 'João Silva',
    email: 'joao@email.com',
    password: '123456',
    role: 'user' as const,
  };
  
  console.log('Validando dados de cadastro:');
  console.log(signupData);
  
  try {
    validateSignupRequest(signupData);
    console.log('✅ Dados válidos! Pode criar conta.');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`❌ Erro: ${error.message} (campo: ${error.field})`);
    }
  }
  
  // Validações individuais
  console.log('\nValidações Individuais:');
  
  const testEmail = 'teste@email.com';
  console.log(`Email "${testEmail}" válido? ${Validators.isValidEmail(testEmail) ? '✅' : '❌'}`);
  
  const testPassword = '12345';
  console.log(`Senha "${testPassword}" válida? ${Validators.isValidPassword(testPassword) ? '✅' : '❌'} (min 6 chars)`);
  
  const testRating = 5;
  console.log(`Nota ${testRating} válida? ${Validators.isValidRating(testRating) ? '✅' : '❌'}`);
  
  const testPrice = -10;
  console.log(`Preço ${testPrice} válido? ${Validators.isValidPrice(testPrice) ? '✅' : '❌'}`);
  
  const testYear = 2025;
  console.log(`Ano ${testYear} válido? ${Validators.isValidYear(testYear) ? '✅' : '❌'}`);
}

// ============================================
// EXEMPLO 7: Generators e Mappers
// ============================================

export function example7_GeneratorsAndMappers() {
  console.log('\n=== EXEMPLO 7: Generators e Mappers ===\n');
  
  // Gerar IDs
  console.log('IDs Gerados:');
  console.log(`- Game ID: ${Generators.generateId('game')}`);
  console.log(`- User ID: ${Generators.generateId('user')}`);
  console.log(`- Purchase ID: ${Generators.generateId('purchase')}`);
  
  // Gerar chaves de ativação
  console.log('\nChaves de Ativação:');
  for (let i = 0; i < 3; i++) {
    console.log(`- ${Generators.generateActivationKey()}`);
  }
  
  // Converter entre formatos (API Response <-> Model)
  console.log('\nMappers:');
  
  const apiGame: GameResponse = {
    id: 'game-1',
    name: 'The Witcher 3',
    description: 'RPG épico',
    year: 2015,
    price: 59.99,
    company: 'CD Projekt Red',
    companyId: 'company-1',
    category: 'RPG',
    categoryId: 'cat-1',
    rating: 4.8,
  };
  
  // Converter para model interno
  const jogoModel = Mappers.gameResponseToJogo(apiGame);
  console.log('API Game → Jogo Model:');
  console.log(jogoModel);
  
  // Converter de volta para API
  const backToApi = Mappers.jogoToGameResponse(
    jogoModel,
    'CD Projekt Red',
    'RPG',
    4.8,
    50000,
    1250
  );
  console.log('\nJogo Model → API Game:');
  console.log(backToApi);
}

// ============================================
// EXEMPLO 8: Uso de Constantes
// ============================================

export function example8_Constants() {
  console.log('\n=== EXEMPLO 8: Constantes ===\n');
  
  console.log('User Roles:');
  console.log(`- USER: "${CONSTANTS.ROLES.USER}"`);
  console.log(`- ADMIN: "${CONSTANTS.ROLES.ADMIN}"`);
  
  console.log('\nCart Status:');
  console.log(`- ACTIVE: "${CONSTANTS.CART_STATUS.ACTIVE}"`);
  console.log(`- FINALIZED: "${CONSTANTS.CART_STATUS.FINALIZED}"`);
  console.log(`- CANCELLED: "${CONSTANTS.CART_STATUS.CANCELLED}"`);
  
  console.log('\nRating Range:');
  console.log(`- MIN: ${CONSTANTS.RATING.MIN}`);
  console.log(`- MAX: ${CONSTANTS.RATING.MAX}`);
  
  console.log('\nValidation Rules:');
  console.log(`- Password min length: ${CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH}`);
  console.log(`- Comment max length: ${CONSTANTS.VALIDATION.COMMENT_MAX_LENGTH}`);
  console.log(`- Name max length: ${CONSTANTS.VALIDATION.NAME_MAX_LENGTH}`);
  console.log(`- Year range: ${CONSTANTS.VALIDATION.YEAR_MIN} - ${CONSTANTS.VALIDATION.YEAR_MAX}`);
  
  console.log('\nDefaults:');
  console.log(`- Report top limit: ${CONSTANTS.DEFAULTS.REPORT_TOP_LIMIT}`);
  console.log(`- Page size: ${CONSTANTS.DEFAULTS.PAGE_SIZE}`);
  console.log(`- Price range: ${CONSTANTS.DEFAULTS.MIN_PRICE} - ${CONSTANTS.DEFAULTS.MAX_PRICE}`);
}

// ============================================
// EXECUTAR TODOS OS EXEMPLOS
// ============================================

export function runAllExamples() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  SYNTHX Types - Exemplos de Uso       ║');
  console.log('╚════════════════════════════════════════╝');
  
  example1_CreateAndValidateGame();
  example2_ReviewSystem();
  example3_ShoppingCart();
  example4_FiltersAndSearch();
  example5_ReportsAndStatistics();
  example6_FormValidation();
  example7_GeneratorsAndMappers();
  example8_Constants();
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Todos os exemplos foram executados!  ║');
  console.log('╚════════════════════════════════════════╝\n');
}

// Para executar em Node.js:
// ts-node types/examples.ts
if (typeof require !== 'undefined' && require.main === module) {
  runAllExamples();
}
