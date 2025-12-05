import axios from '../api/axios';

// Obtener CSRF token
export const obtenerCsrfToken = async () => {
  const response = await axios.get('/csrf-token', { withCredentials: true });
  const csrfToken = response.data.data?.csrfToken || response.data.csrfToken;
  localStorage.setItem("csrfToken", csrfToken);
  return csrfToken;
};

// Listar servicios de emergencia
export const listarServiciosEmergencia = async () => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.get('/servicios_emergencia/listar', {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Crear servicio de emergencia
export const crearServicioEmergencia = async (servicio, usuarioId) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.post('/servicios_emergencia/crear', 
    { ...servicio, usuarioId },
    {
      headers: { "X-CSRF-Token": csrfToken },
      withCredentials: true
    }
  );
  return response.data;
};

// Actualizar servicio de emergencia
export const actualizarServicioEmergencia = async (id, servicioEditado) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.put(`/servicios_emergencia/actualizar/${id}`, servicioEditado, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Eliminar servicio de emergencia
export const eliminarServicioEmergencia = async (id) => {
  const csrfToken = localStorage.getItem("csrfToken");
  await axios.delete(`/servicios_emergencia/eliminar/${id}`, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
};

// Obtener usuario logeado
export const obtenerUsuarioLogeado = async (usuarioId) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.get(`/usuarios/detalle/${usuarioId}`, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};