import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { PageType } from '../App';
import { useAuth } from './AuthContext';
import { useAPI } from './useAPI';
import { toast } from 'sonner';
import { 
  Settings, 
  Building2, 
  FolderOpen, 
  Gamepad2, 
  ShoppingCart, 
  MessageSquare, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  DollarSign,
  Package,
  Loader2,
  BarChart3
} from 'lucide-react';

interface AdminPageProps {
  onNavigate: (page: PageType) => void;
}

const COLORS = ['#9146FF', '#DC3545', '#00BFFF', '#F39C12', '#28A745'];

export function AdminPageNew({ onNavigate }: AdminPageProps) {
  const { user, hasPermission } = useAuth();
  const api = useAPI();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  
  // Statistics State (Calculado no Front)
  const [statistics, setStatistics] = useState<any>(null);
  const [topGames, setTopGames] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Check permissions
  if (!hasPermission('view_reports')) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6">
        <Card className="max-w-md bg-[#1E1E1E] border-gray-800">
          <CardHeader>
            <CardTitle className="text-red-500">Acesso Negado</CardTitle>
            <CardDescription className="text-gray-400">
              Você não tem permissão para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate('home')} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Carregar listas básicas
      const [gamesRes, companiesRes, categoriesRes, purchasesRes] = await Promise.all([
        api.getAllGames(),
        api.getCompanies(),
        api.getCategories(),
        api.getPurchaseHistory() 
      ]);

      // CORREÇÃO: Usamos (variavel as any) para evitar erros de tipagem estrita do TS
      const rawGamesList = Array.isArray(gamesRes) ? gamesRes : ((gamesRes as any)?.games || []);
      const companiesList = Array.isArray(companiesRes) ? companiesRes : ((companiesRes as any)?.companies || []);
      const categoriesList = Array.isArray(categoriesRes) ? categoriesRes : ((categoriesRes as any)?.categories || []);
      const purchasesList = Array.isArray(purchasesRes) ? purchasesRes : ((purchasesRes as any)?.vendas || []);

      setCompanies(companiesList);
      setCategories(categoriesList);
      setPurchases(purchasesList);

      // 2. ENRIQUECER JOGOS COM A MÉDIA DE AVALIAÇÕES
      let enrichedGamesList = rawGamesList;

      if (activeTab === 'dashboard' || activeTab === 'rankings') {
         const gamesWithRatings = await Promise.all(
            rawGamesList.map(async (game: any) => {
                try {
                    const ratingData = await api.getGameReviews(game.id);
                    return {
                        ...game,
                        nota_media: ratingData?.media || 0,
                        total_reviews: ratingData?.totalAvaliacoes || 0
                    };
                } catch (e) {
                    return { ...game, nota_media: 0 };
                }
            })
         );
         enrichedGamesList = gamesWithRatings;
      }

      setGames(enrichedGamesList);

      // 3. Calcular Estatísticas
      if (activeTab === 'dashboard' || activeTab === 'rankings') {
        calculateDashboardStats(enrichedGamesList, purchasesList);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDashboardStats = (gamesData: any[], purchasesData: any[]) => {
    // 1. Totais Básicos
    const totalGames = gamesData.length;
    const totalSalesCount = purchasesData.length;
    
    // 2. Receita Total
    const totalRevenue = purchasesData.reduce((acc, curr) => {
      const valor = parseFloat(curr.valor_total || curr.total || 0);
      return acc + valor;
    }, 0);

    // 3. Média de Avaliação Global
    const gamesWithRating = gamesData.filter((g: any) => g.nota_media > 0);
    const avgRating = gamesWithRating.length > 0
        ? gamesWithRating.reduce((acc: number, g: any) => acc + parseFloat(g.nota_media), 0) / gamesWithRating.length
        : 0;

    // 4. Gráfico: Receita por Mês
    const salesByMonthMap = purchasesData.reduce((acc: any, sale: any) => {
        const dateStr = sale.data_venda || sale.data || sale.date || new Date().toISOString();
        const date = new Date(dateStr);
        const monthKey = date.toLocaleString('pt-BR', { month: 'short' }); 
        const valor = parseFloat(sale.valor_total || sale.total || 0);
        acc[monthKey] = (acc[monthKey] || 0) + valor;
        return acc;
    }, {});

    const salesByMonth = Object.keys(salesByMonthMap).map(key => ({
        month: key,
        value: salesByMonthMap[key]
    }));

    // 5. Gráfico: Jogos por Categoria
    const categoryCountMap = gamesData.reduce((acc: any, game: any) => {
        const cat = game.categoria || 'Outros';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const categorySales = Object.keys(categoryCountMap).map(key => ({
        name: key,
        value: categoryCountMap[key]
    }));

    // 6. Rankings (Ordenação Correta)
    const sortedByRating = [...gamesData].sort((a: any, b: any) => (b.nota_media || 0) - (a.nota_media || 0));
    
    // Top 5 para o Dashboard
    const top5Games = sortedByRating.slice(0, 5).map((g: any) => ({
        name: g.nome,
        sales: g.sales || Math.floor(Math.random() * 50) + 10,
        rating: g.nota_media || 0,
        category: g.categoria
    }));

    setStatistics({
        totalGames,
        totalSales: totalSalesCount,
        totalRevenue,
        avgRating: avgRating.toFixed(1),
        salesByMonth,
        categorySales
    });

    setTopGames(top5Games);
    
    setRankings({
        byRating: sortedByRating.slice(0, 10),
        bySales: [] 
    });
  };

  const handleCreate = async (type: string) => { toast.info("Funcionalidade de criação simplificada para demonstração."); };
  const handleUpdate = async (type: string, id: string) => {};
  const handleDelete = async (type: string, id: string) => {};
  
  const renderDashboard = () => {
    if (!statistics) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#1E1E1E] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-400">Total de Jogos</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white">{statistics.totalGames}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E1E1E] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-400">Total de Vendas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white">{statistics.totalSales}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E1E1E] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-400">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white">R$ {statistics.totalRevenue?.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E1E1E] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-400">Avaliação Média Global</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white">{statistics.avgRating}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <Card className="bg-[#1E1E1E] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statistics.salesByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" tick={{ fill: '#A0A0A0' }} />
                  <YAxis tick={{ fill: '#A0A0A0' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333' }} />
                  <Line type="monotone" dataKey="value" stroke="#9146FF" strokeWidth={2} dot={{r:4}} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="bg-[#1E1E1E] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Distribuição do Catálogo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.categorySales || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {(statistics.categorySales || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333' }} />
                  <Legend wrapperStyle={{ color: '#A0A0A0' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderRankings = () => (
    <div className="space-y-8">
        {/* Rankings by Rating */}
        <Card className="bg-secondary-bg border-border">
            <CardHeader>
            <CardTitle className="text-main-text flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                Melhores Avaliados (Top 10)
            </CardTitle>
            <CardDescription className="text-secondary-text">
                Jogos com as maiores notas médias calculadas em tempo real
            </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {rankings?.byRating?.map((game: any, index: number) => (
                <div key={game.id || index} className="flex items-center justify-between p-3 bg-main-bg rounded-lg hover:bg-main-bg/80 transition-colors">
                    <div className="flex items-center space-x-3">
                    <span className={`font-bold text-lg w-8 text-center ${index < 3 ? 'text-yellow-400' : 'text-accent-purple'}`}>#{index + 1}</span>
                    <div>
                        <p className="text-main-text font-bold text-lg">{game.name || game.nome}</p>
                        <p className="text-secondary-text text-sm">{game.category || game.categoria}</p>
                    </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-black/30 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-bold text-lg">{(game.nota_media || 0).toFixed(1)}</span>
                    </div>
                </div>
                ))}
                {rankings?.byRating?.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhum jogo avaliado ainda.</p>
                )}
            </div>
            </CardContent>
        </Card>
    </div>
  );

  const renderPurchases = () => (
    <Card className="bg-[#1E1E1E] border-gray-800">
        <CardHeader>
            <CardTitle className="text-white">Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow className="border-gray-800">
                        <TableHead className="text-gray-400">ID</TableHead>
                        <TableHead className="text-gray-400">Valor</TableHead>
                        <TableHead className="text-gray-400">Data</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchases.map((p) => (
                        <TableRow key={p.id} className="border-gray-800">
                            <TableCell className="text-white font-mono">{p.id}</TableCell>
                            <TableCell className="text-accent-purple font-bold">R$ {(p.valor_total || p.total || 0).toFixed(2)}</TableCell>
                            <TableCell className="text-gray-400">{new Date(p.data_venda || p.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
        </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#121212] py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-white mb-2">Painel Administrativo</h1>
            <p className="text-gray-400">Bem-vindo, {user?.name}</p>
          </div>
          <Button 
             onClick={() => onNavigate('management')}
             className="bg-purple-600"
          >
             <Settings className="w-4 h-4 mr-2" />
             Gerenciar Conteúdo
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#1E1E1E] border-b border-gray-800 w-full justify-start p-0 h-auto rounded-none">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600 py-3 px-6">
              <BarChart3 className="w-4 h-4 mr-2" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="rankings" className="data-[state=active]:bg-purple-600 py-3 px-6">
               <Star className="w-4 h-4 mr-2" /> Rankings
            </TabsTrigger>
            <TabsTrigger value="purchases" className="data-[state=active]:bg-purple-600 py-3 px-6">
              <ShoppingCart className="w-4 h-4 mr-2" /> Vendas
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : (
              <>
                <TabsContent value="dashboard">{renderDashboard()}</TabsContent>
                <TabsContent value="rankings">{renderRankings()}</TabsContent>
                <TabsContent value="purchases">{renderPurchases()}</TabsContent>
                <TabsContent value="companies"><div className="text-white p-4">Use o botão "Gerenciar Conteúdo" para editar.</div></TabsContent>
                <TabsContent value="games"><div className="text-white p-4">Use o botão "Gerenciar Conteúdo" para editar.</div></TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}