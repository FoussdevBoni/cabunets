// src/components/ui/Pagination.tsx

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3 py-4 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!canPrev}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Précédent</span>
      </button>

      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-700 font-medium">
          Page {page} sur {totalPages}
        </span>
        {total !== undefined && (
          <span className="text-xs text-gray-500">
            {total} élément{total > 1 ? "s" : ""} au total
          </span>
        )}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}