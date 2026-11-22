import React from 'react';
import type { TestSectionItem } from '../testingApi';

interface TestSectionsFeedProps {
  sections: TestSectionItem[];
  isLoading: boolean;
  isAdmin: boolean;
  onSelectSection: (sectionId: number) => void;
}

export const TestSectionsFeed: React.FC<TestSectionsFeedProps> = ({
  sections,
  isLoading,
  isAdmin,
  onSelectSection,
}) => {
  if (isLoading) {
    return <div className="testing-feed-wrap">Загрузка разделов тестирования...</div>;
  }

  if (sections.length === 0) {
    return (
      <div className="testing-feed-wrap">
        <div className="sub-view">
          Разделы тестирования пока не созданы.
          {isAdmin &&
            ' Перейдите на вкладку «Редактирование разделов тестирования», чтобы добавить первый раздел.'}
        </div>
      </div>
    );
  }

  return (
    <div className="testing-feed-wrap">
      {sections.map((section) => (
        <div
          key={section.id}
          className={`testing-section-card ${
            !section.isActive ? 'testing-section-card--inactive' : ''
          }`}
          onClick={() => onSelectSection(section.id)}
        >
          <div>
            <div className="testing-section-title">{section.title}</div>
            {section.description && (
              <div className="testing-section-desc">{section.description}</div>
            )}
          </div>

          <div className="testing-section-meta">
            <span className="testing-badge">
              Доступно тестов: <strong>{section.testsCount}</strong>
            </span>
            {!section.isActive && (
              <span className="testing-badge testing-badge--warn">
                Скрыт от сотрудников
              </span>
            )}
            <span className="erp-tile-title">Открыть раздел →</span>
          </div>
        </div>
      ))}
    </div>
  );
};
