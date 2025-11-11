import { useState, useEffect } from "react";
import { PageType } from "../App";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAPI } from "./useAPI";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Loader2 } from "lucide-react";
// 🏆 CORREÇÃO: Importar todos os sub-componentes de Paginação
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "./ui/Pagination";

interface HomePageProps {
  onNavigate: (page: PageType, data?: any) => void;
}

// Interface para o Jogo retornado pela API (Ajustada para o seu JSON)
interface Game {
  nome: string;
  preco: number;
  descricao: string;
  ano: number;
  categoria: string;
  empresa_nome: string;
  id?: number; // Opcional, será gerado como fallback
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
        src={image}
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
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 1. Função de carregamento corrigida para tratar a página e a paginação manual
  const loadGames = async (page: number = 1) => {
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
      let apiPagination = null; // Para armazenar metadados da API

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
        if (apiPagination) {
          // A. Se a API retornou metadados de paginação (Estrutura Completa)
          setGames(validGames); // A API já devolveu a fatia correta
          setPagination({
            page: apiPagination.page || page,
            limit: apiPagination.limit || limit,
            total: apiPagination.total || validGames.length,
            totalPages: apiPagination.totalPages || 1,
            hasNext: apiPagination.hasNext || false,
            hasPrevious: apiPagination.hasPrevious || false,
          });
        } else {
          // B. Se a API não retornou metadados (OU retornou todos os jogos, o que causava o loop)
          const total = validGames.length;
          const totalPages = Math.ceil(total / limit) || 1;

          // 🏆 FIX: Implementa Paginação Manual (fatiando o array)
          const start = (page - 1) * limit;
          const end = start + limit;
          const gamesForPage = validGames.slice(start, end);

          // CRUCIAL: Apenas os jogos da página atual são mostrados
          setGames(gamesForPage);

          // CRUCIAL: A paginação reflete a página solicitada
          setPagination({
            page: page,
            limit: limit,
            total: total,
            totalPages: totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
          });
        }
      } else {
        setError("Nenhum jogo encontrado na API.");
        setGames([]);
      }
    } catch (e) {
      console.error("Erro na API ao buscar jogos:", e);
      setError("Falha na conexão com o servidor. Tente novamente mais tarde.");
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // A chamada só ocorre quando currentPage ou o objeto 'api' (estabilizado) muda
    loadGames(currentPage);
    // Rola para o topo ao mudar a página, para melhor UX
    if (currentPage !== 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, api]);

  // Função para mudar a página (Chama setCurrentPage, que dispara o useEffect)
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Função helper para gerar os botões de página com reticências (Ellipsis)
  const renderPageItems = () => {
    const { totalPages, page } = pagination;
    const items = [];
    const maxPagesToShow = 5;

    if (totalPages <= 1) return null; // Não renderiza nada se houver apenas 1 página

    if (totalPages <= maxPagesToShow) {
      // Mostra todos os botões se o total for pequeno
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={i === page}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
              size="icon" // 🏆 CORREÇÃO: Adicionando a propriedade 'size' obrigatória
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Lógica para mostrar Ellipsis (...) em páginas com muitos resultados
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={page === 1}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
            size={"icon"}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (start > 2) {
        items.push(<PaginationEllipsis key="start-ellipsis" />);
      }

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={i === page}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
              size={"icon"}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (end < totalPages - 1) {
        items.push(<PaginationEllipsis key="end-ellipsis" />);
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={page === totalPages}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
            size={"icon"}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // 2. PROCESSAMENTO DOS JOGOS (Permanece o mesmo)
  const processedGames: GameCardProps[] = (games || []).map((game, index) => {
    const gameId = game.id ?? index + 1;
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
            onClick={() => loadGames(currentPage)}
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
            Todos os Jogos ({pagination.total})
          </h2>
          {processedGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {processedGames.map((game) => (
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

        {/* 🏆 CORREÇÃO: Implementação Completa da Paginação */}
        {pagination.totalPages > 1 && (
          <section className="mb-12">
            <Pagination className="mt-8">
              <PaginationContent>
                {/* Botão Anterior */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    size={"icon"}
                    aria-disabled={currentPage === 1}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>

                {/* Botões de Página e Ellipsis (reticências) */}
                {renderPageItems()}

                {/* Botão Próximo */}
                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    size={"icon"}
                    aria-disabled={currentPage === pagination.totalPages}
                    className={
                      currentPage === pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </section>
        )}
      </div>
    </div>
  );
}
