import axios from 'axios';

const api = axios.create({
  // Asegúrate de que este puerto (5105) coincida con el de tu Backend
  baseURL: 'http://localhost:5105/api', 
});

// Esto inyecta el token de 30 minutos automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;