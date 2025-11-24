import { useState } from "react";
import { Search, ShoppingCart, Settings, User, LogOut } from "lucide-react";
import { PageType } from "../App";
import { MiniCart } from "./MiniCart";
import { AuthModal } from "./AuthModal";
import { Button } from "./ui/button";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { Avatar } from "./Avatar";
import logoImage from "figma:asset/51b39ac868a401500b18dd358f02e1e4ae10abe0.png";

interface HeaderProps {
  onNavigate: (page: PageType) => void;
  onSearchChange: (term: string) => void;
}

export function Header({ onNavigate, onSearchChange }: HeaderProps) {
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  // O termo digitado é gerenciado localmente no Header
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const { user, isAuthenticated, logout, hasPermission } = useAuth();
  const { cartCount } = useCart();

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // FUNÇÃO DE BUSCA: Lida com a mudança no input e envia para o componente pai
  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const term = event.target.value;
    setLocalSearchTerm(term);
    // Chama o callback prop para notificar o App sobre a mudança
    onSearchChange(term);
  };

  // Lógica para limpar a busca e navegar
  const handleLogoClick = () => {
    // Limpa a busca e notifica o App para resetar o filtro
    setLocalSearchTerm("");
    onSearchChange("");
    onNavigate("home");
  };

  return (
    <>
      <MiniCart
        isOpen={isMiniCartOpen}
        onClose={() => setIsMiniCartOpen(false)}
        onNavigate={onNavigate}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onLogin={() => {
          onNavigate("profile");
        }}
      />
      <header className="bg-[#2A2A2A] border-b border-[#3A3A3A]" role="banner">
        <nav
          className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center"
          role="navigation"
          aria-label="Navegação principal"
        >
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="hover:opacity-80 transition flex-shrink-0"
            aria-label="SYNTHX - Ir para página inicial"
          >
            <img
              src={logoImage}
              alt="SYNTHX.com"
              className="h-8 sm:h-10 md:h-12 w-auto max-w-[160px] sm:max-w-[200px] md:max-w-[240px]"
            />
          </button>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Buscar por jogos"
                value={localSearchTerm}
                onChange={handleSearchInputChange}
                className="w-full bg-[#1A1A1A] border border-[#404040] text-white placeholder-gray-400 rounded-lg py-2.5 md:py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                aria-label="Campo de busca"
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search Button - Sem campo de busca mobile por simplificação */}
          <div className="md:hidden flex-1 flex justify-center">
            <button className="text-gray-400 hover:text-white transition">
              <Search className="w-6 h-6" />
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 flex-shrink-0">
            {/* Cart */}
            <button
              onClick={() => setIsMiniCartOpen(true)}
              className="relative text-gray-300 hover:text-white transition"
              aria-label={`Carrinho de compras - ${cartCount} ${
                cartCount === 1 ? "item" : "itens"
              }`}
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-bold"
                  aria-hidden="true"
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {isAuthenticated && user ? (
              <>
                {/* User Avatar when logged in */}
                <button
                  onClick={() => onNavigate("profile")}
                  className="hover:opacity-80 transition flex items-center space-x-2"
                  title="Meu Perfil"
                  aria-label={`Perfil de ${user.name}`}
                >
                  <Avatar
                    name={user.name}
                    size={40}
                    className="border-2 border-accent-purple"
                  />
                  <span className="hidden md:block text-main-text text-sm">
                    {user.name}
                  </span>
                </button>

                {/* Admin Settings - only show if user has admin permissions */}
                {hasPermission("manage_companies") && (
                  <button
                    onClick={() => onNavigate("admin")}
                    className="hidden sm:block text-gray-400 hover:text-white transition"
                    title="Painel do Administrador"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="hidden sm:flex items-center text-gray-400 hover:text-white transition"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Button
                  onClick={() => openAuthModal("login")}
                  variant="ghost"
                  className="hidden sm:flex text-gray-300 hover:text-white hover:bg-gray-700 transition"
                >
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Button>

                {/* Register Button */}
                <Button
                  onClick={() => openAuthModal("register")}
                  className="bg-accent-purple hover:bg-accent-hover text-white transition"
                >
                  Cadastrar
                </Button>

                {/* Mobile Login Icon */}
                <button
                  onClick={() => openAuthModal("login")}
                  className="sm:hidden text-gray-300 hover:text-white transition"
                  title="Entrar"
                >
                  <User className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
