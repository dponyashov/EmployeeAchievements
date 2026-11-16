import React, { useState, useEffect } from 'react';
import {
  useLazyGetReportDataQuery,
  type ReportQueryParams,
  type ReportResponse,
} from '../reportsApi';
import { ErpPagination } from '../../../components/ui/ErpPagination';
import {
  ErpColumnSelector,
  type ErpColumnOption,
} from '../../../components/ui/ErpColumnSelector';
import { ReportExportModal } from './ReportExportModal';
import { exportReportToExcel, type ReportColumnKey } from '../utils/exportReportToExcel';
import { exportReportToPdf } from '../utils/exportReportToPdf';

interface ReportTableProps {
  result: ReportResponse | undefined;
  activeFilters: ReportQueryParams | null;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const REPORT_COLUMNS: ErpColumnOption<ReportColumnKey>[] = [
  { key: 'period', label: 'Период' },
  { key: 'task', label: 'Задача' },
  { key: 'service', label: 'Услуга' },
  { key: 'component', label: 'Компонент' },
  { key: 'profile', label: 'Исполнитель' },
];

const STORAGE_KEY = 'erp_report_visible_columns';

const DEFAULT_VISIBILITY: Record<ReportColumnKey, boolean> = {
  period: true,
  task: true,
  service: true,
  component: true,
  profile: true,
};

export const ReportTable: React.FC<ReportTableProps> = ({
  result,
  activeFilters,
  currentPage,
  onPageChange,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [triggerGetAllReportRows] = useLazyGetReportDataQuery();

  const [visibleColumns, setVisibleColumns] = useState<Record<ReportColumnKey, boolean>>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return { ...DEFAULT_VISIBILITY, ...JSON.parse(saved) };
        }
      } catch {
        // Игнорируем ошибки парсинга
      }
      return DEFAULT_VISIBILITY;
    },
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
    } catch {
      // Игнорируем ошибки записи
    }
  }, [visibleColumns]);

  const toggleColumn = (key: ReportColumnKey) => {
    setVisibleColumns((prev) => {
      const visibleCount = Object.values(prev).filter(Boolean).length;
      if (prev[key] && visibleCount <= 1) {
        return prev;
      }
      return { ...prev, [key]: !prev[key] };
    });
  };

  const handleShowAll = () => {
    setVisibleColumns(DEFAULT_VISIBILITY);
  };

  // Загружаем все страницы отчета (если totalPages > 1) или берем текущий массив
  const fetchAllReportRows = async (): Promise<ReportResponse['content']> => {
    if (!result) return [];
    if (result.totalPages <= 1 || result.content.length >= result.totalElements) {
      return result.content;
    }

    const fullResponse = await triggerGetAllReportRows({
      ...(activeFilters || {}),
      page: 0,
      size: result.totalElements,
    }).unwrap();

    return fullResponse.content;
  };

  const handleExportExcel = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      const allRows = await fetchAllReportRows();
      exportReportToExcel(allRows, visibleColumns);
    } catch (err) {
      console.error('Ошибка выгрузки отчета в Excel:', err);
      alert('Не удалось загрузить все страницы отчета для выгрузки в Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      const allRows = await fetchAllReportRows();
      await exportReportToPdf(allRows, visibleColumns);
    } catch (err) {
      console.error('Ошибка выгрузки отчета в PDF:', err);
      alert('Не удалось сформировать PDF файл.');
    } finally {
      setIsExporting(false);
    }
  };

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
      <ErpColumnSelector
        columns={REPORT_COLUMNS}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onShowAll={handleShowAll}
        extraActions={
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            style={{
              padding: '4px 10px',
              background: '#f5f5f5',
              border: '1px solid #aaa',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#333',
            }}
          >
            <span>📥 Выгрузить</span>
          </button>
        }
      />

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr
            style={{
              background: '#eaeaea',
              borderBottom: '2px solid #333',
              textAlign: 'left',
            }}
          >
            {visibleColumns.period && (
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
            )}
            {visibleColumns.task && (
              <th style={{ padding: '6px', border: '1px solid #aaa' }}>Задача</th>
            )}
            {visibleColumns.service && (
              <th style={{ padding: '6px', border: '1px solid #aaa', width: '200px' }}>
                Услуга
              </th>
            )}
            {visibleColumns.component && (
              <th style={{ padding: '6px', border: '1px solid #aaa', width: '200px' }}>
                Компонент
              </th>
            )}
            {visibleColumns.profile && (
              <th style={{ padding: '6px', border: '1px solid #aaa', width: '180px' }}>
                Исполнитель
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {result.content.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid #ccc' }}>
              {visibleColumns.period && (
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
              )}
              {visibleColumns.task && (
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                  <div style={{ fontWeight: 'bold' }}>{row.title}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>{row.description}</div>
                </td>
              )}
              {visibleColumns.service && (
                <td style={{ padding: '6px', border: '1px solid #ddd', color: '#444' }}>
                  {row.service?.name || '—'}
                </td>
              )}
              {visibleColumns.component && (
                <td style={{ padding: '6px', border: '1px solid #ddd', color: '#444' }}>
                  {row.component?.name || '—'}
                </td>
              )}
              {visibleColumns.profile && (
                <td
                  style={{ padding: '6px', border: '1px solid #ddd', fontSize: '12px' }}
                >
                  {row.profile.lastName} {row.profile.firstName}.
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ErpPagination
        totalElements={result.totalElements}
        currentPage={currentPage}
        totalPages={result.totalPages}
        onPageChange={onPageChange}
      />

      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
        totalElements={result.totalElements}
      />
    </>
  );
};
