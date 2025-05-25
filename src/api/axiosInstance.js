import axios from 'axios';

const baseURL =
  import.meta.env.MODE === 'development'
    ? '/api'
    : import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // ✅ cookie dikirim
});

export default axiosInstance;
