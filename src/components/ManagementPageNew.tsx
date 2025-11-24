import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { PageType } from '../App';
import { Building2, Tag, Gamepad2, Plus, Edit, Trash2, Save, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useAPI } from './useAPI';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// --- INTERFACES E COMPONENTES AUXILIARES ---

interface FormProps {
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  closeDialog: () => void;
  companies?: any[];
  categories?: any[];
}

// --- FORMULÁRIO DE EMPRESA ---
const CompanyForm = ({ formData, setFormData, handleSubmit, isLoading, closeDialog }: FormProps) => (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <Label htmlFor="company-name" className="text-secondary-text">Nome da Empresa</Label>
      <Input
        id="company-name"
        value={formData.name || formData.nome || ''}
        onChange={(e) => setFormData({ ...formData, name: e.target.value, nome: e.target.value })}
        className="bg-main-bg border-border text-main-text"
        placeholder="Ex: Nintendo"
        required
        autoFocus
      />
    </div>
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
      <Button type="submit" className="bg-accent-purple hover:bg-accent-hover" disabled={isLoading}>
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Salvar
      </Button>
    </div>
  </form>
);

// --- FORMULÁRIO DE JOGO (COM CARROSSEL) ---
const GameForm = ({ formData, setFormData, handleSubmit, isLoading, closeDialog, companies = [], categories = [] }: FormProps) => {
  
  // Adiciona um novo campo vazio ao array de carrossel
  const addCarouselImage = () => {
    const currentImages = Array.isArray(formData.carousel) ? formData.carousel : [];
    setFormData({ ...formData, carousel: [...currentImages, ''] });
  };

  // Remove uma imagem específica do array pelo índice
  const removeCarouselImage = (index: number) => {
    const currentImages = [...(Array.isArray(formData.carousel) ? formData.carousel : [])];
    currentImages.splice(index, 1);
    setFormData({ ...formData, carousel: currentImages });
  };

  // Atualiza o texto de um link específico no array
  const updateCarouselImage = (index: number, value: string) => {
    const currentImages = [...(Array.isArray(formData.carousel) ? formData.carousel : [])];
    currentImages[index] = value;
    setFormData({ ...formData, carousel: currentImages });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Dados Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="game-name" className="text-secondary-text">Nome do Jogo</Label>
          <Input
            id="game-name"
            value={formData.name || formData.nome || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value, nome: e.target.value })}
            className="bg-main-bg border-border text-main-text"
            required
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="game-price" className="text-secondary-text">Preço (R$)</Label>
          <Input
            id="game-price"
            type="number"
            step="0.01"
            value={formData.price || formData.preco || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value), preco: parseFloat(e.target.value) })}
            className="bg-main-bg border-border text-main-text"
            required
          />
        </div>
        <div>
          <Label htmlFor="game-year" className="text-secondary-text">Ano</Label>
          <Input
            id="game-year"
            type="number"
            value={formData.year || formData.ano || ''}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value), ano: parseInt(e.target.value) })}
            className="bg-main-bg border-border text-main-text"
            required
          />
        </div>
      </div>
      
      {/* Selects de Relacionamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="game-company" className="text-secondary-text">Empresa</Label>
          <Select
            value={String(formData.fkEmpresa || formData.fk_empresa || '')}
            onValueChange={(value) => setFormData({ ...formData, fkEmpresa: value, fk_empresa: value })}
          >
            <SelectTrigger className="bg-main-bg border-border text-main-text">
              <SelectValue placeholder="Selecione a empresa" />
            </SelectTrigger>
            <SelectContent className="bg-secondary-bg border-border">
              {companies.map((company) => (
                <SelectItem key={company.id} value={String(company.id)} className="text-main-text">
                  {company.name || company.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="game-category" className="text-secondary-text">Categoria</Label>
          <Select
            value={String(formData.fkCategoria || formData.fk_categoria || '')}
            onValueChange={(value) => setFormData({ ...formData, fkCategoria: value, fk_categoria: value })}
          >
            <SelectTrigger className="bg-main-bg border-border text-main-text">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent className="bg-secondary-bg border-border">
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)} className="text-main-text">
                  {category.name || category.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- GERENCIAMENTO DE IMAGENS --- */}
      <div className="space-y-4 border border-border p-4 rounded-md bg-main-bg/30">
        <h3 className="text-main-text font-semibold flex items-center gap-2 text-sm">
          <ImageIcon className="w-4 h-4 text-accent-purple" /> Imagens e Mídia
        </h3>

        {/* Poster Principal */}
        <div>
          <Label htmlFor="game-poster" className="text-secondary-text text-xs uppercase tracking-wider">Poster Principal (URL)</Label>
          <Input
            id="game-poster"
            value={formData.poster || ''}
            onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
            className="bg-main-bg border-border text-main-text mt-1"
            placeholder="https://exemplo.com/poster.jpg"
          />
        </div>

        {/* Carrossel Dinâmico */}
        <div>
          <Label className="text-secondary-text text-xs uppercase tracking-wider mb-2 block">Carrossel de Imagens</Label>
          
          <div className="space-y-3">
            {(Array.isArray(formData.carousel) ? formData.carousel : []).map((url: string, index: number) => (
              <div key={index} className="flex gap-2 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-secondary-text text-xs w-4">{index + 1}.</span>
                <Input
                  value={url}
                  onChange={(e) => updateCarouselImage(index, e.target.value)}
                  className="bg-main-bg border-border text-main-text flex-1"
                  placeholder={`Cole o link da imagem ${index + 1}`}
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon"
                  onClick={() => removeCarouselImage(index)}
                  className="h-10 w-10 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addCarouselImage}
            className="mt-3 w-full border-dashed border-border text-secondary-text hover:text-main-text hover:border-accent-purple hover:bg-accent-purple/10"
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Imagem ao Carrossel
          </Button>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="game-description" className="text-secondary-text">Descrição</Label>
        <Textarea
          id="game-description"
          value={formData.description || formData.descricao || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value, descricao: e.target.value })}
          className="bg-main-bg border-border text-main-text"
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
        <Button type="submit" className="bg-accent-purple hover:bg-accent-hover" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Jogo
        </Button>
      </div>
    </form>
  );
};

// --- COMPONENTE PRINCIPAL ---

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

  // Verificação de Permissão
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

  // Carrega dados ao mudar a aba
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'companies' || activeTab === 'games') {
        const result = await api.getCompanies();
        const list = Array.isArray(result) ? result : (result?.companies || []);
        // Deduplicação por ID
        const uniqueCompanies = Array.from(new Map(list.map((c: any) => [c.id, c])).values());
        setCompanies(uniqueCompanies);
      } 
      
      if (activeTab === 'categories' || activeTab === 'games') {
        const result = await api.getCategories();
        const list = Array.isArray(result) ? result : (result?.categories || []);
        const uniqueCategories = Array.from(new Map(list.map((c: any) => [c.id, c])).values());
        setCategories(uniqueCategories);
      } 
      
      if (activeTab === 'games') {
        const result = await api.getAllGames();
        const list = Array.isArray(result) ? result : (result?.games || []);
        const uniqueGames = Array.from(new Map(list.map((g: any) => [g.id, g])).values());
        setGames(uniqueGames);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Abre o modal preparando os dados
  const openDialog = (item: any = null) => {
    setEditingItem(item);
    
    if (item) {
        // LÓGICA DE RECUPERAÇÃO DO CARROSSEL
        // Tenta converter se for string JSON ou usa direto se for Array
        let loadedCarousel: string[] = [];
        try {
            if (Array.isArray(item.carousel)) {
                loadedCarousel = item.carousel;
            } else if (typeof item.carousel === 'string' && item.carousel.trim() !== '') {
                // Tenta fazer parse se vier como string do banco
                const parsed = JSON.parse(item.carousel);
                loadedCarousel = Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.warn("Falha ao parsear carrossel, iniciando vazio:", error);
            loadedCarousel = [];
        }

        setFormData({ 
            ...item,
            poster: item.poster || item.imagem || '', // Recupera poster ou imagem antiga
            carousel: loadedCarousel 
        });
    } else {
        // Criação: Inicializa arrays vazios
        setFormData({ carousel: [], poster: '' });
    }
    
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  // Envia os dados para a API
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
      } else if (activeTab === 'games') {
        
        // LIMPEZA DO CARROSSEL: Remove strings vazias
        const cleanCarousel = (Array.isArray(formData.carousel) ? formData.carousel : [])
            .filter((url: string) => url && url.trim() !== '');

        const payload = {
            nome: formData.name || formData.nome,
            descricao: formData.description || formData.descricao,
            ano: Number(formData.year || formData.ano),
            preco: Number(formData.price || formData.preco),
            desconto: 0,
            fkEmpresa: Number(formData.fkEmpresa),
            fkCategoria: Number(formData.fkCategoria),
            // ENVIA AS IMAGENS
            poster: formData.poster || '',
            carousel: cleanCarousel // Envia como array (se seu back aceitar) ou use JSON.stringify(cleanCarousel)
        };

        if (editingItem) {
          result = await api.updateGame(editingItem.id, payload);
        } else {
          result = await api.createGame(payload);
        }
      }

      // Verificação flexível de sucesso (aceita objeto de resposta ou apenas status 200 implícito)
      if (result || result === undefined) {
        toast.success(editingItem ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
        closeDialog();
        await loadData();
      } else {
        toast.error('O servidor retornou um erro inesperado.');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar. Verifique o console.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;

    setIsLoading(true);
    try {
      let result;
      if (activeTab === 'companies') {
        result = await api.deleteCompany(id);
      } else if (activeTab === 'games') {
        result = await api.deleteGame(id);
      }

      toast.success('Excluído com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erro ao excluir');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <Button 
          onClick={() => onNavigate('admin')}
          variant="outline"
          className="mb-4 border-border text-secondary-text hover:text-main-text"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Admin
        </Button>
        
        <h1 className="text-main-text mb-2 text-2xl font-bold">Gerenciamento de Conteúdo</h1>
        <p className="text-secondary-text">Adicione, edite ou remova jogos e empresas.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary-bg border border-border">
          <TabsTrigger value="companies" className="data-[state=active]:bg-accent-purple data-[state=active]:text-white">
            <Building2 className="w-4 h-4 mr-2" /> Empresas
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-accent-purple data-[state=active]:text-white">
            <Tag className="w-4 h-4 mr-2" /> Categorias
          </TabsTrigger>
          <TabsTrigger value="games" className="data-[state=active]:bg-accent-purple data-[state=active]:text-white">
            <Gamepad2 className="w-4 h-4 mr-2" /> Jogos
          </TabsTrigger>
        </TabsList>

        {/* CONTEÚDO EMPRESAS */}
        <TabsContent value="companies" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-main-text text-xl">Empresas ({companies.length})</h2>
            <Button onClick={() => openDialog()} className="bg-accent-purple hover:bg-accent-hover">
              <Plus className="w-4 h-4 mr-2" /> Nova Empresa
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Card key={company.id} className="bg-secondary-bg border-border">
                  <CardHeader>
                    <CardTitle className="text-main-text">{company.name || company.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openDialog(company)}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(company.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* CONTEÚDO CATEGORIAS */}
        <TabsContent value="categories" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-main-text text-xl">Categorias ({categories.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="bg-secondary-bg border-border opacity-80">
                  <CardHeader>
                    <CardTitle className="text-main-text">{category.name || category.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-xs text-secondary-text italic">Somente Leitura</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* CONTEÚDO JOGOS */}
        <TabsContent value="games" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-main-text text-xl">Jogos ({games.length})</h2>
            <Button onClick={() => openDialog()} className="bg-accent-purple hover:bg-accent-hover">
              <Plus className="w-4 h-4 mr-2" /> Novo Jogo
            </Button>
          </div>
           <div className="grid grid-cols-1 gap-4">
              {games.map((game) => (
                <Card key={game.id} className="bg-secondary-bg border-border flex flex-row items-center p-4">
                  <div className="flex-1">
                    <h3 className="text-main-text font-bold">{game.name || game.nome}</h3>
                    <p className="text-secondary-text text-sm">R$ {game.price || game.preco}</p>
                  </div>
                  <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openDialog(game)}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(game.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-secondary-bg border-border max-w-2xl max-h-[90vh] overflow-y-auto text-main-text">
          <DialogHeader>
            <DialogTitle className="text-main-text">
              {editingItem ? 'Editar' : 'Novo'} {activeTab === 'companies' ? 'Empresa' : 'Jogo'}
            </DialogTitle>
          </DialogHeader>
          
          {/* Renderização Condicional dos Formulários */}
          {activeTab === 'companies' && (
            <CompanyForm 
                formData={formData} 
                setFormData={setFormData} 
                handleSubmit={handleSubmit} 
                isLoading={isLoading} 
                closeDialog={closeDialog} 
            />
          )}
          {activeTab === 'games' && (
            <GameForm 
                formData={formData} 
                setFormData={setFormData} 
                handleSubmit={handleSubmit} 
                isLoading={isLoading} 
                closeDialog={closeDialog}
                companies={companies}
                categories={categories}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}