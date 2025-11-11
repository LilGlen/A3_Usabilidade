import { useState } from 'react';
import { Gamepad2, Shield, Zap, Users } from 'lucide-react';
import { Button } from './ui/button';
import { AuthModal } from './AuthModal';
import logoImage from 'figma:asset/51b39ac868a401500b18dd358f02e1e4ae10abe0.png';

export function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-main-bg text-main-text overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-highlight/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo and Title Section */}
        <div className="text-center mb-12 animate-fadeIn">
          {/* SYNTHX Logo */}
          <div className="mb-6 relative flex justify-center">
            <div className="relative">
              <img 
                src={logoImage} 
                alt="SYNTHX.com" 
                className="h-24 sm:h-32 md:h-40 lg:h-48 w-auto"
              />
              <div className="absolute inset-0 blur-xl opacity-50">
                <img 
                  src={logoImage} 
                  alt="" 
                  className="h-24 sm:h-32 md:h-40 lg:h-48 w-auto"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-secondary-text mb-4 max-w-2xl mx-auto">
            Sua próxima aventura começa aqui
          </p>
          <p className="text-base md:text-lg text-secondary-text/80 mb-12 max-w-xl mx-auto">
            Descubra, compre e jogue os melhores jogos digitais em um só lugar
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              onClick={() => handleOpenAuth('login')}
              className="w-full sm:w-auto px-8 py-6 bg-accent-purple hover:bg-accent-hover text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(145,70,255,0.5)] group"
            >
              <Shield className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Entrar
            </Button>
            <Button
              onClick={() => handleOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-6 bg-secondary-bg hover:bg-secondary-bg/80 text-main-text border-2 border-accent-purple rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(145,70,255,0.3)] group"
            >
              <Users className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Criar Conta
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {/* Feature 1 */}
          <div className="bg-secondary-bg border border-border rounded-xl p-6 backdrop-blur-sm hover:border-accent-purple transition-all duration-300 hover:transform hover:scale-105 group">
            <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-purple/30 transition-colors">
              <Gamepad2 className="w-6 h-6 text-accent-purple" />
            </div>
            <h3 className="text-xl mb-2 text-main-text">
              Biblioteca Imensa
            </h3>
            <p className="text-secondary-text text-sm">
              Milhares de jogos digitais dos principais desenvolvedores e estúdios independentes
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-secondary-bg border border-border rounded-xl p-6 backdrop-blur-sm hover:border-accent-purple transition-all duration-300 hover:transform hover:scale-105 group">
            <div className="w-12 h-12 bg-cyan-highlight/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-highlight/30 transition-colors">
              <Zap className="w-6 h-6 text-cyan-highlight" />
            </div>
            <h3 className="text-xl mb-2 text-main-text">
              Download Instantâneo
            </h3>
            <p className="text-secondary-text text-sm">
              Compre e jogue imediatamente. Sem espera, sem complicações
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-secondary-bg border border-border rounded-xl p-6 backdrop-blur-sm hover:border-accent-purple transition-all duration-300 hover:transform hover:scale-105 group">
            <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-purple/30 transition-colors">
              <Shield className="w-6 h-6 text-accent-purple" />
            </div>
            <h3 className="text-xl mb-2 text-main-text">
              Compra Segura
            </h3>
            <p className="text-secondary-text text-sm">
              Transações protegidas e dados criptografados para sua segurança
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-secondary-text text-sm">
            Primeira vez aqui?{' '}
            <button
              onClick={() => {
                localStorage.removeItem('synthx_setup_complete');
                window.location.reload();
              }}
              className="text-accent-purple hover:underline font-medium"
            >
              Execute o wizard de setup
            </button>
          </p>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onLogin={() => {
          // Modal fechará automaticamente após login bem-sucedido
          // O App.tsx detectará a autenticação e mudará para a HomePage
        }}
      />

      <style>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </div>
  );
}
