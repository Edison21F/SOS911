//roles.js
import axios from '../api/axios';

// Obtener CSRF token
export const obtenerCsrfToken = async () => {
  const response = await axios.get('/csrf-token', { withCredentials: true });
  const csrfToken = response.data.data?.csrfToken || response.data.csrfToken;
  localStorage.setItem("csrfToken", csrfToken);
  return csrfToken;
};

// Listar roles
export const listarRoles = async () => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.get('/roles/listar', {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Crear rol
export const crearRol = async (nombre) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.post('/roles/crear', { nombre }, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Actualizar rol
export const actualizarRol = async (id, rolEditado) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.put(`/roles/actualizar/${id}`, rolEditado, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Eliminar rol
export const eliminarRol = async (id) => {
  const csrfToken = localStorage.getItem("csrfToken");
  await axios.delete(`/roles/eliminar/${id}`, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
};

// Obtener detalle de usuario logeado
export const obtenerUsuarioLogeado = async (usuarioId) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.get(`/usuarios/detalle/${usuarioId}`, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};