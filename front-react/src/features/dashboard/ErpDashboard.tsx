import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/store';
import {
  useGetDashboardSettingsQuery,
  useSaveDashboardSettingsMutation,
} from './dashboardApi';
import {
  DASHBOARD_TILE_REGISTRY,
  DEFAULT_TILE_IDS,
  type DashboardTileDefinition,
} from './dashboardRegistry';
import { DashboardTileSlot } from './components/DashboardTileSlot';
import { ErpErrorBanner } from '../../components/ui/ErpErrorBanner';
import './dashboard.css';

const normalizeGridCells = (
  rawTiles: string[],
  totalCells: number,
  allowedIds: Set<string>,
): string[] => {
  const result = Array.from({ length: totalCells }, (_, idx) => {
    const candidate = rawTiles.at(idx) || '';
    return candidate && allowedIds.has(candidate) ? candidate : '';
  });
  return result;
};

export const ErpDashboard: React.FC = () => {
  const navigate = useNavigate();
  const userRoles = useAppSelector((state) => state.auth.user?.roles || []);

  const { data: savedSettings, isLoading } = useGetDashboardSettingsQuery();
  const [saveSettings] = useSaveDashboardSettingsMutation();

  const [columnsCount, setColumnsCount] = useState(4);
  const [rowsCount, setRowsCount] = useState(3);
  const [cells, setCells] = useState<string[]>(() =>
    Array.from({ length: 12 }, (_, i) => DEFAULT_TILE_IDS[i] || ''),
  );
  const [draggedCellIdx, setDraggedCellIdx] = useState<number | null>(null);
  const [dragOverCellIdx, setDragOverCellIdx] = useState<number | null>(null);
  const [error, setError] = useState<unknown>(null);

  const allowedRegistry = useMemo(
    () =>
      DASHBOARD_TILE_REGISTRY.filter((tile) =>
        tile.allowedRoles.some((role) => userRoles.includes(role)),
      ),
    [userRoles],
  );

  const allowedMap = useMemo(() => {
    const map = new Map<string, DashboardTileDefinition>();
    allowedRegistry.forEach((t) => map.set(t.id, t));
    return map;
  }, [allowedRegistry]);

  const allowedIdsSet = useMemo(
    () => new Set(allowedRegistry.map((t) => t.id)),
    [allowedRegistry],
  );

  useEffect(() => {
    if (!savedSettings) return;
    const cols = Math.min(6, Math.max(1, savedSettings.columnsCount || 4));
    const rows = Math.min(6, Math.max(1, savedSettings.rowsCount || 3));
    const total = cols * rows;
    setColumnsCount(cols);
    setRowsCount(rows);
    setCells(
      normalizeGridCells(savedSettings.tiles || DEFAULT_TILE_IDS, total, allowedIdsSet),
    );
  }, [savedSettings, allowedIdsSet]);

  const persistGrid = useCallback(
    async (nextCols: number, nextRows: number, nextCells: string[]) => {
      try {
        setError(null);
        await saveSettings({
          columnsCount: nextCols,
          rowsCount: nextRows,
          tiles: nextCells,
        }).unwrap();
      } catch (err) {
        setError(err);
      }
    },
    [saveSettings],
  );

  // Плитки, доступные пользователю и ещё не размещённые на рабочем столе
  const availableTiles = useMemo(() => {
    const placedSet = new Set(cells.filter(Boolean));
    return allowedRegistry.filter((t) => !placedSet.has(t.id));
  }, [allowedRegistry, cells]);

  const handleSelectTileForCell = (cellIndex: number, tileId: string) => {
    setCells((prev) => {
      // Если плитка уже стояла в другой ячейке, очищаем старую и ставим в выбранную
      const next = prev.map((id) => (id === tileId ? '' : id));
      next[cellIndex] = tileId;
      void persistGrid(columnsCount, rowsCount, next);
      return next;
    });
  };

  const handleClearCell = (cellIndex: number) => {
    setCells((prev) => {
      const next = [...prev];
      next[cellIndex] = '';
      void persistGrid(columnsCount, rowsCount, next);
      return next;
    });
  };

  const handleDropOnCell = (targetCellIdx: number) => {
    if (draggedCellIdx === null || draggedCellIdx === targetCellIdx) {
      setDraggedCellIdx(null);
      setDragOverCellIdx(null);
      return;
    }

    setCells((prev) => {
      const next = [...prev];
      const movedTile = next[draggedCellIdx] || '';
      const targetTile = next[targetCellIdx] || '';
      // Меняем содержимое двух ячеек местами (работает и для пустой целевой ячейки)
      next[targetCellIdx] = movedTile;
      next[draggedCellIdx] = targetTile;
      void persistGrid(columnsCount, rowsCount, next);
      return next;
    });

    setDraggedCellIdx(null);
    setDragOverCellIdx(null);
  };

  const handleChangeGridSize = (nextCols: number, nextRows: number) => {
    const safeCols = Math.min(6, Math.max(1, nextCols));
    const safeRows = Math.min(6, Math.max(1, nextRows));
    const nextTotal = safeCols * safeRows;

    const resizedCells = Array.from(
      { length: nextTotal },
      (_, idx) => cells.at(idx) || '',
    );

    setColumnsCount(safeCols);
    setRowsCount(safeRows);
    setCells(resizedCells);
    void persistGrid(safeCols, safeRows, resizedCells);
  };

  const safeCols = Math.min(6, Math.max(1, columnsCount));

  return (
    <div className="erp-dashboard-container">
      {Boolean(error) && <ErpErrorBanner error={error} />}

      {isLoading ? (
        <div>Загрузка рабочего стола...</div>
      ) : (
        <div className={`erp-tiles-grid erp-tiles-grid--cols-${safeCols}`}>
          {cells.map((tileId, idx) => {
            const tileDef = tileId ? allowedMap.get(tileId) || null : null;

            return (
              <DashboardTileSlot
                key={`cell-${idx}`}
                cellIndex={idx}
                tileDef={tileDef}
                availableTiles={availableTiles}
                columnsCount={safeCols}
                rowsCount={rowsCount}
                isDragOver={dragOverCellIdx === idx}
                onNavigate={navigate}
                onDragStart={setDraggedCellIdx}
                onDragOver={setDragOverCellIdx}
                onDragLeave={() => setDragOverCellIdx(null)}
                onDrop={handleDropOnCell}
                onSelectTileForCell={handleSelectTileForCell}
                onClearCell={handleClearCell}
                onChangeGridSize={handleChangeGridSize}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
