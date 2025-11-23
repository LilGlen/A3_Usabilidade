import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { PageType } from '../App';
import { ArrowLeft, CreditCard, Shield, CheckCircle, Loader2, ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useAPI, CarrinhoItem } from './useAPI';
import { useToast } from './ToastProvider';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CheckoutPageNewProps {
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

export function CheckoutPageNew({ onNavigate }: CheckoutPageNewProps) {
  const [step, setStep] = useState(1); // 1: Cobrança, 2: Pagamento, 3: Sucesso
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | number>('');
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito');
  
  // Estados para detalhes dos jogos
  const [cartWithDetails, setCartWithDetails] = useState<CartItemWithDetails[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  
  const { cart, isLoading: cartLoading, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const api = useAPI();
  const { showToast } = useToast();

  // 1. Redireciona se não autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      showToast({ type: 'error', title: 'Acesso negado', message: 'Faça login para continuar' });
      onNavigate('home');
    }
  }, [isAuthenticated, onNavigate, showToast]);

  // 2. Busca detalhes dos jogos (Preço, Imagem, Nome)
  useEffect(() => {
    const fetchGameDetails = async () => {
      // Se o carrinho estiver vazio e já tiver carregado
      if (!cartLoading && cart.length === 0 && step < 3) {
        showToast({ type: 'info', title: 'Carrinho vazio', message: 'Seu carrinho está vazio' });
        onNavigate('home');
        return;
      }

      if (cart.length === 0) return;

      setIsLoadingDetails(true);
      try {
        const detailsPromises = cart.map(async (item) => {
          try {
            // Busca dados do jogo pelo ID
            const rawData = await api.getGame(String(item.fkJogo));
            
            // Tratamento de dados (o backend pode retornar estruturas diferentes)
            let actualGame = rawData;
            if (rawData && rawData.jogo) actualGame = rawData.jogo;
            
            if (!actualGame) throw new Error("Dados vazios");

            // Busca imagem (tenta URL do back, senão fallback do componente resolverá pelo nome)
            const imageUrl = actualGame.imagem_url || actualGame.image || ""; 

            const gameName = actualGame.nome || actualGame.titulo || 'Jogo Indisponível';
            const empresa = actualGame.desenvolvedora || actualGame.empresa || 'Digital Key';

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

    if (!cartLoading) {
      fetchGameDetails();
    }
  }, [cart, cartLoading, api, onNavigate, step, showToast]);

  // Cálculos
  const subtotal = cartWithDetails.reduce((sum, item) => sum + (item.gameDetails?.preco || 0), 0);
  const tax = subtotal * 0.0; // 0% de taxa por enquanto (ou ajuste conforme regra)
  const total = subtotal + tax;

  // Navegação entre passos
  const handleNextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Finalizar Compra
  const handleCompletePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsProcessing(true);
    try {
      const result = await api.checkout(paymentMethod);
      
      if (result?.success || (result as any)?.venda) {
        const vendaId = (result as any).venda?.id || (result as any).purchase?.id || 'CONFIRMADO';
        setOrderId(vendaId);
        showToast({ type: 'success', title: 'Sucesso!', message: 'Compra realizada com sucesso!' });
        
        // Limpa carrinho e vai para sucesso
        await clearCart();
        setStep(3);
      } else {
        showToast({ type: 'error', title: 'Erro', message: result?.message || 'Erro ao processar compra. Tente novamente.' });
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      showToast({ type: 'error', title: 'Erro', message: 'Erro ao processar compra' });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ESTADO DE CARREGAMENTO ---
  if (cartLoading || (isLoadingDetails && step < 3)) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-purple animate-spin" />
      </div>
    );
  }

  // --- PASSO 3: SUCESSO ---
  if (step === 3) {
    return (
      <div className="min-h-screen bg-main-bg">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-secondary-bg rounded-xl p-8 border border-border shadow-lg">
              <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
              <h1 className="text-3xl text-main-text font-bold mb-4">Compra Realizada!</h1>
              <p className="text-secondary-text mb-6 text-lg">
                Seu pedido foi processado com sucesso. As chaves de ativação já estão disponíveis na sua biblioteca.
              </p>
              <div className="bg-main-bg/50 p-4 rounded-lg mb-8 inline-block px-8">
                <p className="text-sm text-secondary-text uppercase tracking-wider font-semibold">Número do Pedido</p>
                <p className="text-accent-purple font-mono text-2xl font-bold mt-1">
                  #{orderId}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => onNavigate('profile')}
                  className="bg-accent-purple hover:bg-accent-hover px-8 py-6 text-lg"
                >
                  Ver Meus Jogos
                </Button>
                <Button 
                  onClick={() => onNavigate('home')}
                  variant="outline"
                  className="border-border text-secondary-text hover:text-main-text px-8 py-6 text-lg"
                >
                  Continuar Comprando
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg py-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <Button 
          onClick={() => onNavigate('home')}
          variant="outline"
          className="mb-8 border-border text-secondary-text hover:text-main-text"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continuar Comprando
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA: FORMULÁRIOS */}
          <div className="lg:col-span-2">
            {/* Indicador de Progresso */}
            <div className="mb-8 flex items-center justify-center space-x-4">
               <div className={`flex items-center ${step >= 1 ? 'text-accent-purple' : 'text-secondary-text'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold mr-2 ${step >= 1 ? 'border-accent-purple bg-accent-purple text-white' : 'border-secondary-text'}`}>1</div>
                 <span>Cobrança</span>
               </div>
               <div className="w-16 h-0.5 bg-border"></div>
               <div className={`flex items-center ${step >= 2 ? 'text-accent-purple' : 'text-secondary-text'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold mr-2 ${step >= 2 ? 'border-accent-purple bg-accent-purple text-white' : 'border-secondary-text'}`}>2</div>
                 <span>Pagamento</span>
               </div>
            </div>

            {step === 1 && (
              <Card className="bg-secondary-bg border-border">
                <CardHeader>
                  <CardTitle className="text-main-text">Dados de Cobrança</CardTitle>
                  <CardDescription className="text-secondary-text">
                    Confirme seus dados pessoais para a nota fiscal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-secondary-text">Nome</Label>
                        <Input id="firstName" defaultValue={user?.name?.split(' ')[0] || ''} className="bg-main-bg border-border text-main-text" required />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-secondary-text">Sobrenome</Label>
                        <Input id="lastName" defaultValue={user?.name?.split(' ').slice(1).join(' ') || ''} className="bg-main-bg border-border text-main-text" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-secondary-text">Email</Label>
                      <Input id="email" type="email" defaultValue={user?.email || ''} className="bg-main-bg border-border text-main-text" required />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-secondary-text">Endereço</Label>
                      <Input id="address" className="bg-main-bg border-border text-main-text" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-secondary-text">Cidade</Label>
                        <Input id="city" className="bg-main-bg border-border text-main-text" required />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-secondary-text">Estado</Label>
                        <Select>
                          <SelectTrigger className="bg-main-bg border-border text-main-text"><SelectValue placeholder="UF" /></SelectTrigger>
                          <SelectContent className="bg-secondary-bg border-border">
                            <SelectItem value="sp">SP</SelectItem>
                            <SelectItem value="rj">RJ</SelectItem>
                            <SelectItem value="mg">MG</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="zipCode" className="text-secondary-text">CEP</Label>
                        <Input id="zipCode" className="bg-main-bg border-border text-main-text" required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-accent-purple hover:bg-accent-hover mt-4 py-6 text-lg">
                      Ir para Pagamento
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="bg-secondary-bg border-border">
                <CardHeader>
                  <CardTitle className="text-main-text flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" /> Informações de Pagamento
                  </CardTitle>
                  <CardDescription className="text-secondary-text">Escolha como deseja pagar</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCompletePurchase} className="space-y-6">
                    <div>
                      <Label className="text-secondary-text mb-2 block">Método de Pagamento</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="bg-main-bg border-border text-main-text h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-secondary-bg border-border">
                          <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                          <SelectItem value="PIX">PIX (Aprovação Imediata)</SelectItem>
                          <SelectItem value="Boleto">Boleto Bancário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentMethod === 'Cartão de Crédito' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <Label className="text-secondary-text">Número do Cartão</Label>
                                <Input placeholder="0000 0000 0000 0000" className="bg-main-bg border-border text-main-text" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-secondary-text">Validade</Label>
                                    <Input placeholder="MM/AA" className="bg-main-bg border-border text-main-text" required />
                                </div>
                                <div>
                                    <Label className="text-secondary-text">CVV</Label>
                                    <Input placeholder="123" className="bg-main-bg border-border text-main-text" required />
                                </div>
                            </div>
                            <div>
                                <Label className="text-secondary-text">Nome no Cartão</Label>
                                <Input placeholder="COMO NO CARTAO" className="bg-main-bg border-border text-main-text" required />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center space-x-2 p-4 bg-main-bg/50 rounded-lg border border-border/50">
                      <Shield className="w-5 h-5 text-success" />
                      <span className="text-secondary-text text-sm">Ambiente 100% seguro e criptografado.</span>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="button" onClick={handlePreviousStep} variant="outline" className="flex-1 border-border text-secondary-text py-6">
                        Voltar
                      </Button>
                      <Button type="submit" className="flex-1 bg-accent-purple hover:bg-accent-hover text-white py-6 text-lg font-bold shadow-lg shadow-accent-purple/20" disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pagar R$ ${total.toFixed(2)}`}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* COLUNA DIREITA: RESUMO */}
          <div className="lg:col-span-1">
            <Card className="bg-secondary-bg border-border sticky top-8 shadow-xl">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-main-text flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-accent-purple" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                    {cartWithDetails.map((item) => (
                        <div key={item.id} className="flex gap-3 group">
                            <div className="w-16 h-20 flex-shrink-0 rounded-md overflow-hidden bg-black/20">
                                <ImageWithFallback 
                                    gameName={item.gameDetails?.nome || ''}
                                    src={item.gameDetails?.imagem_url}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-main-text font-medium text-sm line-clamp-2">{item.gameDetails?.nome}</p>
                                <p className="text-secondary-text text-xs mt-1">{item.gameDetails?.empresa}</p>
                                <p className="text-accent-purple font-bold text-sm mt-1">R$ {item.gameDetails?.preco.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <Separator className="bg-border my-4" />
                
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-secondary-text">
                        <span>Subtotal</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-secondary-text">
                        <span>Descontos</span>
                        <span>- R$ 0,00</span>
                    </div>
                    <Separator className="bg-border my-2" />
                    <div className="flex justify-between text-main-text text-lg font-bold">
                        <span>Total</span>
                        <span className="text-accent-purple">R$ {total.toFixed(2)}</span>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}