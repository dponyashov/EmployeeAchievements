import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  useCreateRoomBookingMutation,
  useUpdateRoomBookingMutation,
  useDeleteRoomBookingMutation,
  type MeetingRoom,
  type RoomBooking,
} from '../bookingsApi';
import { ErpErrorBanner } from '../../../components/ui/ErpErrorBanner';
import '../bookings.css';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: MeetingRoom[];
  defaultDate: string;
  initialBooking?: RoomBooking | null;
  presetRoomId?: number;
  presetStartTime?: string;
  canEditOrDelete: boolean;
}

const formatTimeShort = (t?: string) => (t ? t.slice(0, 5) : '09:00');

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isOpen,
  onClose,
  rooms,
  defaultDate,
  initialBooking,
  presetRoomId,
  presetStartTime,
  canEditOrDelete,
}) => {
  const activeRooms = rooms.filter((r) => r.isActive || r.id === initialBooking?.roomId);

  const [roomId, setRoomId] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bookingDate, setBookingDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const [
    createBooking,
    { isLoading: isCreating, error: createError, reset: resetCreate },
  ] = useCreateRoomBookingMutation();
  const [
    updateBooking,
    { isLoading: isUpdating, error: updateError, reset: resetUpdate },
  ] = useUpdateRoomBookingMutation();
  const [
    deleteBooking,
    { isLoading: isDeleting, error: deleteError, reset: resetDelete },
  ] = useDeleteRoomBookingMutation();

  useEffect(() => {
    if (!isOpen) return;
    resetCreate();
    resetUpdate();
    resetDelete();

    if (initialBooking) {
      setRoomId(initialBooking.roomId);
      setTitle(initialBooking.title);
      setDescription(initialBooking.description || '');
      setBookingDate(initialBooking.bookingDate);
      setStartTime(formatTimeShort(initialBooking.startTime));
      setEndTime(formatTimeShort(initialBooking.endTime));
    } else {
      const firstRoomId = presetRoomId || activeRooms[0]?.id || 0;
      setRoomId(firstRoomId);
      setTitle('');
      setDescription('');
      setBookingDate(defaultDate);
      const start = presetStartTime || '09:00';
      setStartTime(start);
      const [startHourStr, startMinStr] = start.split(':');
      const nextHour = Math.min(Number(startHourStr) + 1, 23);
      setEndTime(`${String(nextHour).padStart(2, '0')}:${startMinStr || '00'}`);
    }
  }, [isOpen, initialBooking, presetRoomId, presetStartTime, defaultDate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isReadOnly = Boolean(initialBooking && !canEditOrDelete);
  const isBusy = isCreating || isUpdating || isDeleting;
  const activeError = createError || updateError || deleteError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const payload = {
      roomId: Number(roomId),
      title,
      description,
      bookingDate,
      startTime,
      endTime,
    };

    try {
      if (initialBooking) {
        await updateBooking({ id: initialBooking.id, data: payload }).unwrap();
      } else {
        await createBooking(payload).unwrap();
      }
      onClose();
    } catch {
      // Ошибка отобразится через ErpErrorBanner
    }
  };

  const handleDelete = async () => {
    if (!initialBooking || isReadOnly) return;
    if (!window.confirm('Отменить выбранное бронирование помещения?')) return;
    try {
      await deleteBooking(initialBooking.id).unwrap();
      onClose();
    } catch {
      // Ошибка отобразится через ErpErrorBanner
    }
  };

  return createPortal(
    <div className="bookings-modal-overlay" onClick={onClose}>
      <div className="bookings-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="bookings-modal-header">
          <span>
            {initialBooking
              ? isReadOnly
                ? `Просмотр брони №${initialBooking.id}`
                : `Редактирование брони №${initialBooking.id}`
              : 'Новое бронирование помещения'}
          </span>
          <button type="button" className="bookings-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bookings-modal-body">
          <ErpErrorBanner error={activeError} title="Не удалось выполнить операцию:" />

          {initialBooking && (
            <div className="bookings-room-meta">
              Организатор: <strong>{initialBooking.authorFullName}</strong>
            </div>
          )}

          <div className="bookings-form-row">
            <label>Помещение для совещания:</label>
            <select
              value={roomId}
              disabled={isReadOnly || isBusy}
              onChange={(e) => setRoomId(Number(e.target.value))}
              required
            >
              {activeRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (до {r.capacity} чел.)
                </option>
              ))}
            </select>
          </div>

          <div className="bookings-form-row">
            <label>Тема совещания:</label>
            <input
              type="text"
              placeholder="Например: Планерка отдела разработки"
              value={title}
              disabled={isReadOnly || isBusy}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="bookings-form-row">
            <label>Дата:</label>
            <input
              type="date"
              value={bookingDate}
              disabled={isReadOnly || isBusy}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </div>

          <div className="bookings-form-time-grid">
            <div className="bookings-form-row">
              <label>Время начала:</label>
              <input
                type="time"
                value={startTime}
                disabled={isReadOnly || isBusy}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="bookings-form-row">
              <label>Время окончания:</label>
              <input
                type="time"
                value={endTime}
                disabled={isReadOnly || isBusy}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="bookings-form-row">
            <label>Примечание / повестка (необязательно):</label>
            <textarea
              rows={3}
              value={description}
              disabled={isReadOnly || isBusy}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="bookings-modal-actions">
            <div>
              {initialBooking && !isReadOnly && (
                <button
                  type="button"
                  className="bookings-delete-btn"
                  disabled={isBusy}
                  onClick={handleDelete}
                >
                  ❌ Отменить бронь
                </button>
              )}
            </div>

            <div className="bookings-toolbar-right">
              {!isReadOnly && (
                <button type="submit" className="erp-btn-primary" disabled={isBusy}>
                  Записать
                </button>
              )}
              <button type="button" className="erp-cmd-btn" onClick={onClose}>
                Закрыть
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
