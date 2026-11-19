import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/baseQuery';

export interface MeetingRoom {
  id: number;
  name: string;
  capacity: number;
  equipment?: string;
  isActive: boolean;
}

export interface MeetingRoomRequest {
  name: string;
  capacity: number;
  equipment?: string;
  isActive: boolean;
}

export interface RoomBooking {
  id: number;
  roomId: number;
  roomName: string;
  authorId: number;
  authorUserId: number | null;
  authorFullName: string;
  title: string;
  description?: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss или HH:mm
  endTime: string; // HH:mm:ss или HH:mm
}

export interface RoomBookingRequest {
  roomId: number;
  title: string;
  description?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
}

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['MeetingRooms', 'RoomBookings'],
  endpoints: (builder) => ({
    // --- Помещения для совещаний ---
    getMeetingRooms: builder.query<MeetingRoom[], boolean | void>({
      query: (onlyActive = false) => ({
        url: '/directory/room',
        method: 'GET',
        params: { onlyActive },
      }),
      providesTags: ['MeetingRooms'],
    }),
    createMeetingRoom: builder.mutation<MeetingRoom, MeetingRoomRequest>({
      query: (data) => ({
        url: '/directory/room',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['MeetingRooms'],
    }),
    updateMeetingRoom: builder.mutation<
      MeetingRoom,
      { id: number; data: MeetingRoomRequest }
    >({
      query: ({ id, data }) => ({
        url: `/directory/room/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['MeetingRooms'],
    }),
    deleteMeetingRoom: builder.mutation<boolean, number>({
      query: (id) => ({
        url: `/directory/room/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MeetingRooms', 'RoomBookings'],
    }),

    // --- Бронирование помещений ---
    getRoomBookings: builder.query<RoomBooking[], { date: string; roomId?: number }>({
      query: ({ date, roomId }) => ({
        url: '/booking',
        method: 'GET',
        params: {
          date,
          ...(roomId ? { roomId } : {}),
        },
      }),
      providesTags: ['RoomBookings'],
    }),
    createRoomBooking: builder.mutation<RoomBooking, RoomBookingRequest>({
      query: (data) => ({
        url: '/booking',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['RoomBookings'],
    }),
    updateRoomBooking: builder.mutation<
      RoomBooking,
      { id: number; data: RoomBookingRequest }
    >({
      query: ({ id, data }) => ({
        url: `/booking/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['RoomBookings'],
    }),
    deleteRoomBooking: builder.mutation<boolean, number>({
      query: (id) => ({
        url: `/booking/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RoomBookings'],
    }),
  }),
});

export const {
  useGetMeetingRoomsQuery,
  useCreateMeetingRoomMutation,
  useUpdateMeetingRoomMutation,
  useDeleteMeetingRoomMutation,
  useGetRoomBookingsQuery,
  useCreateRoomBookingMutation,
  useUpdateRoomBookingMutation,
  useDeleteRoomBookingMutation,
} = bookingsApi;
