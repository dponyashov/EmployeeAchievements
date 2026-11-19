import React from 'react';
import type { RoomBooking } from '../bookingsApi';
import '../bookings.css';

interface BookingsJournalTableProps {
  bookings: RoomBooking[];
  selectedId: number | null;
  onSelectRow: (id: number) => void;
  onDoubleClickRow: (booking: RoomBooking) => void;
}

export const BookingsJournalTable: React.FC<BookingsJournalTableProps> = ({
  bookings,
  selectedId,
  onSelectRow,
  onDoubleClickRow,
}) => {
  return (
    <table className="bookings-journal-table">
      <thead>
        <tr>
          <th style={{ width: '120px' }}>Время</th>
          <th style={{ width: '240px' }}>Помещение</th>
          <th>Тема совещания</th>
          <th style={{ width: '210px' }}>Организатор</th>
        </tr>
      </thead>
      <tbody>
        {bookings.length > 0 ? (
          bookings.map((b) => {
            const isSelected = selectedId === b.id;
            return (
              <tr
                key={b.id}
                onClick={() => onSelectRow(b.id)}
                onDoubleClick={() => onDoubleClickRow(b)}
                className={`bookings-journal-row ${
                  isSelected ? 'bookings-journal-row--selected' : ''
                }`}
              >
                <td>
                  <span className="bookings-time-badge">
                    {b.startTime.slice(0, 5)} – {b.endTime.slice(0, 5)}
                  </span>
                </td>
                <td className="font-medium">{b.roomName}</td>
                <td>
                  <div className="font-bold">{b.title}</div>
                  {b.description && (
                    <div className="bookings-room-meta">{b.description}</div>
                  )}
                </td>
                <td>{b.authorFullName}</td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={4} className="erp-empty-table">
              На выбранную дату бронирований нет.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
