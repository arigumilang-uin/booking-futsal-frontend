// src/api/bookingAPI.js
import axios from 'axios';

export const fetchUserBookings = (token) => {
  return axios.get('/api/bookings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createBooking = (token, bookingData) => {
  return axios.post('/api/bookings', bookingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const cancelBooking = (token, bookingId) => {
  return axios.delete(`/api/bookings/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateBookingStatus = (token, bookingId, status) => {
  return axios.put(`/api/bookings/${bookingId}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
