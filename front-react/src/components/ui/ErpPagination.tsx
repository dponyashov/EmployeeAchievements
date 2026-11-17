import React from 'react';
import './ui.css';

interface ErpPaginationProps {
  totalElements: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ErpPagination: React.FC<ErpPaginationProps> = ({
  totalElements,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const safeTotalPages = totalPages || 1;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= safeTotalPages - 1;

  return (
    <div className="erp-pagination">
      <span>
        Всего записей: <strong>{totalElements}</strong>
      </span>
      <div className="erp-pagination-controls">
        <button
          type="button"
          className="erp-pagination-btn"
          disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ◀ Назад
        </button>
        <span className="erp-pagination-info">
          Страница <strong>{currentPage + 1}</strong> из {safeTotalPages}
        </span>
        <button
          type="button"
          className="erp-pagination-btn"
          disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Вперед ▶
        </button>
      </div>
    </div>
  );
};
