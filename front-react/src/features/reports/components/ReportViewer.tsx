import React, { useState } from 'react';
import { useGetReportDataQuery, type ReportQueryParams } from '../reportsApi';
import { ReportFilters } from './ReportFilters';
import { ReportTable } from './ReportTable';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';
import '../reports.css';

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
    <div className="report-viewer">
      <ReportFilters isFetching={isFetching} onGenerate={handleFiltersChange} />

      {reportError && (
        <div className="report-viewer-error">
          <ErpErrorBanner error={reportError} title="Ошибка построения отчета:" />
        </div>
      )}

      <div className="report-viewer-content">
        <ReportTable
          result={reportResult}
          activeFilters={activeFilters}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
