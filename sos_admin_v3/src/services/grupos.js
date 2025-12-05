import axios from '../api/axios';

// Listar grupos
export const listarGrupos = async () => {
  const csrfToken = localStorage.getItem('csrfToken');
  const response = await axios.get('/grupos/listar', {
    headers: { 'X-CSRF-Token': csrfToken },
    withCredentials: true,
  });
  return response.data;
};

// Crear grupo
export const crearGrupo = async (data) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const response = await axios.post('/grupos/crear', data, {
    headers: { 'X-CSRF-Token': csrfToken },
    withCredentials: true,
  });
  return response.data;
};

// Actualizar grupo
export const actualizarGrupo = async (id, data) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const response = await axios.put(`/grupos/actualizar/${id}`, data, {
    headers: { 'X-CSRF-Token': csrfToken },
    withCredentials: true,
  });
  return response.data;
};

// Eliminar grupo (borrado lógico)
export const eliminarGrupo = async (id) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const response = await axios.delete(`/grupos/eliminar/${id}`, {
    headers: { 'X-CSRF-Token': csrfToken },
    withCredentials: true,
  });
  return response.data;
};
