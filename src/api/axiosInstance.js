// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false, // tidak pakai cookie
});

// Tambahkan interceptor untuk menambahkan token ke header
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // atau dari Context jika disimpan di state
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
