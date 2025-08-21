import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductPaginationProps = {
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export default function ProductPagination({
  pageIndex,
  pageCount,
  onPageChange,
}: ProductPaginationProps) {
  // Helper untuk tombol page
  const renderPages = () => {
    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-semibold transition-colors ${
            i === pageIndex
              ? "bg-[#232336] text-white border-[#232336]"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
          }`}
          aria-current={i === pageIndex ? "page" : undefined}
        >
          {i + 1}
        </button>
      ));
    }
    // Ellipsis logic
    const pages = [];
    if (pageIndex > 1) {
      pages.push(
        <button
          key={0}
          onClick={() => onPageChange(0)}
          className="w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-semibold bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
        >
          1
        </button>
      );
      if (pageIndex > 2) {
        pages.push(
          <span key="start-ellipsis" className="w-10 h-10 flex items-center justify-center text-gray-400">
            ...
          </span>
        );
      }
    }
    pages.push(
      <button
        key={pageIndex}
        className="w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-semibold bg-[#232336] text-white border-[#232336]"
        aria-current="page"
      >
        {pageIndex + 1}
      </button>
    );
    if (pageIndex < pageCount - 2) {
      if (pageIndex < pageCount - 3) {
        pages.push(
          <span key="end-ellipsis" className="w-10 h-10 flex items-center justify-center text-gray-400">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={pageCount - 1}
          onClick={() => onPageChange(pageCount - 1)}
          className="w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-semibold bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
        >
          {pageCount}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(pageIndex - 1)}
        disabled={pageIndex === 0}
        className={`w-10 h-10 rounded-lg border flex items-center justify-center text-gray-400 bg-white ${
          pageIndex === 0 ? "cursor-not-allowed" : "hover:bg-gray-100"
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>
      {renderPages()}
      <button
        onClick={() => onPageChange(pageIndex + 1)}
        disabled={pageIndex + 1 >= pageCount}
        className={`w-10 h-10 rounded-lg border flex items-center justify-center text-gray-400 bg-white ${
          pageIndex + 1 >= pageCount ? "cursor-not-allowed" : "hover:bg-gray-100"
        }`}
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}