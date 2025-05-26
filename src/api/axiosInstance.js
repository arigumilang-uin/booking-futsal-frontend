import axios from 'axios';

const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000' //localhost backend
    : import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // kirim cookie untuk autentikasi
});

export default axiosInstance;
