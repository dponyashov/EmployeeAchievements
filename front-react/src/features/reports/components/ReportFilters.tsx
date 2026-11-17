import React, { useState, useMemo } from 'react';
import { type ReportQueryParams } from '../reportsApi';
import {
  useGetComponentsDirectoryQuery,
  useGetServicesDirectoryQuery,
} from '../../tasks/tasksApi';
import { ErpCombobox } from '../../../components/ui/ErpCombobox';
import { useGetDirectoryDataQuery } from '../../directories/directoriesApi';
import '../reports.css';

interface ReportFiltersProps {
  isFetching: boolean;
  onGenerate: (filters: ReportQueryParams) => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  isFetching,
  onGenerate,
}) => {
  const [titleSearch, setTitleSearch] = useState('');

  const yearsDirectory = useMemo(() => {
    const list = [];
    for (let y = 2012; y <= 2100; y++) {
      list.push({ id: y, name: `${y} год` });
    }
    return list;
  }, []);

  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [serviceIds, setServiceIds] = useState<number[]>([]);
  const [componentIds, setComponentIds] = useState<number[]>([]);
  const [profileIds, setProfileIds] = useState<number[]>([]);

  const [pageSize, setPageSize] = useState(10);
  const [sortConfig] = useState<string[]>(['year,asc', 'month,asc']);

  const { data: services = [] } = useGetServicesDirectoryQuery();
  const { data: components = [] } = useGetComponentsDirectoryQuery();
  const { data: employees = [], isLoading: isEmployeesLoading } =
    useGetDirectoryDataQuery('profile');

  const employeesItems = useMemo(() => {
    return employees.map((emp: any) => {
      const lastName = emp.lastName || '';
      const firstName = emp.firstName || '';
      const positionName = emp.position?.name ? ` [${emp.position.name}]` : '';
      const fullName = `${lastName} ${firstName}${positionName}`.trim();

      return {
        id: emp.id,
        name: fullName ? `👤 ${fullName}` : `👤 Сотрудник №${emp.id} (${emp.email})`,
      };
    });
  }, [employees]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      title: titleSearch ? `*${titleSearch}*` : undefined,
      years: selectedYears.length > 0 ? selectedYears : undefined,
      months: selectedMonths.length > 0 ? selectedMonths : undefined,
      serviceIds: serviceIds.length > 0 ? serviceIds : undefined,
      componentIds: componentIds.length > 0 ? componentIds : undefined,
      profileIds: profileIds.length > 0 ? profileIds : undefined,
      sort: sortConfig,
      page: 0,
      size: pageSize,
    });
  };

  const toggleMonth = (m: number) => {
    setSelectedMonths((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  const hasActiveTokens =
    selectedYears.length > 0 ||
    profileIds.length > 0 ||
    serviceIds.length > 0 ||
    componentIds.length > 0;

  return (
    <form onSubmit={handleFormSubmit} className="report-filters-form">
      <div className="report-filters-grid">
        <div className="report-filter-group">
          <label className="report-filter-label">Поиск по заголовку:</label>
          <input
            type="text"
            placeholder="Текст..."
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
            className="report-filter-input"
          />
        </div>

        <ErpCombobox
          label="Отбор по году:"
          items={yearsDirectory}
          selectedId={0}
          onChange={(id) =>
            id > 0 &&
            !selectedYears.includes(id) &&
            setSelectedYears([...selectedYears, id])
          }
        />

        <ErpCombobox
          label={isEmployeesLoading ? 'Загрузка сотрудников...' : 'Отбор по сотруднику:'}
          items={employeesItems}
          selectedId={0}
          disabled={isEmployeesLoading}
          onChange={(id) =>
            id > 0 && !profileIds.includes(id) && setProfileIds([...profileIds, id])
          }
        />

        <ErpCombobox
          label="Отбор по услуге:"
          items={services}
          selectedId={0}
          onChange={(id) =>
            id > 0 && !serviceIds.includes(id) && setServiceIds([...serviceIds, id])
          }
        />

        <ErpCombobox
          label="Отбор по компоненту:"
          items={components}
          selectedId={0}
          onChange={(id) =>
            id > 0 && !componentIds.includes(id) && setComponentIds([...componentIds, id])
          }
        />
      </div>

      {hasActiveTokens && (
        <div className="report-tokens-bar">
          {selectedYears.map((year) => (
            <span key={`y-${year}`} className="report-token report-token--year">
              📅 {year} г.
              <button
                type="button"
                className="report-token-remove"
                onClick={() => setSelectedYears(selectedYears.filter((x) => x !== year))}
              >
                ×
              </button>
            </span>
          ))}

          {profileIds.map((id) => {
            const matchedItem = employeesItems.find((e) => e.id === id);
            return (
              <span key={`p-${id}`} className="report-token report-token--profile">
                {matchedItem?.name || `👤 Сотрудник №${id}`}
                <button
                  type="button"
                  className="report-token-remove"
                  onClick={() => setProfileIds(profileIds.filter((x) => x !== id))}
                >
                  ×
                </button>
              </span>
            );
          })}

          {serviceIds.map((id) => (
            <span key={`s-${id}`} className="report-token report-token--service">
              🛠️ {services.find((s) => s.id === id)?.name}
              <button
                type="button"
                className="report-token-remove"
                onClick={() => setServiceIds(serviceIds.filter((x) => x !== id))}
              >
                ×
              </button>
            </span>
          ))}

          {componentIds.map((id) => (
            <span key={`c-${id}`} className="report-token report-token--component">
              📦 {components.find((c) => c.id === id)?.name}
              <button
                type="button"
                className="report-token-remove"
                onClick={() => setComponentIds(componentIds.filter((x) => x !== id))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="report-filters-bottom">
        <div>
          <span className="report-months-label">Месяцы:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
            const isSelected = selectedMonths.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMonth(m)}
                className={`report-month-btn ${
                  isSelected ? 'report-month-btn--selected' : ''
                }`}
              >
                {String(m).padStart(2, '0')}
              </button>
            );
          })}
        </div>

        <div className="report-page-size-box">
          <span className="report-page-size-label">Строк на странице:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="report-page-size-select"
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <button type="submit" disabled={isFetching} className="report-generate-btn">
          {isFetching ? 'Формирование...' : 'Сформировать отчет'}
        </button>
      </div>
    </form>
  );
};
