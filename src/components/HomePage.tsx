import { useState, useEffect, useMemo, useCallback } from "react";
import { PageType } from "../App";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAPI } from "./useAPI";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Loader2 } from "lucide-react";
import { Pagination } from "../components/Pagination";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastProvider";

// CONSTANTE DE PAGINAÇÃO
const ITEMS_PER_PAGE = 12;

interface HomePageProps {
  onNavigate: (page: PageType, data?: any) => void;
  searchTerm: string;
}

// Game vindo da API pública (SEM ID)
interface GamePublic {
  nome: string;
  preco: number;
  descricao: string;
  ano: number;
  categoria: string;
  empresa_nome: string;
  image?: string;
}

// Game privado (COM ID)
interface GamePrivate {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ano: number;
  fk_empresa: number;
  fk_categoria: number;
  desconto?: number;
  image?: string;
}

interface GameCardProps {
  title: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  image: string;
  onClick: () => void;
  onAddToCart: () => Promise<void>;
}

// ---------- COMPONENTE CARD ----------
function GameCard({
  title,
  originalPrice,
  discountedPrice,
  discount,
  image,
  onClick,
  onAddToCart,
}: GameCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    await onAddToCart();
    setIsAdding(false);
  };

  return (
    <div
      className="bg-secondary-bg rounded-lg overflow-hidden cursor-pointer 
      transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg relative"
      onClick={onClick}
      role="button"
    >
      {discount > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-accent-purple text-white font-bold px-2 py-1 text-xs">
            {discount}%
          </Badge>
        </div>
      )}

      <div className="w-full h-32 sm:h-40">
        <ImageWithFallback
          gameName={title}
          alt={`Capa do ${title}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-3">
        <h3 className="text-main-text font-medium text-sm mb-2 truncate">
          {title}
        </h3>

        <div className="flex flex-col space-y-1 mb-4">
          {discount > 0 && (
            <p className="text-secondary-text line-through text-xs">
              R$ {originalPrice.toFixed(2)}
            </p>
          )}
          <p className="text-main-text font-bold text-sm">
            R$ {discountedPrice.toFixed(2)}
          </p>
        </div>

        <Button
          className="w-full bg-accent-purple hover:bg-accent-hover text-white py-2"
          onClick={handleAdd}
          disabled={isAdding}
        >
          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Adicionar ao Carrinho"
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------- HOME PAGE ----------
export function HomePage({ onNavigate, searchTerm }: HomePageProps) {
  const api = useAPI();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [gamesPublic, setGamesPublic] = useState<GamePublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });

  // ---------- BUSCA DE JOGOS PÚBLICOS ----------
  useEffect(() => {
    const loadPublicGames = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await api.getGames({});
        const list: GamePublic[] = Array.isArray(result)
          ? result
          : result?.data ?? [];

        const filtered = list.filter(
          (game) =>
            game.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.descricao.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setGamesPublic(filtered);
        setPagination((prev) => ({
          ...prev,
          page: 1,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / prev.limit),
        }));

        if (filtered.length === 0) {
          setError("Nenhum jogo encontrado.");
        }
      } catch {
        setError("Falha ao conectar ao servidor.");
        setGamesPublic([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicGames();
  }, [searchTerm]);

  // ---------- PAGINAÇÃO ----------
  const currentGames = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return gamesPublic.slice(start, end);
  }, [gamesPublic, pagination]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ---------- OBTÉM O JOGO PRIVADO ----------
  const findPrivateGameByName = async (
    nome: string
  ): Promise<GamePrivate | null> => {
    const result = await api.getAllGames();
    const list = result?.games || result;

    return Array.isArray(list)
      ? list.find((g) => g.nome.trim() === nome.trim()) ?? null
      : null;
  };

  // ---------- CLIQUE NO CARD ----------
  const handleCardClick = useCallback(
    async (game: GamePublic) => {
      if (!isAuthenticated) {
        showToast({
          type: "info",
          title: "Login necessário",
          message: "Você precisa estar logado para visualizar detalhes.",
        });
        return;
      }

      const found = await findPrivateGameByName(game.nome);
      if (!found) {
        showToast({
          type: "error",
          title: "Erro ao carregar detalhes",
        });
        return;
      }

      onNavigate("details", { gameId: found.id });
    },
    [isAuthenticated]
  );

  // ---------- ADICIONAR AO CARRINHO ----------
  const handleAddToCart = useCallback(
    async (game: GamePublic) => {
      if (!isAuthenticated) {
        showToast({
          type: "error",
          title: "Login necessário",
          message: "Faça login para adicionar itens ao carrinho.",
        });
        return;
      }

      const found = await findPrivateGameByName(game.nome);
      if (!found) {
        showToast({
          type: "error",
          title: "Erro ao identificar jogo",
        });
        return;
      }

      const result = await addToCart(found.id);

      if (result === true) {
        showToast({ type: "success", title: "Adicionado ao carrinho!" });
      } else if (result === "already-in-cart") {
        showToast({
          type: "error",
          title: "Jogo já está no carrinho.",
        });
      } else if (typeof result === "string") {
        showToast({
          type: "error",
          title: result,
        });
      } else {
        showToast({
          type: "error",
          title: "Erro ao adicionar ao carrinho.",
        });
      }
    },
    [isAuthenticated]
  );

  // ---------- PREPARA OS GAMES ----------
  const processedGames = currentGames.map((game) => ({
    title: game.nome,
    originalPrice: game.preco,
    discountedPrice: game.preco,
    discount: 0,
    image: game.image || "",
    onClick: () => handleCardClick(game),
    onAddToCart: () => handleAddToCart(game),
  }));

  // ---------- UI ----------
  if (isLoading) {
    return (
      <div className="bg-main-bg min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-purple animate-spin" />
      </div>
    );
  }

  const defaultImageUrl =
    "https://images.unsplash.com/photo-1732631486925-8f7e9924f993?w=1200&h=600&fit=crop";

  return (
    <div className="bg-main-bg min-h-screen">
      {/* HERO */}
      <section className="container mx-auto px-6 py-8">
        <div
          className="relative rounded-2xl overflow-hidden h-[300px] md:h-[400px] flex items-center justify-start"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('${defaultImageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          <div className="relative z-10 px-8 py-6 max-w-md">
            <h1 className="text-white font-bold text-3xl md:text-4xl mb-3 leading-tight">
              A Sua Nova Biblioteca Digital
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              Descubra os melhores jogos, de clássicos a lançamentos.
            </p>
          </div>
        </div>
      </section>

      {/* JOGOS */}
      <div className="container mx-auto px-6 pb-12">
        <section className="mb-12">
          <h2 className="text-main-text font-bold text-2xl mb-6">
            JOGOS EM DESTAQUE
          </h2>

          {processedGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {processedGames.map((g, idx) => (
                <GameCard key={idx} {...g} />
              ))}
            </div>
          ) : (
            <p className="text-secondary-text">{error}</p>
          )}
        </section>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
