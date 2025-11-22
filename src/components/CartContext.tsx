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

    const already = cart.some((item) => item.fkJogo === gameId);
    if (already) return "already-in-cart";

    try {
      const resp = await api.addToCart(gameId);

      const msg: string = resp?.message?.toLowerCase() ?? "";

      // --- ERROS REAIS VINDOS DO BACKEND ---
      if (
        msg.includes("erro") || // "Erro ao adicionar"
        msg.includes("falha") || // "Falha ao adicionar"
        msg.includes("não foi possível")
      ) {
        return false; // → tratado como ERROR no HomePage
      }

      // --- JÁ ESTÁ NO CARRINHO ---
      if (msg.includes("já está")) {
        await refreshCart();
        return "already-in-cart";
      }

      // --- SUCESSO COM MENSAGEM ---
      if (resp?.message) {
        await refreshCart();
        return true;
      }

      // --- SUCESSO PADRÃO ---
      if (resp?.carrinho?.itens) {
        setCart(resp.carrinho.itens);
        await refreshCart();
        return true;
      }

      // fallback — algo inesperado
      return false;
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho:", err);
      return false;
    }
  };

  const removeFromCart = async (gameId: number): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const result = await api.removeFromCart(gameId);
      if (result?.message) {
        await refreshCart();
        window.location.reload(); // ⬅ ADICIONADO
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
