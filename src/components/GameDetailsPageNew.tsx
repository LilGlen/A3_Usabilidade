// GameDetailsPageNew.tsx
import React, { useEffect, useState } from "react";
import {
  Star,
  Heart,
  ShoppingCart,
  Loader2,
  ArrowLeft,
  Send,
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
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface GameDetailsPageProps {
  gameId?: string;
  onNavigate: (page: PageType, data?: any) => void;
}

export function GameDetailsPageNew({
  gameId,
  onNavigate,
}: GameDetailsPageProps) {
  const [game, setGame] = useState<any | null>(null); // será preenchido com result.jogo
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeMedia, setActiveMedia] = useState(0);

  const api = useAPI();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (gameId) loadGameDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const loadGameDetails = async () => {
    setIsLoading(true);
    try {
      const [gameResult, reviewsResult] = await Promise.all([
        api.getGame(gameId || ""),
        api.getGameReviews(gameId || ""),
      ]);

      if (gameResult?.jogo) setGame(gameResult.jogo);
      else setGame(null);

      if (reviewsResult?.reviews) setReviews(reviewsResult.reviews);
      else setReviews([]);
    } catch (err) {
      console.error("Error loading game details:", err);
      toast.error("Erro ao carregar detalhes do jogo");
      setGame(null);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Faça login para adicionar ao carrinho");
      return;
    }
    if (!game?.id) {
      toast.error("ID do jogo inválido");
      return;
    }

    const result = await addToCart(Number(game.id));
    if (result === true) {
      toast.success(
        `${game.nome || game.name || "Jogo"} adicionado ao carrinho!`
      );
    } else if (result === "already-in-cart") {
      toast.info(`${game.nome || game.name || "Jogo"} já está no carrinho!`);
    } else {
      toast.error("Erro ao adicionar ao carrinho. Tente novamente.");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Faça login para avaliar jogos");
      return;
    }
    if (!gameId) {
      toast.error("ID do jogo inválido");
      return;
    }
    if (userRating === 0) {
      toast.error("Selecione uma nota de 1 a 5 estrelas");
      return;
    }

    setSubmittingReview(true);
    try {
      // Backend espera { jogoId, nota, comentario }
      const result = await api.createReview({
        jogoId: Number(gameId),
        nota: userRating,
        comentario: userComment,
      });

      if (result?.review) {
        toast.success("Avaliação enviada!");
        setUserRating(0);
        setUserComment("");
        setHasSpoilers(false);
        await loadGameDetails();
      } else {
        toast.error("Erro ao enviar avaliação");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Erro ao enviar avaliação");
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

  const gameImage =
    game.imagem_url ||
    game.image ||
    "https://images.unsplash.com/photo-1625314887424-9f190599bd56?w=800&h=600";

  const mediaItems = [
    gameImage,
    "https://images.unsplash.com/photo-1708577269890-12a58e153589?w=800",
    "https://images.unsplash.com/photo-1705594975210-02cbcc7af5ad?w=800",
    "https://images.unsplash.com/photo-1723360480597-d21deccaf3d0?w=800",
  ];

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
          <div className="lg:col-span-3">
            <div className="bg-secondary-bg rounded-xl overflow-hidden mb-4">
              <ImageWithFallback
                src={mediaItems[activeMedia]}
                alt={`${game.nome || game.name} - Imagem ${activeMedia + 1}`}
                gameName= {game.nome}
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {mediaItems.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMedia(idx)}
                  className={`cursor-pointer rounded-lg border-2 ${
                    activeMedia === idx
                      ? "border-accent-purple"
                      : "border-transparent hover:border-accent-purple"
                  }`}
                >
                  <ImageWithFallback
                    src={m}
                    alt={`Miniatura ${idx + 1}`}
                    gameName= {game.nome}
                    className="w-full h-16 sm:h-20 object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-main-text mb-2">
              {game.nome || game.name}
            </h1>
            <p className="text-secondary-text mb-4">
              Por{" "}
              <span className="text-main-text">
                {game.empresa || game.company}
              </span>{" "}
              | {game.categoria || game.category}
            </p>

            <div className="flex items-center mb-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(game.nota_media || game.rating || 0)
                        ? "fill-current"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-secondary-text">
                {(game.nota_media || game.rating)?.toFixed?.(1) || "0.0"} (
                {reviews.length} avaliações)
              </span>
            </div>

            <div className="bg-secondary-bg p-4 sm:p-6 rounded-xl">
              <p className="text-3xl text-main-text mb-6">
                R$ {(game.preco || game.price || 0).toFixed(2)}
              </p>

              <Button
                className="w-full bg-accent-purple hover:bg-accent-hover mb-4"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" /> Adicionar ao Carrinho
              </Button>

              <Button
                variant="outline"
                className="w-full border-secondary-text text-secondary-text"
                onClick={() =>
                  toast.info("Função de wishlist ainda não implementada aqui")
                }
              >
                <Heart className="w-5 h-5 mr-2" /> Adicionar à Lista de Desejos
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 mt-8">
            <Tabs defaultValue="descricao">
              <TabsList className="grid grid-cols-3 border-b border-border">
                <TabsTrigger value="descricao">Descrição</TabsTrigger>
                <TabsTrigger value="requisitos">Requisitos</TabsTrigger>
                <TabsTrigger value="avaliacoes">
                  Avaliações ({reviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="descricao" className="py-8">
                <p className="text-secondary-text leading-relaxed">
                  {game.descricao ||
                    game.description ||
                    "Este jogo não possui descrição disponível."}
                </p>
                {game.features && (
                  <ul className="list-disc list-inside mt-6 text-secondary-text">
                    {game.features.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="requisitos" className="py-8">
                <p className="text-secondary-text">Requisitos fixos mockados</p>
              </TabsContent>

              <TabsContent value="avaliacoes" className="py-8">
                {isAuthenticated && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="bg-secondary-bg p-6 rounded-xl mb-8"
                  >
                    <div className="mb-4">
                      <label className="text-secondary-text">Sua nota:</label>
                      <div className="flex mt-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setUserRating(s)}
                            className="p-1"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                s <= userRating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <Textarea
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Escreva sua avaliação..."
                      className="bg-main-bg border border-border text-main-text mb-4"
                    />

                    <label className="flex items-center gap-2 text-secondary-text">
                      <input
                        type="checkbox"
                        checked={hasSpoilers}
                        onChange={(e) => setHasSpoilers(e.target.checked)}
                      />
                      Contém spoilers
                    </label>

                    <Button
                      type="submit"
                      className="mt-4 bg-accent-purple hover:bg-accent-hover"
                      disabled={submittingReview}
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
                )}

                {reviews.length === 0 ? (
                  <p className="text-secondary-text text-center">
                    Nenhuma avaliação ainda.
                  </p>
                ) : (
                  reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-border py-4">
                      <div className="flex gap-3 items-center">
                        <Avatar
                          name={review.userName || review.usuario || "Usuário"}
                          size={40}
                        />
                        <div>
                          <p className="text-main-text">
                            {review.userName || review.usuario}
                          </p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < (review.rating ?? review.nota)
                                    ? "fill-current text-yellow-400"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {review.hasSpoilers ? (
                        <details className="bg-yellow-500/10 border border-yellow-500/30 p-4 mt-3 rounded">
                          <summary className="cursor-pointer">
                            ⚠️ Contém spoilers
                          </summary>
                          <p className="text-secondary-text mt-3">
                            {review.comment || review.comentario}
                          </p>
                        </details>
                      ) : (
                        <p className="text-secondary-text mt-3">
                          {review.comment || review.comentario}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
