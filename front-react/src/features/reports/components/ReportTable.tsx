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
import {
  exportReportToExcel,
  trimTrailingDots,
  type ReportColumnKey,
} from '../utils/exportReportToExcel';
import { exportReportToPdf } from '../utils/exportReportToPdf';
import '../reports.css';

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
  { key: 'queries', label: 'Запросы' },
];

const STORAGE_KEY = 'erp_report_visible_columns';

const DEFAULT_VISIBILITY: Record<ReportColumnKey, boolean> = {
  period: true,
  task: true,
  service: true,
  component: true,
  profile: true,
  queries: true,
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
      <div className="report-table-empty">
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
            className="report-export-trigger-btn"
          >
            <span>📥 Выгрузить</span>
          </button>
        }
      />

      <table className="report-grid">
        <thead>
          <tr>
            {visibleColumns.period && <th className="col-period">Период</th>}
            {visibleColumns.task && <th>Задача</th>}
            {visibleColumns.service && <th className="col-service">Услуга</th>}
            {visibleColumns.component && <th className="col-component">Компонент</th>}
            {visibleColumns.profile && <th className="col-profile">Исполнитель</th>}
            {visibleColumns.queries && <th className="col-queries">Запросы</th>}
          </tr>
        </thead>
        <tbody>
          {result.content.map((row) => (
            <tr key={row.id}>
              {visibleColumns.period && (
                <td className="cell-period">
                  {row.year}.{String(row.month).padStart(2, '0')}
                </td>
              )}
              {visibleColumns.task && (
                <td>
                  <div className="report-grid-task-title">{row.title}</div>
                  <div className="report-grid-task-desc">{row.description}</div>
                </td>
              )}
              {visibleColumns.service && (
                <td className="cell-directory">
                  {trimTrailingDots(row.service?.name) || '—'}
                </td>
              )}
              {visibleColumns.component && (
                <td className="cell-directory">
                  {trimTrailingDots(row.component?.name) || '—'}
                </td>
              )}
              {visibleColumns.profile && (
                <td className="cell-profile">
                  {trimTrailingDots(`${row.profile.lastName} ${row.profile.firstName}`)}
                </td>
              )}
              {visibleColumns.queries && (
                <td className="cell-queries">
                  {row.queries && row.queries.length > 0 ? (
                    <ul className="report-queries-list">
                      {row.queries.map((q) => (
                        <li key={q.id}>{trimTrailingDots(q.name)}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="report-queries-empty">—</span>
                  )}
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
