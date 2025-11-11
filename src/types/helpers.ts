// ============================================
// HELPERS - SYNTHX Digital Game Store
// ============================================
// Utility functions for working with models

import type {
  Jogo,
  Venda,
  Avaliacao,
  GameResponse,
  Rating,
} from './models';

// ============================================
// FORMATTING HELPERS
// ============================================

export const Formatters = {
  /**
   * Format price to BRL currency
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  },

  /**
   * Format date to Brazilian format (DD/MM/YYYY)
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  },

  /**
   * Format date and time to Brazilian format
   */
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  },

  /**
   * Format rating to display (e.g., "4.5 ⭐")
   */
  formatRating(rating: number): string {
    return `${rating.toFixed(1)} ⭐`;
  },

  /**
   * Format cart status to user-friendly text
   */
  formatCartStatus(status: 'A' | 'F' | 'C'): string {
    const statusMap = {
      A: 'Ativo',
      F: 'Finalizado',
      C: 'Cancelado',
    };
    return statusMap[status] || status;
  },

  /**
   * Format activation key (e.g., "ABCDE-12345-FGHIJ-67890")
   */
  formatActivationKey(key: string): string {
    // Add dashes every 5 characters if not present
    if (key.includes('-')) return key;
    return key.match(/.{1,5}/g)?.join('-') || key;
  },

  /**
   * Truncate text to specified length
   */
  truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },
};

// ============================================
// CALCULATION HELPERS
// ============================================

export const Calculators = {
  /**
   * Calculate total price for cart items
   */
  calculateCartTotal(games: GameResponse[]): number {
    return games.reduce((sum, game) => sum + game.price, 0);
  },

  /**
   * Calculate average rating from reviews
   */
  calculateAverageRating(reviews: Avaliacao[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.nota, 0);
    return sum / reviews.length;
  },

  /**
   * Calculate total revenue from sales
   */
  calculateTotalRevenue(vendas: Venda[]): number {
    return vendas.reduce((sum, venda) => sum + venda.valorTotal, 0);
  },

  /**
   * Calculate discount price
   */
  calculateDiscount(price: number, discountPercent: number): number {
    return price * (1 - discountPercent / 100);
  },

  /**
   * Calculate rating distribution
   */
  calculateRatingDistribution(reviews: Avaliacao[]): Record<Rating, number> {
    const distribution: Record<Rating, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      if (review.nota >= 1 && review.nota <= 5) {
        distribution[review.nota as Rating]++;
      }
    });

    return distribution;
  },
};

// ============================================
// GENERATORS
// ============================================

export const Generators = {
  /**
   * Generate unique ID (timestamp-based)
   */
  generateId(prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
  },

  /**
   * Generate activation key (format: XXXXX-XXXXX-XXXXX-XXXXX)
   */
  generateActivationKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 5;

    const generateSegment = () => {
      let segment = '';
      for (let i = 0; i < segmentLength; i++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return segment;
    };

    const key = [];
    for (let i = 0; i < segments; i++) {
      key.push(generateSegment());
    }

    return key.join('-');
  },

  /**
   * Generate random price within range
   */
  generateRandomPrice(min: number = 10, max: number = 300): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  },
};

// ============================================
// SORTING HELPERS
// ============================================

export const Sorters = {
  /**
   * Sort games by price (ascending or descending)
   */
  sortByPrice(games: GameResponse[], order: 'asc' | 'desc' = 'asc'): GameResponse[] {
    return [...games].sort((a, b) => {
      return order === 'asc' ? a.price - b.price : b.price - a.price;
    });
  },

  /**
   * Sort games by rating (descending)
   */
  sortByRating(games: GameResponse[]): GameResponse[] {
    return [...games].sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    });
  },

  /**
   * Sort games by sales (descending)
   */
  sortBySales(games: GameResponse[]): GameResponse[] {
    return [...games].sort((a, b) => {
      const salesA = a.sales || 0;
      const salesB = b.sales || 0;
      return salesB - salesA;
    });
  },

  /**
   * Sort games by name (alphabetically)
   */
  sortByName(games: GameResponse[]): GameResponse[] {
    return [...games].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  },

  /**
   * Sort games by year (newest first)
   */
  sortByYear(games: GameResponse[]): GameResponse[] {
    return [...games].sort((a, b) => b.year - a.year);
  },

  /**
   * Sort reviews by date (newest first)
   */
  sortReviewsByDate(reviews: Avaliacao[]): Avaliacao[] {
    return [...reviews].sort((a, b) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });
  },
};

// ============================================
// FILTERING HELPERS
// ============================================

export const Filters = {
  /**
   * Filter games by price range
   */
  filterByPriceRange(
    games: GameResponse[],
    min: number,
    max: number
  ): GameResponse[] {
    return games.filter((game) => game.price >= min && game.price <= max);
  },

  /**
   * Filter games by minimum rating
   */
  filterByMinRating(games: GameResponse[], minRating: number): GameResponse[] {
    return games.filter((game) => (game.rating || 0) >= minRating);
  },

  /**
   * Filter games by category
   */
  filterByCategory(games: GameResponse[], category: string): GameResponse[] {
    return games.filter(
      (game) => game.category.toLowerCase() === category.toLowerCase()
    );
  },

  /**
   * Filter games by company
   */
  filterByCompany(games: GameResponse[], company: string): GameResponse[] {
    return games.filter(
      (game) => game.company.toLowerCase() === company.toLowerCase()
    );
  },

  /**
   * Filter games by year range
   */
  filterByYearRange(
    games: GameResponse[],
    startYear: number,
    endYear: number
  ): GameResponse[] {
    return games.filter((game) => game.year >= startYear && game.year <= endYear);
  },

  /**
   * Search games by name or description
   */
  searchGames(games: GameResponse[], query: string): GameResponse[] {
    const lowerQuery = query.toLowerCase();
    return games.filter(
      (game) =>
        game.name.toLowerCase().includes(lowerQuery) ||
        game.description.toLowerCase().includes(lowerQuery)
    );
  },
};

// ============================================
// VALIDATION HELPERS
// ============================================

export const Checkers = {
  /**
   * Check if user owns a game
   */
  userOwnsGame(userGames: GameResponse[], gameId: string): boolean {
    return userGames.some((game) => game.id === gameId);
  },

  /**
   * Check if game is in wishlist
   */
  isInWishlist(wishlist: GameResponse[], gameId: string): boolean {
    return wishlist.some((game) => game.id === gameId);
  },

  /**
   * Check if game is in cart
   */
  isInCart(cart: GameResponse[], gameId: string): boolean {
    return cart.some((game) => game.id === gameId);
  },

  /**
   * Check if user has reviewed a game
   */
  userHasReviewed(reviews: Avaliacao[], userId: string, gameId: string): boolean {
    return reviews.some(
      (review) => review.fkUsuario === userId && review.fkJogo === gameId
    );
  },

  /**
   * Check if cart is empty
   */
  isCartEmpty(cart: GameResponse[]): boolean {
    return cart.length === 0;
  },

  /**
   * Check if user can purchase (has items in cart and doesn't own them)
   */
  canPurchase(cart: GameResponse[], userGames: GameResponse[]): boolean {
    if (cart.length === 0) return false;

    // Check if user doesn't already own any game in cart
    return !cart.some((cartGame) =>
      userGames.some((ownedGame) => ownedGame.id === cartGame.id)
    );
  },
};

// ============================================
// STATISTICS HELPERS
// ============================================

export const Statistics = {
  /**
   * Get most popular games (by sales)
   */
  getMostPopularGames(games: GameResponse[], limit: number = 10): GameResponse[] {
    return Sorters.sortBySales(games).slice(0, limit);
  },

  /**
   * Get highest rated games
   */
  getHighestRatedGames(games: GameResponse[], limit: number = 10): GameResponse[] {
    return Sorters.sortByRating(games).slice(0, limit);
  },

  /**
   * Get newest games
   */
  getNewestGames(games: GameResponse[], limit: number = 10): GameResponse[] {
    return Sorters.sortByYear(games).slice(0, limit);
  },

  /**
   * Get games by category count
   */
  getGamesByCategory(games: GameResponse[]): Record<string, number> {
    const categories: Record<string, number> = {};

    games.forEach((game) => {
      categories[game.category] = (categories[game.category] || 0) + 1;
    });

    return categories;
  },

  /**
   * Get games by company count
   */
  getGamesByCompany(games: GameResponse[]): Record<string, number> {
    const companies: Record<string, number> = {};

    games.forEach((game) => {
      companies[game.company] = (companies[game.company] || 0) + 1;
    });

    return companies;
  },

  /**
   * Get price statistics
   */
  getPriceStatistics(games: GameResponse[]): {
    min: number;
    max: number;
    average: number;
    median: number;
  } {
    if (games.length === 0) {
      return { min: 0, max: 0, average: 0, median: 0 };
    }

    const prices = games.map((g) => g.price).sort((a, b) => a - b);
    const sum = prices.reduce((acc, price) => acc + price, 0);

    return {
      min: prices[0],
      max: prices[prices.length - 1],
      average: sum / prices.length,
      median: prices[Math.floor(prices.length / 2)],
    };
  },
};

// ============================================
// EXPORT ALL
// ============================================

export {
  Formatters,
  Calculators,
  Generators,
  Sorters,
  Filters,
  Checkers,
  Statistics,
};
