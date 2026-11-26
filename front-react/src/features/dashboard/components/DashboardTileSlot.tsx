import React, { useState, useRef } from 'react';
import type { DashboardTileDefinition } from '../dashboardRegistry';
import { DashboardCellMenu } from './DashboardCellMenu';

export interface DashboardTileSlotProps {
  cellIndex: number;
  tileDef: DashboardTileDefinition | null;
  availableTiles: DashboardTileDefinition[];
  columnsCount: number;
  rowsCount: number;
  isDragOver: boolean;
  onNavigate: (route: string) => void;
  onDragStart: (cellIndex: number) => void;
  onDragOver: (cellIndex: number) => void;
  onDragLeave: () => void;
  onDrop: (targetCellIndex: number) => void;
  onSelectTileForCell: (cellIndex: number, tileId: string) => void;
  onClearCell: (cellIndex: number) => void;
  onChangeGridSize: (cols: number, rows: number) => void;
}

export const DashboardTileSlot: React.FC<DashboardTileSlotProps> = ({
  cellIndex,
  tileDef,
  availableTiles,
  columnsCount,
  rowsCount,
  isDragOver,
  onNavigate,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onSelectTileForCell,
  onClearCell,
  onChangeGridSize,
}) => {
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (anchorRect) {
      setAnchorRect(null);
    } else if (btnRef.current) {
      setAnchorRect(btnRef.current.getBoundingClientRect());
    }
  };

  const TileComponent = tileDef?.Component;

  return (
    <div
      draggable={Boolean(tileDef)}
      onDragStart={() => tileDef && onDragStart(cellIndex)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(cellIndex);
      }}
      onDragLeave={onDragLeave}
      onDrop={() => onDrop(cellIndex)}
      className={`erp-grid-cell ${
        !tileDef ? 'erp-grid-cell--empty' : ''
      } ${isDragOver ? 'erp-grid-cell--drag-over' : ''}`}
    >
      <button
        ref={btnRef}
        type="button"
        className={`erp-cell-kebab-btn ${anchorRect ? 'erp-cell-kebab-btn--open' : ''}`}
        title="Настройки ячейки рабочего стола"
        onClick={handleToggleMenu}
      >
        ⋮
      </button>

      {anchorRect && (
        <DashboardCellMenu
          anchorRect={anchorRect}
          cellIndex={cellIndex}
          hasTile={Boolean(tileDef)}
          availableTiles={availableTiles}
          columnsCount={columnsCount}
          rowsCount={rowsCount}
          onClose={() => setAnchorRect(null)}
          onSelectTile={onSelectTileForCell}
          onClearCell={onClearCell}
          onChangeGridSize={onChangeGridSize}
        />
      )}

      {TileComponent && tileDef ? (
        <TileComponent onClick={() => onNavigate(tileDef.route)} />
      ) : (
        <span className="erp-grid-cell-empty-hint">Пустая ячейка</span>
      )}
    </div>
  );
};
