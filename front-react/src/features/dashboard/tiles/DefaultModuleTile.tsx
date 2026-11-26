import React from 'react';

interface DefaultModuleTileProps {
  icon: string;
  title: string;
  description?: string;
  onClick: () => void;
}

export const DefaultModuleTile: React.FC<DefaultModuleTileProps> = ({
  icon,
  title,
  description,
  onClick,
}) => {
  return (
    <div className="erp-tile" onClick={onClick}>
      <div className="erp-tile-icon">{icon}</div>
      <div className="erp-tile-title">{title}</div>
      <div className="erp-tile-info">{description || `Перейти в раздел «${title}»`}</div>
    </div>
  );
};
