import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLogin?: () => void;
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { login, register } = useAuth();

  // Sincroniza o mode interno com o initialMode quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    }
  }, [isOpen, initialMode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const success = await login(formData.email, formData.password);
        if (success) {
          toast.success('Login realizado com sucesso!');
          onClose();
          if (onLogin) {
            onLogin(); // Trigger navigation to profile page
          }
        } else {
          toast.error('Email ou senha incorretos. Execute o wizard de setup se for a primeira vez!');
        }
      } else {
        // Register mode
        if (formData.password !== formData.confirmPassword) {
          toast.error('As senhas não coincidem');
          setIsLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          toast.error('A senha deve ter no mínimo 6 caracteres');
          setIsLoading(false);
          return;
        }
        
        const success = await register(formData.name, formData.email, formData.password);
        if (success) {
          toast.success('Conta criada com sucesso! Você foi automaticamente logado.');
          onClose();
          if (onLogin) {
            onLogin(); // Trigger navigation to profile page
          }
        } else {
          toast.error('Email já cadastrado ou erro no servidor');
        }
      }
    } catch (error) {
      toast.error('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-secondary-bg rounded-xl shadow-2xl p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-secondary-text hover:text-main-text transition-colors duration-200 hover:bg-main-bg rounded-lg"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-main-text mb-2">
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </h2>
          <p className="text-secondary-text">
            {mode === 'login' ? 'Bem-vindo de volta!' : 'Junte-se à SYNTHX'}
          </p>
          {mode === 'login' && (
            <div className="mt-3 p-3 bg-main-bg rounded-lg border border-border">
              
              <div className="space-y-1 text-xs text-secondary-text">
              
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('synthx_setup_complete');
                    window.location.reload();
                  }}
                  className="text-xs text-accent-purple hover:underline mt-2 block"
                >
            
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <Label htmlFor="name" className="block text-secondary-text mb-2">
                Nome Completo
              </Label>
              <Input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-main-bg border border-border text-main-text rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-accent-purple transition"
                placeholder="Seu nome completo"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="block text-secondary-text mb-2">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full bg-main-bg border border-border text-main-text rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-accent-purple transition"
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="block text-secondary-text mb-2">
              Senha
            </Label>
            <Input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full bg-main-bg border border-border text-main-text rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-accent-purple transition"
              placeholder="Sua senha"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          {mode === 'register' && (
            <div>
              <Label htmlFor="confirmPassword" className="block text-secondary-text mb-2">
                Confirmar Senha
              </Label>
              <Input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full bg-main-bg border border-border text-main-text rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-accent-purple transition"
                placeholder="Confirme sua senha"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-accent-purple hover:bg-accent-hover text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'login' ? 'Entrando...' : 'Criando...'}
              </>
            ) : (
              mode === 'login' ? 'Entrar' : 'Criar Conta'
            )}
          </Button>

          {mode === 'login' && (
            <div className="text-center mt-4">
              <button 
                type="button"
                className="text-accent-purple hover:underline text-sm"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-6 pt-4 border-t border-border">
          <p className="text-secondary-text text-sm">
            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-accent-purple hover:underline font-bold ml-1"
            >
              {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
