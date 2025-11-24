import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import type { PageType } from '../App';
// ÍCONES: Adicionei Key e Copy
import { Loader2, ShoppingCart, Lock, CheckCircle, Key, Copy } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useAPI, CarrinhoItem } from './useAPI';
import { useToast } from './ToastProvider';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CheckoutPageProps {
  onNavigate: (page: PageType) => void;
}

interface CartItemWithDetails extends CarrinhoItem {
  gameDetails?: {
    nome: string;
    preco: number;
    imagem_url: string;
    empresa: string;
    id: number; // Importante para comparar depois
  };
}

// Interface para as chaves que vamos "pescar" da biblioteca
interface PurchasedKey {
  nomeJogo: string;
  chave: string;
  imagem?: string;
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | number>('');
  const [step, setStep] = useState(1);
  
  const [cartWithDetails, setCartWithDetails] = useState<CartItemWithDetails[]>([]);
  const [purchasedKeys, setPurchasedKeys] = useState<PurchasedKey[]>([]); // Estado para as chaves
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  
  const { cart, refreshCart, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const api = useAPI();
  const { showToast } = useToast();

  // 1. Verificação de Autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      showToast({ type: 'info', title: 'Login necessário', message: 'Faça login para acessar o checkout.' });
      onNavigate('home');
    }
  }, [isAuthenticated, onNavigate, showToast]);

  // Função auxiliar para extrair dados (mantida igual)
  const extractGameData = (data: any) => {
    if (!data) return null;
    if (Array.isArray(data)) return data[0];
    if (data.jogo) return data.jogo;
    if (data.game) return data.game;
    if (data.data) return Array.isArray(data.data) ? data.data[0] : data.data;
    return data;
  };

  // 2. Busca detalhes dos jogos (Mantida igual, mas garantindo pegar o ID)
  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!cartLoading && cart.length === 0) {
        setCartWithDetails([]);
        setIsLoadingDetails(false);
        return;
      }

      setIsLoadingDetails(true);
      try {
        const detailsPromises = cart.map(async (item) => {
          try {
            const rawData = await api.getGame(String(item.fkJogo));
            const actualGame = extractGameData(rawData);
            
            if (!actualGame) throw new Error("Dados vazios");

            const imageUrl = actualGame.imagem_url || actualGame.image || actualGame.url_imagem || ""; 
            const gameName = actualGame.nome || actualGame.titulo || 'Jogo Indisponível';
            const empresa = actualGame.desenvolvedora || actualGame.empresa || 'Digital Key';

            return {
              ...item,
              gameDetails: {
                id: Number(actualGame.id), // ID do jogo é crucial
                nome: gameName,
                preco: Number(actualGame.preco || 0),
                imagem_url: imageUrl, 
                empresa: empresa
              }
            };
          } catch (error) {
            return {
                ...item,
                gameDetails: { id: 0, nome: "Erro", preco: 0, imagem_url: "", empresa: "-" }
            };
          }
        });

        const itemsWithDetails = await Promise.all(detailsPromises);
        setCartWithDetails(itemsWithDetails);
      } catch (error) {
        console.error("Erro geral", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    if (!cartLoading) {
      fetchGameDetails();
    }
  }, [cart, cartLoading, api]);

  // Redireciona se vazio
  useEffect(() => {
    if (!cartLoading && !isLoadingDetails && cartWithDetails.length === 0 && step !== 2) {
      showToast({ type: 'info', title: 'Carrinho vazio', message: 'Adicione jogos antes.' });
      onNavigate('home');
    }
  }, [cartLoading, isLoadingDetails, cartWithDetails, onNavigate, step]);

  const total = cartWithDetails.reduce((sum, item) => sum + (item.gameDetails?.preco || 0), 0);

  // --- A MÁGICA ACONTECE AQUI ---
  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    
    // 1. Guardamos os IDs dos jogos que estamos comprando AGORA
    // Precisamos disso porque depois vamos limpar o carrinho
    const gameIdsBeingBought = cartWithDetails.map(item => Number(item.fkJogo));
    
    try {
      // 2. Faz o Checkout (Backend gera as chaves e salva no banco, mas não devolve)
      const result = await api.checkout("Compra Direta");
      
      if (result?.success || (result as any)?.venda) {
        const vendaId = (result as any).venda?.id || (result as any).purchase?.id || 'PROCESSADO';
        setOrderId(vendaId);
        
        // 3. AGORA BUSCAMOS AS CHAVES:
        // Chamamos a biblioteca do usuário para pegar os dados atualizados do banco
        try {
            // ATENÇÃO: Você precisa ter esse método no useAPI que chama seu endpoint de "Meus Jogos"
            // Se o nome for diferente (ex: getUserGames), ajuste aqui.
            const myLibrary = await api.getLibrary(); 
            
            // 4. Filtramos a biblioteca para achar SOMENTE os jogos que acabamos de comprar
            const foundKeys: PurchasedKey[] = [];
            
            // O formato de 'myLibrary' depende do seu endpoint, assumindo que seja um array de jogos com chave
            if (Array.isArray(myLibrary)) {
                myLibrary.forEach((libItem: any) => {
                    // Verifica se o jogo da biblioteca é um dos que compramos
                    // Adapte 'libItem.jogoId' ou 'libItem.id' conforme seu retorno da API de library
                    const libGameId = Number(libItem.fkJogo || libItem.jogoId || libItem.id);
                    
                    if (gameIdsBeingBought.includes(libGameId)) {
                        foundKeys.push({
                            nomeJogo: libItem.nome || libItem.gameName || 'Jogo',
                            // Aqui pegamos a chave que o backend acabou de gerar
                            chave: libItem.chave || libItem.key || libItem.chave_ativacao || 'Ativado na conta',
                            imagem: libItem.imagem || libItem.image
                        });
                    }
                });
            }
            
            setPurchasedKeys(foundKeys);

        } catch (libraryError) {
            console.error("Erro ao buscar chaves na biblioteca:", libraryError);
            // Se falhar, não quebra o fluxo de sucesso, apenas não mostra as chaves
        }

        showToast({ type: 'success', title: 'Sucesso!', message: 'Compra realizada!' });
        
        await refreshCart(); // Limpa o carrinho visual
        setStep(2); // Vai para tela de sucesso
      } else {
        showToast({ type: 'error', title: 'Erro', message: result?.message || 'Erro ao processar.' });
      }
    } catch (error) {
      console.error('Error processing:', error);
      showToast({ type: 'error', title: 'Erro', message: 'Erro de conexão.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast({ type: 'success', title: 'Copiado!', message: 'Chave copiada.' });
  };

  if (cartLoading || isLoadingDetails) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-purple animate-spin mx-auto mb-4" />
          <p className="text-secondary-text">Processando...</p>
        </div>
      </div>
    );
  }

  // --- TELA DE SUCESSO (PASSO 2) ---
  if (step === 2) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center p-4 py-12">
        <div className="max-w-3xl w-full text-center">
          <div className="bg-secondary-bg rounded-xl p-8 border border-border shadow-2xl">
            <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
            <h1 className="text-3xl text-main-text font-bold mb-2">Compra Realizada!</h1>
            <p className="text-secondary-text mb-6 text-lg">
              Pedido #{orderId} processado com sucesso.
            </p>

            {/* LISTA DE CHAVES (Se conseguimos recuperar) */}
            {purchasedKeys.length > 0 ? (
                <div className="grid gap-4 mb-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-main-text font-semibold text-center mb-2">Suas Chaves de Ativação:</h3>
                    {purchasedKeys.map((item, index) => (
                        <div key={index} className="bg-main-bg border border-border p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="w-12 h-12 bg-secondary-bg rounded flex items-center justify-center text-accent-purple border border-border/50">
                                    <Key className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-main-text font-bold">{item.nomeJogo}</h3>
                                    <p className="text-[10px] text-secondary-text uppercase tracking-wider font-bold">Serial Key</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <code className="bg-black/40 text-success font-mono px-4 py-3 rounded border border-success/20 flex-1 sm:flex-none text-center select-all text-sm sm:text-base">
                                    {item.chave}
                                </code>
                                <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => copyToClipboard(item.chave)}
                                    className="hover:bg-main-bg hover:text-white border-border h-12 w-12"
                                    title="Copiar Chave"
                                >
                                    <Copy className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-main-bg/50 p-6 rounded-lg mb-8 border border-border">
                    <p className="text-secondary-text">
                        Seus jogos foram adicionados à sua biblioteca. 
                        Acesse seu perfil para visualizar as chaves.
                    </p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center border-t border-border pt-6">
              <Button 
                onClick={() => onNavigate('profile')}
                className="bg-accent-purple hover:bg-accent-hover text-white px-8 py-6 text-lg w-full sm:w-auto"
              >
                Ir para Minha Biblioteca
              </Button>
              <Button 
                onClick={() => onNavigate('home')}
                variant="outline"
                className="border-border text-secondary-text hover:text-main-text px-8 py-6 text-lg w-full sm:w-auto"
              >
                Voltar para Loja
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA DE REVISÃO (MANTIDA IGUAL) ---
  return (
    <div className="min-h-screen bg-main-bg py-12 px-4 sm:px-6">
      {/* ... (Todo o seu JSX anterior da tela de checkout) ... */}
       <div className="max-w-4xl mx-auto">
         {/* ... Cabeçalho ... */}
         <h1 className="text-3xl font-bold text-main-text text-center mb-8">
           Finalizar Compra
         </h1>
         <div className="flex justify-center">
          <Card className="w-full max-w-2xl bg-secondary-bg border-border shadow-2xl">
            {/* ... Conteúdo do Card ... */}
            <CardHeader className="pb-4 border-b border-border/50">
               <CardTitle className="text-xl text-main-text flex items-center gap-2">
                 <ShoppingCart className="w-5 h-5 text-accent-purple" />
                 Resumo do Pedido
               </CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
               {/* Lista de itens para revisão */}
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                 {cartWithDetails.map((item) => (
                    <div key={item.id} className="flex items-center justify-between group p-3 rounded-lg hover:bg-main-bg/50 transition-colors border border-transparent hover:border-border/30">
                      <div className="flex items-center space-x-4">
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
                   className="w-full bg-accent-purple hover:bg-accent-hover text-white font-bold text-lg py-6 shadow-lg"
                 >
                   {isProcessing ? (
                     <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Processando...</>
                   ) : 'Confirmar Compra'}
                 </Button>

                 <div className="flex items-center justify-center gap-2 text-xs text-secondary-text/70 mt-4">
                   <Lock className="w-3 h-3" />
                   <p>Pagamento seguro. Ativação imediata.</p>
                 </div>
               </div>
             </CardContent>
          </Card>
         </div>
       </div>
    </div>
  );
}