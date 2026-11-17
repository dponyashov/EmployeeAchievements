import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetDirectoryItemQuery, useSaveDirectoryItemMutation } from './directoriesApi';
import { PositionForm } from './components/PositionComponents';
import { DepartmentForm } from './components/DepartmentComponents';
import { parseErpError } from '../../utils/parseErpError';
import { ServiceForm } from './components/ServiceComponents';
import { ComponentForm } from './components/ComponentComponents';
import './directories.css';

export const DirectoryItemDispatcher: React.FC = () => {
  const { directoryUrl, id } = useParams<{ directoryUrl: string; id: string }>();
  const navigate = useNavigate();

  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const isNew = id === 'new';
  const { data: item, isLoading } = useGetDirectoryItemQuery(
    { cleanKey: directoryUrl || '', id: id || '' },
    { skip: isNew },
  );
  const [saveItem, { isLoading: isSaving }] = useSaveDirectoryItemMutation();

  if (isLoading && !isNew) {
    return <div className="erp-loading-text">Загрузка данных элемента...</div>;
  }

  const handleSave = async (formData: any) => {
    setErrorBanner(null);
    try {
      await saveItem({
        cleanKey: directoryUrl || '',
        id: id || '',
        data: formData,
      }).unwrap();
      alert('Данные успешно записаны в информационную базу.');
      navigate(`/directories/${directoryUrl}`);
    } catch (e: any) {
      const errorMessage = parseErpError(e);
      setErrorBanner(errorMessage);
      console.error('Ошибка манипуляции с НСИ:', e);
    }
  };

  const handleCancel = () => navigate(`/directories/${directoryUrl}`);

  const renderForm = () => {
    switch (directoryUrl) {
      case 'position':
        return <PositionForm item={item} onSave={handleSave} onCancel={handleCancel} />;
      case 'department':
        return <DepartmentForm item={item} onSave={handleSave} onCancel={handleCancel} />;
      case 'service':
        return <ServiceForm item={item} onSave={handleSave} onCancel={handleCancel} />;
      case 'component':
        return <ComponentForm item={item} onSave={handleSave} onCancel={handleCancel} />;
      default:
        return (
          <div className="sub-view">
            Ошибка конфигурации формы. Элемент управления не найден.
          </div>
        );
    }
  };

  return (
    <div className="erp-directory-form-container">
      {errorBanner && (
        <div className="erp-error-banner dir-form-error-banner">
          <span className="erp-error-icon">⚠️</span>
          <div className="erp-error-text">
            <strong>Исключение бизнес-логики:</strong> {errorBanner}
          </div>
        </div>
      )}

      <div className={isSaving ? 'dir-form-wrapper--saving' : undefined}>
        {renderForm()}
      </div>
    </div>
  );
};
