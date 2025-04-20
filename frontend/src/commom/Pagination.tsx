interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const usePagination = ({
  page,
  total,
  pageSize,
}: {
  page: number;
  total: number;
  pageSize: number;
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };
  return {
    totalPages,
    pages: getPages(),
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };
};

const Pagination = ({page, total, pageSize, onPageChange}: PaginationProps) => {
  const {pages, hasPrevious, hasNext} = usePagination({
    page: page,
    total,
    pageSize,
  });
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => hasPrevious && onPageChange(page - 1)}
          disabled={!hasPrevious}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => hasNext && onPageChange(page + 1)}
          disabled={!hasNext}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            显示
            <span className="font-medium"> {(page - 1) * pageSize + 1} </span>到
            <span className="font-medium">
              {Math.min(page * pageSize, total)}
            </span>
            ，共
            <span className="font-medium"> {total} </span>个
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            {total > 0 && (
              <button
                onClick={() => hasPrevious && onPageChange(page - 1)}
                disabled={!hasPrevious}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                &lt;
              </button>
            )}
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  page === page
                    ? "bg-indigo-600 text-white"
                    : "text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            {total > 0 && (
              <button
                onClick={() => hasNext && onPageChange(page + 1)}
                disabled={!hasNext}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                &gt;
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
