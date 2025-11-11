import { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { GameDetailsPageNew } from "./components/GameDetailsPageNew";
import { AdminPageComplete } from "./components/AdminPageComplete";
import { UserProfilePageNew } from "./components/UserProfilePageNew";
import { ManagementPageNew } from "./components/ManagementPageNew";
import { CheckoutPageNew } from "./components/CheckoutPageNew";
import { LandingPage } from "./components/LandingPage";
import { ToastProvider } from "./components/ToastProvider";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { CartProvider } from "./components/CartContext";

export type PageType =
  | "home"
  | "details"
  | "admin"
  | "profile"
  | "management"
  | "checkout";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [pageData, setPageData] = useState<any>(null);
  const navigateToPage = (page: PageType, data?: any) => {
    setCurrentPage(page);
    setPageData(data || null);
    window.scrollTo(0, 0);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <AppContent
            currentPage={currentPage}
            pageData={pageData}
            navigateToPage={navigateToPage}
          />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

function AppContent({
  currentPage,
  pageData,
  navigateToPage,
}: {
  currentPage: PageType;
  pageData: any;
  navigateToPage: (page: PageType, data?: any) => void;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-text">Carregando...</p>
        </div>
      </div>
    );
  }

  // Define páginas públicas (que não precisam de login)
  const isPublicPage = currentPage === "home" || currentPage === "details";

  // Se o usuário não estiver autenticado E tentar acessar uma página restrita,
  // renderiza a LandingPage (tela de login/cadastro).
  if (!isAuthenticated && !isPublicPage) {
    return <LandingPage />;
  }

  // A partir daqui, o usuário está:
  // 1. Autenticado (e pode ver qualquer página) OU
  // 2. Não autenticado, mas está em uma página pública ("home" ou "details").

  return (
    <div
      className="min-h-screen bg-main-bg text-main-text"
      role="application"
      aria-label="SYNTHX - Loja de Jogos Digitais"
    >
      <Header onNavigate={navigateToPage} />

      <main role="main" aria-live="polite">
        {/* HomePage e GameDetailsPageNew agora são acessíveis a todos */}
        {currentPage === "home" && <HomePage onNavigate={navigateToPage} />}
        {currentPage === "details" && (
          <GameDetailsPageNew
            gameId={pageData?.gameId}
            onNavigate={navigateToPage}
          />
        )}
        {/* As páginas abaixo só serão carregadas se isAuthenticated for true, 
            graças ao check feito logo acima. */}
        {currentPage === "admin" && (
          <AdminPageComplete onNavigate={navigateToPage} />
        )}
        {currentPage === "profile" && (
          <UserProfilePageNew onNavigate={navigateToPage} />
        )}
        {currentPage === "management" && (
          <ManagementPageNew onNavigate={navigateToPage} />
        )}
        {currentPage === "checkout" && (
          <CheckoutPageNew onNavigate={navigateToPage} />
        )}
      </main>

      <Footer />
    </div>
  );
}
