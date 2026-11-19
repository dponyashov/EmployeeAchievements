import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useGetMeetingRoomsQuery,
  useCreateMeetingRoomMutation,
  useUpdateMeetingRoomMutation,
  useDeleteMeetingRoomMutation,
  type MeetingRoom,
} from '../bookingsApi';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';
import '../bookings.css';

interface RoomsDirectoryTabProps {
  canManageRooms: boolean;
}

export const RoomsDirectoryTab: React.FC<RoomsDirectoryTabProps> = ({
  canManageRooms,
}) => {
  const { data: rooms = [], refetch } = useGetMeetingRoomsQuery(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);

  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(6);
  const [equipment, setEquipment] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [createRoom, { error: createErr, reset: resetCreate }] =
    useCreateMeetingRoomMutation();
  const [updateRoom, { error: updateErr, reset: resetUpdate }] =
    useUpdateMeetingRoomMutation();
  const [deleteRoom] = useDeleteMeetingRoomMutation();

  const openCreate = () => {
    resetCreate();
    resetUpdate();
    setEditingRoom(null);
    setName('');
    setCapacity(6);
    setEquipment('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = () => {
    const target = rooms.find((r) => r.id === selectedId);
    if (!target) {
      alert('Выделите помещение в списке.');
      return;
    }
    resetCreate();
    resetUpdate();
    setEditingRoom(target);
    setName(target.name);
    setCapacity(target.capacity);
    setEquipment(target.equipment || '');
    setIsActive(target.isActive);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) {
      alert('Выделите помещение для удаления.');
      return;
    }
    if (!window.confirm('Удалить выбранное помещение и все его бронирования?')) return;
    await deleteRoom(selectedId).unwrap();
    setSelectedId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, capacity: Number(capacity), equipment, isActive };
    try {
      if (editingRoom) {
        await updateRoom({ id: editingRoom.id, data: payload }).unwrap();
      } else {
        await createRoom(payload).unwrap();
      }
      setModalOpen(false);
    } catch {
      // Ошибка отображается в ErpErrorBanner
    }
  };

  return (
    <div>
      {canManageRooms && (
        <ErpCommandBar
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={handleDelete}
          onRefresh={refetch}
        />
      )}

      <table className="bookings-journal-table">
        <thead>
          <tr>
            <th style={{ width: '70px' }}>Код</th>
            <th>Наименование помещения</th>
            <th style={{ width: '120px' }}>Вместимость</th>
            <th>Оснащение</th>
            <th style={{ width: '130px' }}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => {
            const isSelected = selectedId === r.id;
            return (
              <tr
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                onDoubleClick={() => canManageRooms && openEdit()}
                className={`bookings-journal-row ${
                  isSelected ? 'bookings-journal-row--selected' : ''
                }`}
              >
                <td>{r.id}</td>
                <td className={!r.isActive ? 'bookings-room-inactive' : 'font-bold'}>
                  {r.name}
                </td>
                <td>до {r.capacity} чел.</td>
                <td>{r.equipment || '—'}</td>
                <td>
                  <span
                    className={`bookings-status-pill ${
                      r.isActive
                        ? 'bookings-status-pill--active'
                        : 'bookings-status-pill--closed'
                    }`}
                  >
                    {r.isActive ? 'Доступно' : 'Закрыто'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {modalOpen &&
        createPortal(
          <div className="bookings-modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="bookings-modal-window" onClick={(e) => e.stopPropagation()}>
              <div className="bookings-modal-header">
                <span>
                  {editingRoom ? 'Редактирование помещения' : 'Новое помещение'}
                </span>
                <button
                  type="button"
                  className="bookings-modal-close"
                  onClick={() => setModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSave} className="bookings-modal-body">
                <ErpErrorBanner error={createErr || updateErr} />

                <div className="bookings-form-row">
                  <label>Наименование:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="bookings-form-row">
                  <label>Вместимость (чел.):</label>
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="bookings-form-row">
                  <label>Оснащение (ВКС, проектор и т.д.):</label>
                  <input
                    type="text"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                  />
                </div>

                <label>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />{' '}
                  Помещение доступно для бронирования
                </label>

                <div className="bookings-modal-actions">
                  <span />
                  <div className="bookings-toolbar-right">
                    <button type="submit" className="erp-btn-primary">
                      Записать
                    </button>
                    <button
                      type="button"
                      className="erp-cmd-btn"
                      onClick={() => setModalOpen(false)}
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
