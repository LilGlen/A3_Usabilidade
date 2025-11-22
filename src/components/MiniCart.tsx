// MiniCart.tsx
import React, { useEffect, useState } from "react";
import { X, Trash2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { PageType } from "../App";
import { useCart } from "./CartContext";
import { useAPI, CarrinhoItem } from "./useAPI";
import { toast } from "sonner";

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageType) => void;
}

interface EnrichedItem {
  id: number; // id do item do carrinho
  fk_jogo: number;
  game: {
    nome: string;
    preco: number;
    imagem_url: string;
  };
}

function getLocalImage(nome: string): string {
  const images: Record<string, string> = {
    "Half-Life Alyx": "/images/alyx.jpg",
    "Cyberpunk 2077": "/images/cyberpunk.jpg",
    "Portal 2": "/images/portal2.jpg",
    "Elden Ring": "/images/eldenring.jpg",
  };
  return images[nome] || "https://via.placeholder.com/80";
}

export function MiniCart({ isOpen, onClose, onNavigate }: MiniCartProps) {
  const { cart: cartItems, isLoading, removeFromCart } = useCart();
  const api = useAPI();

  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!isOpen) return; // só busca quando aberto
    let active = true;

    async function enrich() {
      if (!cartItems || cartItems.length === 0) {
        setItems([]);
        return;
      }

      setLoadingDetails(true);
      try {
        const promises = cartItems.map(async (item: CarrinhoItem) => {
          // note: fk_jogo conforme backend
          const result = await api.getGame(String(item.fkJogo));
          if (!result?.jogo) return null;
          return {
            id: item.id,
            fk_jogo: item.fkJogo,
            game: {
              nome: result.jogo.nome,
              preco: result.jogo.preco,
              imagem_url: getLocalImage(result.jogo.nome),
            },
          } as EnrichedItem;
        });

        const resolved = (await Promise.all(promises)).filter(Boolean) as EnrichedItem[];
        if (active) setItems(resolved);
      } catch (err) {
        console.error("Erro ao enriquecer itens do carrinho:", err);
        setItems([]);
      } finally {
        setLoadingDetails(false);
      }
    }

    enrich();
    return () => {
      active = false;
    };
  }, [cartItems, isOpen, api]);

  const handleRemove = async (fk_jogo: number) => {
    const confirmed = window.confirm("Tem certeza que deseja remover este jogo do carrinho?");
    if (!confirmed) return;

    const success = await removeFromCart(fk_jogo);
    if (success) {
      toast.success("Item removido do carrinho");
    } else {
      toast.error("Erro ao remover item");
    }
  };

  const total = items.reduce((sum, it) => sum + (it.game.preco || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-secondary-bg shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-main-text text-xl font-bold">Carrinho</h2>
          <button onClick={onClose} className="p-2 text-secondary-text hover:text-main-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading || loadingDetails ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-secondary-text py-8">
              <p>Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 bg-main-bg rounded-lg p-4">
                  <img src={item.game.imagem_url} alt={item.game.nome} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="text-main-text font-medium">{item.game.nome}</h3>
                    <p className="text-accent-purple">R$ {item.game.preco.toFixed(2)}</p>

                    <button onClick={() => handleRemove(item.fk_jogo)} className="mt-2 flex items-center text-red-500 hover:text-red-400">
                      <Trash2 size={16} className="mr-1" />
                      <span className="text-xs">Remover</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-secondary-text">Total:</span>
              <span className="text-main-text font-bold text-xl">R$ {total.toFixed(2)}</span>
            </div>

            <Button className="w-full bg-accent-purple hover:bg-accent-hover text-white py-3 rounded-lg" onClick={() => { onNavigate("checkout"); onClose(); }}>
              Finalizar Compra
            </Button>

            <Button variant="outline" className="w-full border-border" onClick={onClose}>
              Continuar Comprando
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
