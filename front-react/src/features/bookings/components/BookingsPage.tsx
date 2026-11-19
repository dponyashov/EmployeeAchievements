import React, { useState } from 'react';
import { useAppSelector } from '../../../app/store';
import {
  useGetMeetingRoomsQuery,
  useGetRoomBookingsQuery,
  useDeleteRoomBookingMutation,
  type RoomBooking,
} from '../bookingsApi';
import { BookingsTimelineView } from './BookingsTimelineView';
import { BookingsJournalTable } from './BookingsJournalTable';
import { BookingFormModal } from './BookingFormModal';
import { RoomsDirectoryTab } from './RoomsDirectoryTab';
import { ErpCommandBar } from '../../../components/ui/ErpCommandBar';
import '../bookings.css';

const getTodayIso = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

const shiftDate = (isoDate: string, days: number) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
    dt.getDate(),
  ).padStart(2, '0')}`;
};

export const BookingsPage: React.FC = () => {
  const authUser = useAppSelector((state) => state.auth.user);
  const roles = authUser?.roles || [];

  const isPrivileged =
    roles.includes('ROLE_ADMIN') ||
    roles.includes('ROLE_SUPERVISOR') ||
    roles.includes('ROLE_DEPARTMENT_ALL');

  const canManageRooms =
    roles.includes('ROLE_ADMIN') ||
    roles.includes('ROLE_SERVICE') ||
    roles.includes('ROLE_DEPARTMENT_ALL');

  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso);
  const [roomFilterId, setRoomFilterId] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'timeline' | 'journal' | 'rooms'>('timeline');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // Состояние модального окна бронирования
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<RoomBooking | null>(null);
  const [presetRoomId, setPresetRoomId] = useState<number | undefined>(undefined);
  const [presetStartTime, setPresetStartTime] = useState<string | undefined>(undefined);

  const { data: rooms = [] } = useGetMeetingRoomsQuery(false);
  const {
    data: bookings = [],
    isFetching,
    refetch,
  } = useGetRoomBookingsQuery({
    date: selectedDate,
    roomId: roomFilterId || undefined,
  });
  const [deleteBooking] = useDeleteRoomBookingMutation();

  const canModifyBooking = (b: RoomBooking | null) => {
    if (!b) return true;
    if (isPrivileged) return true;
    return authUser?.id != null && b.authorUserId === authUser.id;
  };

  const openNewBooking = (roomId?: number, startTime?: string) => {
    setEditingBooking(null);
    setPresetRoomId(roomId);
    setPresetStartTime(startTime);
    setModalOpen(true);
  };

  const openExistingBooking = (booking: RoomBooking) => {
    setEditingBooking(booking);
    setPresetRoomId(undefined);
    setPresetStartTime(undefined);
    setModalOpen(true);
  };

  const handleJournalEdit = () => {
    const found = bookings.find((b) => b.id === selectedBookingId);
    if (!found) {
      alert('Выделите бронирование в журнале.');
      return;
    }
    openExistingBooking(found);
  };

  const handleJournalDelete = async () => {
    const found = bookings.find((b) => b.id === selectedBookingId);
    if (!found) {
      alert('Выделите бронирование для отмены.');
      return;
    }
    if (!canModifyBooking(found)) {
      alert('Отменять бронь может только её автор или администратор.');
      return;
    }
    if (!window.confirm('Отменить выбранное бронирование?')) return;
    await deleteBooking(found.id).unwrap();
    setSelectedBookingId(null);
  };

  const filteredRoomsForTimeline = roomFilterId
    ? rooms.filter((r) => r.id === roomFilterId)
    : rooms;

  return (
    <div className="bookings-page">
      <div className="bookings-toolbar">
        <div className="bookings-toolbar-left">
          <div className="bookings-view-tabs">
            <button
              type="button"
              className={`bookings-tab-btn ${
                viewMode === 'timeline' ? 'bookings-tab-btn--active' : ''
              }`}
              onClick={() => setViewMode('timeline')}
            >
              🗓️ Шахматка
            </button>
            <button
              type="button"
              className={`bookings-tab-btn ${
                viewMode === 'journal' ? 'bookings-tab-btn--active' : ''
              }`}
              onClick={() => setViewMode('journal')}
            >
              📋 Журнал ({bookings.length})
            </button>
            <button
              type="button"
              className={`bookings-tab-btn ${
                viewMode === 'rooms' ? 'bookings-tab-btn--active' : ''
              }`}
              onClick={() => setViewMode('rooms')}
            >
              🚪 Помещения ({rooms.length})
            </button>
          </div>

          {viewMode !== 'rooms' && (
            <>
              <div className="bookings-date-control">
                <button
                  type="button"
                  className="erp-cmd-btn"
                  onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
                  title="Предыдущий день"
                >
                  ◀
                </button>
                <input
                  type="date"
                  className="bookings-date-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <button
                  type="button"
                  className="erp-cmd-btn"
                  onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
                  title="Следующий день"
                >
                  ▶
                </button>
                <button
                  type="button"
                  className="erp-cmd-btn"
                  onClick={() => setSelectedDate(getTodayIso())}
                >
                  Сегодня
                </button>
              </div>

              <select
                className="bookings-room-filter"
                value={roomFilterId}
                onChange={(e) => setRoomFilterId(Number(e.target.value))}
              >
                <option value={0}>Все помещения</option>
                {rooms
                  .filter((r) => r.isActive)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>
            </>
          )}
        </div>

        <div className="bookings-toolbar-right">
          {viewMode !== 'rooms' && (
            <button
              type="button"
              className="bookings-create-btn"
              onClick={() => openNewBooking(roomFilterId || undefined)}
            >
              ➕ Забронировать помещение
            </button>
          )}
        </div>
      </div>

      <div className="bookings-content">
        {isFetching && viewMode !== 'rooms' && (
          <div className="bookings-room-meta">Обновление расписания...</div>
        )}

        {viewMode === 'timeline' && (
          <BookingsTimelineView
            rooms={filteredRoomsForTimeline}
            bookings={bookings}
            currentUserId={authUser?.id}
            onSlotClick={(roomId, hourStr) => openNewBooking(roomId, hourStr)}
            onBookingClick={(booking) => openExistingBooking(booking)}
          />
        )}

        {viewMode === 'journal' && (
          <>
            <ErpCommandBar
              onCreate={() => openNewBooking(roomFilterId || undefined)}
              onEdit={handleJournalEdit}
              onDelete={handleJournalDelete}
              onRefresh={refetch}
            />
            <BookingsJournalTable
              bookings={bookings}
              selectedId={selectedBookingId}
              onSelectRow={setSelectedBookingId}
              onDoubleClickRow={(booking) => openExistingBooking(booking)}
            />
          </>
        )}

        {viewMode === 'rooms' && <RoomsDirectoryTab canManageRooms={canManageRooms} />}
      </div>

      <BookingFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        rooms={rooms}
        defaultDate={selectedDate}
        initialBooking={editingBooking}
        presetRoomId={presetRoomId}
        presetStartTime={presetStartTime}
        canEditOrDelete={canModifyBooking(editingBooking)}
      />
    </div>
  );
};
