import axios from '../api/axios';

// Obtener CSRF token
export const obtenerCsrfToken = async () => {
  const response = await axios.get('/csrf-token', { withCredentials: true });
  const csrfToken = response.data.data?.csrfToken || response.data.csrfToken;
  localStorage.setItem("csrfToken", csrfToken);
  return csrfToken;
};

// Obtener contenido de la app (editor móvil)
export const obtenerContenidoApp = async () => {
  const response = await axios.get('/contenido_app/obtener', { withCredentials: true });
  return response.data;
};

// Crear contenido de la app (si no existe)
export const crearContenidoApp = async (body) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.post('/contenido_app/crear', body, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Actualizar contenido de la app
export const actualizarContenidoApp = async (body) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.put('/contenido_app/actualizar', body, {
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Obtener contenido de la página principal
export const obtenerContenidoPagina = async () => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.get('/pagina/listar', {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Crear contenido de la página principal
export const crearContenidoPagina = async (body) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.post('/pagina/crear', body, {
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Actualizar contenido de la página principal
export const actualizarContenidoPagina = async (id, body) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.put(`/pagina/actualizar/${id}`, body, {
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};