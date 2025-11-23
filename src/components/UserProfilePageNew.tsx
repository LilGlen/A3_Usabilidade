import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PageType } from '../App';
import { User, ShoppingBag, Star, Menu, X, ArrowLeft, Loader2, Heart, Trash2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useAPI } from './useAPI';
import { Avatar } from './Avatar';
import { useToast } from './ToastProvider';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UserProfilePageNewProps {
  onNavigate: (page: PageType, data?: any) => void;
}

export function UserProfilePageNew({ onNavigate }: UserProfilePageNewProps) {
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [purchases, setPurchases] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  
  const { user, isAuthenticated } = useAuth();
  const api = useAPI();
  const { showToast } = useToast();

  if (!isAuthenticated || !user) {
    onNavigate('home');
    return null;
  }

  useEffect(() => {
    if (activeSection === 'orders') {
      loadPurchases();
    } else if (activeSection === 'reviews') {
      loadReviews();
    } else if (activeSection === 'wishlist') {
      loadWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const loadPurchases = async () => {
    setIsLoading(true);
    try {
      const result = await api.getPurchaseHistory();
      if (Array.isArray(result)) {
        setPurchases(result);
      } else {
        setPurchases([]);
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
      showToast({ type: 'error', title: 'Erro', message: 'Erro ao carregar histórico.' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadWishlist = async () => {
    setIsLoading(true);
    try {
      const result = await api.getWishlist();
      if (Array.isArray(result)) {
        const wishlistMapped = result.map((item) => ({
          id: item.id,
          name: item.nome,
          price: item.preco || 0,
          discount: item.desconto || 0,
          // Não usamos item.image ou imagem_url aqui pois preferimos o fallback pelo NOME
        }));
        setWishlist(wishlistMapped);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      showToast({ type: 'error', title: 'Erro', message: 'Erro ao carregar lista de desejos.' });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (gameId: number, gameName: string) => {
    try {
      await api.removeFromWishlist(gameId);
      showToast({ 
        type: 'success', 
        title: 'Removido', 
        message: `${gameName} removido da lista de desejos.` 
      });
      loadWishlist();
    } catch (error) {
      console.error("Erro ao remover:", error);
      showToast({ type: 'error', title: 'Erro', message: 'Erro ao remover item.' });
    }
  }

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const userReviews = await api.getUserReviews();
      
      if (Array.isArray(userReviews) && userReviews.length > 0) {
        const reviewsWithGameDetails = await Promise.all(
          userReviews.map(async (review) => {
            try {
              const gameDetails = await api.getGame(review.fkJogo);
              return {
                ...review,
                gameName: gameDetails?.nome || gameDetails?.titulo || "Jogo Desconhecido",
              };
            } catch {
              return { ...review, gameName: "Jogo não encontrado" };
            }
          })
        );
        setReviews(reviewsWithGameDetails);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      showToast({ type: 'error', title: 'Erro', message: 'Erro ao carregar avaliações.' });
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'reviews', label: 'Minhas Avaliações', icon: Star },
    { id: 'wishlist', label: 'Lista de Desejos', icon: Heart }
  ];

  const renderProfileContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                className="bg-main-bg border-border text-main-text mt-1"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-secondary-text">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                className="bg-main-bg border-border text-main-text mt-1"
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role" className="text-secondary-text">Tipo de Conta</Label>
              <Input
                id="role"
                value={user.role === 'admin' ? 'Administrador' : 'Usuário'}
                className="bg-main-bg border-border text-main-text mt-1"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="joinDate" className="text-secondary-text">Membro desde</Label>
              <Input
                id="joinDate"
                value={new Date(user.joinDate).toLocaleDateString('pt-BR')}
                className="bg-main-bg border-border text-main-text mt-1"
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-main-text mb-4 text-2xl font-bold">Histórico de Compras</h2>
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
          <Card key={order.id} className="bg-secondary-bg border-border mb-4">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-main-text font-bold">Pedido #{order.id}</p>
                  <p className="text-secondary-text text-sm">
                    {new Date(order.data || Date.now()).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className="text-green-500 border-green-500"
                >
                  Concluída
                </Badge>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-secondary-text">Itens: {order.quantidade}</span>
                <span className="text-accent-purple font-bold text-lg">
                  Total: R$ {Number(order.valorTotal || order.valor_total || 0).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
  
  const renderWishlistContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-main-text mb-4 text-2xl font-bold">Lista de Desejos</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-12 bg-secondary-bg/50 rounded-xl border border-border border-dashed">
          <Heart className="w-12 h-12 text-secondary-text mx-auto mb-4 opacity-50" />
          <p className="text-secondary-text">Sua lista de desejos está vazia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id} className="bg-secondary-bg border-border hover:border-accent-purple transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="w-full h-32 overflow-hidden rounded-lg mb-4 relative group">
                  {/* CORREÇÃO: Puxa imagem igual à Home (via nome) */}
                  <ImageWithFallback
                    gameName={item.name}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full bg-red-500/80 hover:bg-red-600"
                      onClick={() => removeFromWishlist(item.id, item.name)}
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-main-text font-bold mb-2 truncate">{item.name}</h3>
                <div className="flex justify-between items-center">
                  <div>
                    {item.discount > 0 && (
                      <p className="text-secondary-text line-through text-xs">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                    <p className="text-accent-purple font-bold">
                      R$ {(item.price * (1 - item.discount / 100)).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  {item.discount > 0 && (
                    <Badge className="bg-green-600 text-white">
                      -{item.discount}%
                    </Badge>
                  )}
                </div>
                <Button 
                  className="w-full mt-4 bg-accent-purple hover:bg-accent-hover"
                  onClick={() => onNavigate('details', { gameId: item.id })}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderReviewsContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-main-text mb-4 text-2xl font-bold">Minhas Avaliações</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <Card className="bg-secondary-bg border-border">
          <CardContent className="p-12 text-center">
            <Star className="w-12 h-12 text-secondary-text mx-auto mb-4 opacity-50" />
            <p className="text-secondary-text mb-4">
              Você ainda não avaliou nenhum jogo.
            </p>
            <p className="text-secondary-text text-sm">
              Suas avaliações ajudam outros jogadores a decidirem o que jogar!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-secondary-bg p-6 rounded-xl border border-border flex flex-col sm:flex-row gap-6">
              {/* Capa do jogo na avaliação */}
              <div className="w-full sm:w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-black/20 border border-border/50">
                {/* CORREÇÃO: Puxa imagem igual à Home (via nome) */}
                <ImageWithFallback 
                  gameName={review.gameName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-main-text font-bold text-lg hover:text-accent-purple cursor-pointer" onClick={() => onNavigate('details', { gameId: review.fkJogo })}>
                    {review.gameName}
                  </h3>
                  <span className="text-xs text-secondary-text border border-border px-2 py-1 rounded">
                    {new Date(review.data || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (review.nota || 0)
                          ? "fill-current"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-secondary-text leading-relaxed italic">
                  "{review.comentario}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileContent();
      case 'orders': return renderOrdersContent();
      case 'wishlist': return renderWishlistContent();
      case 'reviews': return renderReviewsContent();
      default: return renderProfileContent();
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
            <Avatar name={user.name} size={96} className="border-4 border-accent-purple shadow-lg" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl text-main-text mb-2 font-bold">{user.name}</h1>
              <p className="text-sm sm:text-base text-secondary-text">{user.email}</p>
              <p className="text-xs sm:text-sm text-secondary-text mt-1">
                Membro desde {new Date(user.joinDate).toLocaleDateString('pt-BR')}
              </p>
              {user.role === 'admin' && (
                <Badge className="mt-3 bg-accent-purple text-white">
                  Administrador
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Mobile */}
          <div className="lg:hidden">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="outline"
              className="w-full justify-between border-border text-secondary-text hover:text-main-text mb-4"
            >
              <span className="flex items-center">
                {isMobileMenuOpen ? <X className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
                Menu
              </span>
              <span className="text-accent-purple font-medium">
                {menuItems.find(item => item.id === activeSection)?.label}
              </span>
            </Button>
            
            {isMobileMenuOpen && (
              <div className="bg-secondary-bg rounded-lg border border-border p-4 mb-6 shadow-lg animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 gap-2">
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
                        <Icon className="w-4 h-4 mr-3" />
                        <span className="text-sm">{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-secondary-bg rounded-lg border border-border p-4 sticky top-6 shadow-sm">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className={`w-full justify-start h-auto p-3 transition-all duration-200 ${
                        activeSection === item.id 
                          ? 'bg-accent-purple hover:bg-accent-hover text-white shadow-md' 
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

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}