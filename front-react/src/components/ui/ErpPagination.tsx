import React from 'react';

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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '15px',
        background: '#f5f5f5',
        padding: '6px',
        border: '1px solid #ccc',
        fontSize: '12px',
      }}
    >
      <span>
        Всего записей: <strong>{totalElements}</strong>
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
        <button
          type="button"
          disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: '2px 8px',
            border: '1px solid #bbb',
            background: '#fff',
            cursor: isFirstPage ? 'default' : 'pointer',
          }}
        >
          ◀ Назад
        </button>
        <span style={{ padding: '2px 6px' }}>
          Страница <strong>{currentPage + 1}</strong> из {safeTotalPages}
        </span>
        <button
          type="button"
          disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: '2px 8px',
            border: '1px solid #bbb',
            background: '#fff',
            cursor: isLastPage ? 'default' : 'pointer',
          }}
        >
          Вперед ▶
        </button>
      </div>
    </div>
  );
};
