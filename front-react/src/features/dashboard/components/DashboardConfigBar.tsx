import React from 'react';
import type { DashboardTileDefinition } from '../dashboardRegistry';

export interface DashboardConfigBarProps {
  columnsCount: number;
  rowsCount: number;
  maxVisibleTiles: number;
  availableToAdd: DashboardTileDefinition[];
  tileToAdd: string;
  onChangeColumns: (value: number) => void;
  onChangeRows: (value: number) => void;
  onChangeTileToAdd: (tileId: string) => void;
  onAddTile: () => void;
}

export const DashboardConfigBar: React.FC<DashboardConfigBarProps> = ({
  columnsCount,
  rowsCount,
  maxVisibleTiles,
  availableToAdd,
  tileToAdd,
  onChangeColumns,
  onChangeRows,
  onChangeTileToAdd,
  onAddTile,
}) => {
  return (
    <div className="erp-dashboard-config-bar">
      <div className="erp-dashboard-config-group">
        <label>Плиток в строке:</label>
        <input
          type="number"
          min={1}
          max={6}
          className="erp-dashboard-size-input"
          value={columnsCount}
          onChange={(e) =>
            onChangeColumns(Math.min(6, Math.max(1, Number(e.target.value) || 4)))
          }
        />
      </div>

      <div className="erp-dashboard-config-group">
        <label>Количество строк:</label>
        <input
          type="number"
          min={1}
          max={6}
          className="erp-dashboard-size-input"
          value={rowsCount}
          onChange={(e) =>
            onChangeRows(Math.min(6, Math.max(1, Number(e.target.value) || 3)))
          }
        />
      </div>

      {availableToAdd.length > 0 && (
        <div className="erp-dashboard-config-group">
          <label>Добавить плитку:</label>
          <select
            className="erp-dashboard-select"
            value={tileToAdd}
            onChange={(e) => onChangeTileToAdd(e.target.value)}
          >
            {availableToAdd.map((tile) => (
              <option key={tile.id} value={tile.id}>
                {tile.icon} {tile.label}
              </option>
            ))}
          </select>
          <button type="button" className="erp-cmd-btn" onClick={onAddTile}>
            ➕ Добавить
          </button>
        </div>
      )}

      <div className="tasks-emp-position">
        Перетаскивайте плитки мышью для изменения порядка (макс. ячеек: {maxVisibleTiles})
      </div>
    </div>
  );
};
