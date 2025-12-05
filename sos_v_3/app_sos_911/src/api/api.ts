import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la instancia de Axios para el backend
const api = axios.create({
  //baseURL: 'http://192.168.40.81:4000', // Dirección IP de tu computadora y puerto 1000
  baseURL: 'http://192.168.100.225:4000', // Dirección IP de tu computadora y puerto 1000
  timeout: 10000, // Tiempo de espera para las solicitudes
  headers: {
    'Content-Type': 'application/json', // Tipo de contenido por defecto para las solicitudes
  },
  // withCredentials: true, // COMENTADO: Manejamos la cookie manualmente para evitar duplicados
});

// Interceptor para agregar el token CSRF automáticamente a las solicitudes
api.interceptors.request.use(
  async (config) => {
    try {
      // Intenta obtener el token CSRF del almacenamiento asíncrono
      const token = await AsyncStorage.getItem('csrfToken');
      if (token) {
        // Si el token existe, lo añade al encabezado 'X-CSRF-Token'
        config.headers['X-CSRF-Token'] = token;
      }

      // Intenta obtener la cookie de sesión
      // COMENTADO: La gestión de cookies nativa de React Native/Axios ya debería manejar esto.
      // Al agregarlo manualmente, estamos enviando la cookie dos veces, lo que confunde al backend.
      /*
      const sessionCookie = await AsyncStorage.getItem('sessionCookie');
      if (sessionCookie) {
        config.headers['Cookie'] = sessionCookie;
      }
      */
    } catch (error) {
      console.error('Error al obtener el token CSRF para el interceptor:', error);
    }
    return config; // Retorna la configuración de la solicitud modificada
  },
  (error) => {
    // Maneja cualquier error que ocurra antes de enviar la solicitud
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores de las solicitudes
api.interceptors.response.use(
  (response) => {
    // Retorna la respuesta si es exitosa
    return response;
  },
  (error) => {
    // Muestra un error en la consola si la solicitud falla
    console.error('Error de API:', error.response?.data || error.message);
    return Promise.reject(error); // Rechaza la promesa con el error
  }
);

export default api; // Exporta la instancia de Axios configurada
