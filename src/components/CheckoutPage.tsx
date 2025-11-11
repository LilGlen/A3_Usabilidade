import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { PageType } from '../App';
import { ArrowLeft, CreditCard, Shield, CheckCircle } from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (page: PageType) => void;
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const [step, setStep] = useState(1); // 1: Billing, 2: Payment, 3: Confirmation

  // Mock cart items (should come from global state)
  const cartItems = [
    {
      id: '1',
      name: 'Cyberpunk 2077',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=80&h=80&fit=crop&crop=center',
      quantity: 1
    },
    {
      id: '2',
      name: 'Neon Highway',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=80&h=80&fit=crop&crop=center',
      quantity: 2
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

  const handleCompletePurchase = () => {
    // Simulate purchase completion
    setTimeout(() => {
      setStep(3);
    }, 1000);
  };

  if (step === 3) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-secondary-bg rounded-xl p-8">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h1 className="text-main-text mb-4">Compra Realizada com Sucesso!</h1>
            <p className="text-secondary-text mb-6">
              Seu pedido foi processado e você receberá um email de confirmação em breve.
            </p>
            <p className="text-accent-purple font-bold mb-6">
              Número do Pedido: #SYNTH-2024-001
            </p>
            <Button 
              onClick={() => onNavigate('profile')}
              className="bg-accent-purple hover:bg-accent-hover mr-4"
            >
              Ver Meus Pedidos
            </Button>
            <Button 
              onClick={() => onNavigate('home')}
              variant="outline"
              className="border-border text-secondary-text hover:text-main-text"
            >
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <Button 
        onClick={() => onNavigate('home')}
        variant="outline"
        className="mb-6 border-border text-secondary-text hover:text-main-text"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Continuar Comprando
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-secondary-text">Nome</Label>
                    <Input
                      id="firstName"
                      className="bg-main-bg border-border text-main-text"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-secondary-text">Sobrenome</Label>
                    <Input
                      id="lastName"
                      className="bg-main-bg border-border text-main-text"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-secondary-text">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-main-bg border-border text-main-text"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-secondary-text">Endereço</Label>
                  <Input
                    id="address"
                    className="bg-main-bg border-border text-main-text"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-secondary-text">Cidade</Label>
                    <Input
                      id="city"
                      className="bg-main-bg border-border text-main-text"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-secondary-text">Estado</Label>
                    <Select>
                      <SelectTrigger className="bg-main-bg border-border text-main-text">
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
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleNextStep}
                  className="w-full bg-accent-purple hover:bg-accent-hover"
                >
                  Continuar para Pagamento
                </Button>
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
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber" className="text-secondary-text">Número do Cartão</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 1234 1234 1234"
                    className="bg-main-bg border-border text-main-text"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cardName" className="text-secondary-text">Nome no Cartão</Label>
                  <Input
                    id="cardName"
                    placeholder="JOÃO SILVA"
                    className="bg-main-bg border-border text-main-text"
                    required
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-secondary-text">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="bg-main-bg border-border text-main-text"
                      required
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
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="flex-1 border-border text-secondary-text hover:text-main-text"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleCompletePurchase}
                    className="flex-1 bg-accent-purple hover:bg-accent-hover"
                  >
                    Finalizar Compra
                  </Button>
                </div>
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
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-main-text font-medium">{item.name}</p>
                    <p className="text-secondary-text text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-accent-purple font-bold">
                    R$ {(item.price * item.quantity).toFixed(2)}
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
                  <span>Impostos:</span>
                  <span>R$ {tax.toFixed(2)}</span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between text-main-text font-bold text-lg">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}