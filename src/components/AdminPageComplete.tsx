import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { PageType } from '../App';
import { useAuth } from './AuthContext';
import { useAPI } from './useAPI';
import { toast } from 'sonner@2.0.3';
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
  const [statistics, setStatistics] = useState<any>(null);
  const [topGames, setTopGames] = useState<any[]>([]);
  const [topGamesByCompany, setTopGamesByCompany] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any>(null);
  const [rankingsByCategory, setRankingsByCategory] = useState<any[]>([]);
  
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
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const [
        statsResult,
        topGamesResult,
        topByCompanyResult,
        rankingsResult,
        rankingsByCategoryResult
      ] = await Promise.all([
        api.getStatistics(),
        api.getTopGames(),
        api.getTopGamesByCompany(),
        api.getRankings(),
        api.getRankingsByCategory()
      ]);

      if (statsResult?.success) {
        setStatistics(statsResult.statistics);
      }
      if (topGamesResult?.success) {
        setTopGames(topGamesResult.topGames || []);
      }
      if (topByCompanyResult?.success) {
        setTopGamesByCompany(topByCompanyResult.topGamesByCompany || []);
      }
      if (rankingsResult?.success) {
        setRankings(rankingsResult.rankings);
      }
      if (rankingsByCategoryResult?.success) {
        setRankingsByCategory(rankingsByCategoryResult.rankingsByCategory || []);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
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
        title: 'Total de Vendas',
        value: `R$ ${(statistics.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: DollarSign,
        trend: '+12.5% este mês',
        color: 'text-accent-purple'
      },
      {
        title: 'Total de Jogos',
        value: statistics.totalGames || 0,
        icon: Package,
        trend: `${statistics.totalGames || 0} cadastrados`,
        color: 'text-accent-purple'
      },
      {
        title: 'Jogos Vendidos',
        value: statistics.totalSales || 0,
        icon: TrendingUp,
        trend: `${statistics.totalSales || 0} unidades`,
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
      
      {/* Revenue Chart */}
      {statistics?.salesByMonth && statistics.salesByMonth.length > 0 && (
        <Card className="bg-secondary-bg border-border">
          <CardHeader>
            <CardTitle className="text-main-text flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Receita Mensal
            </CardTitle>
            <CardDescription className="text-secondary-text">
              Evolução da receita nos últimos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#A0A0A0' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Games Bar Chart */}
        {topGames.length > 0 && (
          <Card className="bg-secondary-bg border-border">
            <CardHeader>
              <CardTitle className="text-main-text flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Jogos Mais Vendidos
              </CardTitle>
              <CardDescription className="text-secondary-text">
                Top {topGames.length} jogos por vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topGames.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#A0A0A0', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fill: '#A0A0A0' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1E1E1E', 
                      border: '1px solid #333', 
                      borderRadius: '8px',
                      color: '#EAEAEA'
                    }}
                    formatter={(value: any) => [`${value} vendas`, 'Total']}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#9146FF" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Category Distribution Pie Chart */}
        {statistics?.salesByCategory && statistics.salesByCategory.length > 0 && (
          <Card className="bg-secondary-bg border-border">
            <CardHeader>
              <CardTitle className="text-main-text flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2" />
                Vendas por Categoria
              </CardTitle>
              <CardDescription className="text-secondary-text">
                Distribuição de vendas entre categorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statistics.salesByCategory.map((entry: any, index: number) => (
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
                    formatter={(value: any) => [`${value} vendas`, 'Total']}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#A0A0A0' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Games by Company */}
      {topGamesByCompany.length > 0 && (
        <Card className="bg-secondary-bg border-border">
          <CardHeader>
            <CardTitle className="text-main-text flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Jogos Mais Vendidos por Empresa
            </CardTitle>
            <CardDescription className="text-secondary-text">
              Jogo mais vendido de cada empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topGamesByCompany}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="company" 
                  tick={{ fill: '#A0A0A0', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fill: '#A0A0A0' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E1E1E', 
                    border: '1px solid #333', 
                    borderRadius: '8px',
                    color: '#EAEAEA'
                  }}
                  formatter={(value: any, name: any, props: any) => [
                    `${props.payload.topGame?.name || 'N/A'} - ${value} vendas`,
                    'Jogo'
                  ]}
                />
                <Bar 
                  dataKey="totalSales" 
                  fill="#00BFFF" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderRankings = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rankings by Rating */}
        {rankings?.byRating && rankings.byRating.length > 0 && (
          <Card className="bg-secondary-bg border-border">
            <CardHeader>
              <CardTitle className="text-main-text flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                Ranking por Avaliação
              </CardTitle>
              <CardDescription className="text-secondary-text">
                Jogos com melhor avaliação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankings.byRating.slice(0, 10).map((game: any, index: number) => (
                  <div key={game.id} className="flex items-center justify-between p-3 bg-main-bg rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-accent-purple font-bold text-lg w-6">#{index + 1}</span>
                      <div>
                        <p className="text-main-text">{game.name}</p>
                        <p className="text-secondary-text text-sm">{game.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-main-text">{game.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rankings by Sales */}
        {rankings?.bySales && rankings.bySales.length > 0 && (
          <Card className="bg-secondary-bg border-border">
            <CardHeader>
              <CardTitle className="text-main-text flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-success" />
                Ranking por Vendas
              </CardTitle>
              <CardDescription className="text-secondary-text">
                Jogos mais vendidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankings.bySales.slice(0, 10).map((game: any, index: number) => (
                  <div key={game.id} className="flex items-center justify-between p-3 bg-main-bg rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-accent-purple font-bold text-lg w-6">#{index + 1}</span>
                      <div>
                        <p className="text-main-text">{game.name}</p>
                        <p className="text-secondary-text text-sm">{game.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-main-text">{game.sales} vendas</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rankings by Category */}
      {rankingsByCategory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {rankingsByCategory.map((categoryRanking: any) => (
            <Card key={categoryRanking.category} className="bg-secondary-bg border-border">
              <CardHeader>
                <CardTitle className="text-main-text">
                  Top {categoryRanking.category}
                </CardTitle>
                <CardDescription className="text-secondary-text">
                  {categoryRanking.totalSales} vendas totais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryRanking.topGames.slice(0, 5).map((game: any, index: number) => (
                    <div key={game.id} className="flex items-center justify-between p-2 bg-main-bg rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-accent-purple font-bold text-sm w-5">#{index + 1}</span>
                        <div>
                          <p className="text-main-text text-sm">{game.name}</p>
                          <p className="text-secondary-text text-xs">{game.company}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-main-text text-sm">{game.sales} vendas</p>
                        <p className="text-secondary-text text-xs flex items-center justify-end">
                          <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                          {game.rating?.toFixed(1) || '0.0'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-purple animate-spin mx-auto mb-4" />
          <p className="text-secondary-text">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => onNavigate('home')}
              variant="outline"
              className="border-border text-secondary-text hover:text-main-text"
              aria-label="Voltar para página inicial"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl text-main-text">Painel Administrativo</h1>
              <p className="text-secondary-text">Bem-vindo, {user?.name}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={() => onNavigate('management')}
              variant="outline"
              className="border-border text-secondary-text hover:text-main-text"
              aria-label="Ir para gerenciamento"
            >
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-error text-error hover:bg-error hover:text-white"
              aria-label="Fazer logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-secondary-bg border border-border">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-accent-purple data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="rankings" 
              className="data-[state=active]:bg-accent-purple data-[state=active]:text-white"
            >
              <Star className="w-4 h-4 mr-2" />
              Rankings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="rankings">
            {renderRankings()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
