/**
 * SYNTHX - Pagination Component
 * Componente de paginação reutilizável
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  className = ''
}: PaginationProps) {
  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, current and nearby pages
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if only 1 page
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Info */}
      <div className="text-sm text-gray-400">
        Mostrando <span className="text-white font-medium">{startItem}</span> a{' '}
        <span className="text-white font-medium">{endItem}</span> de{' '}
        <span className="text-white font-medium">{total}</span> resultados
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={`
            flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${canGoPrevious
              ? 'bg-[#1E1E1E] text-white hover:bg-[#2A2A2A] border border-gray-700 hover:border-[#9146FF]'
              : 'bg-[#1E1E1E] text-gray-600 cursor-not-allowed border border-gray-800'
            }
          `}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-500"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-[#9146FF] text-white shadow-lg shadow-purple-500/30'
                    : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#2A2A2A] border border-gray-700 hover:border-[#9146FF]'
                  }
                `}
                aria-label={`Página ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`
            flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${canGoNext
              ? 'bg-[#1E1E1E] text-white hover:bg-[#2A2A2A] border border-gray-700 hover:border-[#9146FF]'
              : 'bg-[#1E1E1E] text-gray-600 cursor-not-allowed border border-gray-800'
            }
          `}
          aria-label="Próxima página"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
