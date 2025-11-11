import { useState } from 'react';
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
import { PageType } from '../App';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';
import { 
  Settings, 
  Building2, 
  FolderOpen, 
  Gamepad2, 
  ShoppingCart, 
  Receipt, 
  MessageSquare, 
  Star, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Eye,
  Download,
  ArrowLeft
} from 'lucide-react';

interface AdminPageProps {
  onNavigate: (page: PageType) => void;
}

// Mock data for demonstrations
const mockCompanies = [
  { id: '1', name: 'Estúdio Fantasia', founded: '2015', games: 23, revenue: 'R$ 2.5M' },
  { id: '2', name: 'CyberDev Studios', founded: '2018', games: 15, revenue: 'R$ 1.8M' },
  { id: '3', name: 'Magic Realms', founded: '2020', games: 8, revenue: 'R$ 950K' }
];

const mockCategories = [
  { id: '1', name: 'RPG', description: 'Role Playing Games', games: 45, active: true },
  { id: '2', name: 'Ação', description: 'Jogos de ação e aventura', games: 32, active: true },
  { id: '3', name: 'Estratégia', description: 'Jogos de estratégia', games: 18, active: true },
  { id: '4', name: 'Corrida', description: 'Jogos de corrida', games: 12, active: false }
];

const mockGames = [
  { id: '1', name: 'Aventura Épica', company: 'Estúdio Fantasia', category: 'RPG', price: 89.99, rating: 4.8, sales: 15204, status: 'Ativo' },
  { id: '2', name: 'Cyber Odyssey', company: 'CyberDev Studios', category: 'Ação', price: 129.99, rating: 4.7, sales: 12890, status: 'Ativo' },
  { id: '3', name: 'Reino Místico', company: 'Magic Realms', category: 'RPG', price: 79.99, rating: 4.6, sales: 11500, status: 'Ativo' }
];

const mockPurchases = [
  { id: '1', user: 'João Silva', games: ['Aventura Épica', 'Cyber Odyssey'], total: 219.98, date: '2024-01-15', status: 'Concluída' },
  { id: '2', user: 'Maria Santos', games: ['Reino Místico'], total: 79.99, date: '2024-01-14', status: 'Concluída' },
  { id: '3', user: 'Pedro Costa', games: ['Aventura Épica'], total: 89.99, date: '2024-01-13', status: 'Pendente' }
];

const mockReviews = [
  { id: '1', user: 'Ana Lima', game: 'Aventura Épica', rating: 5, comment: 'Jogo incrível! Gráficos excelentes.', date: '2024-01-16' },
  { id: '2', user: 'Carlos Oliveira', game: 'Cyber Odyssey', rating: 4, comment: 'Muito bom, mas poderia ter mais conteúdo.', date: '2024-01-15' },
  { id: '3', user: 'Luana Ferreira', game: 'Reino Místico', rating: 5, comment: 'Perfeito para fãs de RPG!', date: '2024-01-14' }
];

const chartData = {
  sales: [
    { month: 'Jan', value: 45000 },
    { month: 'Fev', value: 52000 },
    { month: 'Mar', value: 48000 },
    { month: 'Abr', value: 61000 },
    { month: 'Mai', value: 55000 },
    { month: 'Jun', value: 67000 }
  ],
  gamesSales: [
    { name: 'Aventura Épica', sales: 15204 },
    { name: 'Cyber Odyssey', sales: 12890 },
    { name: 'Reino Místico', sales: 11500 },
    { name: 'Space Raiders', sales: 9800 },
    { name: 'Velocidade Final', sales: 8500 }
  ],
  categorySales: [
    { name: 'RPG', value: 50, color: '#9146FF' },
    { name: 'Ação', value: 25, color: '#DC3545' },
    { name: 'Estratégia', value: 15, color: '#00BFFF' },
    { name: 'Corrida', value: 10, color: '#F39C12' }
  ]
};

export function AdminPage({ onNavigate }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout, hasPermission } = useAuth();

  // Check if user has admin permissions
  if (!hasPermission('manage_companies')) {
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

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
    onNavigate('home');
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-secondary-bg border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-text text-sm">Total de Vendas</p>
              <p className="text-2xl font-bold text-main-text">R$ 328.5K</p>
              <p className="text-success text-sm flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5% este mês
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-accent-purple" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary-bg border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-text text-sm">Usuários Ativos</p>
              <p className="text-2xl font-bold text-main-text">2,847</p>
              <p className="text-success text-sm flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.2% este mês
              </p>
            </div>
            <Users className="w-8 h-8 text-accent-purple" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary-bg border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-text text-sm">Jogos Cadastrados</p>
              <p className="text-2xl font-bold text-main-text">156</p>
              <p className="text-success text-sm flex items-center mt-1">
                <Plus className="w-4 h-4 mr-1" />
                +5 novos esta semana
              </p>
            </div>
            <Package className="w-8 h-8 text-accent-purple" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary-bg border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-text text-sm">Avaliação Média</p>
              <p className="text-2xl font-bold text-main-text">4.7/5</p>
              <p className="text-success text-sm flex items-center mt-1">
                <Star className="w-4 h-4 mr-1" />
                +0.3 este mês
              </p>
            </div>
            <Star className="w-8 h-8 text-accent-purple" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      {renderStatsCards()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Card className="bg-secondary-bg border-border">
          <CardHeader>
            <CardTitle className="text-main-text">Receita Mensal</CardTitle>
            <CardDescription className="text-secondary-text">
              Evolução da receita nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.sales}>
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

        {/* Top Games */}
        <Card className="bg-secondary-bg border-border">
          <CardHeader>
            <CardTitle className="text-main-text">Jogos Mais Vendidos</CardTitle>
            <CardDescription className="text-secondary-text">
              Top 5 jogos por número de vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.gamesSales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" tick={{ fill: '#A0A0A0', fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fill: '#A0A0A0' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E1E1E', 
                    border: '1px solid #333', 
                    borderRadius: '8px',
                    color: '#EAEAEA'
                  }}
                />
                <Bar dataKey="sales" fill="#9146FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card className="bg-secondary-bg border-border">
        <CardHeader>
          <CardTitle className="text-main-text">Distribuição por Categoria</CardTitle>
          <CardDescription className="text-secondary-text">
            Porcentagem de vendas por categoria de jogo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData.categorySales}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.categorySales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
              <Legend 
                wrapperStyle={{ color: '#A0A0A0' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompanies = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-main-text">Gerenciar Empresas</h2>
        <Button className="bg-accent-purple hover:bg-accent-hover">
          <Plus className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      <Card className="bg-secondary-bg border-border">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-main-text">Nome</TableHead>
                <TableHead className="text-main-text">Fundada</TableHead>
                <TableHead className="text-main-text">Jogos</TableHead>
                <TableHead className="text-main-text">Receita</TableHead>
                <TableHead className="text-main-text">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="text-main-text font-medium">{company.name}</TableCell>
                  <TableCell className="text-secondary-text">{company.founded}</TableCell>
                  <TableCell className="text-secondary-text">{company.games}</TableCell>
                  <TableCell className="text-secondary-text">{company.revenue}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="border-border text-secondary-text hover:text-main-text">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-border text-secondary-text hover:text-main-text">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-border text-error hover:text-error">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-main-text">Gerenciar Categorias</h2>
        <Button className="bg-accent-purple hover:bg-accent-hover">
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <Card className="bg-secondary-bg border-border">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-main-text">Nome</TableHead>
                <TableHead className="text-main-text">Descrição</TableHead>
                <TableHead className="text-main-text">Jogos</TableHead>
                <TableHead className="text-main-text">Status</TableHead>
                <TableHead className="text-main-text">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="text-main-text font-medium">{category.name}</TableCell>
                  <TableCell className="text-secondary-text">{category.description}</TableCell>
                  <TableCell className="text-secondary-text">{category.games}</TableCell>
                  <TableCell>
                    <Badge className={category.active ? 'bg-success text-white' : 'bg-error text-white'}>
                      {category.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="border-border text-secondary-text hover:text-main-text">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-border text-error hover:text-error">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderGames = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-main-text">Gerenciar Jogos</h2>
        <Button className="bg-accent-purple hover:bg-accent-hover">
          <Plus className="w-4 h-4 mr-2" />
          Novo Jogo
        </Button>
      </div>

      <Card className="bg-secondary-bg border-border">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text w-4 h-4" />
              <Input
                placeholder="Buscar jogos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-main-bg border-border text-main-text"
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-main-text">Nome</TableHead>
                <TableHead className="text-main-text">Empresa</TableHead>
                <TableHead className="text-main-text">Categoria</TableHead>
                <TableHead className="text-main-text">Preço</TableHead>
                <TableHead className="text-main-text">Avaliação</TableHead>
                <TableHead className="text-main-text">Vendas</TableHead>
                <TableHead className="text-main-text">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockGames.map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="text-main-text font-medium">{game.name}</TableCell>
                  <TableCell className="text-secondary-text">{game.company}</TableCell>
                  <TableCell className="text-secondary-text">{game.category}</TableCell>
                  <TableCell className="text-secondary-text">R$ {game.price}</TableCell>
                  <TableCell className="text-secondary-text">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {game.rating}
                    </div>
                  </TableCell>
                  <TableCell className="text-secondary-text">{game.sales.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="border-border text-secondary-text hover:text-main-text">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-border text-secondary-text hover:text-main-text">
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-border text-error hover:text-error">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderPurchases = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-main-text">Histórico de Compras</h2>
        <Button variant="outline" className="border-border text-secondary-text hover:text-main-text">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <Card className="bg-secondary-bg border-border">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-main-text">ID</TableHead>
                <TableHead className="text-main-text">Usuário</TableHead>
                <TableHead className="text-main-text">Jogos</TableHead>
                <TableHead className="text-main-text">Total</TableHead>
                <TableHead className="text-main-text">Data</TableHead>
                <TableHead className="text-main-text">Status</TableHead>
                <TableHead className="text-main-text">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="text-main-text font-medium">#{purchase.id}</TableCell>
                  <TableCell className="text-secondary-text">{purchase.user}</TableCell>
                  <TableCell className="text-secondary-text">
                    <div className="max-w-xs truncate">
                      {purchase.games.join(', ')}
                    </div>
                  </TableCell>
                  <TableCell className="text-secondary-text">R$ {purchase.total}</TableCell>
                  <TableCell className="text-secondary-text">{new Date(purchase.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge className={purchase.status === 'Concluída' ? 'bg-success text-white' : 'bg-yellow-600 text-white'}>
                      {purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="border-border text-secondary-text hover:text-main-text">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-main-text">Comentários e Avaliações</h2>
        <Select defaultValue="all">
          <SelectTrigger className="w-48 bg-main-bg border-border text-main-text">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as avaliações</SelectItem>
            <SelectItem value="5">5 estrelas</SelectItem>
            <SelectItem value="4">4 estrelas</SelectItem>
            <SelectItem value="3">3 estrelas</SelectItem>
            <SelectItem value="2">2 estrelas</SelectItem>
            <SelectItem value="1">1 estrela</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {mockReviews.map((review) => (
          <Card key={review.id} className="bg-secondary-bg border-border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-main-text font-medium">{review.user}</h3>
                  <p className="text-secondary-text text-sm">{review.game}</p>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-secondary-text text-sm">
                    {new Date(review.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <p className="text-secondary-text">{review.comment}</p>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" className="border-border text-error hover:text-error">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

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
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-main-text">Painel Administrativo</h1>
              <p className="text-secondary-text">Bem-vindo, {user?.name}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-error text-error hover:bg-error hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 bg-secondary-bg border border-border">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-accent-purple data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-accent-purple data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Empresas</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-accent-purple data-[state=active]:text-white">
              <FolderOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-accent-purple data-[state=active]:text-white">
              <Gamepad2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Jogos</span>
            </TabsTrigger>
            <TabsTrigger value="purchases" className="data-[state=active]:bg-accent-purple data-[state=active]:text-white">
              <Receipt className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Compras</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-accent-purple data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Avaliações</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-accent-purple data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="companies">
            {renderCompanies()}
          </TabsContent>

          <TabsContent value="categories">
            {renderCategories()}
          </TabsContent>

          <TabsContent value="games">
            {renderGames()}
          </TabsContent>

          <TabsContent value="purchases">
            {renderPurchases()}
          </TabsContent>

          <TabsContent value="reviews">
            {renderReviews()}
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-secondary-bg border-border">
              <CardHeader>
                <CardTitle className="text-main-text">Configurações do Sistema</CardTitle>
                <CardDescription className="text-secondary-text">
                  Configure as preferências globais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-main-text">Taxa de Comissão (%)</Label>
                    <Input defaultValue="15" className="bg-main-bg border-border text-main-text" />
                  </div>
                  <div>
                    <Label className="text-main-text">Email de Suporte</Label>
                    <Input defaultValue="suporte@synthx.com" className="bg-main-bg border-border text-main-text" />
                  </div>
                  <div>
                    <Label className="text-main-text">Limite de Upload (MB)</Label>
                    <Input defaultValue="50" className="bg-main-bg border-border text-main-text" />
                  </div>
                </div>
                <Button className="bg-accent-purple hover:bg-accent-hover">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}