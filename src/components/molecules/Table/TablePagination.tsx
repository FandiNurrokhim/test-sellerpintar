type TablePaginationProps = {
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

const TablePagination = ({
  pageIndex,
  pageCount,
  onPageChange,
}: TablePaginationProps) => {
  return (
    <div className="flex justify-between items-center gap-4 mt-6">
      <button
        onClick={() => onPageChange(pageIndex - 1)}
        disabled={pageIndex === 0}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          pageIndex === 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-[#2F49B3] text-white hover:bg-[#001363] dark:bg-[#2F49B3]"
        }`}
        aria-label="Previous page"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pageCount <= 7 ? (
          Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`w-8 h-8 rounded border text-xs font-medium transition-colors ${
                i === pageIndex
                  ? "bg-[#2F49B3] text-white border-[#2F49B3"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
              aria-current={i === pageIndex ? "page" : undefined}
            >
              {i + 1}
            </button>
          ))
        ) : (
          <>
            <button
              onClick={() => onPageChange(0)}
              className={`w-8 h-8 rounded border text-xs font-medium transition-colors ${
                pageIndex === 0
                  ? "bg-[#2F49B3] text-white border-[#2F49B3"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
              aria-current={pageIndex === 0 ? "page" : undefined}
            >
              1
            </button>
            {pageIndex > 3 && <span className="px-2">...</span>}
            {Array.from({ length: 3 }, (_, i) => {
              const page =
                pageIndex <= 2
                  ? i + 1
                  : pageIndex >= pageCount - 3
                  ? pageCount - 5 + i
                  : pageIndex - 1 + i;
              if (page <= 0 || page >= pageCount - 1) return null;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded border text-xs font-medium transition-colors ${
                    page === pageIndex
                      ? "bg-[#2F49B3] text-white border-[#2F49B3]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
                  }`}
                  aria-current={page === pageIndex ? "page" : undefined}
                >
                  {page + 1}
                </button>
              );
            })}
            {pageIndex < pageCount - 4 && <span className="px-2">...</span>}
            <button
              onClick={() => onPageChange(pageCount - 1)}
              className={`w-8 h-8 rounded border text-xs font-medium transition-colors ${
                pageIndex === pageCount - 1
                  ? "bg-[#2F49B3] text-white border-[#2F49B3"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
              aria-current={pageIndex === pageCount - 1 ? "page" : undefined}
            >
              {pageCount}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(pageIndex + 1)}
        disabled={pageIndex + 1 >= pageCount}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          pageIndex + 1 >= pageCount
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-[#2F49B3] text-white hover:bg-[#001363] dark:bg-[#2F49B3]"
        }`}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
};

export default TablePagination;
