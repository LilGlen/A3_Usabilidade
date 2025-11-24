import { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { GameDetailsPageNew } from "./components/GameDetailsPageNew";
import { AdminPageNew } from "./components/AdminPageNew";
import { UserProfilePageNew } from "./components/UserProfilePageNew";
import { ManagementPageNew } from "./components/ManagementPageNew";
import { CheckoutPage } from "./components/CheckoutPage";
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

  const [searchTerm, setSearchTerm] = useState("");

  const navigateToPage = (page: PageType, data?: any) => {
    setCurrentPage(page);
    setPageData(data || null);

    if (page !== "home") setSearchTerm("");

    window.scrollTo(0, 0);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (currentPage !== "home") setCurrentPage("home");
  };

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>

          <AppContent
            currentPage={currentPage}
            pageData={pageData}
            navigateToPage={navigateToPage}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />

        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}


function AppContent({
  currentPage,
  pageData,
  navigateToPage,
  searchTerm,
  onSearchChange,
}: {
  currentPage: PageType;
  pageData: any;
  navigateToPage: (page: PageType, data?: any) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
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

  const isPublicPage = currentPage === "home" || currentPage === "details";

  if (!isAuthenticated && !isPublicPage) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-main-bg text-main-text">
      <Header onNavigate={navigateToPage} onSearchChange={onSearchChange} />

      <main>
        {currentPage === "home" && (
          <HomePage onNavigate={navigateToPage} searchTerm={searchTerm} />
        )}

        {currentPage === "details" && (
          <GameDetailsPageNew
            gameId={pageData?.gameId}
            onNavigate={navigateToPage}
          />
        )}

        {currentPage === "admin" && (
          <AdminPageNew onNavigate={navigateToPage} />
        )}

        {currentPage === "profile" && (
          <UserProfilePageNew onNavigate={navigateToPage} />
        )}

        {currentPage === "management" && (
          <ManagementPageNew onNavigate={navigateToPage} />
        )}

        {currentPage === "checkout" && (
          <CheckoutPage onNavigate={navigateToPage} />
        )}
      </main>
      <Footer />
    </div>
  );
}
