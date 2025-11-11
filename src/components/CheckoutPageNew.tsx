import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { PageType } from '../App';
import { ArrowLeft, CreditCard, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useAPI } from './useAPI';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CheckoutPageNewProps {
  onNavigate: (page: PageType) => void;
}

export function CheckoutPageNew({ onNavigate }: CheckoutPageNewProps) {
  const [step, setStep] = useState(1); // 1: Billing, 2: Payment, 3: Confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito');
  
  const { cart, isLoading: cartLoading, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const api = useAPI();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Faça login para continuar');
      onNavigate('home');
    }
  }, [isAuthenticated]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && cart.length === 0 && step < 3) {
      toast.info('Seu carrinho está vazio');
      onNavigate('home');
    }
  }, [cart, cartLoading, step]);

  const subtotal = cart.reduce((sum, item) => sum + (item.gameDetails?.price || 0), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCompletePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsProcessing(true);
    try {
      const result = await api.checkout(paymentMethod);
      
      if (result?.success) {
        setOrderId(result.purchase?.id || '');
        toast.success('Compra realizada com sucesso!');
        setStep(3);
        // Clear local cart
        await clearCart();
      } else {
        toast.error('Erro ao processar compra. Tente novamente.');
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error('Erro ao processar compra');
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-main-bg">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-secondary-bg rounded-xl p-8 border border-border">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h1 className="text-main-text mb-4">Compra Realizada com Sucesso!</h1>
              <p className="text-secondary-text mb-6">
                Seu pedido foi processado e você receberá um email de confirmação em breve.
              </p>
              <p className="text-accent-purple mb-6">
                Número do Pedido: #{orderId || 'SYNTH-2024-XXX'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => onNavigate('profile')}
                  className="bg-accent-purple hover:bg-accent-hover"
                  aria-label="Ver meus pedidos"
                >
                  Ver Meus Pedidos
                </Button>
                <Button 
                  onClick={() => onNavigate('home')}
                  variant="outline"
                  className="border-border text-secondary-text hover:text-main-text"
                  aria-label="Continuar comprando"
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

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <Button 
          onClick={() => onNavigate('home')}
          variant="outline"
          className="mb-6 border-border text-secondary-text hover:text-main-text"
          aria-label="Continuar comprando"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continuar Comprando
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-accent-purple text-white' : 'bg-secondary-bg text-secondary-text'
                }`}>
                  1
                </div>
                <span className={step >= 1 ? 'text-main-text' : 'text-secondary-text'}>
                  Dados de Cobrança
                </span>
                <div className="flex-1 h-px bg-border"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-accent-purple text-white' : 'bg-secondary-bg text-secondary-text'
                }`}>
                  2
                </div>
                <span className={step >= 2 ? 'text-main-text' : 'text-secondary-text'}>
                  Pagamento
                </span>
              </div>
            </div>

            {step === 1 && (
              <Card className="bg-secondary-bg border-border">
                <CardHeader>
                  <CardTitle className="text-main-text">Dados de Cobrança</CardTitle>
                  <CardDescription className="text-secondary-text">
                    Preencha seus dados para finalizar a compra
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-secondary-text">Nome</Label>
                        <Input
                          id="firstName"
                          defaultValue={user?.name?.split(' ')[0] || ''}
                          className="bg-main-bg border-border text-main-text"
                          required
                          aria-label="Nome"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-secondary-text">Sobrenome</Label>
                        <Input
                          id="lastName"
                          defaultValue={user?.name?.split(' ').slice(1).join(' ') || ''}
                          className="bg-main-bg border-border text-main-text"
                          required
                          aria-label="Sobrenome"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-secondary-text">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={user?.email || ''}
                        className="bg-main-bg border-border text-main-text"
                        required
                        aria-label="Email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-secondary-text">Endereço</Label>
                      <Input
                        id="address"
                        className="bg-main-bg border-border text-main-text"
                        required
                        aria-label="Endereço"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-secondary-text">Cidade</Label>
                        <Input
                          id="city"
                          className="bg-main-bg border-border text-main-text"
                          required
                          aria-label="Cidade"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-secondary-text">Estado</Label>
                        <Select required>
                          <SelectTrigger className="bg-main-bg border-border text-main-text" aria-label="Estado">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-secondary-bg border-border">
                            <SelectItem value="sp" className="text-main-text">São Paulo</SelectItem>
                            <SelectItem value="rj" className="text-main-text">Rio de Janeiro</SelectItem>
                            <SelectItem value="mg" className="text-main-text">Minas Gerais</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="zipCode" className="text-secondary-text">CEP</Label>
                        <Input
                          id="zipCode"
                          className="bg-main-bg border-border text-main-text"
                          placeholder="00000-000"
                          required
                          aria-label="CEP"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-accent-purple hover:bg-accent-hover"
                    >
                      Continuar para Pagamento
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="bg-secondary-bg border-border">
                <CardHeader>
                  <CardTitle className="text-main-text flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Informações de Pagamento
                  </CardTitle>
                  <CardDescription className="text-secondary-text">
                    Digite os dados do seu cartão de crédito
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCompletePurchase} className="space-y-4">
                    <div>
                      <Label htmlFor="paymentMethod" className="text-secondary-text">Método de Pagamento</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="bg-main-bg border-border text-main-text" aria-label="Método de pagamento">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-secondary-bg border-border">
                          <SelectItem value="Cartão de Crédito" className="text-main-text">Cartão de Crédito</SelectItem>
                          <SelectItem value="Cartão de Débito" className="text-main-text">Cartão de Débito</SelectItem>
                          <SelectItem value="PIX" className="text-main-text">PIX</SelectItem>
                          <SelectItem value="Boleto" className="text-main-text">Boleto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cardNumber" className="text-secondary-text">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 1234 1234 1234"
                        className="bg-main-bg border-border text-main-text"
                        required
                        aria-label="Número do cartão"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardName" className="text-secondary-text">Nome no Cartão</Label>
                      <Input
                        id="cardName"
                        placeholder="NOME COMPLETO"
                        className="bg-main-bg border-border text-main-text"
                        required
                        aria-label="Nome no cartão"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry" className="text-secondary-text">Validade</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/AA"
                          className="bg-main-bg border-border text-main-text"
                          required
                          aria-label="Validade do cartão"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-secondary-text">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          className="bg-main-bg border-border text-main-text"
                          required
                          aria-label="CVV do cartão"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-4 bg-main-bg rounded-lg">
                      <Shield className="w-5 h-5 text-success" />
                      <span className="text-secondary-text text-sm">
                        Suas informações estão protegidas com criptografia SSL
                      </span>
                    </div>
                    <div className="flex space-x-4">
                      <Button 
                        type="button"
                        onClick={handlePreviousStep}
                        variant="outline"
                        className="flex-1 border-border text-secondary-text hover:text-main-text"
                        aria-label="Voltar"
                      >
                        Voltar
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1 bg-accent-purple hover:bg-accent-hover"
                        disabled={isProcessing}
                        aria-label="Finalizar compra"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          'Finalizar Compra'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-secondary-bg border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-main-text">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.gameId} className="flex items-center space-x-3">
                    <ImageWithFallback
                      src={item.gameDetails?.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=80&h=80&fit=crop'}
                      alt={item.gameDetails?.name || 'Jogo'}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-main-text text-sm">{item.gameDetails?.name}</p>
                      <p className="text-secondary-text text-xs">{item.gameDetails?.company}</p>
                    </div>
                    <p className="text-accent-purple">
                      R$ {(item.gameDetails?.price || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
                
                <Separator className="bg-border" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-secondary-text">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-secondary-text">
                    <span>Impostos (10%):</span>
                    <span>R$ {tax.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex justify-between text-main-text text-lg">
                    <span>Total:</span>
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
