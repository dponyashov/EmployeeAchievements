import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/store';
import { useGetTestSectionsQuery, type TestAttemptSession } from '../testingApi';
import '../testing.css';
import { TestRunnerView } from './TestRunnerView';
import { TestSectionEditorTab } from './TestSectionEditorTab';
import { TestSectionsFeed } from './TestSectionsFeed';
import { TestEditorTab } from './TestEditorTab';
import { TestControlTab } from './TestControlTab';
import { SectionTestsTab } from './SectionTestsTab';

export const TestingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userRoles = useAppSelector((state) => state.auth.user?.roles || []);

  const isTestAdmin =
    userRoles.includes('ROLE_TEST_ADMIN') || userRoles.includes('ROLE_ADMIN');
  const isTestControl = isTestAdmin || userRoles.includes('ROLE_TEST_CONTROL');

  const sectionIdParam = searchParams.get('sectionId');
  const selectedSectionId = sectionIdParam ? Number(sectionIdParam) : null;
  const tabParam = searchParams.get('tab');

  // Активная сессия прохождения теста
  const [activeSession, setActiveSession] = useState<TestAttemptSession | null>(null);

  const { data: sections, isLoading: isSectionsLoading } = useGetTestSectionsQuery();

  const selectedSection = sections?.find((s) => s.id === selectedSectionId) || null;

  // Вкладки уровня 1 (список разделов)
  const rootTab: 'sections' | 'edit-sections' =
    tabParam === 'edit-sections' && isTestAdmin ? 'edit-sections' : 'sections';

  // Вкладки уровня 2 (внутри выбранного раздела)
  const sectionTab: 'tests' | 'edit-tests' | 'control' =
    tabParam === 'edit-tests' && isTestAdmin
      ? 'edit-tests'
      : tabParam === 'control' && isTestControl
        ? 'control'
        : 'tests';

  const handleSelectSection = (sectionId: number) => {
    setActiveSession(null);
    setSearchParams({ sectionId: String(sectionId), tab: 'tests' }, { replace: true });
  };

  const handleBackToSections = () => {
    setActiveSession(null);
    setSearchParams({}, { replace: true });
  };

  const handleRootTabChange = (nextTab: 'sections' | 'edit-sections') => {
    setSearchParams(nextTab === 'sections' ? {} : { tab: nextTab }, { replace: true });
  };

  const handleSectionTabChange = (nextTab: 'tests' | 'edit-tests' | 'control') => {
    if (!selectedSectionId) return;
    setActiveSession(null);
    setSearchParams(
      { sectionId: String(selectedSectionId), tab: nextTab },
      { replace: true },
    );
  };

  // Если запущена сессия прохождения теста — отображаем окно тестирования
  if (activeSession) {
    return (
      <div className="testing-page">
        <div className="testing-topbar">
          <div className="testing-topbar-left">
            <button
              type="button"
              className="erp-cmd-btn"
              onClick={() => setActiveSession(null)}
            >
              ◀ К списку тестов
            </button>
            <h2 className="testing-page-title">
              Тестирование: {activeSession.testTitle} (Попытка №
              {activeSession.attemptNumber})
            </h2>
          </div>
        </div>
        <div className="testing-content">
          <TestRunnerView
            initialSession={activeSession}
            onExit={() => setActiveSession(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="testing-page">
      <div className="testing-topbar">
        <div className="testing-topbar-left">
          {selectedSectionId !== null && (
            <button type="button" className="erp-cmd-btn" onClick={handleBackToSections}>
              ◀ Все разделы
            </button>
          )}
          <h2 className="testing-page-title">
            {selectedSection
              ? `Раздел: ${selectedSection.title}`
              : '🎓 Подсистема тестирования сотрудников'}
          </h2>
        </div>

        {/* Переключатель вкладок уровня 1 (Разделы) */}
        {selectedSectionId === null && isTestAdmin && (
          <div className="testing-tabs">
            <button
              type="button"
              className={`testing-tab-btn ${
                rootTab === 'sections' ? 'testing-tab-btn--active' : ''
              }`}
              onClick={() => handleRootTabChange('sections')}
            >
              📚 Разделы тестирования
            </button>
            <button
              type="button"
              className={`testing-tab-btn ${
                rootTab === 'edit-sections' ? 'testing-tab-btn--active' : ''
              }`}
              onClick={() => handleRootTabChange('edit-sections')}
            >
              ✏️ Редактирование разделов тестирования
            </button>
          </div>
        )}

        {/* Переключатель вкладок уровня 2 (Внутри раздела) */}
        {selectedSectionId !== null && (
          <div className="testing-tabs">
            <button
              type="button"
              className={`testing-tab-btn ${
                sectionTab === 'tests' ? 'testing-tab-btn--active' : ''
              }`}
              onClick={() => handleSectionTabChange('tests')}
            >
              📝 Тесты раздела
            </button>

            {isTestControl && (
              <button
                type="button"
                className={`testing-tab-btn ${
                  sectionTab === 'control' ? 'testing-tab-btn--active' : ''
                }`}
                onClick={() => handleSectionTabChange('control')}
              >
                📊 Контроль тестирования
              </button>
            )}

            {isTestAdmin && (
              <button
                type="button"
                className={`testing-tab-btn ${
                  sectionTab === 'edit-tests' ? 'testing-tab-btn--active' : ''
                }`}
                onClick={() => handleSectionTabChange('edit-tests')}
              >
                ⚙️ Редактирование тестов
              </button>
            )}
          </div>
        )}
      </div>

      <div className="testing-content">
        {selectedSectionId === null ? (
          rootTab === 'edit-sections' && isTestAdmin ? (
            <TestSectionEditorTab sections={sections || []} />
          ) : (
            <TestSectionsFeed
              sections={sections || []}
              isLoading={isSectionsLoading}
              isAdmin={isTestAdmin}
              onSelectSection={handleSelectSection}
            />
          )
        ) : sectionTab === 'edit-tests' && isTestAdmin ? (
          <TestEditorTab sectionId={selectedSectionId} />
        ) : sectionTab === 'control' && isTestControl ? (
          <TestControlTab sectionId={selectedSectionId} />
        ) : (
          <SectionTestsTab
            sectionId={selectedSectionId}
            isAdmin={isTestAdmin}
            onStartSession={(session) => setActiveSession(session)}
          />
        )}
      </div>
    </div>
  );
};
