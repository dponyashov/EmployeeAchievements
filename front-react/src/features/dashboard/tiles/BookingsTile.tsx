import React from 'react';
import { useGetRoomBookingsQuery } from '../../bookings/bookingsApi';

interface TileProps {
  onClick: () => void;
}

const getTodayIso = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

export const BookingsTile: React.FC<TileProps> = ({ onClick }) => {
  const today = getTodayIso();
  const { data: todayBookings = [], isLoading } = useGetRoomBookingsQuery({
    date: today,
  });

  return (
    <div className="erp-tile" onClick={onClick}>
      <div className="erp-tile-icon">🏢</div>
      <div className="erp-tile-title">Переговорные</div>
      <div className="erp-tile-info">Бронирование помещений для совещаний.</div>
      <div className="erp-tile-counter">
        {isLoading ? '...' : `Сегодня броней: ${todayBookings.length}`}
      </div>
    </div>
  );
};
