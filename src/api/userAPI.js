// === src/api/userAPI.js ===
import axiosInstance from './axiosInstance';

export const fetchProfile = async () => {
  const response = await axiosInstance.get('/users/profile');
  return response.data;
};