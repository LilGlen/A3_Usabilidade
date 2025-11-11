import { X, Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { PageType } from '../App';
import { useCart } from './CartContext';
import { toast } from 'sonner@2.0.3';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageType) => void;
}

export function MiniCart({ isOpen, onClose, onNavigate }: MiniCartProps) {
  const { cart, isLoading, removeFromCart } = useCart();

  const handleRemove = async (gameId: string) => {
    const success = await removeFromCart(gameId);
    if (success) {
      toast.success('Item removido do carrinho');
    } else {
      toast.error('Erro ao remover item');
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.gameDetails?.price || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Mini Cart */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-secondary-bg shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-main-text">Carrinho</h2>
            <button
              onClick={onClose}
              className="p-2 text-secondary-text hover:text-main-text transition-colors rounded-lg hover:bg-main-bg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center text-secondary-text py-8">
                <p>Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.gameId} className="flex items-center space-x-4 bg-main-bg rounded-lg p-4">
                    <img
                      src={item.gameDetails?.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=80&h=80&fit=crop&crop=center'}
                      alt={item.gameDetails?.name || 'Jogo'}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-main-text font-medium">{item.gameDetails?.name || 'Carregando...'}</h3>
                      <p className="text-accent-purple">R$ {(item.gameDetails?.price || 0).toFixed(2)}</p>
                      
                      {/* Remove Button */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleRemove(item.gameId)}
                          className="p-1 text-red-500 hover:text-red-400 transition-colors flex items-center"
                          aria-label={`Remover ${item.gameDetails?.name || 'jogo'} do carrinho`}
                        >
                          <Trash2 size={16} className="mr-1" />
                          <span className="text-xs">Remover</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isLoading && cart.length > 0 && (
            <div className="border-t border-border p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-secondary-text">Total:</span>
                <span className="text-main-text font-bold text-xl">
                  R$ {total.toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full bg-accent-purple hover:bg-accent-hover text-white py-3 rounded-lg transition duration-300"
                  onClick={() => {
                    onNavigate('checkout');
                    onClose();
                  }}
                  aria-label="Ir para finalizar compra"
                >
                  Finalizar Compra
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-border text-main-text hover:bg-main-bg transition duration-300"
                  onClick={onClose}
                  aria-label="Continuar comprando"
                >
                  Continuar Comprando
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}