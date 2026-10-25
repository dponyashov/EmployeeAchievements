import React from 'react';
import { type ReportResponse } from '../reportsApi';

interface ReportTableProps {
  result: ReportResponse | undefined;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  result,
  currentPage,
  onPageChange,
}) => {
  if (!result) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontSize: '14px',
          marginTop: '60px',
        }}
      >
        📊 Настройте параметры компоновки данных и нажмите «Сформировать отчет»
      </div>
    );
  }

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr
            style={{
              background: '#eaeaea',
              borderBottom: '2px solid #333',
              textAlign: 'left',
            }}
          >
            <th
              style={{
                padding: '6px',
                border: '1px solid #aaa',
                width: '80px',
                textAlign: 'center',
              }}
            >
              Период
            </th>
            <th style={{ padding: '6px', border: '1px solid #aaa' }}>Задача</th>
            <th style={{ padding: '6px', border: '1px solid #aaa', width: '200px' }}>
              Услуга
            </th>
            <th style={{ padding: '6px', border: '1px solid #aaa', width: '200px' }}>
              Компонент
            </th>
            <th style={{ padding: '6px', border: '1px solid #aaa', width: '180px' }}>
              Исполнитель
            </th>
          </tr>
        </thead>
        <tbody>
          {result.content.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td
                style={{
                  padding: '6px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                }}
              >
                {row.year}.{String(row.month).padStart(2, '0')}
              </td>
              <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                <div style={{ fontWeight: 'bold' }}>{row.title}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>{row.description}</div>
              </td>
              <td style={{ padding: '6px', border: '1px solid #ddd', color: '#444' }}>
                {row.service?.name || '—'}
              </td>
              <td style={{ padding: '6px', border: '1px solid #ddd', color: '#444' }}>
                {row.component?.name || '—'}
              </td>
              <td style={{ padding: '6px', border: '1px solid #ddd', fontSize: '12px' }}>
                {row.profile.lastName} {row.profile.firstName}.
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Панель пагинации в стиле 1С */}
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
          Всего записей: <strong>{result.totalElements}</strong>
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            style={{
              padding: '2px 8px',
              border: '1px solid #bbb',
              background: '#fff',
              cursor: currentPage === 0 ? 'default' : 'pointer',
            }}
          >
            ◀ Назад
          </button>
          <span style={{ padding: '2px 6px' }}>
            Страница <strong>{currentPage + 1}</strong> из {result.totalPages || 1}
          </span>
          <button
            disabled={currentPage >= result.totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
            style={{
              padding: '2px 8px',
              border: '1px solid #bbb',
              background: '#fff',
              cursor: currentPage >= result.totalPages - 1 ? 'default' : 'pointer',
            }}
          >
            Вперед ▶
          </button>
        </div>
      </div>
    </>
  );
};
