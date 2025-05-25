// src/api/userAPI.js
import axiosInstance from './axiosInstance';

export const fetchProfile = async () => {
  const response = await axiosInstance.get('/user/profile/me'); // <== diperbaiki
  return response.data;
};
