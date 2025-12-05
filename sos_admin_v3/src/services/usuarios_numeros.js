// usuarios_numeros.js
import axios from '../api/axios';

// Listar números de usuario
export const listarUsuariosNumeros = async () => {
  const csrfToken = localStorage.getItem('csrfToken');
  const response = await axios.get('/usuarios_numeros/listar', {
    headers: { 'X-CSRF-Token': csrfToken },
    withCredentials: true,
  });
  return response.data;
};

// Crear número de usuario
export const crearUsuarioNumero = async (data) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const response = await axios.post('/usuarios_numeros/crear', data, {
    headers: { 'X-CSRF-Token': csrfToken },
    withCredentials: true,
  });
  return response.data;
};

// Actualizar número de usuario
export const actualizarUsuarioNumero = async (id, data) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const response = await axios.put(`/usuarios_numeros/actualizar/${id}`, data, {
    headers: { 'X-CSRF-Token': csrfToken },
    withCredentials: true,
  });
  return response.data;
};

// Eliminar número de usuario
export const eliminarUsuarioNumero = async (id) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const response = await axios.delete(`/usuarios_numeros/eliminar/${id}`, {
    headers: { 'X-CSRF-Token': csrfToken },
    withCredentials: true,
  });
  return response.data;
};
