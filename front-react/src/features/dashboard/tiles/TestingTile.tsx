import React from 'react';
import { useGetTestSectionsQuery } from '../../testing/testingApi';

interface TestingTileProps {
  onClick: () => void;
}

export const TestingTile: React.FC<TestingTileProps> = ({ onClick }) => {
  const { data: sections } = useGetTestSectionsQuery();

  const totalTests = sections?.reduce((acc, sec) => acc + (sec.testsCount || 0), 0) ?? 0;

  return (
    <div className="erp-tile" onClick={onClick}>
      <div className="erp-tile-icon">🎓</div>
      <div className="erp-tile-title">Тестирование</div>
      <div className="erp-tile-info">
        Аттестация, проверка знаний и контроль результатов сотрудников
      </div>
      {totalTests > 0 && (
        <div className="erp-tile-counter emp-tile-counter">Тестов: {totalTests}</div>
      )}
    </div>
  );
};
