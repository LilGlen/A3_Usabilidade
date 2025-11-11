import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAPI } from './useAPI';
import { useAuth } from './AuthContext';

interface CartItem {
  gameId: string;
  addedAt: string;
  gameDetails?: any;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (gameId: string) => Promise<boolean | 'already-in-cart'>;
  removeFromCart: (gameId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const api = useAPI();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await api.getCart();
      if (result?.success) {
        setCart(result.cart?.items || []);
      } else {
        console.warn('Failed to fetch cart, using empty cart');
        setCart([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (gameId: string): Promise<boolean | 'already-in-cart'> => {
    if (!isAuthenticated) {
      console.warn('Cannot add to cart: user not authenticated');
      return false;
    }

    try {
      const result = await api.addToCart(gameId);
      if (result?.success) {
        await refreshCart();
        return true;
      } else if (result?.alreadyInCart) {
        // Game is already in cart, but this is not really an error
        console.info('Game already in cart');
        return 'already-in-cart' as any; // Return a special value
      } else {
        console.warn('Failed to add to cart:', result);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
    return false;
  };

  const removeFromCart = async (gameId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const result = await api.removeFromCart(gameId);
      if (result?.success) {
        await refreshCart();
        return true;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
    return false;
  };

  const clearCart = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const result = await api.clearCart();
      if (result?.success) {
        setCart([]);
        return true;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
    return false;
  };

  const value: CartContextType = {
    cart,
    cartCount: cart.length,
    isLoading,
    refreshCart,
    addToCart,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
