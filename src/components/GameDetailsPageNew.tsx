import React, { useEffect, useState } from "react";
import {
  Star,
  Heart,
  ShoppingCart,
  Loader2,
  ArrowLeft,
  Send,
  Calendar,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { PageType } from "../App";
import { useAPI } from "./useAPI";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { Avatar } from "./Avatar";
import { useToast } from "./ToastProvider";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface GameDetailsPageProps {
  gameId?: string;
  onNavigate: (page: PageType, data?: any) => void;
}

export function GameDetailsPageNew({
  gameId,
  onNavigate,
}: GameDetailsPageProps) {
  const [game, setGame] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeMedia, setActiveMedia] = useState(0);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const api = useAPI();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (!gameId) {
      setIsLoading(false);
      return;
    }
    loadGameDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const loadGameDetails = async () => {
    setIsLoading(true);
    try {
      // 1. Busca o jogo e as reviews
      const [gameResult, reviewsResponse] = await Promise.all([
        api.getGame(gameId || ""),
        api.getGameReviews(gameId || ""),
      ]);

      // 2. Busca o nome da empresa se tivermos o ID (fk_empresa)
      let empresaNome = "Desenvolvedora Desconhecida";
      if (gameResult && gameResult.fk_empresa) {
        try {
          const companyResult = await api.getCompany(gameResult.fk_empresa);
          if (companyResult && (companyResult.nome || companyResult.name)) {
            empresaNome = companyResult.nome || companyResult.name;
          }
        } catch (e) {
          console.warn("Não foi possível carregar o nome da empresa");
        }
      } else if (gameResult?.empresa) {
         empresaNome = gameResult.empresa;
      }

      const reviewsList = reviewsResponse?.avaliacoes || [];
      const freshRating = reviewsResponse?.media !== undefined ? reviewsResponse.media : (gameResult?.nota_media || 0);

      if (gameResult) {
        const mappedGame = {
          ...gameResult,
          id: gameResult.id,
          nome: gameResult.nome || gameResult.titulo || gameResult.name,
          descricao: gameResult.descricao || gameResult.description,
          preco: gameResult.preco || gameResult.price || 0,
          nota_media: freshRating,
          empresa: empresaNome, // Nome resolvido da empresa
          categoria: gameResult.categoria || gameResult.category || "Geral",
          imagem_url: gameResult.imagem_url || undefined,
        };
        setGame(mappedGame);
      } else {
        setGame(null);
      }

      if (Array.isArray(reviewsList)) {
        const mappedReviews = reviewsList.map((review: any) => ({
          id: review.id,
          usuario: review.usuario?.nome || review.nome_usuario || "Usuário",
          nota: review.nota || review.rating || 0,
          comentario: review.comentario || review.comment || "",
          hasSpoilers: review.spoilers || review.hasSpoilers || false,
          data: review.data_criacao || review.created_at || new Date().toISOString(),
        }));
        setReviews(mappedReviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Error loading game details:", err);
      showToast({ 
        type: "error", 
        title: "Erro", 
        message: "Erro ao carregar detalhes do jogo" 
      });
      setGame(null);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast({ 
        type: "info", 
        title: "Login necessário", 
        message: "Faça login para adicionar ao carrinho" 
      });
      return;
    }
    if (!game?.id) {
      showToast({ type: "error", title: "Erro", message: "ID do jogo inválido" });
      return;
    }

    const result = await addToCart(Number(game.id));
    
    if (result === true) {
      showToast({ 
        type: "success", 
        title: "Adicionado!", 
        message: `${game.nome} adicionado ao carrinho.` 
      });
    } else if (result === "already-in-cart") {
      showToast({ 
        type: "info", 
        title: "Atenção", 
        message: `${game.nome} já está no carrinho!` 
      });
    } else {
      showToast({ 
        type: "error", 
        title: "Erro", 
        message: "Não foi possível adicionar ao carrinho." 
      });
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      showToast({ 
        type: "info", 
        title: "Login necessário", 
        message: "Faça login para adicionar à lista de desejos" 
      });
      return;
    }
    if (!game?.id) {
      showToast({ type: "error", title: "Erro", message: "ID do jogo inválido" });
      return;
    }

    setIsAddingToWishlist(true);
    try {
      const result = await api.addToWishlist(Number(game.id));
      
      if (result?.item) {
        showToast({ 
          type: "success", 
          title: "Sucesso", 
          message: "Item adicionado a lista de desejo"
        });
      } else {
        showToast({ 
          type: "error", 
          title: "Erro", 
          message: "Não foi possível adicionar a lista de desejos"
        });
      }
    } catch (err: any) {
      console.error("Error adding to wishlist:", err);
      if (err?.status === 409) {
        showToast({ 
          type: "info", 
          title: "Atenção", 
          message: "Item já adicionado a lista de desejos"
        });
      } else {
        showToast({ 
          type: "error", 
          title: "Erro", 
          message: "Não foi possível adicionar a lista de desejos"
        });
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast({ 
        type: "info", 
        title: "Login necessário", 
        message: "Faça login para avaliar jogos" 
      });
      return;
    }
    if (!gameId) return;
    if (userRating === 0) {
      showToast({ 
        type: "warning", 
        title: "Avaliação", 
        message: "Selecione uma nota de 1 a 5 estrelas" 
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const result = await api.createReview({
        jogoId: Number(gameId),
        nota: userRating,
        comentario: userComment,
      });

      // Verifica sucesso baseado nas respostas possíveis do seu backend
      if (result?.review || result?.success || result?.message === "Avaliação criada com sucesso!") {
        showToast({ 
          type: "success", 
          title: "Sucesso!", 
          message: "Avaliação encaminhada com sucesso"
        });
        
        // Atualização Otimista: Adiciona a review na lista imediatamente
        const newReview = {
          id: Date.now(), // ID temporário
          usuario: user?.name || "Você",
          nota: userRating,
          comentario: userComment,
          hasSpoilers: hasSpoilers,
          data: new Date().toISOString()
        };
        
        setReviews(prev => [newReview, ...prev]);
        setUserRating(0);
        setUserComment("");
        setHasSpoilers(false);

      } else if (result?.message === "Você já avaliou este jogo." || (result as any)?.error === "Você já avaliou este jogo.") {
         showToast({ 
          type: "info", 
          title: "Atenção", 
          message: "Item já avaliado"
        });
      } else {
        // Fallback genérico de erro
        showToast({ 
          type: "error", 
          title: "Erro", 
          message: "Não foi possível avaliar este item" 
        });
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      if (err?.status === 400 && (err?.body?.message === "Você já avaliou este jogo." || err?.body?.error === "Você já avaliou este jogo.")) {
         showToast({ 
          type: "info", 
          title: "Atenção", 
          message: "Item já avaliado"
        });
      } else {
        showToast({ 
          type: "error", 
          title: "Erro", 
          message: "Não foi possível avaliar este item" 
        });
      }
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
          <p className="text-main-text mb-4">
            {!gameId ? "ID do jogo não encontrado." : "Jogo não encontrado."}
          </p>
          <Button
            onClick={() => onNavigate("home")}
            className="bg-accent-purple hover:bg-accent-hover"
          >
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  const mediaItems = [
    game.imagem_url, 
    "https://images.unsplash.com/photo-1708577269890-12a58e153589?w=800", 
    "https://images.unsplash.com/photo-1705594975210-02cbcc7af5ad?w=800", 
    "https://images.unsplash.com/photo-1723360480597-d21deccaf3d0?w=800", 
  ];

  const renderActiveMedia = () => {
    if (activeMedia === 0) {
      return (
        <ImageWithFallback
          src={game.imagem_url || undefined}
          gameName={game.nome}
          alt={`${game.nome} - Capa`}
          className="w-full h-64 sm:h-96 object-cover transition-all duration-300"
        />
      );
    } else {
      return (
        <img
          src={mediaItems[activeMedia]}
          alt={`Screenshot ${activeMedia}`}
          className="w-full h-64 sm:h-96 object-cover transition-all duration-300"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/800x600?text=Sem+Imagem";
          }}
        />
      );
    }
  };

  const formattedPrice = (game.preco || 0).toFixed(2).replace('.', ',');
  const formattedRating = (game.nota_media || 0).toFixed(1).replace('.', ',');

  return (
    <div className="bg-main-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <Button
          onClick={() => onNavigate("home")}
          variant="outline"
          className="mb-6 border-border text-secondary-text hover:text-main-text"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12">
          
          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-3">
            <div className="bg-secondary-bg rounded-xl overflow-hidden mb-4 border border-border">
              {renderActiveMedia()}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {mediaItems.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMedia(idx)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                    activeMedia === idx
                      ? "border-accent-purple opacity-100 scale-105"
                      : "border-transparent hover:border-accent-purple/50 opacity-70 hover:opacity-100"
                  }`}
                >
                  {idx === 0 ? (
                    <ImageWithFallback
                      src={game.imagem_url || undefined}
                      gameName={game.nome}
                      alt="Miniatura Capa"
                      className="w-full h-20 sm:h-24 object-cover"
                    />
                  ) : (
                    <img
                      src={m}
                      alt={`Miniatura ${idx}`}
                      className="w-full h-20 sm:h-24 object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-main-text mb-2 leading-tight">
              {game.nome}
            </h1>
            
            {/* SUBTÍTULO DA EMPRESA */}
            <div className="mb-6">
              <p className="text-xl text-secondary-text">
                <span className="font-bold text-accent-purple tracking-wide">
                  {game.empresa}
                </span>
                <span className="mx-2 opacity-50">•</span>
                <span className="text-base font-medium text-secondary-text/80">
                  {game.categoria}
                </span>
              </p>
            </div>

            <div className="flex items-center mb-8 bg-secondary-bg/50 p-3 rounded-lg w-fit border border-border/50">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(game.nota_media || 0)
                        ? "fill-current"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-3 text-main-text font-medium">
                {formattedRating} 
                <span className="text-secondary-text ml-1 text-sm font-normal">
                  ({reviews.length} avaliações)
                </span>
              </span>
            </div>

            <div className="bg-secondary-bg p-6 rounded-xl border border-border shadow-sm">
              <p className="text-4xl font-bold text-main-text mb-8">
                R$ {formattedPrice}
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full bg-accent-purple hover:bg-accent-hover text-white py-6 text-lg shadow-lg shadow-accent-purple/20 transition-all hover:scale-[1.02]"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-6 h-6 mr-2" /> 
                  Adicionar ao Carrinho
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-secondary-text/30 text-secondary-text hover:text-main-text hover:bg-secondary-bg hover:border-accent-purple/50 py-6 text-lg transition-colors"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                >
                  {isAddingToWishlist ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Heart className="w-5 h-5 mr-2" />
                  )}
                  Lista de Desejos
                </Button>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="lg:col-span-5 mt-12">
            <Tabs defaultValue="descricao" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-border p-0 h-auto gap-8 rounded-none">
                <TabsTrigger 
                  value="descricao" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent-purple data-[state=active]:bg-transparent data-[state=active]:text-accent-purple pb-4 text-lg px-0 transition-colors hover:text-main-text"
                >
                  Descrição
                </TabsTrigger>
                <TabsTrigger 
                  value="requisitos"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent-purple data-[state=active]:bg-transparent data-[state=active]:text-accent-purple pb-4 text-lg px-0 transition-colors hover:text-main-text"
                >
                  Requisitos
                </TabsTrigger>
                <TabsTrigger 
                  value="avaliacoes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent-purple data-[state=active]:bg-transparent data-[state=active]:text-accent-purple pb-4 text-lg px-0 transition-colors hover:text-main-text"
                >
                  Avaliações ({reviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="descricao" className="py-8 animate-in fade-in-50 duration-500">
                <div className="prose prose-invert max-w-none">
                  <p className="text-secondary-text leading-relaxed text-lg text-pretty">
                    {game.descricao || "Este jogo não possui descrição disponível."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="requisitos" className="py-8">
                <div className="bg-secondary-bg p-6 rounded-lg border border-border">
                  <h3 className="text-main-text font-bold mb-4 text-lg">Requisitos Mínimos</h3>
                  <ul className="space-y-2 text-secondary-text">
                    <li><span className="font-semibold text-main-text">Sistema:</span> Windows 10 64-bit</li>
                    <li><span className="font-semibold text-main-text">Processador:</span> Intel Core i5 ou equivalente</li>
                    <li><span className="font-semibold text-main-text">Memória:</span> 8 GB RAM</li>
                    <li><span className="font-semibold text-main-text">Gráficos:</span> NVIDIA GTX 1060 / AMD Radeon RX 580</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="avaliacoes" className="py-8">
                {isAuthenticated && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="bg-secondary-bg p-6 rounded-xl mb-8 border border-border shadow-sm"
                  >
                    <h3 className="text-main-text font-bold mb-6 text-xl">Escreva sua análise</h3>
                    <div className="mb-6">
                      <label className="text-secondary-text block mb-3 text-sm font-semibold">Sua avaliação</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setUserRating(s)}
                            className="transition-all duration-200 hover:scale-110 focus:outline-none"
                          >
                            <Star
                              className={`w-10 h-10 ${
                                s <= userRating
                                  ? "text-yellow-400 fill-current drop-shadow-lg"
                                  : "text-gray-500 hover:text-yellow-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <Textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Compartilhe sua experiência com este jogo..."
                        className="bg-main-bg border border-border text-main-text min-h-[120px] resize-none focus:ring-2 focus:ring-accent-purple/30 transition-all"
                        maxLength={500}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <label className="flex items-center gap-3 text-secondary-text cursor-pointer hover:text-main-text transition-colors select-none">
                        <input
                          type="checkbox"
                          checked={hasSpoilers}
                          onChange={(e) => setHasSpoilers(e.target.checked)}
                          className="w-5 h-5 rounded border-border bg-main-bg text-accent-purple focus:ring-accent-purple"
                        />
                        <span>Contém spoilers</span>
                      </label>

                      <Button
                        type="submit"
                        className="bg-accent-purple hover:bg-accent-hover px-8 py-3 text-base font-semibold min-w-[140px] shadow-lg shadow-accent-purple/20"
                        disabled={submittingReview || userRating === 0}
                      >
                        {submittingReview ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Publicar
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <div className="text-center py-16 bg-secondary-bg/30 rounded-xl border-2 border-dashed border-border">
                    <p className="text-secondary-text text-lg">Nenhuma avaliação ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review, idx) => (
                      <div key={review.id || idx} className="bg-secondary-bg p-6 rounded-xl border border-border">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4 items-center">
                            <Avatar name={review.usuario || "Usuário"} size={48} />
                            <div>
                              <p className="text-main-text font-bold text-lg">{review.usuario}</p>
                              <div className="flex text-yellow-400 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < (review.nota || 0) ? "fill-current" : "text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-secondary-text" />
                            <span className="text-xs text-secondary-text">
                                {new Date(review.data).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {review.hasSpoilers ? (
                          <details className="group">
                            <summary className="cursor-pointer text-yellow-500 font-medium">⚠️ Alerta de Spoiler (Clique para ver)</summary>
                            <p className="mt-3 text-secondary-text">{review.comentario}</p>
                          </details>
                        ) : (
                          <p className="text-secondary-text">{review.comentario}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}