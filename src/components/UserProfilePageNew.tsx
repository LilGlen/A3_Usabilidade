import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PageType } from '../App';
import { User, ShoppingBag, Star, Menu, X, ArrowLeft, Loader2, Heart, Trash2, Eye, Key, Copy, Check, Receipt, AlertCircle, Gamepad2, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useAPI } from './useAPI';
import { Avatar } from './Avatar';
import { useToast } from './ToastProvider';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

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

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const api = useAPI();
  const { showToast } = useToast();

  if (!isAuthenticated || !user) {
    onNavigate('home');
    return null;
  }

  useEffect(() => {
    if (activeSection === 'orders') loadPurchases();
    else if (activeSection === 'reviews') loadReviews();
    else if (activeSection === 'wishlist') loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // --- LÓGICA DE CARREGAMENTO (MANTIDA) ---

  const loadPurchases = async () => {
    setIsLoading(true);
    try {
      const fetchFunction = api.getCartHistory || api.getPurchaseHistory;
      const result = await fetchFunction();
      
      let rawCarts: any[] = [];
      if (result?.carrinhosComItens) rawCarts = (result as any).carrinhosComItens;
      else if (Array.isArray(result)) rawCarts = result;
      else if (result && (result as any).vendas) rawCarts = (result as any).vendas;

      const history = rawCarts
        .filter(cart => cart.status !== 'ativo' && cart.status !== 'aberto') 
        .map(cart => {
            const itensSeguros = Array.isArray(cart.itens) ? cart.itens : [];
            
            const itensComChave = itensSeguros.map((item: any) => ({
                ...item,
                chave: item.chave_ativacao || item.chave || null, 
                fkJogo: item.fkJogo || item.fk_jogo
            }));

            const totalCalculado = itensComChave.reduce((acc: number, item: any) => acc + Number(item.preco || 0), 0);

            return {
                id: cart.id,
                data: cart.data_criacao || cart.data || cart.createdAt || new Date().toISOString(),
                valorTotal: Number(cart.valor_total || cart.valorTotal || totalCalculado || 0),
                itens: itensComChave,
                status: 'Concluído'
            };
        });

      const historySorted = history.reverse();
      setPurchases(historySorted);

      if (historySorted.length > 0) {
          enrichPurchasesWithGameData(historySorted);
      }

    } catch (error) {
      console.error('Erro ao carregar compras:', error);
      setPurchases([]); 
    } finally {
      setIsLoading(false);
    }
  };

  const enrichPurchasesWithGameData = async (carts: any[]) => {
      const enrichedCarts = await Promise.all(carts.map(async (cart) => {
          if (!cart.itens || cart.itens.length === 0) return cart;
          
          const enrichedItems = await Promise.all(cart.itens.map(async (item: any) => {
              if (item.nome || item.gameName) return item;
              try {
                  const gameId = item.fkJogo;
                  if (!gameId) return item;
                  const game = await api.getGame(gameId);
                  return {
                      ...item,
                      nome: game?.nome || "Jogo",
                      imagem: game?.imagem_url || game?.image,
                      preco: Number(game?.preco || 0)
                  };
              } catch (e) {
                  return item;
              }
          }));
          
          const realTotal = enrichedItems.reduce((acc, i) => acc + Number(i.preco || 0), 0);
          return { ...cart, itens: enrichedItems, valorTotal: cart.valorTotal || realTotal };
      }));
      setPurchases(enrichedCarts);
  };

  const loadWishlist = async () => {
    setIsLoading(true);
    try {
      const result = await api.getWishlist();
      let list: any[] = [];
      if (Array.isArray(result)) list = result;
      else if (result?.data) list = result.data;

      const wishlistMapped = list.map((item) => ({
        id: item.id,
        name: item.nome || item.name,
        price: Number(item.preco || item.price || 0),
        discount: Number(item.desconto || item.discount || 0),
        image: item.imagem_url || item.image
      }));
      setWishlist(wishlistMapped);
    } catch (error) { setWishlist([]); } finally { setIsLoading(false); }
  };

  const removeFromWishlist = async (gameId: number, gameName: string) => {
    try {
      await api.removeFromWishlist(gameId);
      showToast({ type: 'success', title: 'Removido', message: 'Item removido.' });
      loadWishlist();
    } catch (error) { console.error(error); }
  }

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const result = await api.getUserReviews();
      const data = Array.isArray(result) ? result : (result?.data || []);
      
      if (data.length > 0) {
        const enriched = await Promise.all(data.map(async (r: any) => {
            try {
                let name = r.gameName || r.nomeJogo;
                if (!name) {
                    const g = await api.getGame(r.fkJogo);
                    name = g?.nome;
                }
                return { ...r, gameName: name || "Jogo" };
            } catch { return { ...r, gameName: "Jogo" }; }
        }));
        setReviews(enriched);
      } else {
        setReviews([]);
      }
    } catch (error) { setReviews([]); } finally { setIsLoading(false); }
  };

  const copyToClipboard = (text: string) => {
    if(!text) {
        showToast({ type: 'error', title: 'Erro', message: 'Chave não disponível para cópia.' });
        return;
    }
    navigator.clipboard.writeText(text);
    showToast({ type: 'success', title: 'Copiado!', message: 'Chave copiada.' });
  };

  const openOrderDetails = (order: any) => {
    const safeOrder = {
        ...order,
        itens: Array.isArray(order.itens) ? order.itens : [] 
    };
    setSelectedOrder(safeOrder);
    setIsDetailsOpen(true);
  };

  const menuItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'reviews', label: 'Avaliações', icon: Star },
    { id: 'wishlist', label: 'Lista de Desejos', icon: Heart }
  ];

  // --- RENDERIZADORES ---

  const renderProfileContent = () => (
    <Card className="bg-secondary-bg border-border animate-in fade-in shadow-md">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-main-text text-xl flex items-center gap-2"><User className="w-5 h-5 text-accent-purple"/> Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 pt-6">
            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-secondary-text font-semibold">Nome</Label>
                <div className="bg-main-bg p-3 rounded-md border border-border text-main-text">{user.name}</div>
            </div>
            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-secondary-text font-semibold">Email</Label>
                <div className="bg-main-bg p-3 rounded-md border border-border text-main-text">{user.email}</div>
            </div>
            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-secondary-text font-semibold">Membro Desde</Label>
                <div className="bg-main-bg p-3 rounded-md border border-border text-main-text flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent-purple" />
                    {new Date(user.joinDate).toLocaleDateString('pt-BR')}
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-secondary-text font-semibold">Tipo de Conta</Label>
                <div className="bg-main-bg p-3 rounded-md border border-border text-main-text flex items-center gap-2">
                    <Badge variant="outline" className={user.role === 'admin' ? 'text-accent-purple border-accent-purple' : 'text-secondary-text border-secondary-text'}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </Badge>
                </div>
            </div>
        </CardContent>
    </Card>
  );

  const renderOrdersContent = () => (
    <div className="space-y-4 animate-in fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-main-text">Meus Pedidos</h2>
            <span className="text-sm text-secondary-text">{purchases.length} pedido(s)</span>
        </div>
        
        {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="w-10 h-10 text-accent-purple animate-spin mx-auto"/></div>
        ) : purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-secondary-bg border border-border border-dashed rounded-xl">
                <ShoppingBag className="w-16 h-16 text-secondary-text/50 mb-4"/>
                <p className="text-lg text-secondary-text mb-4 font-medium">Você ainda não realizou compras.</p>
                <Button onClick={() => onNavigate('home')} className="bg-accent-purple hover:bg-accent-hover">Ir para a Loja</Button>
            </div>
        ) : (
            purchases.map((order, i) => (
                <Card key={order.id || i} className="bg-secondary-bg border-border hover:border-accent-purple/40 transition-all duration-300 group overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-accent-purple/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center gap-4"> {/* Container para alinhar texto e botão */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg font-bold text-main-text flex items-center gap-2">
                                        <Receipt className="w-4 h-4 text-accent-purple" /> 
                                        Pedido #{order.id}
                                    </span>
                                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20">
                                        <Check className="w-3 h-3 mr-1"/> Concluído
                                    </Badge>
                                </div>
                                <div className="text-sm text-secondary-text flex items-center gap-4">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(order.data).toLocaleDateString('pt-BR')}</span>
                                    <span className="flex items-center gap-1"><CreditCard className="w-3 h-3"/> Total: <span className="text-main-text font-bold">R$ {Number(order.valorTotal).toFixed(2).replace('.', ',')}</span></span>
                                </div>
                            </div>
                            {/* BOTÃO AGORA ALINHADO À DIREITA (Flex-shrink-0) */}
                            <Button onClick={() => openOrderDetails(order)} className="flex-shrink-0 bg-main-bg border border-border hover:bg-accent-purple hover:text-white hover:border-accent-purple transition-all shadow-md group-hover:shadow-accent-purple/20">
                                <Eye className="w-4 h-4 mr-2"/> Ver Detalhes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))
        )}
    </div>
  );

  const renderWishlistContent = () => (
      <div className="space-y-6 animate-in fade-in">
        <h2 className="text-2xl font-bold text-main-text mb-4">Lista de Desejos</h2>
        {isLoading ? <Loader2 className="w-8 h-8 text-accent-purple animate-spin mx-auto py-12"/> :
         wishlist.length === 0 ? <div className="py-20 text-center bg-secondary-bg/50 rounded-xl border border-dashed border-border"><Heart className="w-16 h-16 text-secondary-text/50 mx-auto mb-4"/><p className="text-secondary-text">Sua lista está vazia.</p></div> :
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
                <Card 
                    key={item.id} 
                    className="bg-secondary-bg border-border overflow-hidden group hover:border-accent-purple transition-all shadow-inner shadow-white/10" /* Borda translúcida e shadow */
                >
                    <div className="relative aspect-video overflow-hidden bg-black/40">
                        <ImageWithFallback gameName={item.name} src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                        {/* ICONE LIXEIRA SUPERIOR REMOVIDO */}
                    </div>
                    <CardContent className="p-4">
                        <h3 className="font-bold text-main-text truncate text-lg mb-1">{item.name}</h3>
                        <div className="flex flex-col mt-3 mb-4">
                            <div>
                                {item.discount > 0 && <span className="text-xs text-secondary-text line-through block">R$ {item.price.toFixed(2)}</span>}
                                <span className="text-accent-purple font-bold text-xl">R$ {(item.price * (1 - item.discount/100)).toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>

                        {/* BLOCO DE AÇÃO: BOTÃO + LIXEIRA ALINHADOS abaixo */}
                        <div className="flex justify-between items-center gap-2">
                            <Button className="flex-1 bg-accent-purple hover:bg-accent-hover" onClick={() => onNavigate('details', { gameId: item.id })}>
                                Ver Detalhes
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-secondary-text hover:text-red-500 hover:bg-red-500/10 h-10 w-10 transition-colors flex-shrink-0"
                                onClick={() => removeFromWishlist(item.id, item.name)}
                                title="Remover da lista"
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
         </div>
        }
      </div>
  );

  const renderReviewsContent = () => (
      <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-main-text mb-4">Minhas Avaliações</h2>
          {isLoading ? <Loader2 className="w-8 h-8 text-accent-purple animate-spin mx-auto py-12"/> :
           reviews.length === 0 ? <div className="py-20 text-center bg-secondary-bg/50 rounded-xl border border-dashed border-border"><Star className="w-16 h-16 text-secondary-text/50 mx-auto mb-4"/><p className="text-secondary-text">Nenhuma avaliação feita.</p></div> :
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {reviews.map((r, i) => (
                   <Card key={i} className="bg-secondary-bg border-border flex flex-col overflow-hidden group hover:border-accent-purple/50 transition-all">
                       <div className="w-full h-32 bg-black/40 relative shrink-0 cursor-pointer overflow-hidden" onClick={() => onNavigate('details', { gameId: r.fkJogo })}>
                           <ImageWithFallback gameName={r.gameName} src={undefined} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                       </div>
                       <CardContent className="p-5 flex-1 flex flex-col"> {/* PADDING AUMENTADO PARA P-5 AQUI */}
                           <div className="flex justify-between items-start">
                               <h4 className="font-bold text-lg text-main-text line-clamp-1 cursor-pointer hover:text-accent-purple" onClick={() => onNavigate('details', { gameId: r.fkJogo })}>{r.gameName}</h4>
                               <span className="text-xs text-secondary-text bg-main-bg px-2 py-1 rounded border border-border">{new Date(r.data || Date.now()).toLocaleDateString()}</span>
                           </div>
                           <div className="flex text-yellow-400 my-2 text-sm">{[...Array(5)].map((_,x) => <Star key={x} className={`w-4 h-4 ${x < r.nota ? 'fill-current' : 'text-gray-600'}`}/>)}</div>
                           <div className="mt-auto bg-main-bg/50 p-3 rounded border border-border/30 relative">
                                <p className="text-sm text-secondary-text italic line-clamp-2 pl-2 border-l-2 border-accent-purple">"{r.comentario}"</p>
                           </div>
                       </CardContent>
                   </Card>
               ))}
           </div>
          }
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
    <div className="min-h-screen bg-main-bg text-main-text">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
             <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-4 md:mb-0 text-secondary-text hover:text-main-text hover:bg-main-bg border border-border"><ArrowLeft className="w-4 h-4 mr-2"/> Voltar</Button>
             <div className="relative group">
                <Avatar name={user.name} size={80} className="border-4 border-secondary-bg shadow-xl group-hover:border-accent-purple transition-colors duration-300"/>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-main-bg"></div>
             </div>
             <div className="text-center md:text-left">
                 <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                 <p className="text-secondary-text">{user.email}</p>
             </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            <div className="hidden lg:block w-64 shrink-0">
                <nav className="bg-secondary-bg border border-border rounded-xl p-3 sticky top-6 space-y-1 shadow-sm">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        return <Button key={item.id} variant={activeSection === item.id ? 'default' : 'ghost'} onClick={() => setActiveSection(item.id)} className={`w-full justify-start h-12 text-base ${activeSection === item.id ? 'bg-accent-purple text-white shadow-md shadow-accent-purple/20' : 'text-secondary-text hover:text-main-text hover:bg-main-bg'}`}><Icon className="w-5 h-5 mr-3"/> {item.label}</Button>
                    })}
                </nav>
            </div>
            <div className="lg:hidden">
                <Button variant="outline" className="w-full justify-between border-border text-main-text mb-6 h-12" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <span className="flex items-center"><Menu className="w-5 h-5 mr-2"/> Menu</span><span className="text-accent-purple font-semibold">{menuItems.find(i => i.id === activeSection)?.label}</span>
                </Button>
                {isMobileMenuOpen && <div className="bg-secondary-bg border border-border rounded-xl p-2 mb-6 space-y-1 animate-in slide-in-from-top-2">{menuItems.map(item => <Button key={item.id} variant="ghost" className="w-full justify-start text-main-text h-12" onClick={() => {setActiveSection(item.id); setIsMobileMenuOpen(false)}}>{item.label}</Button>)}</div>}
            </div>
            <main className="flex-1 min-w-0 pb-10">{renderContent()}</main>
        </div>
      </div>

      {/* --- POPUP PREMIUM --- */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-secondary-bg border-border text-main-text sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
            <div className="p-6 border-b border-border bg-main-bg/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                        <div className="bg-accent-purple/10 p-2 rounded-lg"><ShoppingBag className="w-6 h-6 text-accent-purple"/></div>
                        Detalhes do Pedido <span className="text-secondary-text">#{selectedOrder?.id}</span>
                    </DialogTitle>
                    <DialogDescription className="text-secondary-text text-base pt-1">
                        Chaves de ativação e itens.
                    </DialogDescription>
                </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {selectedOrder?.itens && selectedOrder.itens.length > 0 ? (
                    selectedOrder.itens.map((item: any, i: number) => (
                        <div key={i} className="bg-main-bg border border-border rounded-xl p-4 flex gap-4 items-center relative group"> {/* ITEM ROW */}
                            <div className="w-16 h-20 bg-black/30 rounded-lg overflow-hidden shrink-0 shadow-inner"> 
                                <ImageWithFallback src={item.imagem || item.image} gameName={item.nome || 'Jogo'} className="w-full h-full object-cover"/>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg text-main-text line-clamp-1">{item.nome || 'Jogo Digital'}</h4>
                                
                                <div className="mt-2 flex items-center gap-3 bg-black/20 rounded-md p-2">
                                    <div className="flex-1 min-w-0">
                                        <Label className="text-[10px] uppercase text-secondary-text font-bold tracking-widest flex items-center gap-1.5">
                                            <Key className="w-3 h-3 text-accent-purple"/> Chave de Ativação
                                        </Label>
                                        <code className="text-sm font-mono text-accent-purple tracking-wider select-all truncate block">
                                            {item.chave || item.chave_ativacao || 'KEY-INDISPONIVEL'}
                                        </code>
                                    </div>
                                    <Button 
                                        size="icon" 
                                        variant="secondary" 
                                        className="h-9 w-9 shrink-0 bg-accent-purple text-white hover:bg-accent-hover shadow-lg shadow-accent-purple/20" 
                                        onClick={() => copyToClipboard(item.chave || item.chave_ativacao)}
                                        disabled={!item.chave && !item.chave_ativacao}
                                    >
                                        <Copy className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl bg-main-bg/30">
                        <AlertCircle className="w-12 h-12 text-secondary-text/50 mb-3"/>
                        <p className="text-lg text-secondary-text font-medium">Nenhum item carregado.</p>
                        <p className="text-sm text-secondary-text mt-1">A lista de jogos está vazia, mas sua compra foi registrada.</p>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-border bg-main-bg/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-left">
                    <p className="text-xs text-secondary-text uppercase tracking-wider font-bold">Total Pago</p>
                    <p className="text-2xl font-bold text-main-text">R$ {Number(selectedOrder?.valorTotal || 0).toFixed(2).replace('.', ',')}</p>
                </div>
                <Button onClick={() => setIsDetailsOpen(false)} size="lg" className="w-full sm:w-auto bg-accent-purple hover:bg-accent-hover shadow-lg shadow-accent-purple/20">
                    Fechar Recibo
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}