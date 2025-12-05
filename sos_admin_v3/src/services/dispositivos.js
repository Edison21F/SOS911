// src/services/dispositivos.js
import axios from '../api/axios'; // Asegúrate de que esta ruta sea correcta para tu instancia de axios

// Función para obtener el token CSRF
export const obtenerCsrfToken = async () => {
    try {
        const response = await axios.get('/csrf-token', { withCredentials: true });
        // Asegúrate de que la estructura de la respuesta sea response.data.data.csrfToken o response.data.csrfToken
        const csrfToken = response.data.data?.csrfToken || response.data.csrfToken;
        localStorage.setItem("csrfToken", csrfToken);
        return csrfToken;
    } catch (error) {
        console.error("Error al obtener el token CSRF:", error.response?.data || error.message);
        throw error;
    }
};

// Función para obtener todos los dispositivos
export const obtenerTodosLosDispositivos = async () => {
    try {
        const response = await axios.get('/dispositivos/listar', { withCredentials: true });
        // Transformar los datos de la API al formato que espera el frontend
        const dispositivosTransformados = response.data.map(dispositivo => ({
            id: dispositivo.id,
            clienteId: dispositivo.clienteId, // Asumiendo que el backend ya devuelve clienteId
            tipoDispositivo: dispositivo.tipo_dispositivo, // Asegúrate de que el backend devuelve esto
            nombre: dispositivo.modelo_dispositivo, // Asegúrate de que el backend devuelve esto
            tokenDispositivo: dispositivo.token_dispositivo,
            estado: dispositivo.estado,
            fechaCreacion: dispositivo.fecha_creacion,
            eliminado: dispositivo.estado === 'eliminado'
        }));
        return dispositivosTransformados;
    } catch (error) {
        console.error("Error al obtener dispositivos:", error.response?.data || error.message);
        throw error;
    }
};

// Función para eliminar un dispositivo
export const eliminarDispositivo = async (id) => {
    try {
        const csrfToken = localStorage.getItem("csrfToken");
        if (!csrfToken) {
            throw new Error('Token CSRF no disponible para eliminar dispositivo.');
        }
        const response = await axios.delete(`/dispositivos/eliminar/${id}`, {
            headers: {
                'X-CSRF-Token': csrfToken,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar el dispositivo con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// Función para crear un nuevo dispositivo
export const crearDispositivo = async (nuevoDispositivoData) => {
    try {
        const csrfToken = localStorage.getItem("csrfToken");
        if (!csrfToken) {
            throw new Error('Token CSRF no disponible para crear dispositivo.');
        }
        const response = await axios.post('/dispositivos/crear', nuevoDispositivoData, {
            headers: {
                'X-CSRF-Token': csrfToken,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Error al crear dispositivo:", error.response?.data || error.message);
        throw error;
    }
};

// Función para actualizar un dispositivo existente
export const actualizarDispositivo = async (id, dispositivoData) => {
    try {
        const csrfToken = localStorage.getItem("csrfToken");
        if (!csrfToken) {
            throw new Error('Token CSRF no disponible para actualizar dispositivo.');
        }
        const response = await axios.put(`/dispositivos/actualizar/${id}`, dispositivoData, {
            headers: {
                'X-CSRF-Token': csrfToken,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el dispositivo con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};
