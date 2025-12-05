// usuarios.js
import axios from '../api/axios'; // Asegúrate que esta importación apunta a tu axios.js configurado

// Registro de usuario
// Se eliminó el parámetro 'req' ya que es una variable del lado del servidor.
// La cookie de sesión y CSRF se manejan automáticamente con 'withCredentials: true'
// y el interceptor de Axios si lo tuvieras configurado para añadir el token.
export const registrarUsuario = async (formData, csrfToken) => {
  const response = await axios.post(
    '/usuarios/registro',
    formData, // FormData se envía directamente, Axios lo detecta y configura el Content-Type
    {
      headers: { "X-CSRF-Token": csrfToken }, // Envía el CSRF token en el encabezado esperado por tu backend
      withCredentials: true, // Importante para que las cookies de sesión (y CSRF) se envíen
    }
  );
  return response.data;
};

// Login de usuario (sin cambios, ya estaba correcto para el frontend)
export const loginUsuario = async (correo_electronico, contrasena, csrfToken) => {
  const response = await axios.post(
    '/usuarios/login',
    { correo_electronico, contrasena },
    {
      headers: { "X-CSRF-Token": csrfToken },
      withCredentials: true
    }
  );
  return response.data;
};

// Función mejorada para obtener CSRF token
export const obtenerCsrfToken = async () => {
  try {
    const response = await axios.get('/csrf-token', { 
      withCredentials: true 
    });
    if (!response.data.csrfToken) {
      throw new Error('Token CSRF no recibido');
    }
    const csrfToken = response.data.csrfToken;
    localStorage.setItem("csrfToken", csrfToken);
    return csrfToken;
  } catch (error) {
    console.error("Error obteniendo CSRF token:", error);
    // Reintentar o manejar error
    throw error;
  }
};

// Listar usuarios (sin cambios, ya estaba correcto)
export const listarUsuarios = async () => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.get('/usuarios/listar', {
    headers: { "X-CSRF-Token": csrfToken }
  });
  return response.data;
};

// Eliminar usuario (marcar como inactivo) (sin cambios, ya estaba correcto)
export const eliminarUsuario = async (id) => {
  const csrfToken = localStorage.getItem("csrfToken");
  await axios.put(`/usuarios/actualizar/${id}`, { estado: "eliminado" }, {
    headers: { "X-CSRF-Token": csrfToken }
  });
};

// Actualizar estado de usuario (sin cambios, ya estaba correcto)
export const actualizarEstadoUsuario = async (id, estado) => {
  const csrfToken = localStorage.getItem("csrfToken");
  await axios.put(`/usuarios/actualizar/${id}`, { estado }, {
    headers: { "X-CSRF-Token": csrfToken }
  });
};

// Obtener detalle de usuario (sin cambios, ya estaba correcto)
export const obtenerDetalleUsuario = async (usuarioId) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.get(`/usuarios/detalle/${usuarioId}`, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Actualizar perfil de usuario (sin cambios, ya estaba correcto)
export const actualizarPerfilUsuario = async (usuarioId, data) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.put(`/usuarios/actualizar/${usuarioId}`, data, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Cambiar contraseña de usuario (sin cambios, ya estaba correcto)
export const cambiarContrasenaUsuario = async (usuarioId, nuevaContrasena) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.put(
    `/usuarios/actualizar/${usuarioId}`,
    { contrasena: nuevaContrasena },
    {
      headers: { "X-CSRF-Token": csrfToken },
      withCredentials: true
    }
  );
  return response.data;
};
