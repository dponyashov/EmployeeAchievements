import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../app/store';
import { TasksJournal } from '../tasks/components/TasksJournal';
import { ReportViewer } from '../reports/components/ReportViewer';
import { SimpleDirectoryTab } from '../directories/components/SimpleDirectoryTab';
import '../testing/testing.css';

type AchievementTab = 'tasks' | 'reports' | 'services' | 'components';

const TAB_TITLES: Record<AchievementTab, string> = {
  tasks: '✅ Задачи сотрудников',
  reports: '📊 Отчетность и анализ',
  services: '🛠️ Справочник услуг',
  components: '🧩 Справочник компонентов',
};

export const AchievementsPage: React.FC = () => {
  const appTitle = import.meta.env.VITE_APP_TITLE;
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAppSelector((state) => state.auth.user);
  const roles = user?.roles || [];

  const canViewReports =
    roles.includes('ROLE_ADMIN') ||
    roles.includes('ROLE_REPORT') ||
    roles.includes('ROLE_SUPERVISOR') ||
    roles.includes('ROLE_DEPARTMENT_ALL');

  const canEditDirectories =
    roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SERVICE');

  const rawTab = searchParams.get('tab') || searchParams.get('section');

  let activeTab: AchievementTab = 'tasks';
  if (rawTab === 'reports' && canViewReports) {
    activeTab = 'reports';
  } else if (rawTab === 'services') {
    activeTab = 'services';
  } else if (rawTab === 'components') {
    activeTab = 'components';
  }

  const currentTitle = TAB_TITLES[activeTab];

  useEffect(() => {
    const cleanTitle = currentTitle.replace(/^[^\p{L}\p{N}]+/u, '').trim();
    document.title = `${cleanTitle} — ${appTitle}`;
  }, [currentTitle]);

  const handleSwitchTab = (nextTab: AchievementTab) => {
    const nextParams = new URLSearchParams();
    nextParams.set('tab', nextTab);
    setSearchParams(nextParams);
  };

  return (
    <div className="testing-page">
      <div className="testing-topbar">
        <div className="testing-topbar-left">
          <h2 className="testing-page-title">{currentTitle}</h2>
        </div>

        <div className="testing-tabs">
          <button
            type="button"
            className={`testing-tab-btn ${
              activeTab === 'tasks' ? 'testing-tab-btn--active' : ''
            }`}
            onClick={() => handleSwitchTab('tasks')}
          >
            ✅ Задачи
          </button>

          {canViewReports && (
            <button
              type="button"
              className={`testing-tab-btn ${
                activeTab === 'reports' ? 'testing-tab-btn--active' : ''
              }`}
              onClick={() => handleSwitchTab('reports')}
            >
              📊 Отчетность
            </button>
          )}

          <button
            type="button"
            className={`testing-tab-btn ${
              activeTab === 'services' ? 'testing-tab-btn--active' : ''
            }`}
            onClick={() => handleSwitchTab('services')}
          >
            🛠️ Услуги
          </button>

          <button
            type="button"
            className={`testing-tab-btn ${
              activeTab === 'components' ? 'testing-tab-btn--active' : ''
            }`}
            onClick={() => handleSwitchTab('components')}
          >
            🧩 Компоненты
          </button>
        </div>
      </div>

      <div className="testing-content erp-v8-scrollbar">
        {activeTab === 'reports' && canViewReports && <ReportViewer />}
        {activeTab === 'services' && (
          <SimpleDirectoryTab
            cleanKey="service"
            itemLabel="Наименование услуги"
            title="Справочник услуг"
            canEdit={canEditDirectories}
          />
        )}
        {activeTab === 'components' && (
          <SimpleDirectoryTab
            cleanKey="component"
            itemLabel="Наименование компонента"
            title="Справочник компонентов"
            canEdit={canEditDirectories}
          />
        )}
        {activeTab === 'tasks' && <TasksJournal />}
      </div>
    </div>
  );
};
