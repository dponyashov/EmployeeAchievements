import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetDirectoryDataQuery,
  useGetDirectoriesMetaQuery,
  useDeleteDirectoryItemMutation,
} from './directoriesApi';
import { PositionList } from './components/PositionComponents';
import { DepartmentList } from './components/DepartmentComponents';
import { ServiceList } from './components/ServiceComponents';
import { ComponentList } from './components/ComponentComponents';
import { ProfileComponents } from './components/profile/ProfileComponents';
import './directories.css';

export const DirectoryDispatcher: React.FC = () => {
  const { directoryUrl } = useParams<{ directoryUrl: string }>();
  const navigate = useNavigate();

  const { data: meta } = useGetDirectoriesMetaQuery();
  const { data, isLoading, refetch } = useGetDirectoryDataQuery(directoryUrl || '', {
    skip: !directoryUrl,
  });

  const [deleteItem] = useDeleteDirectoryItemMutation();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (!directoryUrl) {
    return (
      <div className="sub-view dir-sub-view">
        <h2>Справочники (НСИ)</h2>
        <ul className="dir-nav-list">
          {meta?.map((d) => {
            const cleanUrl = d.url.replace('/directory/', '').replace('/', '');
            return (
              <li
                key={d.url}
                className="dir-nav-item"
                onClick={() => navigate(`/directories/${cleanUrl}`)}
              >
                • {d.name}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const currentData = data || [];

  const handleCreate = () => navigate(`/directories/${directoryUrl}/new`);

  const handleEdit = () => {
    if (selectedId) {
      navigate(`/directories/${directoryUrl}/${selectedId}`);
    } else {
      alert('Выделите строку в списке для изменения.');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) {
      alert('Выделите элемент для удаления.');
      return;
    }
    if (window.confirm('Объект будет удален из информационной базы. Продолжить?')) {
      try {
        await deleteItem({ cleanKey: directoryUrl, id: selectedId }).unwrap();
        setSelectedId(null);
        alert('Элемент успешно удален.');
      } catch (e) {
        alert('Ошибка удаления. Возможно, объект используется в других документах.');
      }
    }
  };

  const handleDoubleClickRow = (id: number) => {
    navigate(`/directories/${directoryUrl}/${id}`);
  };

  const listProps = {
    data: currentData,
    selectedId,
    onSelectRow: setSelectedId,
    onDoubleClickRow: handleDoubleClickRow,
    onCreate: handleCreate,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRefresh: refetch,
  };

  if (isLoading) {
    return (
      <div className="erp-loading-text dir-loading-text">
        Загрузка данных динамического списка...
      </div>
    );
  }

  switch (directoryUrl) {
    case 'position':
      return <PositionList {...listProps} />;
    case 'department':
      return <DepartmentList {...listProps} />;
    case 'service':
      return <ServiceList {...listProps} />;
    case 'component':
      return <ComponentList {...listProps} />;
    case 'profile':
      return (
        <ProfileComponents
          data={currentData}
          selectedId={selectedId}
          onSelectRow={setSelectedId}
          onDelete={async (id) => {
            if (window.confirm('Удалить сотрудника?')) {
              await deleteItem({ cleanKey: 'profile', id }).unwrap();
              setSelectedId(null);
            }
          }}
          onRefresh={refetch}
        />
      );
    default:
      return (
        <div className="sub-view dir-sub-view">
          ⚠️ Справочник "/{directoryUrl}" зарегистрирован, но для него отсутствует
          компонент отображения списка.
        </div>
      );
  }
};
