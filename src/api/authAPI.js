// === src/api/authAPI.js ===
import axiosInstance from './axiosInstance';

export const loginUser = async (email, password) => {
  const response = await axiosInstance.post('/user/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await axiosInstance.post('/user/auth/register', { name, email, password });
  return response.data;
};