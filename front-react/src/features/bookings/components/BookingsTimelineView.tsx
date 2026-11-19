import React from 'react';
import type { MeetingRoom, RoomBooking } from '../bookingsApi';
import '../bookings.css';

interface BookingsTimelineViewProps {
  rooms: MeetingRoom[];
  bookings: RoomBooking[];
  currentUserId?: number;
  onSlotClick: (roomId: number, hourStr: string) => void;
  onBookingClick: (booking: RoomBooking) => void;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]; //Рабочие часы

const parseHour = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m || 0) / 60;
};

export const BookingsTimelineView: React.FC<BookingsTimelineViewProps> = ({
  rooms,
  bookings,
  currentUserId,
  onSlotClick,
  onBookingClick,
}) => {
  const activeRooms = rooms.filter((r) => r.isActive);

  if (activeRooms.length === 0) {
    return (
      <div className="erp-empty-table">
        Нет активных помещений для совещаний. Добавьте помещения во вкладке «Помещения».
      </div>
    );
  }

  return (
    <>
      <div className="bookings-grid-wrap">
        <table className="bookings-timeline-table">
          <thead>
            <tr>
              <th className="col-room-name">Помещение</th>
              {HOURS.map((h) => (
                <th key={h}>{String(h).padStart(2, '0')}:00</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeRooms.map((room) => {
              const roomBookings = bookings.filter((b) => b.roomId === room.id);

              // Отрисовка ячеек по часам с объединением colSpan для длительных броней
              const cells: React.ReactNode[] = [];
              let idx = 0;

              while (idx < HOURS.length) {
                const hour = HOURS[idx];
                const slotStart = hour;
                const slotEnd = hour + 1;

                // Ищем бронь, которая начинается в этом часе или перекрывает его первой
                const booking = roomBookings.find((b) => {
                  const bStart = parseHour(b.startTime);
                  const bEnd = parseHour(b.endTime);
                  return bStart < slotEnd && bEnd > slotStart;
                });

                if (booking) {
                  const bEnd = parseHour(booking.endTime);
                  let span = 1;
                  while (idx + span < HOURS.length && HOURS[idx + span] < bEnd) {
                    span++;
                  }

                  const isOwn =
                    currentUserId != null && booking.authorUserId === currentUserId;

                  cells.push(
                    <td
                      key={`${room.id}-${hour}`}
                      colSpan={span}
                      className={`bookings-slot-busy ${
                        isOwn ? 'bookings-slot-busy--own' : ''
                      }`}
                      onClick={() => onBookingClick(booking)}
                      title={`${booking.startTime.slice(0, 5)}–${booking.endTime.slice(
                        0,
                        5,
                      )} | ${booking.title} (${booking.authorFullName})`}
                    >
                      <div className="bookings-slot-busy-time">
                        {booking.startTime.slice(0, 5)}–{booking.endTime.slice(0, 5)}
                      </div>
                      <div className="bookings-slot-busy-title">{booking.title}</div>
                      <div className="bookings-slot-busy-author">
                        {booking.authorFullName}
                      </div>
                    </td>,
                  );
                  idx += span;
                } else {
                  const hourStr = `${String(hour).padStart(2, '0')}:00`;
                  cells.push(
                    <td
                      key={`${room.id}-${hour}`}
                      className="bookings-slot-free"
                      onClick={() => onSlotClick(room.id, hourStr)}
                      title={`Забронировать «${room.name}» с ${hourStr}`}
                    >
                      +
                    </td>,
                  );
                  idx += 1;
                }
              }

              return (
                <tr key={room.id}>
                  <td className="bookings-room-cell">
                    <div className="bookings-room-title">{room.name}</div>
                    <div className="bookings-room-meta">
                      До {room.capacity} чел.
                      {room.equipment ? ` • ${room.equipment}` : ''}
                    </div>
                  </td>
                  {cells}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bookings-legend">
        <span className="bookings-legend-item">
          <span className="bookings-legend-box bookings-legend-box--own" /> Ваши брони
        </span>
        <span className="bookings-legend-item">
          <span className="bookings-legend-box bookings-legend-box--other" /> Занято
          коллегами
        </span>
        <span>• Нажмите на свободную ячейку «+», чтобы быстро создать бронь</span>
      </div>
    </>
  );
};
