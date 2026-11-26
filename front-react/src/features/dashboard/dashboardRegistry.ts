import React from 'react';
import { erpMenuItems, type ErpMenuItem } from '../../routes/menuConfig';
import { DefaultModuleTile } from './tiles/DefaultModuleTile';

export interface DashboardTileDefinition {
  id: string;
  label: string;
  icon: string;
  route: string;
  allowedRoles: string[];
  Component: React.FC<{ onClick: () => void }>;
}

const resolveTileId = (item: ErpMenuItem): string => {
  if (item.tileId) return item.tileId;
  return item.path.replace(/^\/+/, '').replace(/\//g, '_') || 'home';
};

const resolveTileComponent = (item: ErpMenuItem): React.FC<{ onClick: () => void }> => {
  if (item.tileComponent) {
    return item.tileComponent;
  }

  const FallbackTile: React.FC<{ onClick: () => void }> = ({ onClick }) =>
    React.createElement(DefaultModuleTile, {
      icon: item.icon,
      title: item.title,
      description: item.tileDescription,
      onClick,
    });

  return FallbackTile;
};

export const DASHBOARD_TILE_REGISTRY: DashboardTileDefinition[] = erpMenuItems
  .filter((item) => !item.hideFromDashboard)
  .map((item) => ({
    id: resolveTileId(item),
    label: item.title,
    icon: item.icon,
    route: item.tileRoute ?? item.path,
    allowedRoles: item.allowedRoles,
    Component: resolveTileComponent(item),
  }));

export const DEFAULT_TILE_IDS = DASHBOARD_TILE_REGISTRY.map((t) => t.id);
