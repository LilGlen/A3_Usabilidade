import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { PageType } from '../App';
import { Building2, Tag, Gamepad2, Plus, Edit, Trash2, Upload, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useAPI } from './useAPI';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';

interface ManagementPageProps {
  onNavigate: (page: PageType) => void;
}

export function ManagementPage({ onNavigate }: ManagementPageProps) {
  const [activeTab, setActiveTab] = useState('companies');
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const api = useAPI();
  const { hasPermission } = useAuth();

  // Mock data for companies
  const [companies] = useState([
    {
      id: '1',
      name: 'Estúdio Fantasia',
      description: 'Desenvolvedora especializada em RPGs épicos',
      founded: '2015',
      games: 12,
      status: 'Ativa'
    },
    {
      id: '2',
      name: 'Neon Studios',
      description: 'Criadores de jogos cyberpunk e futuristas',
      founded: '2018',
      games: 8,
      status: 'Ativa'
    },
    {
      id: '3',
      name: 'Pixel Dreams',
      description: 'Estúdio indie focado em experiências narrativas',
      founded: '2020',
      games: 5,
      status: 'Ativa'
    }
  ]);

  // Mock data for categories
  const [categories] = useState([
    {
      id: '1',
      name: 'RPG',
      description: 'Jogos de interpretação de papéis',
      games: 45,
      color: '#9146FF'
    },
    {
      id: '2',
      name: 'Ação',
      description: 'Jogos focados em combate e reflexos',
      games: 32,
      color: '#DC3545'
    },
    {
      id: '3',
      name: 'Aventura',
      description: 'Jogos de exploração e história',
      games: 28,
      color: '#28A745'
    },
    {
      id: '4',
      name: 'Estratégia',
      description: 'Jogos que exigem planejamento tático',
      games: 18,
      color: '#F39C12'
    },
    {
      id: '5',
      name: 'Simulação',
      description: 'Simuladores de vida real',
      games: 15,
      color: '#00BFFF'
    }
  ]);

  // Mock data for games
  const [games] = useState([
    {
      id: '1',
      name: 'Aventura Épica',
      company: 'Estúdio Fantasia',
      category: 'RPG',
      price: 129.99,
      status: 'Publicado',
      sales: 1284,
      rating: 4.3
    },
    {
      id: '2',
      name: 'Neon Highway',  
      company: 'Neon Studios',
      category: 'Ação',
      price: 49.99,
      status: 'Publicado',
      sales: 856,
      rating: 4.1
    },
    {
      id: '3',
      name: 'Space Explorer',
      company: 'Pixel Dreams',
      category: 'Aventura',
      price: 79.99,
      status: 'Em Desenvolvimento',
      sales: 0,
      rating: 0
    }
  ]);

  const CompanyForm = ({ company = null, onClose = () => {} }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="company-name" className="text-secondary-text">Nome da Empresa</Label>
        <Input
          id="company-name"
          defaultValue={company?.name || ''}
          className="bg-main-bg border-border text-main-text"
          placeholder="Digite o nome da empresa"
        />
      </div>
      <div>
        <Label htmlFor="company-description" className="text-secondary-text">Descrição</Label>
        <Textarea
          id="company-description"
          defaultValue={company?.description || ''}
          className="bg-main-bg border-border text-main-text"
          placeholder="Descreva a empresa"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="company-founded" className="text-secondary-text">Ano de Fundação</Label>
        <Input
          id="company-founded"
          type="number"
          defaultValue={company?.founded || ''}
          className="bg-main-bg border-border text-main-text"
          placeholder="2023"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button className="bg-accent-purple hover:bg-accent-hover">
          <Save className="w-4 h-4 mr-2" />
          {company ? 'Atualizar' : 'Criar'} Empresa
        </Button>
      </div>
    </div>
  );

  const CategoryForm = ({ category = null, onClose = () => {} }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category-name" className="text-secondary-text">Nome da Categoria</Label>
        <Input
          id="category-name"
          defaultValue={category?.name || ''}
          className="bg-main-bg border-border text-main-text"
          placeholder="Digite o nome da categoria"
        />
      </div>
      <div>
        <Label htmlFor="category-description" className="text-secondary-text">Descrição</Label>
        <Textarea
          id="category-description"
          defaultValue={category?.description || ''}
          className="bg-main-bg border-border text-main-text"
          placeholder="Descreva a categoria"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="category-color" className="text-secondary-text">Cor da Categoria</Label>
        <Input
          id="category-color"
          type="color"
          defaultValue={category?.color || '#9146FF'}
          className="bg-main-bg border-border h-12 w-20"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button className="bg-accent-purple hover:bg-accent-hover">
          <Save className="w-4 h-4 mr-2" />
          {category ? 'Atualizar' : 'Criar'} Categoria
        </Button>
      </div>
    </div>
  );

  const GameForm = ({ game = null, onClose = () => {} }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="game-name" className="text-secondary-text">Nome do Jogo</Label>
          <Input
            id="game-name"
            defaultValue={game?.name || ''}
            className="bg-main-bg border-border text-main-text"
            placeholder="Digite o nome do jogo"
          />
        </div>
        <div>
          <Label htmlFor="game-price" className="text-secondary-text">Preço (R$)</Label>
          <Input
            id="game-price"
            type="number"
            step="0.01"
            defaultValue={game?.price || ''}
            className="bg-main-bg border-border text-main-text"
            placeholder="99.99"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="game-company" className="text-secondary-text">Empresa</Label>
          <Select defaultValue={game?.company || ''}>
            <SelectTrigger className="bg-main-bg border-border text-main-text">
              <SelectValue placeholder="Selecione a empresa" />
            </SelectTrigger>
            <SelectContent className="bg-secondary-bg border-border">
              {companies.map((company, index) => (
                <SelectItem key={`company-${company.id}-${index}`} value={company.name} className="text-main-text">
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="game-category" className="text-secondary-text">Categoria</Label>
          <Select defaultValue={game?.category || ''}>
            <SelectTrigger className="bg-main-bg border-border text-main-text">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent className="bg-secondary-bg border-border">
              {categories.map((category, index) => (
                <SelectItem key={`category-${category.id}-${index}`} value={category.name} className="text-main-text">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="game-description" className="text-secondary-text">Descrição</Label>
        <Textarea
          id="game-description"
          className="bg-main-bg border-border text-main-text"
          placeholder="Descreva o jogo"
          rows={4}
        />
      </div>
      <div>
        <Label className="text-secondary-text">Imagem do Jogo</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-secondary-text mx-auto mb-4" />
          <p className="text-secondary-text">Clique para fazer upload da imagem</p>
          <input type="file" accept="image/*" className="hidden" />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button className="bg-accent-purple hover:bg-accent-hover">
          <Save className="w-4 h-4 mr-2" />
          {game ? 'Atualizar' : 'Criar'} Jogo
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <Button 
          onClick={() => onNavigate('admin')}
          variant="outline"
          className="mb-4 border-border text-secondary-text hover:text-main-text"
        >
          ← Voltar para Admin
        </Button>
        
        <h1 className="text-main-text mb-2">Gerenciamento</h1>
        <p className="text-secondary-text">Gerencie empresas, categorias e jogos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary-bg">
          <TabsTrigger value="companies" className="data-[state=active]:bg-accent-purple">
            <Building2 className="w-4 h-4 mr-2" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-accent-purple">
            <Tag className="w-4 h-4 mr-2" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="games" className="data-[state=active]:bg-accent-purple">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Jogos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-main-text">Empresas Cadastradas</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent-purple hover:bg-accent-hover">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Empresa
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-secondary-bg border-border max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-main-text">Nova Empresa</DialogTitle>
                  <DialogDescription className="text-secondary-text">
                    Preencha os dados da nova empresa
                  </DialogDescription>
                </DialogHeader>
                <CompanyForm />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="bg-secondary-bg border-border">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-main-text">{company.name}</CardTitle>
                      <CardDescription className="text-secondary-text">
                        Fundada em {company.founded}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-success border-success">
                      {company.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-text mb-4">{company.description}</p>
                  <p className="text-main-text font-bold">{company.games} jogos</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-error border-error hover:bg-error hover:text-white">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-main-text">Categorias de Jogos</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent-purple hover:bg-accent-hover">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-secondary-bg border-border">
                <DialogHeader>
                  <DialogTitle className="text-main-text">Nova Categoria</DialogTitle>
                  <DialogDescription className="text-secondary-text">
                    Preencha os dados da nova categoria
                  </DialogDescription>
                </DialogHeader>
                <CategoryForm />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="bg-secondary-bg border-border">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <CardTitle className="text-main-text">{category.name}</CardTitle>
                        <CardDescription className="text-secondary-text">
                          {category.games} jogos
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary-text mb-4">{category.description}</p>
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-error border-error hover:bg-error hover:text-white">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-main-text">Jogos Cadastrados</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent-purple hover:bg-accent-hover">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Jogo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-secondary-bg border-border max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-main-text">Novo Jogo</DialogTitle>
                  <DialogDescription className="text-secondary-text">
                    Preencha os dados do novo jogo
                  </DialogDescription>
                </DialogHeader>
                <GameForm />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {games.map((game) => (
              <Card key={game.id} className="bg-secondary-bg border-border">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <h3 className="text-main-text font-bold">{game.name}</h3>
                      <p className="text-secondary-text">{game.company}</p>
                    </div>
                    <div>
                      <Badge style={{ backgroundColor: categories.find(c => c.name === game.category)?.color }}>
                        {game.category}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-accent-purple font-bold">R$ {game.price.toFixed(2)}</p>
                      <p className="text-secondary-text text-sm">{game.sales} vendas</p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Badge variant={game.status === 'Publicado' ? 'default' : 'outline'}>
                        {game.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-error border-error hover:bg-error hover:text-white">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}