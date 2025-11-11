import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { PageType } from '../App';
import { User, ShoppingBag, Heart, Settings, Star, Menu, X, ArrowLeft } from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';

interface UserProfilePageProps {
  onNavigate: (page: PageType) => void;
}

export function UserProfilePage({ onNavigate }: UserProfilePageProps) {
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, hasPermission } = useAuth();

  // Redirect to home if not authenticated
  if (!isAuthenticated || !user) {
    onNavigate('home');
    return null;
  }

  // Mock purchase history
  const purchaseHistory = [
    {
      id: '1',
      date: '2024-01-15',
      games: ['Cyberpunk 2077', 'The Witcher 3'],
      total: 249.98,
      status: 'Concluída'
    },
    {
      id: '2', 
      date: '2024-01-10',
      games: ['Neon Highway'],
      total: 49.99,
      status: 'Concluída'
    },
    {
      id: '3',
      date: '2024-01-05',
      games: ['Space Adventure', 'Racing Champion'],
      total: 159.98,
      status: 'Concluída'
    }
  ];

  // Mock wishlist
  const wishlist = [
    {
      id: '1',
      name: 'Starfield',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200&h=150&fit=crop',
      discount: 20
    },
    {
      id: '2',
      name: 'Elden Ring',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1562576649-daf535f7f4af?w=200&h=150&fit=crop',
      discount: 0
    }
  ];

  // Mock reviews
  const userReviews = [
    {
      id: '1',
      game: 'Cyberpunk 2077',
      rating: 4,
      review: 'Jogo incrível, mas teve alguns bugs no lançamento. Após as atualizações ficou muito melhor!',
      date: '2024-01-20'
    },
    {
      id: '2',
      game: 'The Witcher 3',
      rating: 5,
      review: 'Um dos melhores RPGs de todos os tempos. História fantástica e mundo vasto para explorar.',
      date: '2024-01-18'
    }
  ];

  const menuItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'wishlist', label: 'Lista de Desejos', icon: Heart },
    { id: 'reviews', label: 'Minhas Avaliações', icon: Star }
  ];

  const renderProfileContent = () => (
    <div className="space-y-6">
      <Card className="bg-secondary-bg border-border">
        <CardHeader>
          <CardTitle className="text-main-text">Informações Pessoais</CardTitle>
          <CardDescription className="text-secondary-text">
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-secondary-text">Nome Completo</Label>
              <Input
                id="name"
                defaultValue={user.name}
                className="bg-main-bg border-border text-main-text"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-secondary-text">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email}
                className="bg-main-bg border-border text-main-text"
              />
            </div>
          </div>
          <Button className="bg-accent-purple hover:bg-accent-hover">
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-secondary-bg border-border">
        <CardHeader>
          <CardTitle className="text-main-text">Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password" className="text-secondary-text">Senha Atual</Label>
            <Input
              id="current-password"
              type="password"
              className="bg-main-bg border-border text-main-text"
            />
          </div>
          <div>
            <Label htmlFor="new-password" className="text-secondary-text">Nova Senha</Label>
            <Input
              id="new-password"
              type="password"
              className="bg-main-bg border-border text-main-text"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password" className="text-secondary-text">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              className="bg-main-bg border-border text-main-text"
            />
          </div>
          <Button className="bg-accent-purple hover:bg-accent-hover">
            Alterar Senha
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="space-y-6">
      <h2 className="text-main-text mb-4">Histórico de Compras</h2>
      {purchaseHistory.map((order) => (
        <Card key={order.id} className="bg-secondary-bg border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-main-text font-bold">Pedido #{order.id}</p>
                <p className="text-secondary-text">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <Badge variant="outline" className="text-success border-success">
                {order.status}
              </Badge>
            </div>
            <div className="mb-4">
              <p className="text-secondary-text">Jogos:</p>
              <ul className="text-main-text">
                {order.games.map((game, index) => (
                  <li key={index}>• {game}</li>
                ))}
              </ul>
            </div>
            <p className="text-accent-purple font-bold">Total: R$ {order.total.toFixed(2)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderWishlistContent = () => (
    <div className="space-y-6">
      <h2 className="text-main-text mb-4">Lista de Desejos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <Card key={item.id} className="bg-secondary-bg border-border hover:border-accent-purple transition-colors">
            <CardContent className="p-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <h3 className="text-main-text font-bold mb-2">{item.name}</h3>
              <div className="flex justify-between items-center">
                <div>
                  {item.discount > 0 && (
                    <p className="text-secondary-text line-through">
                      R$ {item.price.toFixed(2)}
                    </p>
                  )}
                  <p className="text-accent-purple font-bold">
                    R$ {(item.price * (1 - item.discount / 100)).toFixed(2)}
                  </p>
                </div>
                {item.discount > 0 && (
                  <Badge className="bg-success text-white">
                    -{item.discount}%
                  </Badge>
                )}
              </div>
              <Button className="w-full mt-4 bg-accent-purple hover:bg-accent-hover">
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReviewsContent = () => (
    <div className="space-y-6">
      <h2 className="text-main-text mb-4">Minhas Avaliações</h2>
      {userReviews.map((review) => (
        <Card key={review.id} className="bg-secondary-bg border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-main-text font-bold">{review.game}</h3>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-secondary-text">
                    ({review.rating}/5)
                  </span>
                </div>
              </div>
              <p className="text-secondary-text text-sm">
                {new Date(review.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <p className="text-secondary-text">{review.review}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileContent();
      case 'orders':
        return renderOrdersContent();
      case 'wishlist':
        return renderWishlistContent();
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
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=9146FF&color=fff&size=120`}
              alt="Avatar do usuário"
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-accent-purple"
            />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl text-main-text mb-2">{user.name}</h1>
              <p className="text-sm sm:text-base text-secondary-text">{user.email}</p>
              <p className="text-xs sm:text-sm text-secondary-text">Membro desde {new Date(user.joinDate).toLocaleDateString('pt-BR')}</p>
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
              <nav className="space-y-2">
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