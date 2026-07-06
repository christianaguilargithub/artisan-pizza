interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
      >
        Prev
      </button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {lastPage}
      </span>
      <button
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  );
}
