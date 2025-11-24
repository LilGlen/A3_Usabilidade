import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PageType } from '../App';
import { useAuth } from './AuthContext';
import { useAPI } from './useAPI';
import { toast } from 'sonner';
import { 
  DollarSign,
  Trophy,
  Building2,
  FileText,
  Loader2,
  Gamepad2,
  LayoutList,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';

interface ManagementPageProps {
  onNavigate: (page: PageType) => void;
}

// Interfaces baseadas no retorno esperado
interface RelatorioItem {
  nome_jogo: string;
  nome_empresa: string;
  total_vendido: number;
}

interface Empresa {
  id: number;
  nome: string;
}

export function ManagementPageNew({ onNavigate }: ManagementPageProps) {
  const { hasPermission } = useAuth();
  const api = useAPI();
  
  const [activeTab, setActiveTab] = useState('reports');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);

  // Estados dos Relatórios
  const [topGamesGlobal, setTopGamesGlobal] = useState<RelatorioItem[]>([]);
  const [topGamesByCompany, setTopGamesByCompany] = useState<RelatorioItem[]>([]);
  
  // Controle do filtro de empresa
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");

  // Totais Cards
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0
  });

  // Verificação de permissão
  if (!hasPermission('view_reports')) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6">
        <Card className="max-w-md bg-[#1E1E1E] border-gray-800">
          <CardHeader>
            <CardTitle className="text-red-500">Acesso Negado</CardTitle>
            <CardDescription className="text-gray-400">
              Você não tem permissão para acessar a gestão.
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

  // Carga inicial (Global + Lista de Empresas)
  useEffect(() => {
    if (activeTab === 'reports') {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Relatório Global (Request 1 do Postman: ?top=10)
      const globalData = await api.getMostSoldGames(10);
      setTopGamesGlobal(normalizeData(globalData));

      // 2. Buscar lista de empresas
      const companiesRes = await api.getCompanies();
      
      const companiesList: Empresa[] = Array.isArray(companiesRes) 
        ? companiesRes 
        : (companiesRes?.companies || companiesRes?.empresas || []);
      
      setCompanies(companiesList);

      // Seleciona a primeira empresa por padrão se houver empresas carregadas
      if (companiesList.length > 0) {
        const firstCompanyId = companiesList[0].id.toString();
        const firstCompanyName = companiesList[0].nome;
        setSelectedCompanyId(firstCompanyId);
        setSelectedCompanyName(firstCompanyName);
      }

      // 3. KPI de totais
      const purchasesRes = await api.getPurchaseHistory();
      const purchasesList = Array.isArray(purchasesRes) ? purchasesRes : ((purchasesRes as any)?.vendas || []);
      const totalRev = purchasesList.reduce((acc: number, p: any) => acc + Number(p.valor_total || p.total || 0), 0);
      setStats({
        totalRevenue: totalRev,
        totalSales: purchasesList.length
      });

    } catch (error) {
      console.error("Erro ao carregar dados iniciais", error);
      toast.error("Erro ao carregar relatórios.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompanyReport = async (empresaId: number, empresaNome: string = "") => {
    if (!empresaId) {
      toast.error("Selecione uma empresa primeiro.");
      return;
    }
    
    setIsCompanyLoading(true);
    setTopGamesByCompany([]);
    
    try {
      const companyData = await api.getMostSoldGamesByCompany(empresaId!, 5);
      const normalizedData = normalizeData(companyData);
      setTopGamesByCompany(normalizedData);
      
      if (empresaNome) {
        setSelectedCompanyName(empresaNome);
      }
      
      if (normalizedData.length === 0) {
        toast.info(`Nenhuma venda encontrada para ${empresaNome || "a empresa selecionada"}`);
      } else {
        toast.success(`Dados carregados para ${empresaNome || "a empresa"}`);
      }
    } catch (error) {
      console.error("Erro ao carregar relatório por empresa", error);
      toast.error("Erro ao carregar dados da empresa.");
      setTopGamesByCompany([]);
    } finally {
      setIsCompanyLoading(false);
    }
  };

  // Handler para mudança de empresa no select
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    // Encontra o nome da empresa selecionada
    const selectedCompany = companies.find(emp => emp.id.toString() === companyId);
    if (selectedCompany) {
      setSelectedCompanyName(selectedCompany.nome);
    }
  };

  // Handler para o botão de buscar
  const handleSearchCompany = () => {
    if (!selectedCompanyId) {
      toast.error("Selecione uma empresa primeiro.");
      return;
    }
    
    const selectedCompany = companies.find(emp => emp.id.toString() === selectedCompanyId);
    loadCompanyReport(Number(selectedCompanyId), selectedCompany?.nome);
  };

  // Helper para garantir formato consistente
  const normalizeData = (data: any): RelatorioItem[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      nome_jogo: item.nome_jogo || item.nome || item.jogo || "Desconhecido",
      nome_empresa: item.nome_empresa || item.empresa || item.desenvolvedora || "N/A",
      total_vendido: Number(item.total_vendido || item.total || item.vendas || 0)
    }));
  };

  const renderReports = () => {
    if (isLoading && topGamesGlobal.length === 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <span className="ml-3 text-gray-400">Carregando relatórios...</span>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* CARDS DE KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="bg-[#1E1E1E] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-400 text-sm font-medium">Faturamento Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500 flex items-center gap-2">
                   <DollarSign className="w-6 h-6" />
                   R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
           </Card>

           <Card className="bg-[#1E1E1E] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-400 text-sm font-medium">Volume de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500 flex items-center gap-2">
                   <TrendingUp className="w-6 h-6" />
                   {stats.totalSales} pedidos
                </div>
              </CardContent>
           </Card>
        </div>

        {/* RELATÓRIO 1: JOGOS MAIS VENDIDOS (GERAL) */}
        <Card className="bg-[#1E1E1E] border-gray-800">
          <CardHeader className="border-b border-gray-800 bg-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top 10 Jogos Mais Vendidos (Geral)
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Ranking global de vendas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-900/50">
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="w-[80px] text-center text-gray-400 font-bold">Pos.</TableHead>
                  <TableHead className="text-gray-400 font-bold">Jogo</TableHead>
                  <TableHead className="text-gray-400 font-bold">Empresa</TableHead>
                  <TableHead className="text-right text-gray-400 font-bold pr-6">Qtd. Vendida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topGamesGlobal.length > 0 ? (
                  topGamesGlobal.map((jogo, index) => (
                    <TableRow key={index} className="border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <TableCell className="text-center font-bold text-gray-500">
                         {index < 3 ? (
                           <span className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto ${
                             index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                             index === 1 ? 'bg-gray-400/20 text-gray-300' :
                             'bg-orange-700/20 text-orange-500'
                           }`}>
                             #{index + 1}
                           </span>
                         ) : (
                           `#${index + 1}`
                         )}
                      </TableCell>
                      <TableCell className="font-medium text-white text-base">
                        {jogo.nome_jogo}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {jogo.nome_empresa}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <span className="font-mono text-lg text-purple-400 font-bold">
                          {jogo.total_vendido.toLocaleString('pt-BR')}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                      Nenhum dado encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* RELATÓRIO 2: JOGOS MAIS VENDIDOS POR EMPRESA */}
        <Card className="bg-[#1E1E1E] border-gray-800">
          <CardHeader className="border-b border-gray-800 bg-gray-900/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  Top 5 Jogos por Empresa
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {selectedCompanyName ? `Desempenho da empresa: ${selectedCompanyName}` : 'Selecione uma empresa para ver os dados'}
                </CardDescription>
              </div>
              
              {/* Filtro de Empresa com Botão de Busca */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
                  <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {companies.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleSearchCompany}
                  disabled={!selectedCompanyId || isCompanyLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCompanyLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span className="ml-2">Buscar</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 min-h-[150px]">
            {/* Loading Overlay Específico */}
            {isCompanyLoading ? (
               <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                  <span className="text-sm">Carregando dados da empresa...</span>
               </div>
            ) : (
            <Table>
              <TableHeader className="bg-gray-900/50">
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="w-[80px] text-center text-gray-400 font-bold">Rank</TableHead>
                  <TableHead className="text-gray-400 font-bold">Jogo</TableHead>
                  <TableHead className="text-right text-gray-400 font-bold pr-6">Vendas (Nesta Empresa)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topGamesByCompany.length > 0 ? (
                  topGamesByCompany.map((jogo, index) => (
                    <TableRow key={index} className="border-gray-800 hover:bg-gray-800/50 transition-colors">
                       <TableCell className="text-center font-bold text-gray-500">
                         #{index + 1}
                       </TableCell>
                      <TableCell className="font-medium text-white text-base">
                        {jogo.nome_jogo}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <span className="font-mono text-lg text-blue-400 font-bold">
                          {jogo.total_vendido.toLocaleString('pt-BR')}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                      {selectedCompanyId 
                        ? "Nenhuma venda encontrada para esta empresa ou clique em 'Buscar' para carregar os dados." 
                        : "Selecione uma empresa e clique em 'Buscar' para ver os dados."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-white mb-2 font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Gestão da Loja
            </h1>
            <p className="text-gray-400">
              Relatórios e gerenciamento de conteúdo
            </p>
          </div>
          <Button 
             variant="outline" 
             onClick={() => onNavigate('home')}
             className="border-gray-700 hover:bg-gray-800 text-gray-300"
          >
             Voltar à Loja
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#1E1E1E] border-b border-gray-800 w-full justify-start p-0 h-auto rounded-none mb-6">
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 px-6 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-purple-400 transition-all"
            >
              <FileText className="w-4 h-4 mr-2" /> 
              Relatórios
            </TabsTrigger>
            <TabsTrigger 
              value="games" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 px-6 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-purple-400 transition-all"
            >
              <Gamepad2 className="w-4 h-4 mr-2" /> 
              Jogos
            </TabsTrigger>
            <TabsTrigger 
              value="companies" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 px-6 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-purple-400 transition-all"
            >
              <LayoutList className="w-4 h-4 mr-2" /> 
              Empresas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-0">
            {renderReports()}
          </TabsContent>

          <TabsContent value="games">
             <div className="flex flex-col items-center justify-center py-20 bg-[#1E1E1E] rounded-lg border border-gray-800 text-center">
                <Gamepad2 className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white">Gestão de Jogos</h3>
                <p className="text-gray-400 max-w-md mt-2">
                   Funcionalidade de cadastro em desenvolvimento.
                </p>
             </div>
          </TabsContent>

          <TabsContent value="companies">
             <div className="flex flex-col items-center justify-center py-20 bg-[#1E1E1E] rounded-lg border border-gray-800 text-center">
                <Building2 className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white">Gestão de Empresas</h3>
                <p className="text-gray-400 max-w-md mt-2">
                   Funcionalidade de cadastro em desenvolvimento.
                </p>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}