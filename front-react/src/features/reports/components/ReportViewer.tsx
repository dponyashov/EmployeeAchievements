import React, { useState } from 'react';
import { useGetReportDataQuery, type ReportQueryParams } from '../reportsApi';
import { ReportFilters } from './ReportFilters';
import { ReportTable } from './ReportTable';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';

export const ReportViewer: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeFilters, setActiveFilters] = useState<ReportQueryParams | null>(null);

  const {
    data: reportResult,
    isFetching,
    error: reportError,
  } = useGetReportDataQuery(activeFilters || {}, { skip: !activeFilters });

  const handleFiltersChange = (filters: ReportQueryParams) => {
    setCurrentPage(0);
    setActiveFilters(filters);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (activeFilters) {
      setActiveFilters({ ...activeFilters, page: newPage });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
        fontSize: '13px',
      }}
    >
      {/* Панель фильтров с поддержкой множественного выбора годов */}
      <ReportFilters isFetching={isFetching} onGenerate={handleFiltersChange} />

      <div style={{ padding: reportError ? '10px 15px 0 15px' : '0' }}>
        <ErpErrorBanner error={reportError} title="Ошибка построения отчета:" />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        <ReportTable
          result={reportResult}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
