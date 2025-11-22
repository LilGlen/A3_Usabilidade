// CartContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAPI, CarrinhoItem } from "./useAPI";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: CarrinhoItem[];
  cartCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (gameId: number) => Promise<boolean | "already-in-cart" | string>;
  removeFromCart: (gameId: number) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CarrinhoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const api = useAPI();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Carrega carrinho ao autenticar
  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated) {
        refreshCart();
      } else {
        setCart([]);
      }
    }
  }, [isAuthenticated, isAuthLoading]);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.getCart();
      if (result?.carrinho?.itens) {
        setCart(result.carrinho.itens);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("Erro ao obter carrinho:", err);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (
    gameId: number
  ): Promise<boolean | "already-in-cart" | string> => {
    if (!isAuthenticated) return false;

    // verificação local (usa fk_jogo conforme backend)
    const already = cart.some((item) => item.fkJogo === gameId);
    if (already) return "already-in-cart";

    try {
      const resp = await api.addToCart(gameId);

      // ❗ Caso o backend tenha retornado erro
      if (resp && (resp as any).message) {
        const msg = (resp as any).message.toLowerCase();

        if (msg.includes("já está")) {
          await refreshCart();
          return "already-in-cart";
        }

        // retorna mensagem exata do backend
        return (resp as any).message;
      }

      // Sucesso
      if (resp?.carrinho?.itens) {
        setCart(resp.carrinho.itens);
        return true;
      }

      // fallback
      await refreshCart();
      return true;
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho:", err);
      return "Erro inesperado.";
    }
  };

  const removeFromCart = async (gameId: number): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const result = await api.removeFromCart(gameId);
      if (result?.message) {
        await refreshCart();
        return true;
      }
    } catch (err) {
      console.error("Erro ao remover do carrinho:", err);
    }
    return false;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.length,
        isLoading,
        refreshCart,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
