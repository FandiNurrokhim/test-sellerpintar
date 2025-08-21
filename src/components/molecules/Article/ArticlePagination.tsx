import { ChevronLeft, ChevronRight } from "lucide-react";

type ArticlePaginationProps = {
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export default function ArticlePagination({
  pageIndex,
  pageCount,
  onPageChange,
}: ArticlePaginationProps) {
  // Helper untuk tombol page
  const renderPages = () => {
    const pages = [];
    if (pageCount <= 5) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`mx-1 px-3 py-1 rounded-lg border text-sm font-semibold transition-colors
              ${
                i === pageIndex
                  ? "border-gray-300 bg-white text-gray-900 shadow"
                  : "border-none bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
            aria-current={i === pageIndex ? "page" : undefined}
          >
            {i + 1}
          </button>
        );
      }
      return pages;
    }
    // Ellipsis logic
    if (pageIndex > 1) {
      pages.push(
        <button
          key={0}
          onClick={() => onPageChange(0)}
          className="mx-1 px-3 py-1 rounded-lg border-none bg-transparent text-gray-700 hover:bg-gray-100 text-sm font-semibold"
        >
          1
        </button>
      );
      if (pageIndex > 2) {
        pages.push(
          <span key="start-ellipsis" className="mx-1 px-3 py-1 text-gray-400">
            ...
          </span>
        );
      }
    }
    pages.push(
      <button
        key={pageIndex}
        className="mx-1 px-3 py-1 rounded-lg border border-gray-300 bg-white text-gray-900 shadow text-sm font-semibold"
        aria-current="page"
      >
        {pageIndex + 1}
      </button>
    );
    if (pageIndex < pageCount - 2) {
      if (pageIndex < pageCount - 3) {
        pages.push(
          <span key="end-ellipsis" className="mx-1 px-3 py-1 text-gray-400">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={pageCount - 1}
          onClick={() => onPageChange(pageCount - 1)}
          className="mx-1 px-3 py-1 rounded-lg border-none bg-transparent text-gray-700 hover:bg-gray-100 text-sm font-semibold"
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
        className={`flex items-center gap-1 px-3 py-1 rounded-lg border-none bg-transparent text-gray-700 hover:bg-gray-100 text-sm font-semibold
          ${pageIndex === 0 ? "text-gray-400 cursor-not-allowed" : ""}`}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
        Previous
      </button>
      {renderPages()}
      <button
        onClick={() => onPageChange(pageIndex + 1)}
        disabled={pageIndex + 1 >= pageCount}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg border-none bg-transparent text-gray-700 hover:bg-gray-100 text-sm font-semibold
          ${
            pageIndex + 1 >= pageCount ? "text-gray-400 cursor-not-allowed" : ""
          }`}
        aria-label="Next page"
      >
        Next
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
