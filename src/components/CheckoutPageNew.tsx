import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import type { PageType } from '../App';
import { Loader2, ShoppingCart, Lock, CheckCircle } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useAPI, CarrinhoItem } from './useAPI';
import { useToast } from './ToastProvider';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CheckoutPageProps {
  onNavigate: (page: PageType) => void;
}

// Interface auxiliar para o item com detalhes completos do jogo
interface CartItemWithDetails extends CarrinhoItem {
  gameDetails?: {
    nome: string;
    preco: number;
    imagem_url: string;
    empresa: string;
  };
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | number>('');
  const [step, setStep] = useState(1); // 1: Revisão, 2: Sucesso
  
  const [cartWithDetails, setCartWithDetails] = useState<CartItemWithDetails[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  
  const { cart, refreshCart, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const api = useAPI();
  const { showToast } = useToast();

  // 1. Verificação de Autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      showToast({ 
        type: 'info', 
        title: 'Login necessário', 
        message: 'Faça login para acessar o checkout.' 
      });
      onNavigate('home');
    }
  }, [isAuthenticated, onNavigate, showToast]);

  // Função auxiliar para extrair dados do jogo de qualquer formato de resposta da API
  const extractGameData = (data: any) => {
    if (!data) return null;
    
    // Se for array, pega o primeiro item
    if (Array.isArray(data)) return data[0];
    
    // Se estiver embrulhado em propriedades comuns
    if (data.jogo) return data.jogo;
    if (data.game) return data.game;
    if (data.data) return Array.isArray(data.data) ? data.data[0] : data.data;
    
    return data;
  };

  // 2. Busca detalhes dos jogos
  useEffect(() => {
    const fetchGameDetails = async () => {
      // Se o carrinho do contexto estiver vazio e não estivermos carregando
      if (!cartLoading && cart.length === 0) {
        setCartWithDetails([]);
        setIsLoadingDetails(false);
        return;
      }

      setIsLoadingDetails(true);
      try {
        const detailsPromises = cart.map(async (item) => {
          try {
            // Busca dados do jogo pelo ID
            const rawData = await api.getGame(String(item.fkJogo));
            
            // Usa a função auxiliar para garantir que pegamos o objeto correto
            const actualGame = extractGameData(rawData);
            
            if (!actualGame) {
                console.warn(`[Checkout] Jogo ${item.fkJogo} não encontrado na resposta.`);
                throw new Error("Dados vazios");
            }

            // Tenta encontrar a URL da imagem vinda da API
            // Se não tiver, passamos undefined/null para que o ImageWithFallback use o asset local (baseado no nome)
            const imageUrl = 
              actualGame.imagem_url || 
              actualGame.image || 
              actualGame.url_imagem || 
              actualGame.img ||
              actualGame.capa ||
              actualGame.thumbnail ||
              ""; 

            // Garante que temos um nome para buscar o asset local
            const gameName = 
              actualGame.nome || 
              actualGame.titulo || 
              actualGame.name || 
              actualGame.title ||
              'Jogo Indisponível';

            const empresa = 
              actualGame.desenvolvedora || 
              actualGame.empresa || 
              actualGame.company || 
              actualGame.publisher ||
              'Digital Key';

            return {
              ...item,
              gameDetails: {
                nome: gameName,
                preco: Number(actualGame.preco || actualGame.price || 0),
                imagem_url: imageUrl, 
                empresa: empresa
              }
            };
          } catch (error) {
            console.error(`Erro ao carregar jogo ${item.fkJogo}`, error);
            // Retorna um item "seguro" em caso de erro, para não quebrar a tela
            return {
                ...item,
                gameDetails: {
                    nome: "Erro ao carregar",
                    preco: 0,
                    imagem_url: "",
                    empresa: "-"
                }
            };
          }
        });

        const itemsWithDetails = await Promise.all(detailsPromises);
        setCartWithDetails(itemsWithDetails);
      } catch (error) {
        console.error("Erro geral ao buscar detalhes", error);
        showToast({ type: 'error', title: 'Erro', message: 'Erro ao carregar detalhes do pedido.' });
      } finally {
        setIsLoadingDetails(false);
      }
    };

    // Só busca se o carrinho já foi carregado pelo contexto
    if (!cartLoading) {
      fetchGameDetails();
    }
  }, [cart, cartLoading, api, showToast]);

  // 3. Redireciona se carrinho vazio (apenas se não estiver na tela de sucesso)
  useEffect(() => {
    if (!cartLoading && !isLoadingDetails && cartWithDetails.length === 0 && step !== 2) {
      showToast({ 
        type: 'info', 
        title: 'Carrinho vazio', 
        message: 'Adicione jogos antes de finalizar a compra.' 
      });
      onNavigate('home');
    }
  }, [cartLoading, isLoadingDetails, cartWithDetails, onNavigate, showToast, step]);

  // Cálculos
  const total = cartWithDetails.reduce((sum, item) => sum + (item.gameDetails?.preco || 0), 0);

  // Lógica de "One-Click Checkout"
  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Envia POST para /vendas/checkout
      const result = await api.checkout("Compra Direta");
      
      // Verifica sucesso (compatível com seu backend que retorna 'venda')
      if (result?.success || (result as any)?.venda) {
        
        // Pega o ID da venda
        const vendaId = (result as any).venda?.id || (result as any).purchase?.id || 'PROCESSADO';
        setOrderId(vendaId);
        
        showToast({ 
          type: 'success', 
          title: 'Sucesso!', 
          message: 'Compra realizada com sucesso!' 
        });
        
        // Limpa o carrinho localmente via refresh
        await refreshCart();
        
        // Muda para a tela de sucesso
        setStep(2);
      } else {
        showToast({ 
          type: 'error', 
          title: 'Erro', 
          message: result?.message || 'Erro ao processar compra.' 
        });
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      showToast({ 
        type: 'error', 
        title: 'Erro de conexão', 
        message: 'Não foi possível conectar ao servidor.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ESTADO DE CARREGAMENTO ---
  if (cartLoading || isLoadingDetails) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-purple animate-spin mx-auto mb-4" />
          <p className="text-secondary-text">Carregando detalhes do pedido...</p>
        </div>
      </div>
    );
  }

  // --- TELA DE SUCESSO (PASSO 2) ---
  if (step === 2) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-secondary-bg rounded-xl p-8 border border-border shadow-2xl">
            <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
            <h1 className="text-3xl text-main-text font-bold mb-4">Compra Realizada!</h1>
            <p className="text-secondary-text mb-8 text-lg">
              Seu pedido foi processado com sucesso. As chaves de ativação já estão disponíveis na sua biblioteca.
            </p>
            <div className="bg-main-bg/50 p-4 rounded-lg mb-8 inline-block">
              <p className="text-accent-purple font-mono text-xl font-bold">
                Pedido #{orderId}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => onNavigate('profile')}
                className="bg-accent-purple hover:bg-accent-hover text-white px-8 py-6 text-lg"
              >
                Ver Meus Jogos
              </Button>
              <Button 
                onClick={() => onNavigate('home')}
                variant="outline"
                className="border-border text-secondary-text hover:text-main-text px-8 py-6 text-lg"
              >
                Voltar para Loja
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA DE REVISÃO (PASSO 1) ---
  return (
    <div className="min-h-screen bg-main-bg py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-bold text-main-text text-center mb-8">
          Finalizar Compra
        </h1>

        <div className="flex justify-center">
          <Card className="w-full max-w-2xl bg-secondary-bg border-border shadow-2xl">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-xl text-main-text flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-accent-purple" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {cartWithDetails.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group p-3 rounded-lg hover:bg-main-bg/50 transition-colors border border-transparent hover:border-border/30">
                    <div className="flex items-center space-x-4">
                      
                      {/* CONTAINER DA IMAGEM: Tamanho fixo para garantir que a imagem apareça */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-md bg-main-bg shadow-sm relative">
                        <ImageWithFallback
                          src={item.gameDetails?.imagem_url}
                          alt={item.gameDetails?.nome || 'Jogo'}
                          gameName={item.gameDetails?.nome || 'Jogo'}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      <div>
                        <h3 className="text-main-text font-medium text-lg leading-tight">
                          {item.gameDetails?.nome}
                        </h3>
                        <p className="text-secondary-text text-sm mt-1">
                          {item.gameDetails?.empresa}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-main-text font-bold text-lg">
                        R$ {(item.gameDetails?.preco || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-border mb-6" />

              <div className="space-y-6">
                <div className="flex justify-between items-end bg-main-bg/30 p-4 rounded-lg">
                  <span className="text-secondary-text text-lg font-medium">Total a pagar:</span>
                  <span className="text-3xl font-bold text-accent-purple">
                    R$ {total.toFixed(2)}
                  </span>
                </div>

                <Button 
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="w-full bg-accent-purple hover:bg-accent-hover text-white font-bold text-lg py-6 shadow-lg hover:shadow-accent-purple/20 transition-all duration-300"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Confirmar Compra'
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-secondary-text/70 mt-4">
                  <Lock className="w-3 h-3" />
                  <p>
                    Pagamento seguro. Ativação imediata.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}