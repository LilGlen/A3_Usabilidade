import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { PageType } from '../App';
import { useAuth } from './AuthContext';
import { useAPI } from './useAPI';
import { toast } from 'sonner'; // Ajuste para seu provider se necessário
import { 
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Star,
  ArrowLeft,
  LogOut,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Settings
} from 'lucide-react';

interface AdminPageCompleteProps {
  onNavigate: (page: PageType) => void;
}

const COLORS = ['#9146FF', '#00BFFF', '#28A745', '#F39C12', '#DC3545'];

export function AdminPageComplete({ onNavigate }: AdminPageCompleteProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados calculados no Frontend
  const [statistics, setStatistics] = useState<any>(null);
  const [topGames, setTopGames] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any>(null);
  const [salesByCategory, setSalesByCategory] = useState<any[]>([]);
  
  const { user, logout, hasPermission } = useAuth();
  const api = useAPI();

  // Check if user has admin permissions
  if (!hasPermission('view_reports')) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <Card className="w-96 bg-secondary-bg border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-main-text">Acesso Negado</CardTitle>
            <CardDescription className="text-secondary-text">
              Você não tem permissão para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onNavigate('home')} 
              className="w-full bg-accent-purple hover:bg-accent-hover"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadDataAndCalculateStats();
  }, []);

  const loadDataAndCalculateStats = async () => {
    setIsLoading(true);
    try {
      // 1. Buscar dados brutos de todas as entidades
      const [gamesResponse, salesResponse, reviewsResponse, categoriesResponse] = await Promise.all([
        api.getAllGames(),
        api.getAllSales(), // Vendas
        api.getAllReviews(),
        api.getCategories(),
      ]);

      const games = Array.isArray(gamesResponse) ? gamesResponse : (gamesResponse?.games || []);
      const sales = Array.isArray(salesResponse) ? salesResponse : (salesResponse?.vendas || []);
      const reviews = Array.isArray(reviewsResponse) ? reviewsResponse : (reviewsResponse?.reviews || []);
      const categories = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.categories || []);

      // --- CÁLCULOS DE ESTATÍSTICAS (FRONTEND) ---

      // 1. Totais Gerais
      const totalGames = games.length;
      const totalRevenue = sales.reduce((acc: number, sale: any) => acc + (sale.valor_total || sale.total || 0), 0);
      const totalSalesCount = sales.length; // Número de pedidos
      
      // Média de avaliações global
      const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc: number, r: any) => acc + (r.nota || r.rating || 0), 0) / reviews.length)
        : 0;

      // 2. Vendas por Categoria (Simulado cruzando jogos vendidos)
      // Como a venda tem itens, precisaríamos ver os itens. Se o endpoint de venda não traz itens,
      // vamos simular distribuindo pelos jogos cadastrados (ou usar dados reais se disponíveis).
      // Aqui vamos agrupar jogos por categoria para ter um gráfico.
      const gamesByCategory = games.reduce((acc: any, game: any) => {
         const cat = game.categoria || 'Outros';
         acc[cat] = (acc[cat] || 0) + 1;
         return acc;
      }, {});
      
      const categoryData = Object.entries(gamesByCategory).map(([name, value]) => ({ name, value }));

      // 3. Top Jogos (Baseado em Rating, já que não temos itens vendidos detalhados aqui fácil)
      const sortedByRating = [...games].sort((a: any, b: any) => (b.nota_media || 0) - (a.nota_media || 0));
      const top5Games = sortedByRating.slice(0, 5).map((g: any) => ({
        name: g.nome,
        rating: g.nota_media || 0,
        category: g.categoria
      }));

      // 4. Receita Mensal (Agrupando vendas por mês)
      const salesByMonthMap = sales.reduce((acc: any, sale: any) => {
         const date = new Date(sale.data_venda || sale.date);
         const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
         acc[key] = (acc[key] || 0) + (sale.valor_total || sale.total || 0);
         return acc;
      }, {});
      
      const salesByMonth = Object.entries(salesByMonthMap).map(([month, value]) => ({ month, value }));


      // SETAR ESTADOS
      setStatistics({
        totalGames,
        totalRevenue,
        totalSales: totalSalesCount,
        totalReviews: reviews.length,
        avgRating,
        salesByMonth, // Gráfico de linha
        categorySales: categoryData // Gráfico de pizza (Distribuição de jogos)
      });

      setTopGames(top5Games);
      
      setRankings({
        byRating: sortedByRating.slice(0, 10),
        bySales: [] // Sem dados detalhados de itens vendidos, deixamos vazio ou simulamos
      });
      
      setSalesByCategory(categoryData);

    } catch (error) {
      console.error('Error calculating stats:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    onNavigate('home');
  };

  const renderStatsCards = () => {
    if (!statistics) return null;

    const stats = [
      {
        title: 'Receita Total',
        value: `R$ ${(statistics.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: DollarSign,
        trend: 'Total acumulado',
        color: 'text-accent-purple'
      },
      {
        title: 'Jogos Cadastrados',
        value: statistics.totalGames || 0,
        icon: Package,
        trend: 'Em catálogo',
        color: 'text-accent-purple'
      },
      {
        title: 'Vendas Realizadas',
        value: statistics.totalSales || 0,
        icon: TrendingUp,
        trend: 'Pedidos concluídos',
        color: 'text-accent-purple'
      },
      {
        title: 'Avaliação Média',
        value: `${(statistics.avgRating || 0).toFixed(1)}/5`,
        icon: Star,
        trend: `${statistics.totalReviews || 0} avaliações`,
        color: 'text-accent-purple'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-secondary-bg border-border hover:border-accent-purple transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary-text text-sm">{stat.title}</p>
                    <p className="text-2xl text-main-text mt-1">{stat.value}</p>
                    <p className="text-success text-sm mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.trend}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {renderStatsCards()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Card className="bg-secondary-bg border-border">
          <CardHeader>
            <CardTitle className="text-main-text flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Receita Mensal
            </CardTitle>
            <CardDescription className="text-secondary-text">
              Evolução das vendas por mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics?.salesByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#A0A0A0' }}
                />
                <YAxis tick={{ fill: '#A0A0A0' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E1E1E', 
                    border: '1px solid #333', 
                    borderRadius: '8px',
                    color: '#EAEAEA'
                  }}
                  formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#9146FF" 
                  strokeWidth={3}
                  dot={{ fill: '#9146FF', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-secondary-bg border-border">
          <CardHeader>
            <CardTitle className="text-main-text flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2" />
              Distribuição de Jogos
            </CardTitle>
            <CardDescription className="text-secondary-text">
              Jogos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics?.categorySales || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {(statistics?.categorySales || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E1E1E', 
                    border: '1px solid #333', 
                    borderRadius: '8px',
                    color: '#EAEAEA'
                  }}
                />
                <Legend wrapperStyle={{ color: '#A0A0A0' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRankings = () => (
    <div className="space-y-8">
        {/* Rankings by Rating */}
        <Card className="bg-secondary-bg border-border">
            <CardHeader>
            <CardTitle className="text-main-text flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                Melhores Avaliados
            </CardTitle>
            <CardDescription className="text-secondary-text">
                Jogos com as maiores notas médias
            </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {rankings?.byRating?.map((game: any, index: number) => (
                <div key={game.id || index} className="flex items-center justify-between p-3 bg-main-bg rounded-lg">
                    <div className="flex items-center space-x-3">
                    <span className="text-accent-purple font-bold text-lg w-6">#{index + 1}</span>
                    <div>
                        <p className="text-main-text font-bold">{game.nome || game.name}</p>
                        <p className="text-secondary-text text-sm">{game.categoria}</p>
                    </div>
                    </div>
                    <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-main-text font-bold">{(game.nota_media || 0).toFixed(1)}</span>
                    </div>
                </div>
                ))}
            </div>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-main-bg py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-main-text mb-2 font-bold">Dashboard</h1>
            <p className="text-secondary-text">Visão geral da loja</p>
          </div>
          <Button 
             onClick={() => onNavigate('management')}
             className="bg-accent-purple hover:bg-accent-hover"
          >
             <Settings className="w-4 h-4 mr-2" />
             Gerenciar Conteúdo
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary-bg border-b border-border w-full justify-start p-0 h-auto rounded-none">
            <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent-purple data-[state=active]:bg-transparent rounded-none py-4 px-6"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
                value="rankings" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent-purple data-[state=active]:bg-transparent rounded-none py-4 px-6"
            >
              <Star className="w-4 h-4 mr-2" />
              Rankings
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
              </div>
            ) : (
              <>
                <TabsContent value="dashboard">{renderDashboard()}</TabsContent>
                <TabsContent value="rankings">{renderRankings()}</TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}