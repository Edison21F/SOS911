// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  // ¡IMPORTANTE! Cambia esta URL a la de tu backend en Railway
  baseURL: 'http://192.168.100.225:4000',
  withCredentials: true, // MUY IMPORTANTE: Para que las cookies (incluyendo CSRF) se envíen
  headers: {
    'Content-Type': 'application/json' // Por defecto, si envías FormData, Axios lo detecta y configura el Content-Type
  }
});

// Interceptor de solicitudes para añadir el CSRF token a los encabezados
instance.interceptors.request.use(config => {
  // Solo añade el token si el método no es GET, HEAD u OPTIONS (métodos que no requieren CSRF)
  // y si hay un token CSRF disponible en localStorage
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method.toUpperCase())) {
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken; // Añade el token al encabezado
    }
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default instance;
