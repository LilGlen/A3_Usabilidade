import { useEffect, useState } from "react";
import { X, Trash2, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { PageType } from "../App";
import { useCart } from "./CartContext";
import { useAPI, CarrinhoItem } from "./useAPI";
import { useToast } from "./ToastProvider";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageType) => void;
}

interface EnrichedItem {
  id: number;
  fkJogo: number;
  game: {
    nome: string;
    preco: number;
  };
}

export function MiniCart({ isOpen, onClose, onNavigate }: MiniCartProps) {
  const { cart: cartItems, isLoading, removeFromCart } = useCart();
  const api = useAPI();
  const { showToast } = useToast();

  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    async function enrich() {
      if (!cartItems || cartItems.length === 0) {
        setItems([]);
        return;
      }
      setLoadingDetails(true);

      try {
        const promises = cartItems.map(async (item: CarrinhoItem) => {
          const result = await api.getGame(String(item.fkJogo));
          const jogo = result?.jogo ?? result;

          if (!jogo) return null;
          return {
            id: item.id,
            fkJogo: item.fkJogo,
            game: {
              nome: jogo.nome,
              preco: jogo.preco,
            },
          };
        });

        const enriched = (await Promise.all(promises)).filter(Boolean) as EnrichedItem[];
        if (active) setItems(enriched);
      } catch (err) {
        console.error("Erro ao enriquecer itens do carrinho:", err);
        setItems([]);
      } finally {
        if (active) setLoadingDetails(false);
      }
    }
    enrich();
    return () => {
      active = false;
    };
  }, [cartItems, isOpen, api]);

  const confirmRemove = async (fk_jogo: number) => {
    const success = await removeFromCart(fk_jogo);
    if (success) {
      showToast({
        type: "success",
        title: "Removido",
        message: "Item removido do carrinho",
      });
    } else {
      showToast({
        type: "error",
        title: "Erro",
        message: "Não foi possível remover o item",
      });
    }
  };

  const total = items.reduce((sum, it) => sum + (it.game.preco || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-secondary-bg shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="flex items-center justify-between p-6 border-b border-border bg-secondary-bg/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-accent-purple" />
            <h2 className="text-main-text text-xl font-bold">Seu Carrinho</h2>
            <span className="bg-accent-purple/20 text-accent-purple text-xs font-bold px-2 py-1 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary-text hover:text-main-text hover:bg-main-bg rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-accent-purple/20 scrollbar-track-transparent">
          {isLoading || loadingDetails ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
              <p className="text-secondary-text text-sm">Carregando seus jogos...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <ShoppingBag size={64} className="text-secondary-text" />
              <p className="text-lg font-medium text-secondary-text">Seu carrinho está vazio</p>
              <Button 
                variant="link" 
                className="text-accent-purple font-bold" 
                onClick={onClose}
              >
                Explorar Loja
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start space-x-4 bg-main-bg rounded-xl p-3 border border-border/50 hover:border-accent-purple/30 transition-all duration-200 hover:shadow-md"
                >
                  {/* IMAGEM: Mesma lógica da Home */}
                  <div className="w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-black/20 border border-border/30">
                    <ImageWithFallback
                      gameName={item.game.nome}
                      alt={item.game.nome}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="flex-1 min-w-0 py-1 flex flex-col justify-between h-20">
                    <div>
                      <h3 className="text-main-text font-semibold text-sm leading-tight line-clamp-2" title={item.game.nome}>
                        {item.game.nome}
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-accent-purple font-bold">
                        R$ {item.game.preco.toFixed(2).replace('.', ',')}
                      </p>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button 
                            className="text-secondary-text hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors"
                            title="Remover do carrinho"
                          >
                            <Trash2 size={16} />
                          </button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover <strong>{item.game.nome}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => confirmRemove(item.fkJogo)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-6 bg-secondary-bg space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-end">
              <span className="text-secondary-text text-sm">Total estimado:</span>
              <span className="text-main-text font-bold text-2xl">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-accent-purple hover:bg-accent-hover text-white py-6 rounded-xl text-lg font-bold shadow-lg shadow-accent-purple/20 transition-transform hover:scale-[1.02]"
                onClick={() => {
                  onNavigate("checkout");
                  onClose();
                }}
              >
                Finalizar Compra
              </Button>

              <Button
                variant="ghost"
                className="w-full text-secondary-text hover:text-main-text hover:bg-main-bg"
                onClick={onClose}
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}