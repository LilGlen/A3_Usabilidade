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
import { toast } from 'sonner@2.0.3';
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
  Search,
  TrendingUp,
  Users,
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
  const [reviews, setReviews] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  
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
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const stats = await api.getStatistics();
        if (stats?.success) setStatistics(stats.statistics);
      } else if (activeTab === 'companies') {
        const result = await api.getCompanies();
        if (result?.success) setCompanies(result.companies);
      } else if (activeTab === 'categories') {
        const result = await api.getCategories();
        if (result?.success) setCategories(result.categories);
      } else if (activeTab === 'games') {
        const result = await api.getGames();
        if (result?.success) setGames(result.games);
      } else if (activeTab === 'purchases') {
        const result = await api.getAllPurchases();
        if (result?.success) setPurchases(result.purchases);
      } else if (activeTab === 'reviews') {
        const result = await api.getAllReviews();
        if (result?.success) setReviews(result.reviews);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (type: string) => {
    try {
      let result;
      if (type === 'company') {
        result = await api.createCompany(formData);
      } else if (type === 'category') {
        result = await api.createCategory(formData);
      } else if (type === 'game') {
        result = await api.createGame(formData);
      }

      if (result?.success) {
        toast.success(`${type === 'company' ? 'Empresa' : type === 'category' ? 'Categoria' : 'Jogo'} criado com sucesso!`);
        setDialogOpen(false);
        setFormData({});
        loadData();
      } else {
        toast.error(api.error || 'Erro ao criar');
      }
    } catch (error) {
      console.error('Error creating:', error);
      toast.error('Erro ao criar');
    }
  };

  const handleUpdate = async (type: string, id: string) => {
    try {
      let result;
      if (type === 'company') {
        result = await api.updateCompany(id, formData);
      } else if (type === 'category') {
        result = await api.updateCategory(id, formData);
      } else if (type === 'game') {
        result = await api.updateGame(id, formData);
      }

      if (result?.success) {
        toast.success('Atualizado com sucesso!');
        setDialogOpen(false);
        setEditingId(null);
        setFormData({});
        loadData();
      } else {
        toast.error(api.error || 'Erro ao atualizar');
      }
    } catch (error) {
      console.error('Error updating:', error);
      toast.error('Erro ao atualizar');
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    
    try {
      let result;
      if (type === 'company') {
        result = await api.deleteCompany(id);
      } else if (type === 'category') {
        result = await api.deleteCategory(id);
      } else if (type === 'game') {
        result = await api.deleteGame(id);
      }

      if (result?.success) {
        toast.success('Excluído com sucesso!');
        loadData();
      } else {
        toast.error(api.error || 'Erro ao excluir');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erro ao excluir');
    }
  };

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
              <CardTitle className="text-sm text-gray-400">Avaliação Média</CardTitle>
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
              <CardDescription className="text-gray-400">
                Evolução nos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statistics.salesByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" tick={{ fill: '#A0A0A0' }} />
                  <YAxis tick={{ fill: '#A0A0A0' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E1E1E',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#EAEAEA'
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#9146FF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="bg-[#1E1E1E] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Vendas por Categoria</CardTitle>
              <CardDescription className="text-gray-400">
                Distribuição de vendas
              </CardDescription>
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
  };

  const renderCompanies = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2A2A2A] border-gray-700 text-white"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
              setEditingId(null);
              setFormData({});
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1E1E1E] border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingId ? 'Editar' : 'Nova'} Empresa
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Nome</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400">Ano de Fundação</Label>
                <Input
                  value={formData.founded || ''}
                  onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400">Descrição</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                />
              </div>
              <Button
                onClick={() => editingId ? handleUpdate('company', editingId) : handleCreate('company')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-[#1E1E1E] border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-400">Nome</TableHead>
              <TableHead className="text-gray-400">Fundação</TableHead>
              <TableHead className="text-gray-400">Descrição</TableHead>
              <TableHead className="text-gray-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((company) => (
              <TableRow key={company.id} className="border-gray-800">
                <TableCell className="text-white">{company.name}</TableCell>
                <TableCell className="text-gray-400">{company.founded}</TableCell>
                <TableCell className="text-gray-400">{company.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(company.id);
                        setFormData(company);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-400"
                      onClick={() => handleDelete('company', company.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2A2A2A] border-gray-700 text-white"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
              setEditingId(null);
              setFormData({});
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1E1E1E] border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingId ? 'Editar' : 'Nova'} Categoria
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Nome</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400">Descrição</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                />
              </div>
              <Button
                onClick={() => editingId ? handleUpdate('category', editingId) : handleCreate('category')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((category) => (
          <Card key={category.id} className="bg-[#1E1E1E] border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{category.name}</CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    {category.description}
                  </CardDescription>
                </div>
                <Badge className={category.active ? 'bg-green-600' : 'bg-gray-600'}>
                  {category.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(category.id);
                    setFormData(category);
                    setDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-400"
                  onClick={() => handleDelete('category', category.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGames = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar jogos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2A2A2A] border-gray-700 text-white"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
              setEditingId(null);
              setFormData({});
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Jogo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1E1E1E] border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingId ? 'Editar' : 'Novo'} Jogo
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label className="text-gray-400">Nome</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400">Empresa</Label>
                <Select
                  value={formData.company || ''}
                  onValueChange={(value) => setFormData({ ...formData, company: value })}
                >
                  <SelectTrigger className="bg-[#2A2A2A] border-gray-700 text-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-700">
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.name} className="text-white">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-400">Categoria</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-[#2A2A2A] border-gray-700 text-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2A2A] border-gray-700">
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.name} className="text-white">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-400">Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400">Descrição</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-gray-400">URL da Imagem</Label>
                <Input
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                  placeholder="https://..."
                />
              </div>
              <Button
                onClick={() => editingId ? handleUpdate('game', editingId) : handleCreate('game')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())).map((game) => (
          <Card key={game.id} className="bg-[#1E1E1E] border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-white text-lg">{game.name}</CardTitle>
                <Badge className="bg-purple-600">{game.category}</Badge>
              </div>
              <CardDescription className="text-gray-400">
                {game.company}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Preço:</span>
                  <span className="text-white">R$ {game.price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Vendas:</span>
                  <span className="text-white">{game.sales || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avaliação:</span>
                  <span className="text-white flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {game.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(game.id);
                    setFormData(game);
                    setDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-400"
                  onClick={() => handleDelete('game', game.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPurchases = () => (
    <Card className="bg-[#1E1E1E] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Histórico de Compras</CardTitle>
        <CardDescription className="text-gray-400">
          Todas as compras realizadas na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-400">ID</TableHead>
              <TableHead className="text-gray-400">Usuário</TableHead>
              <TableHead className="text-gray-400">Jogos</TableHead>
              <TableHead className="text-gray-400">Total</TableHead>
              <TableHead className="text-gray-400">Data</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id} className="border-gray-800">
                <TableCell className="text-gray-400 font-mono text-xs">
                  {purchase.id.substring(0, 12)}...
                </TableCell>
                <TableCell className="text-white">{purchase.userName}</TableCell>
                <TableCell className="text-gray-400">
                  {purchase.games?.length || 0} jogo(s)
                </TableCell>
                <TableCell className="text-white">
                  R$ {purchase.total?.toFixed(2)}
                </TableCell>
                <TableCell className="text-gray-400">
                  {new Date(purchase.date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Badge className={purchase.status === 'Concluída' ? 'bg-green-600' : 'bg-yellow-600'}>
                    {purchase.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderReviews = () => (
    <Card className="bg-[#1E1E1E] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Avaliações</CardTitle>
        <CardDescription className="text-gray-400">
          Todas as avaliações dos usuários
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-[#2A2A2A] border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-sm">{review.userName}</CardTitle>
                    <CardDescription className="text-gray-400 text-xs">
                      {review.gameName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              {review.comment && (
                <CardContent>
                  <p className="text-gray-300 text-sm">{review.comment}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(review.date).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#121212] py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl text-white mb-2">Painel Administrativo</h1>
          <p className="text-gray-400">Bem-vindo, {user?.name}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#1E1E1E] border-b border-gray-800 w-full justify-start">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            {hasPermission('manage_companies') && (
              <TabsTrigger value="companies" className="data-[state=active]:bg-purple-600">
                <Building2 className="w-4 h-4 mr-2" />
                Empresas
              </TabsTrigger>
            )}
            {hasPermission('manage_categories') && (
              <TabsTrigger value="categories" className="data-[state=active]:bg-purple-600">
                <FolderOpen className="w-4 h-4 mr-2" />
                Categorias
              </TabsTrigger>
            )}
            {hasPermission('manage_games') && (
              <TabsTrigger value="games" className="data-[state=active]:bg-purple-600">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Jogos
              </TabsTrigger>
            )}
            <TabsTrigger value="purchases" className="data-[state=active]:bg-purple-600">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Compras
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              Avaliações
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
                <TabsContent value="companies">{renderCompanies()}</TabsContent>
                <TabsContent value="categories">{renderCategories()}</TabsContent>
                <TabsContent value="games">{renderGames()}</TabsContent>
                <TabsContent value="purchases">{renderPurchases()}</TabsContent>
                <TabsContent value="reviews">{renderReviews()}</TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
