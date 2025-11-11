import { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, Loader2, ArrowLeft, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { PageType } from '../App';
import { useAPI } from './useAPI';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { Avatar } from './Avatar';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GameDetailsPageProps {
  gameId?: string;
  onNavigate: (page: PageType, data?: any) => void;
}

export function GameDetailsPageNew({ gameId, onNavigate }: GameDetailsPageProps) {
  const [game, setGame] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeMedia, setActiveMedia] = useState(0);
  
  const api = useAPI();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (gameId) {
      loadGameDetails();
    }
  }, [gameId]);

  const loadGameDetails = async () => {
    setIsLoading(true);
    try {
      const [gameResult, reviewsResult] = await Promise.all([
        api.getGame(gameId || ''),
        api.getGameReviews(gameId || '')
      ]);

      if (gameResult?.success) {
        setGame(gameResult.game);
      }
      if (reviewsResult?.success) {
        setReviews(reviewsResult.reviews || []);
      }
    } catch (error) {
      console.error('Error loading game details:', error);
      toast.error('Erro ao carregar detalhes do jogo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para adicionar ao carrinho');
      return;
    }

    if (!gameId) return;

    const result = await addToCart(gameId);
    if (result === true) {
      toast.success(`${game?.name || 'Jogo'} adicionado ao carrinho!`);
    } else if (result === 'already-in-cart') {
      toast.info(`${game?.name || 'Jogo'} já está no carrinho!`);
    } else {
      toast.error('Erro ao adicionar ao carrinho. Tente novamente.');
    }
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Faça login para adicionar à lista de desejos');
      return;
    }
    toast.info(`${game?.name || 'Jogo'} adicionado à lista de desejos!`);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Faça login para avaliar jogos');
      return;
    }

    if (userRating === 0) {
      toast.error('Selecione uma nota de 1 a 5 estrelas');
      return;
    }

    setSubmittingReview(true);
    try {
      const result = await api.createReview({
        gameId: gameId || '',
        rating: userRating,
        comment: userComment,
        hasSpoilers: hasSpoilers
      });

      if (result?.success) {
        toast.success('Avaliação enviada com sucesso!');
        setUserRating(0);
        setUserComment('');
        setHasSpoilers(false);
        await loadGameDetails();
      } else {
        toast.error('Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-purple animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <Card className="bg-secondary-bg border-border p-8 text-center">
          <p className="text-main-text mb-4">Jogo não encontrado</p>
          <Button onClick={() => onNavigate('home')} className="bg-accent-purple hover:bg-accent-hover">
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  // Use game image or fallback
  const gameImage = game.image || 'https://images.unsplash.com/photo-1625314887424-9f190599bd56?w=800&h=600&fit=crop';
  
  // Mock media items - in a real app, these would come from the game data
  const mediaItems = [
    gameImage,
    'https://images.unsplash.com/photo-1708577269890-12a58e153589?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1705594975210-02cbcc7af5ad?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1723360480597-d21deccaf3d0?w=800&h=600&fit=crop'
  ];

  return (
    <div className="bg-main-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <Button 
          onClick={() => onNavigate('home')}
          variant="outline"
          className="mb-6 border-border text-secondary-text hover:text-main-text"
          aria-label="Voltar para página inicial"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12">
          {/* Left Column: Media */}
          <div className="lg:col-span-3">
            <div className="bg-secondary-bg rounded-xl overflow-hidden mb-4">
              <ImageWithFallback
                src={mediaItems[activeMedia]}
                alt={`${game.name} - Imagem ${activeMedia + 1}`}
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {mediaItems.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setActiveMedia(index)}
                  className={`cursor-pointer rounded-lg border-2 transition focus:outline-none focus:ring-2 focus:ring-accent-purple ${
                    activeMedia === index 
                      ? 'border-accent-purple' 
                      : 'border-transparent hover:border-accent-purple'
                  }`}
                  aria-label={`Ver imagem ${index + 1}`}
                >
                  <ImageWithFallback
                    src={media}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-16 sm:h-20 object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Info and Purchase */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-main-text mb-2">{game.name}</h1>
            <p className="text-secondary-text mb-4">
              Por <span className="text-main-text">{game.company}</span> | {game.category}
            </p>
            
            <div className="flex items-center mb-6" role="group" aria-label="Avaliação do jogo">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${i < Math.round(game.rating) ? 'fill-current' : 'text-gray-600'}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="ml-2 text-secondary-text">
                {game.rating?.toFixed(1) || '0.0'} ({reviews.length} avaliações)
              </span>
            </div>
            
            <div className="bg-secondary-bg p-4 sm:p-6 rounded-xl">
              <p className="text-3xl sm:text-4xl text-main-text mb-6">
                R$ {game.price?.toFixed(2)}
              </p>
              <Button 
                className="w-full bg-accent-purple hover:bg-accent-hover text-white py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 mb-4"
                onClick={handleAddToCart}
                aria-label={`Adicionar ${game.name} ao carrinho`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-secondary-text text-secondary-text hover:bg-secondary-bg hover:text-main-text py-3 px-8 rounded-lg transition duration-300"
                onClick={handleAddToWishlist}
                aria-label={`Adicionar ${game.name} à lista de desejos`}
              >
                <Heart className="w-5 h-5 mr-2" />
                Adicionar à Lista de Desejos
              </Button>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="lg:col-span-5 mt-8">
            <Tabs defaultValue="descricao" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-border">
                <TabsTrigger 
                  value="descricao"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-accent-purple data-[state=active]:text-main-text text-secondary-text"
                >
                  Descrição
                </TabsTrigger>
                <TabsTrigger 
                  value="requisitos"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-accent-purple data-[state=active]:text-main-text text-secondary-text"
                >
                  Requisitos
                </TabsTrigger>
                <TabsTrigger 
                  value="avaliacoes"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-accent-purple data-[state=active]:text-main-text text-secondary-text"
                >
                  Avaliações ({reviews.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="descricao" className="py-8">
                <p className="text-secondary-text leading-relaxed">
                  {game.description || 'Este jogo não possui descrição disponível.'}
                </p>
                {game.features && game.features.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-main-text mb-3">Características:</h3>
                    <ul className="list-disc list-inside text-secondary-text space-y-2">
                      {game.features.map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="requisitos" className="py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-main-text mb-4">Mínimos</h3>
                    <ul className="text-secondary-text space-y-2">
                      <li><strong>SO:</strong> Windows 10 64-bit</li>
                      <li><strong>Processador:</strong> Intel Core i5-4460 / AMD FX-8350</li>
                      <li><strong>Memória:</strong> 8 GB de RAM</li>
                      <li><strong>Placa de vídeo:</strong> NVIDIA GeForce GTX 760 / AMD Radeon R7 260x</li>
                      <li><strong>Armazenamento:</strong> 50 GB de espaço disponível</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-main-text mb-4">Recomendados</h3>
                    <ul className="text-secondary-text space-y-2">
                      <li><strong>SO:</strong> Windows 11 64-bit</li>
                      <li><strong>Processador:</strong> Intel Core i7-8700K / AMD Ryzen 5 3600</li>
                      <li><strong>Memória:</strong> 16 GB de RAM</li>
                      <li><strong>Placa de vídeo:</strong> NVIDIA GeForce GTX 1070 / AMD Radeon RX Vega 56</li>
                      <li><strong>Armazenamento:</strong> 50 GB de espaço disponível (SSD)</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="avaliacoes" className="py-8">
                {isAuthenticated && (
                  <>
                    <h3 className="text-main-text mb-4">Deixe sua avaliação</h3>
                    <form onSubmit={handleSubmitReview} className="bg-secondary-bg p-4 sm:p-6 rounded-xl mb-8">
                      <div className="mb-4">
                        <label className="block text-secondary-text mb-2">Sua nota:</label>
                        <div className="flex items-center space-x-1" role="radiogroup" aria-label="Nota do jogo">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="p-1 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-accent-purple rounded"
                              onClick={() => setUserRating(star)}
                              aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                              role="radio"
                              aria-checked={userRating === star}
                            >
                              <Star 
                                className={`w-6 h-6 cursor-pointer ${
                                  star <= userRating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea 
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        className="w-full bg-main-bg border border-border text-main-text rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-accent-purple" 
                        rows={4} 
                        placeholder="Escreva sua opinião..."
                        aria-label="Comentário sobre o jogo"
                      />
                      <div className="mb-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasSpoilers"
                          checked={hasSpoilers}
                          onChange={(e) => setHasSpoilers(e.target.checked)}
                          className="w-4 h-4 text-accent-purple bg-main-bg border-border rounded focus:ring-2 focus:ring-accent-purple"
                        />
                        <label htmlFor="hasSpoilers" className="text-sm text-secondary-text cursor-pointer">
                          ⚠️ Este comentário contém spoilers
                        </label>
                      </div>
                      <Button 
                        type="submit" 
                        className="bg-accent-purple hover:bg-accent-hover text-white py-2 px-6 rounded-lg transition"
                        disabled={submittingReview}
                        aria-label="Enviar avaliação"
                      >
                        {submittingReview ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Avaliação
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}
                
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-secondary-text text-center py-8">
                      Nenhuma avaliação ainda. Seja o primeiro a avaliar!
                    </p>
                  ) : (
                    reviews.map((review, index) => (
                      <div key={review.id || index} className="border-b border-border pb-4">
                        <div className="flex items-center mb-2">
                          <Avatar name={review.userName} size={40} className="mr-4" />
                          <div>
                            <p className="text-main-text">{review.userName}</p>
                            <div className="flex items-center">
                              <div className="flex text-yellow-400 mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`}
                                    aria-hidden="true"
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-secondary-text">
                                {new Date(review.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                        {review.hasSpoilers ? (
                          <details className="border border-yellow-500/30 bg-yellow-500/10 rounded-lg p-4 mt-2">
                            <summary className="cursor-pointer text-yellow-500 font-medium hover:text-yellow-400 transition">
                              ⚠️ Este comentário contém spoilers (clique para revelar)
                            </summary>
                            <p className="text-secondary-text mt-4">{review.comment}</p>
                          </details>
                        ) : (
                          <p className="text-secondary-text mt-2">{review.comment}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
