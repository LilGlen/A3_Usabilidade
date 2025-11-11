import { useState, useEffect } from "react";
import { PageType } from "../App";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAPI } from "./useAPI";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Loader2 } from "lucide-react";
import { Pagination } from "../components/Pagination";

interface HomePageProps {
  onNavigate: (page: PageType, data?: any) => void;
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
      className="bg-[#2A2A2A] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg relative"
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
          <Badge className="bg-purple-600 text-white font-bold px-2 py-1 text-xs">
            {discount}%
          </Badge>
        </div>
      )}

      <ImageWithFallback
        gameName={title}
        alt={`Capa do ${title}`}
        className="w-full h-32 sm:h-40 object-cover"
      />

      <div className="p-3">
        <h3 className="text-white font-medium text-sm mb-2 truncate">
          {title}
        </h3>
        <div className="flex flex-col space-y-1">
          {discount > 0 && (
            <p className="text-gray-400 line-through text-xs">
              R$ {originalPrice.toFixed(2)}
            </p>
          )}
          <p className="text-white font-bold text-sm">
            R$ {discountedPrice.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HomePage({ onNavigate }: HomePageProps) {
  const api = useAPI();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [error, setError] = useState<string | null>(null);

  // 1. Função de carregamento dos jogos
  const loadGames = async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const limit = pagination.limit;
      // Faz a requisição usando a 'page' solicitada
      const result = await api.getGames({ page, limit });

      if (result === null) {
        throw new Error("Falha na API ao buscar jogos.");
      }

      let gameData: Game[] = [];
      let apiPagination = null;

      // Trata a resposta
      if (Array.isArray(result)) {
        gameData = result; // API retorna array direto
      } else if (result && Array.isArray(result.data)) {
        gameData = result.data; // API retorna { data: [...] }
        apiPagination = result.pagination; // Tenta pegar metadados de paginação
      }

      const validGames = gameData.filter(
        (game) => game.nome && game.preco !== undefined && game.preco !== null
      );

      if (validGames.length > 0) {
        if (apiPagination && apiPagination.total !== undefined) {
          setGames(validGames);
          setPagination({
            page: apiPagination.page || page,
            limit: apiPagination.limit || limit,
            total: apiPagination.total,
            totalPages: apiPagination.totalPages || 1,
            hasNext: apiPagination.hasNext ?? false,
            hasPrevious: apiPagination.hasPrevious ?? false,
          });
        } else {
          const total =
            validGames.length > 0
              ? validGames.length + (page - 1) * limit + 1
              : 0; // Aproximação perigosa
          const totalPages = Math.ceil(total / limit) || 1;
          setGames(validGames);
          setPagination((prev) => ({
            ...prev,
            page: page,
            limit: limit,
            totalPages:
              prev.totalPages > 1
                ? prev.totalPages
                : validGames.length < limit
                ? page
                : page + 1,
            hasNext: validGames.length === limit,
            hasPrevious: page > 1,
            // total: prev.total // Manter o total anterior ou forçar 0
            total: prev.total > 0 ? prev.total : 999999, // Valor grande de fallback se API não dá o total
          }));
        }
      } else {
        // Sem jogos
        setError("Nenhum jogo encontrado na API.");
        setGames([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          totalPages: 0,
          page: 1,
        }));
      }
    } catch (e) {
      console.error("Erro na API ao buscar jogos:", e);
      setError("Falha na conexão com o servidor. Tente novamente mais tarde.");
      setGames([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 0, page: 1 }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 🏆 Dispara o carregamento quando a página atual (pagination.page) muda
    loadGames(pagination.page);
    // Rola para o topo ao mudar a página, para melhor UX
    if (pagination.page !== 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pagination.page, api, pagination.limit]);

  // Função para mudar a página
  const handlePageChange = (page: number) => {
    // Validação de segurança
    if (page >= 1 && page !== pagination.page) {
      // Muda a página dentro do objeto de paginação
      setPagination((prev) => ({ ...prev, page }));
    }
  };

  // 2. PROCESSAMENTO DOS JOGOS
  const processedGames: GameCardProps[] = (games || []).map((game, index) => {
    // A chave única é essencial. Se o ID for undefined, use a combinação de índice e página.
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
  });

  if (isLoading) {
    return (
      <div className="bg-[#1A1A1A] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando jogos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1A1A1A] min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-[#2A2A2A] rounded-lg shadow-xl">
          <p className="text-red-500 font-bold mb-4">Erro de Carregamento:</p>
          <p className="text-gray-300">{error}</p>
          <Button
            onClick={() => loadGames(pagination.page)}
            className="mt-6 bg-purple-600 hover:bg-purple-700"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] min-h-screen">
      {/* Hero Banner (Mantido para estética) */}
      <section className="container mx-auto px-6 py-8">
        <div
          className="relative rounded-2xl overflow-hidden h-[300px] md:h-[400px] flex items-center justify-start"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1732631486925-8f7e9924f993?w=1200&h=600&fit=crop')`,
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
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition duration-300"
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
          <h2 className="text-white font-bold text-2xl mb-6 uppercase tracking-wide">
            Todos os Jogos (
            {pagination.total === 999999
              ? "Carregando Total"
              : pagination.total}
            )
          </h2>
          {processedGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {processedGames.map((game) => (
                // ⚠️ CRUCIAL: usar o ID gerado/processado
                <GameCard key={game.id} {...game} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">
              Nenhum jogo encontrado. Tente ajustar os filtros ou recarregar a
              página.
            </p>
          )}
        </section>

        {/* 🏆 IMPLEMENTAÇÃO FINAL: Seu componente customizado */}
        {pagination.totalPages > 1 && (
          <section className="mb-12 flex justify-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              className="w-full md:w-3/4 max-w-4xl" // Adiciona classes de largura para centralizar
            />
          </section>
        )}
      </div>
    </div>
  );
}
