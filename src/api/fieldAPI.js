// src/api/fieldAPI.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api'; // Ganti jika beda port

export const getFields = async () => {
  const response = await axios.get(`${BASE_URL}/fields`);
  return response.data;
};
