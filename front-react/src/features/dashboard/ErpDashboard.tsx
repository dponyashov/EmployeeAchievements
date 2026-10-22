// src/features/dashboard/ErpDashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { AdminTile } from './tiles/AdminTile';
import { DirectoriesTile } from './tiles/DirectoriesTile';
import { ReportsTile } from './tiles/ReportsTile';
import { TasksTile } from './tiles/TasksTile';
import { EmployeesTile } from './tiles/EmployeesTile';

export const ErpDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="erp-grid-dashboard">
      <AdminTile onClick={() => navigate('/admin')} />
      <DirectoriesTile onClick={() => navigate('/directories')} />
      <ReportsTile onClick={() => navigate('/reports')} />
      <TasksTile onClick={() => navigate('/tasks')} />
      <EmployeesTile onClick={() => navigate('/directories/profile')} />
    </div>
  );
};
