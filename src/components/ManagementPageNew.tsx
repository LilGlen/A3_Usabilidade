import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { PageType } from '../App';
import { Building2, Tag, Gamepad2, Plus, Edit, Trash2, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useAPI } from './useAPI';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';

interface ManagementPageProps {
  onNavigate: (page: PageType) => void;
}

export function ManagementPageNew({ onNavigate }: ManagementPageProps) {
  const [activeTab, setActiveTab] = useState('companies');
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  const api = useAPI();
  const { hasPermission } = useAuth();

  // Check permissions
  if (!hasPermission('manage_companies')) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <Card className="w-96 bg-secondary-bg border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-main-text">Acesso Negado</CardTitle>
            <CardDescription className="text-secondary-text">
              Você não tem permissão para acessar esta página.
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
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'companies') {
        const result = await api.getCompanies();
        if (result?.success) {
          // Remove duplicates by id
          const uniqueCompanies = Array.from(
            new Map((result.companies || []).map((c: any) => [c.id, c])).values()
          );
          setCompanies(uniqueCompanies);
        }
      } else if (activeTab === 'categories') {
        const result = await api.getCategories();
        if (result?.success) {
          // Remove duplicates by id
          const uniqueCategories = Array.from(
            new Map((result.categories || []).map((c: any) => [c.id, c])).values()
          );
          setCategories(uniqueCategories);
        }
      } else if (activeTab === 'games') {
        const [gamesResult, companiesResult, categoriesResult] = await Promise.all([
          api.getGames(),
          api.getCompanies(),
          api.getCategories()
        ]);
        if (gamesResult?.success) {
          // Remove duplicates by id
          const uniqueGames = Array.from(
            new Map((gamesResult.games || []).map((g: any) => [g.id, g])).values()
          );
          setGames(uniqueGames);
        }
        if (companiesResult?.success) {
          // Remove duplicates by id
          const uniqueCompanies = Array.from(
            new Map((companiesResult.companies || []).map((c: any) => [c.id, c])).values()
          );
          setCompanies(uniqueCompanies);
        }
        if (categoriesResult?.success) {
          // Remove duplicates by id
          const uniqueCategories = Array.from(
            new Map((categoriesResult.categories || []).map((c: any) => [c.id, c])).values()
          );
          setCategories(uniqueCategories);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (item: any = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      
      if (activeTab === 'companies') {
        if (editingItem) {
          result = await api.updateCompany(editingItem.id, formData);
        } else {
          result = await api.createCompany(formData);
        }
      } else if (activeTab === 'categories') {
        if (editingItem) {
          result = await api.updateCategory(editingItem.id, formData);
        } else {
          result = await api.createCategory(formData);
        }
      } else if (activeTab === 'games') {
        if (editingItem) {
          result = await api.updateGame(editingItem.id, formData);
        } else {
          result = await api.createGame(formData);
        }
      }

      if (result?.success) {
        toast.success(editingItem ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
        closeDialog();
        await loadData();
      } else {
        toast.error('Erro ao salvar');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;

    setIsLoading(true);
    try {
      let result;
      
      if (activeTab === 'companies') {
        result = await api.deleteCompany(id);
      } else if (activeTab === 'categories') {
        result = await api.deleteCategory(id);
      } else if (activeTab === 'games') {
        result = await api.deleteGame(id);
      }

      if (result?.success) {
        toast.success('Excluído com sucesso!');
        await loadData();
      } else {
        toast.error('Erro ao excluir');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erro ao excluir');
    } finally {
      setIsLoading(false);
    }
  };

  const CompanyForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="company-name" className="text-secondary-text">Nome da Empresa</Label>
        <Input
          id="company-name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-main-bg border-border text-main-text"
          placeholder="Digite o nome da empresa"
          required
          aria-label="Nome da empresa"
        />
      </div>
      <div>
        <Label htmlFor="company-description" className="text-secondary-text">Descrição</Label>
        <Textarea
          id="company-description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-main-bg border-border text-main-text"
          placeholder="Descreva a empresa"
          rows={3}
          aria-label="Descrição da empresa"
        />
      </div>
      <div>
        <Label htmlFor="company-founded" className="text-secondary-text">Ano de Fundação</Label>
        <Input
          id="company-founded"
          type="number"
          value={formData.founded || ''}
          onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
          className="bg-main-bg border-border text-main-text"
          placeholder="2023"
          required
          aria-label="Ano de fundação"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
        <Button type="submit" className="bg-accent-purple hover:bg-accent-hover" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {editingItem ? 'Atualizar' : 'Criar'} Empresa
        </Button>
      </div>
    </form>
  );

  const CategoryForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category-name" className="text-secondary-text">Nome da Categoria</Label>
        <Input
          id="category-name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-main-bg border-border text-main-text"
          placeholder="Digite o nome da categoria"
          required
          aria-label="Nome da categoria"
        />
      </div>
      <div>
        <Label htmlFor="category-description" className="text-secondary-text">Descrição</Label>
        <Textarea
          id="category-description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-main-bg border-border text-main-text"
          placeholder="Descreva a categoria"
          rows={3}
          aria-label="Descrição da categoria"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
        <Button type="submit" className="bg-accent-purple hover:bg-accent-hover" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {editingItem ? 'Atualizar' : 'Criar'} Categoria
        </Button>
      </div>
    </form>
  );

  const GameForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="game-name" className="text-secondary-text">Nome do Jogo</Label>
          <Input
            id="game-name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-main-bg border-border text-main-text"
            placeholder="Digite o nome do jogo"
            required
            aria-label="Nome do jogo"
          />
        </div>
        <div>
          <Label htmlFor="game-price" className="text-secondary-text">Preço (R$)</Label>
          <Input
            id="game-price"
            type="number"
            step="0.01"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="bg-main-bg border-border text-main-text"
            placeholder="99.99"
            required
            aria-label="Preço do jogo"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="game-company" className="text-secondary-text">Empresa</Label>
          <Select
            value={formData.company || ''}
            onValueChange={(value) => setFormData({ ...formData, company: value })}
          >
            <SelectTrigger className="bg-main-bg border-border text-main-text" aria-label="Empresa do jogo">
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
          <Select
            value={formData.category || ''}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="bg-main-bg border-border text-main-text" aria-label="Categoria do jogo">
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
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-main-bg border-border text-main-text"
          placeholder="Descreva o jogo"
          rows={4}
          aria-label="Descrição do jogo"
        />
      </div>
      <div>
        <Label htmlFor="game-image" className="text-secondary-text">URL da Imagem</Label>
        <Input
          id="game-image"
          value={formData.image || ''}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="bg-main-bg border-border text-main-text"
          placeholder="https://..."
          aria-label="URL da imagem do jogo"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
        <Button type="submit" className="bg-accent-purple hover:bg-accent-hover" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {editingItem ? 'Atualizar' : 'Criar'} Jogo
        </Button>
      </div>
    </form>
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <Button 
          onClick={() => onNavigate('admin')}
          variant="outline"
          className="mb-4 border-border text-secondary-text hover:text-main-text"
          aria-label="Voltar para painel administrativo"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Admin
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
            <h2 className="text-main-text">Empresas Cadastradas ({companies.length})</h2>
            <Button
              onClick={() => openDialog()}
              className="bg-accent-purple hover:bg-accent-hover"
              aria-label="Criar nova empresa"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
            </div>
          ) : companies.length === 0 ? (
            <Card className="bg-secondary-bg border-border">
              <CardContent className="p-12 text-center">
                <Building2 className="w-12 h-12 text-secondary-text mx-auto mb-4" />
                <p className="text-secondary-text">Nenhuma empresa cadastrada</p>
              </CardContent>
            </Card>
          ) : (
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-secondary-text mb-4">{company.description}</p>
                    <p className="text-main-text">{company.games || 0} jogos</p>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(company)}
                        aria-label={`Editar ${company.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-error border-error hover:bg-error hover:text-white"
                        onClick={() => handleDelete(company.id)}
                        aria-label={`Excluir ${company.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-main-text">Categorias de Jogos ({categories.length})</h2>
            <Button
              onClick={() => openDialog()}
              className="bg-accent-purple hover:bg-accent-hover"
              aria-label="Criar nova categoria"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <Card className="bg-secondary-bg border-border">
              <CardContent className="p-12 text-center">
                <Tag className="w-12 h-12 text-secondary-text mx-auto mb-4" />
                <p className="text-secondary-text">Nenhuma categoria cadastrada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="bg-secondary-bg border-border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-main-text">{category.name}</CardTitle>
                        <CardDescription className="text-secondary-text">
                          {category.games || 0} jogos
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-secondary-text mb-4">{category.description}</p>
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(category)}
                        aria-label={`Editar ${category.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-error border-error hover:bg-error hover:text-white"
                        onClick={() => handleDelete(category.id)}
                        aria-label={`Excluir ${category.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-main-text">Jogos Cadastrados ({games.length})</h2>
            <Button
              onClick={() => openDialog()}
              className="bg-accent-purple hover:bg-accent-hover"
              aria-label="Criar novo jogo"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Jogo
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
            </div>
          ) : games.length === 0 ? (
            <Card className="bg-secondary-bg border-border">
              <CardContent className="p-12 text-center">
                <Gamepad2 className="w-12 h-12 text-secondary-text mx-auto mb-4" />
                <p className="text-secondary-text">Nenhum jogo cadastrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <Card key={game.id} className="bg-secondary-bg border-border">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <h3 className="text-main-text">{game.name}</h3>
                        <p className="text-secondary-text text-sm">{game.company}</p>
                      </div>
                      <div>
                        <Badge className="bg-accent-purple">{game.category}</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-accent-purple">R$ {game.price?.toFixed(2)}</p>
                        <p className="text-secondary-text text-sm">{game.sales || 0} vendas</p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(game)}
                          aria-label={`Editar ${game.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-error border-error hover:bg-error hover:text-white"
                          onClick={() => handleDelete(game.id)}
                          aria-label={`Excluir ${game.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for creating/editing */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-secondary-bg border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-main-text">
              {editingItem ? 'Editar' : 'Novo'}{' '}
              {activeTab === 'companies' ? 'Empresa' : activeTab === 'categories' ? 'Categoria' : 'Jogo'}
            </DialogTitle>
            <DialogDescription className="text-secondary-text">
              Preencha os dados abaixo
            </DialogDescription>
          </DialogHeader>
          {activeTab === 'companies' && <CompanyForm />}
          {activeTab === 'categories' && <CategoryForm />}
          {activeTab === 'games' && <GameForm />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
