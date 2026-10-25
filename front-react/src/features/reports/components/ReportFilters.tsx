import React, { useState, useMemo } from 'react';
import { type ReportQueryParams } from '../reportsApi';
import {
  useGetComponentsDirectoryQuery,
  useGetServicesDirectoryQuery,
} from '../../tasks/tasksApi';
import { ErpCombobox } from '../../../components/ui/ErpCombobox';
import { useGetDirectoryDataQuery } from '../../directories/directoriesApi';

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

  // Стягиваем справочники услуг и компонентов
  const { data: services = [] } = useGetServicesDirectoryQuery();
  const { data: components = [] } = useGetComponentsDirectoryQuery();

  // 🚀 Загружаем полноценный НСИ-справочник сотрудников (профилей) по адресу /directory/profile
  // Если у вас используется другой хук (например, useGetProfilesQuery), подставьте его имя
  const { data: employees = [], isLoading: isEmployeesLoading } =
    useGetDirectoryDataQuery('profile');

  // 🚀 Формируем кадровый список ФИО + Должность для ErpCombobox
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

  return (
    <form
      onSubmit={handleFormSubmit}
      style={{ background: '#f5f5f5', borderBottom: '1px solid #ccc', padding: '12px' }}
    >
      {/* СЕТКА ПОЛЕЙ ВЫБОРА */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '10px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontWeight: 'bold' }}>Поиск по заголовку:</label>
          <input
            type="text"
            placeholder="Текст..."
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
            style={{
              padding: '4px',
              border: '1px solid #bbb',
              outline: 'none',
              fontSize: '13px',
            }}
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

        {/* Выпадающий список кадровых сотрудников 🚀 */}
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

      {/* ЛЕНТА АКТИВНЫХ ТОКЕНОВ ОТБОРА */}
      {(selectedYears.length > 0 ||
        profileIds.length > 0 ||
        serviceIds.length > 0 ||
        componentIds.length > 0) && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '12px',
            background: '#fff',
            padding: '6px',
            border: '1px solid #ddd',
          }}
        >
          {selectedYears.map((year) => (
            <span
              key={`y-${year}`}
              style={{
                background: '#f5f5f5',
                border: '1px solid #bbb',
                padding: '2px 6px',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              📅 {year} г.
              <button
                type="button"
                onClick={() => setSelectedYears(selectedYears.filter((x) => x !== year))}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'red',
                  fontWeight: 'bold',
                }}
              >
                ×
              </button>
            </span>
          ))}

          {/* Кадровые токены сотрудников с ФИО 🚀 */}
          {profileIds.map((id) => {
            const matchedItem = employeesItems.find((e) => e.id === id);
            return (
              <span
                key={`p-${id}`}
                style={{
                  background: '#e1f5fe',
                  border: '1px solid #03a9f4',
                  padding: '2px 6px',
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {matchedItem?.name || `👤 Сотрудник №${id}`}
                <button
                  type="button"
                  onClick={() => setProfileIds(profileIds.filter((x) => x !== id))}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'red',
                    fontWeight: 'bold',
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}

          {serviceIds.map((id) => (
            <span
              key={`s-${id}`}
              style={{
                background: '#fff9e6',
                border: '1px solid #ffcc00',
                padding: '2px 6px',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              🛠️ {services.find((s) => s.id === id)?.name}
              <button
                type="button"
                onClick={() => setServiceIds(serviceIds.filter((x) => x !== id))}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'red',
                  fontWeight: 'bold',
                }}
              >
                ×
              </button>
            </span>
          ))}
          {componentIds.map((id) => (
            <span
              key={`c-${id}`}
              style={{
                background: '#e2ece9',
                border: '1px solid #a3c1ad',
                padding: '2px 6px',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              📦 {components.find((c) => c.id === id)?.name}
              <button
                type="button"
                onClick={() => setComponentIds(componentIds.filter((x) => x !== id))}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'red',
                  fontWeight: 'bold',
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* НИЖНЯЯ ПАНЕЛЬ МЕСЯЦЕВ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px dashed #ccc',
          paddingTop: '10px',
          flexWrap: 'wrap',
          gap: '15px',
        }}
      >
        <div>
          <span style={{ fontWeight: 'bold', marginRight: '6px' }}>Месяцы:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
            const isSelected = selectedMonths.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMonth(m)}
                style={{
                  padding: '2px 6px',
                  marginRight: '3px',
                  background: isSelected ? '#ffcc00' : '#fff',
                  border: '1px solid #bbb',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: isSelected ? 'bold' : 'normal',
                }}
              >
                {String(m).padStart(2, '0')}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            marginLeft: '20px',
          }}
        >
          <span style={{ fontWeight: 'bold', color: '#333' }}>Строк на странице:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{
              padding: '2px 6px',
              border: '1px solid #bbb',
              background: '#fff',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isFetching}
          style={{
            background: '#ffcc00',
            border: '1px solid #997a00',
            padding: '4px 25px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          {isFetching ? 'Формирование...' : 'Сформировать отчет'}
        </button>
      </div>
    </form>
  );
};
