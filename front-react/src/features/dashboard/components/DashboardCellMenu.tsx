import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { DashboardTileDefinition } from '../dashboardRegistry';

export interface DashboardCellMenuProps {
  anchorRect: DOMRect;
  cellIndex: number;
  hasTile: boolean;
  availableTiles: DashboardTileDefinition[];
  columnsCount: number;
  rowsCount: number;
  onClose: () => void;
  onSelectTile: (cellIndex: number, tileId: string) => void;
  onClearCell: (cellIndex: number) => void;
  onChangeGridSize: (cols: number, rows: number) => void;
}

export const DashboardCellMenu: React.FC<DashboardCellMenuProps> = ({
  anchorRect,
  cellIndex,
  hasTile,
  availableTiles,
  columnsCount,
  rowsCount,
  onClose,
  onSelectTile,
  onClearCell,
  onChangeGridSize,
}) => {
  const [showTilePicker, setShowTilePicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuWidth = 235;
  const clampedLeft = Math.max(
    8,
    Math.min(window.innerWidth - menuWidth - 8, anchorRect.right - menuWidth),
  );
  const clampedTop = Math.max(
    8,
    Math.min(window.innerHeight - 280, anchorRect.bottom + 4),
  );

  const cssVars = {
    '--menu-top': `${clampedTop}px`,
    '--menu-left': `${clampedLeft}px`,
  } as React.CSSProperties;

  return createPortal(
    <div
      ref={menuRef}
      className="erp-cell-menu"
      style={cssVars}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="erp-cell-menu-item"
        onClick={() => setShowTilePicker((prev) => !prev)}
      >
        ➕ {hasTile ? 'Заменить плитку' : 'Добавить плитку'} ▾
      </button>

      {showTilePicker && (
        <>
          <div className="erp-cell-menu-divider" />
          <div className="erp-cell-menu-section-title">Доступные плитки:</div>
          {availableTiles.length === 0 ? (
            <div className="erp-cell-menu-section-title">
              Все доступные плитки уже размещены
            </div>
          ) : (
            availableTiles.map((item) => (
              <button
                key={item.id}
                type="button"
                className="erp-cell-menu-item"
                onClick={() => {
                  onSelectTile(cellIndex, item.id);
                  onClose();
                }}
              >
                {item.icon} {item.label}
              </button>
            ))
          )}
        </>
      )}

      {hasTile && (
        <button
          type="button"
          className="erp-cell-menu-item erp-cell-menu-item--danger"
          onClick={() => {
            onClearCell(cellIndex);
            onClose();
          }}
        >
          🗑️ Убрать плитку
        </button>
      )}

      <div className="erp-cell-menu-divider" />
      <div className="erp-cell-menu-section-title">Размер рабочего стола:</div>

      <div className="erp-cell-menu-grid-row">
        <span>Столбцов (в строке):</span>
        <input
          type="number"
          min={1}
          max={6}
          className="erp-dashboard-size-input"
          value={columnsCount}
          onChange={(e) =>
            onChangeGridSize(
              Math.min(6, Math.max(1, Number(e.target.value) || 4)),
              rowsCount,
            )
          }
        />
      </div>

      <div className="erp-cell-menu-grid-row">
        <span>Количество строк:</span>
        <input
          type="number"
          min={1}
          max={6}
          className="erp-dashboard-size-input"
          value={rowsCount}
          onChange={(e) =>
            onChangeGridSize(
              columnsCount,
              Math.min(6, Math.max(1, Number(e.target.value) || 3)),
            )
          }
        />
      </div>
    </div>,
    document.body,
  );
};
