import React, { useEffect } from 'react';

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
    <div style={modalOverlayStyle} onClick={() => !isExporting && onClose()}>
      <div style={modalWindowStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <span>Выгрузка отчета (все страницы)</span>
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            style={modalCloseBtnStyle}
            title="Закрыть (Esc)"
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: '20px',
            background: '#FFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '12px',
          }}
        >
          {typeof totalElements === 'number' && (
            <div style={{ fontSize: '12px', color: '#555', textAlign: 'center' }}>
              Будет выгружено записей: <strong>{totalElements}</strong>
            </div>
          )}

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExcelClick}
            style={{
              padding: '8px 16px',
              background: '#ffcc00',
              border: '1px solid #997a00',
              cursor: isExporting ? 'default' : 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>📥</span>
            <span>{isExporting ? 'Подготовка данных...' : 'Выгрузить в Excel'}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handlePdfClick}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              border: '1px solid #999',
              cursor: isExporting ? 'default' : 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>📄</span>
            <span>{isExporting ? 'Подготовка данных...' : 'Выгрузить в PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalWindowStyle: React.CSSProperties = {
  backgroundColor: '#FFF',
  border: '1px solid #999',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
  width: '360px',
  maxWidth: '95vw',
  overflow: 'hidden',
};

const modalHeaderStyle: React.CSSProperties = {
  backgroundColor: '#FFCC00',
  borderBottom: '1px solid #D4A000',
  padding: '8px 12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 'bold',
  fontSize: '13px',
  color: '#333',
};

const modalCloseBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: 'bold',
  color: '#333',
};
