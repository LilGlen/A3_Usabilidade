import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PageType } from '../App';
import { User, ShoppingBag, Star, Menu, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useAPI } from './useAPI';
import { Avatar } from './Avatar';
import { toast } from 'sonner@2.0.3';

interface UserProfilePageNewProps {
  onNavigate: (page: PageType) => void;
}

export function UserProfilePageNew({ onNavigate }: UserProfilePageNewProps) {
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  const { user, isAuthenticated, hasPermission } = useAuth();
  const api = useAPI();

  // Redirect to home if not authenticated
  if (!isAuthenticated || !user) {
    onNavigate('home');
    return null;
  }

  useEffect(() => {
    if (activeSection === 'orders') {
      loadPurchases();
    } else if (activeSection === 'reviews') {
      loadReviews();
    }
  }, [activeSection]);

  const loadPurchases = async () => {
    setIsLoading(true);
    try {
      const result = await api.getPurchaseHistory();
      if (result?.success) {
        setPurchases(result.purchases || []);
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast.error('Erro ao carregar histórico de compras');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      // In a real app, we'd have an endpoint to get user's reviews
      // For now, we'll just show a message
      setReviews([]);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'reviews', label: 'Minhas Avaliações', icon: Star }
  ];

  const renderProfileContent = () => (
    <div className="space-y-6">
      <Card className="bg-secondary-bg border-border">
        <CardHeader>
          <CardTitle className="text-main-text">Informações Pessoais</CardTitle>
          <CardDescription className="text-secondary-text">
            Suas informações de conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-secondary-text">Nome Completo</Label>
              <Input
                id="name"
                value={user.name}
                className="bg-main-bg border-border text-main-text"
                readOnly
                aria-label="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-secondary-text">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                className="bg-main-bg border-border text-main-text"
                readOnly
                aria-label="Email"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role" className="text-secondary-text">Tipo de Conta</Label>
              <Input
                id="role"
                value={user.role === 'admin' ? 'Administrador' : 'Usuário'}
                className="bg-main-bg border-border text-main-text"
                readOnly
                aria-label="Tipo de conta"
              />
            </div>
            <div>
              <Label htmlFor="joinDate" className="text-secondary-text">Membro desde</Label>
              <Input
                id="joinDate"
                value={new Date(user.joinDate).toLocaleDateString('pt-BR')}
                className="bg-main-bg border-border text-main-text"
                readOnly
                aria-label="Data de cadastro"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="space-y-6">
      <h2 className="text-main-text mb-4">Histórico de Compras</h2>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
        </div>
      ) : purchases.length === 0 ? (
        <Card className="bg-secondary-bg border-border">
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-secondary-text mx-auto mb-4" />
            <p className="text-secondary-text mb-4">Você ainda não fez nenhuma compra</p>
            <Button 
              onClick={() => onNavigate('home')}
              className="bg-accent-purple hover:bg-accent-hover"
            >
              Explorar Jogos
            </Button>
          </CardContent>
        </Card>
      ) : (
        purchases.map((order) => (
          <Card key={order.id} className="bg-secondary-bg border-border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-main-text">Pedido #{order.id}</p>
                  <p className="text-secondary-text text-sm">
                    {new Date(order.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={order.status === 'Concluída' ? 'text-success border-success' : 'text-yellow-500 border-yellow-500'}
                >
                  {order.status}
                </Badge>
              </div>
              <div className="mb-4">
                <p className="text-secondary-text text-sm mb-2">Jogos:</p>
                <div className="space-y-1">
                  {order.games?.map((game: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-main-bg p-2 rounded">
                      <span className="text-main-text text-sm">• {game.name}</span>
                      <span className="text-accent-purple text-sm">R$ {game.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-secondary-text">Total</span>
                <span className="text-accent-purple font-bold text-lg">R$ {order.total?.toFixed(2)}</span>
              </div>
              <div className="mt-2">
                <p className="text-secondary-text text-sm">
                  Método de pagamento: {order.paymentMethod || 'Cartão de Crédito'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderReviewsContent = () => (
    <div className="space-y-6">
      <h2 className="text-main-text mb-4">Minhas Avaliações</h2>
      <Card className="bg-secondary-bg border-border">
        <CardContent className="p-12 text-center">
          <Star className="w-12 h-12 text-secondary-text mx-auto mb-4" />
          <p className="text-secondary-text mb-4">
            Suas avaliações aparecerão aqui
          </p>
          <p className="text-secondary-text text-sm">
            Avalie os jogos que você comprou para ajudar outros jogadores
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileContent();
      case 'orders':
        return renderOrdersContent();
      case 'reviews':
        return renderReviewsContent();
      default:
        return renderProfileContent();
    }
  };

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <Button 
            onClick={() => onNavigate('home')}
            variant="outline"
            className="mb-4 border-border text-secondary-text hover:text-main-text"
            aria-label="Voltar para página inicial"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Avatar name={user.name} size={96} className="border-4 border-accent-purple" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl text-main-text mb-2">{user.name}</h1>
              <p className="text-sm sm:text-base text-secondary-text">{user.email}</p>
              <p className="text-xs sm:text-sm text-secondary-text">
                Membro desde {new Date(user.joinDate).toLocaleDateString('pt-BR')}
              </p>
              {user.role === 'admin' && (
                <Badge className="mt-2 bg-accent-purple text-white">
                  Administrador
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="outline"
              className="w-full justify-start border-border text-secondary-text hover:text-main-text mb-4"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
              {menuItems.find(item => item.id === activeSection)?.label || 'Menu'}
            </Button>
            
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="bg-secondary-bg rounded-lg border border-border p-4 mb-6">
                <div className="grid grid-cols-2 gap-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        variant={activeSection === item.id ? "default" : "ghost"}
                        className={`justify-start h-auto p-3 ${
                          activeSection === item.id 
                            ? 'bg-accent-purple hover:bg-accent-hover text-white' 
                            : 'text-secondary-text hover:text-main-text hover:bg-main-bg'
                        }`}
                        aria-label={item.label}
                        aria-current={activeSection === item.id ? 'page' : undefined}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        <span className="text-xs sm:text-sm">{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-secondary-bg rounded-lg border border-border p-6 sticky top-6">
              <nav className="space-y-2" aria-label="Menu de perfil">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className={`w-full justify-start h-auto p-3 ${
                        activeSection === item.id 
                          ? 'bg-accent-purple hover:bg-accent-hover text-white' 
                          : 'text-secondary-text hover:text-main-text hover:bg-main-bg'
                      }`}
                      aria-label={item.label}
                      aria-current={activeSection === item.id ? 'page' : undefined}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
