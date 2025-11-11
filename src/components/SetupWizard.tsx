import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, Database, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-23051d03`;

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [seedComplete, setSeedComplete] = useState(false);
  const [adminComplete, setAdminComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setSeedComplete(false);
    setAdminComplete(false);
    setError(null);
    console.log('Setup wizard reset');
  };

  const seedDatabase = async () => {
    setIsSeeding(true);
    setError(null);

    try {
      console.log('Starting database seeding...');
      const response = await fetch(`${API_URL}/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      console.log('Seed response:', data);

      if (data.success) {
        console.log('✓ Database seeded successfully');
        setSeedComplete(true);
      } else {
        setError(data.error || 'Erro ao inicializar banco de dados');
      }
    } catch (err) {
      setError(`Erro de conexão: ${err}`);
      console.error('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const createAdminUser = async () => {
    setIsCreatingAdmin(true);
    setError(null);

    try {
      console.log('Creating admin user...');
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          name: 'Admin SYNTHX',
          email: 'admin@synthx.com',
          password: 'admin123',
          role: 'admin'
        })
      });

      const data = await response.json();
      console.log('Admin user creation response:', data);

      if (data.success) {
        console.log('✓ Admin user created successfully');
        console.log('User data:', data.user);
        console.log('✅ Você pode agora fazer login com: admin@synthx.com / admin123');
        setAdminComplete(true);
      } else if (data.error && data.error.includes('already')) {
        // User already exists - that's ok
        console.log('✓ Admin user already exists');
        console.log('✅ Você pode fazer login com: admin@synthx.com / admin123');
        setAdminComplete(true);
      } else {
        console.error('Error creating admin user:', data);
        setError(`Erro ao criar admin: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      setError(`Erro ao criar usuário administrador: ${err}`);
      console.error('Admin creation error:', err);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-[#1E1E1E] border-gray-800">
        <CardHeader>
          <CardTitle className="text-3xl text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-purple-600" />
            Configuração Inicial SYNTHX
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Configure o banco de dados e crie o usuário administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-800">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-red-400 ml-2">{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Seed Database */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl text-white font-semibold">1. Inicializar Banco de Dados</h3>
                <p className="text-gray-400 text-sm">Criar empresas, categorias e jogos iniciais</p>
              </div>
              {seedComplete && <CheckCircle className="w-6 h-6 text-green-500" />}
            </div>
            <Button
              onClick={seedDatabase}
              disabled={isSeeding || seedComplete}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inicializando...
                </>
              ) : seedComplete ? (
                'Banco de Dados Inicializado ✓'
              ) : (
                'Inicializar Banco de Dados'
              )}
            </Button>
          </div>

          {/* Step 2: Create Admin User */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl text-white font-semibold">2. Criar Usuário Administrador</h3>
                <p className="text-gray-400 text-sm">
                  Email: admin@synthx.com | Senha: admin123
                </p>
              </div>
              {adminComplete && <CheckCircle className="w-6 h-6 text-green-500" />}
            </div>
            <Button
              onClick={createAdminUser}
              disabled={isCreatingAdmin || adminComplete || !seedComplete}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400"
            >
              {isCreatingAdmin ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : adminComplete ? (
                'Administrador Criado ✓'
              ) : (
                'Criar Administrador'
              )}
            </Button>
          </div>

          {/* Complete Setup */}
          {seedComplete && adminComplete && (
            <div className="pt-6 border-t border-gray-800">
              <Alert className="bg-green-900/20 border-green-800 mb-4">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <AlertDescription className="text-green-400 ml-2">
                  Configuração concluída com sucesso!
                </AlertDescription>
              </Alert>
              <Button
                onClick={onComplete}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Ir para a Loja
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="pt-6 border-t border-gray-800">
            <h4 className="text-white font-semibold mb-2">Credenciais de Acesso</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p><strong className="text-gray-300">Administrador:</strong></p>
              <p>• Email: admin@synthx.com</p>
              <p>• Senha: admin123</p>
              <p className="pt-2"><strong className="text-gray-300">Usuário Teste:</strong></p>
              <p>• Crie uma nova conta no botão "Cadastrar"</p>
            </div>
            
            {/* Reset button */}
            {(seedComplete || adminComplete || error) && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full mt-4 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                Reiniciar Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
