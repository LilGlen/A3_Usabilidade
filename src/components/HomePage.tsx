import { useState, useEffect, useMemo } from "react";
import { PageType } from "../App";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAPI } from "./useAPI";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Loader2 } from "lucide-react";
import { Pagination } from "../components/Pagination";

// CONSTANTE DE PAGINAÇÃO
const ITEMS_PER_PAGE = 12;

interface HomePageProps {
  onNavigate: (page: PageType, data?: any) => void;
  searchTerm: string;
}

// Interface para o Jogo retornado pela API
interface Game {
  nome: string;
  preco: number;
  descricao: string;
  ano: number;
  categoria: string;
  empresa_nome: string;
  id?: number;
  desconto?: number | null; // Opcional, será assumido como 0
  fk_empresa?: number;
  fk_categoria?: number;
  image?: string;
}

interface GameCardProps {
  id: number;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  image: string;
  onNavigate: (page: PageType, data?: any) => void;
}

function GameCard({
  id,
  title,
  originalPrice,
  discountedPrice,
  discount,
  image,
  onNavigate,
}: GameCardProps) {
  return (
    <div
      className="bg-secondary-bg rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg relative"
      onClick={() => onNavigate("details", { gameId: id })}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate("details", { gameId: id });
        }
      }}
      aria-label={`Ver detalhes de ${title}`}
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
        <div className="flex flex-col space-y-1">
          {discount > 0 && (
            <p className="text-secondary-text line-through text-xs">
              R$ {originalPrice.toFixed(2)}
            </p>
          )}
          <p className="text-main-text font-bold text-sm">
            R$ {discountedPrice.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HomePage({ onNavigate }: HomePageProps) {
  const api = useAPI();
  // Armazena a lista completa de jogos retornada pela API
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de paginação, focado apenas na página atual
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  // 1. FUNÇÃO DE CARREGAMENTO
  const loadAllGames = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.getGames({});
      let gameData: Game[] = [];
      if (Array.isArray(result)) {
        gameData = result;
      } else if (result && Array.isArray(result.data)) {
        gameData = result.data;
      } else if (result !== null) {
        console.warn(
          "Formato de resposta inesperado da API, tratando como lista vazia."
        );
      }

      const validGames = gameData.filter(
        (game) => game.nome && game.preco !== undefined && game.preco !== null
      );
      setAllGames(validGames);
      setPagination((prev) => ({
        ...prev,
        page: 1,
        total: validGames.length,
        totalPages: Math.ceil(validGames.length / prev.limit),
      }));

      if (validGames.length === 0) {
        setError("Nenhum jogo encontrado no catálogo.");
      }
    } catch (e) {
      console.error("Erro na API ao buscar jogos:", e);
      setError("Falha na conexão com o servidor. Tente novamente mais tarde.");
      setAllGames([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 0, page: 1 }));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. EFEITO PARA CARREGAMENTO INICIAL
  // Este useEffect carrega os jogos apenas uma vez
  useEffect(() => {
    loadAllGames();
  }, []);

  // 3. CÁLCULO DOS JOGOS DA PÁGINA ATUAL
  const currentGames = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;

    // Fatiamento para pegar os jogos da página atual
    return allGames.slice(startIndex, endIndex);
  }, [allGames, pagination.page, pagination.limit]); // Recalcula quando allGames ou a página mudam

  // Função para mudar a página
  const handlePageChange = (page: number) => {
    if (
      page >= 1 &&
      page <= pagination.totalPages &&
      page !== pagination.page
    ) {
      setPagination((prev) => ({ ...prev, page }));
      // Rola para o topo ao mudar a página, para melhor UX
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 4. PROCESSAMENTO DOS JOGOS
  const processedGames: GameCardProps[] = (currentGames || []).map(
    (game, index) => {
      const gameId =
        game.id ?? (pagination.page - 1) * pagination.limit + index + 1;
      const originalPrice = game.preco || 0;
      const discount = game.desconto || 0;
      const discountedPrice = originalPrice - originalPrice * (discount / 100);
      return {
        id: gameId,
        title: game.nome,
        originalPrice: originalPrice,
        discountedPrice: discount > 0 ? discountedPrice : originalPrice,
        discount: discount,
        image:
          game.image ||
          `https://placehold.co/300x200/9146FF/ffffff?text=${encodeURIComponent(
            game.nome
          )}`,
        onNavigate: onNavigate,
      };
    }
  );

  if (isLoading) {
    return (
      <div className="bg-main-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-purple animate-spin mx-auto mb-4" />
          <p className="text-secondary-text">Carregando catálogo completo...</p>
        </div>
      </div>
    );
  }

  // 5. CÁLCULO DO RODAPÉ
  const defaultImageUrl =
    "https://images.unsplash.com/photo-1732631486925-8f7e9924f993?w=1200&h=600&fit=crop";
  const startGameIndex = (pagination.page - 1) * pagination.limit + 1;
  const endGameIndex = startGameIndex + processedGames.length - 1;
  const totalResults = pagination.total;

  return (
    <div className="bg-main-bg min-h-screen">
      {/* Hero Banner */}
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
            <Button
              className="bg-accent-purple hover:bg-accent-hover text-white font-bold py-3 px-8 rounded-full transition duration-300"
              onClick={() => onNavigate("details")}
            >
              EXPLORAR JOGOS
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-12">
        {/* LISTAGEM PRINCIPAL DE JOGOS */}
        <section className="mb-12">
          <h2 className="text-main-text font-bold text-2xl mb-6 uppercase tracking-wide">
            JOGOS EM DESTAQUE
          </h2>
          {processedGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {processedGames.map((game) => (
                <GameCard key={game.id} {...game} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <p className="text-secondary-text">
              {error || "Nenhum jogo encontrado no catálogo."}
            </p>
          )}
        </section>

        {/* PAGINAÇÃO */}
        {totalResults > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 pt-4 space-y-4 md:space-y-0">
            <p className="text-secondary-text text-sm">
              Mostrando {startGameIndex} a {endGameIndex} de {totalResults}{" "}
              resultados
            </p>
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                total={totalResults}
                limit={pagination.limit}
                onPageChange={handlePageChange}
                className="w-full md:w-auto"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
