// src/features/directories/CounterpartiesList.tsx
import React from 'react';
import { useGetCounterpartiesQuery } from './counterpartiesApi';
import './CounterpartiesList.css'; // Стили ниже

export const CounterpartiesList: React.FC = () => {
  const { data: counterparties, isLoading, error, refetch } = useGetCounterpartiesQuery();

  if (isLoading) {
    return (
      <div className="erp-loading-text">Загрузка данных из информационной базы...</div>
    );
  }

  if (error) {
    return (
      <div className="erp-error-text">Ошибка загрузки НСИ. Проверьте права доступа.</div>
    );
  }

  return (
    <div className="erp-directory-container">
      {/* Заголовок формы справочника */}
      <div className="erp-directory-header">
        <h2>Справочник "Контрагенты"</h2>
      </div>

      {/* Командная панель */}
      <div className="erp-command-bar">
        <button className="erp-cmd-btn font-bold">➕ Создать</button>
        <button className="erp-cmd-btn">📋 Создать новым копированием</button>
        <button className="erp-cmd-btn">✏️ Изменить</button>
        <button className="erp-cmd-btn" onClick={() => refetch()}>
          🔄 Обновить
        </button>
        <div className="erp-command-bar-separator"></div>
        <input type="text" className="erp-search-input" placeholder="Поиск (Ctrl+F)..." />
      </div>

      {/* Табличная часть (Динамический список) */}
      <div className="erp-table-wrapper">
        <table className="erp-v8-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Код</th>
              <th>Наименование контрагента</th>
              <th style={{ width: '120px' }}>ИНН</th>
              <th style={{ width: '100px' }}>КПП</th>
              <th style={{ width: '90px' }}>Клиент</th>
              <th style={{ width: '90px' }}>Поставщик</th>
            </tr>
          </thead>
          <tbody>
            {counterparties && counterparties.length > 0 ? (
              counterparties.map((item) => (
                <tr
                  key={item.id}
                  onDoubleClick={() => alert(`Открытие карточки: ${item.fullName}`)}
                >
                  <td className="text-center">{item.id}</td>
                  <td className="text-left font-medium">
                    {item.shortName || item.fullName}
                  </td>
                  <td className="text-center">{item.inn}</td>
                  <td className="text-center">{item.kpp}</td>
                  <td className="text-center">{item.isClient ? '☑' : '☐'}</td>
                  <td className="text-center">{item.isSupplier ? '☑' : '☐'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="erp-empty-table">
                  В информационной базе нет записей для отображения.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
