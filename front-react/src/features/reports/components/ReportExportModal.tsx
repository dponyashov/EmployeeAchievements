import React, { useEffect } from 'react';
import '../reports.css';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportExcel: () => Promise<void> | void;
  onExportPdf: () => Promise<void> | void;
  isExporting?: boolean;
  totalElements?: number;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  onExportExcel,
  onExportPdf,
  isExporting = false,
  totalElements,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExporting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExporting, onClose]);

  if (!isOpen) return null;

  const handleExcelClick = async () => {
    await onExportExcel();
    onClose();
  };

  const handlePdfClick = async () => {
    await onExportPdf();
    onClose();
  };

  return (
    <div className="report-modal-overlay" onClick={() => !isExporting && onClose()}>
      <div className="report-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <span>Выгрузка отчета (все страницы)</span>
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            className="report-modal-close"
            title="Закрыть (Esc)"
          >
            ✕
          </button>
        </div>

        <div className="report-modal-body">
          {typeof totalElements === 'number' && (
            <div className="report-modal-info">
              Будет выгружено записей: <strong>{totalElements}</strong>
            </div>
          )}

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExcelClick}
            className="report-modal-btn report-modal-btn--excel"
          >
            <span>📥</span>
            <span>{isExporting ? 'Подготовка данных...' : 'Выгрузить в Excel'}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handlePdfClick}
            className="report-modal-btn report-modal-btn--pdf"
          >
            <span>📄</span>
            <span>{isExporting ? 'Подготовка данных...' : 'Выгрузить в PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
