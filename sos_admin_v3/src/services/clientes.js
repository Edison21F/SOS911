//clientes.js
import axios from '../api/axios';

// Obtener CSRF token
export const obtenerCsrfToken = async () => {
  const response = await axios.get('/csrf-token', { withCredentials: true });
  const csrfToken = response.data.data?.csrfToken || response.data.csrfToken;
  localStorage.setItem("csrfToken", csrfToken);
  return csrfToken;
};

// Listar clientes
export const listarClientes = async (incluirEliminados = true) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const url = incluirEliminados ? '/clientes/listar?incluirEliminados=true' : '/clientes/listar';
  const response = await axios.get(url, {
    headers: { "X-CSRF-Token": csrfToken }
  });
  return response.data;
};

// Actualizar estado de cliente
export const actualizarEstadoCliente = async (id, estado) => {
  const csrfToken = localStorage.getItem("csrfToken");
  await axios.put(`/clientes/actualizar/${id}`, { estado }, {
    headers: { "X-CSRF-Token": csrfToken }
  });
};

// Eliminar cliente (borrado lógico)
export const eliminarCliente = async (id) => {
  const csrfToken = localStorage.getItem("csrfToken");
  await axios.put(`/clientes/actualizar/${id}`, { estado: "eliminado" }, {
    headers: { "X-CSRF-Token": csrfToken }
  });
};

// Obtener números del cliente
export const obtenerNumerosCliente = async (clienteId) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.get(`/clientes_numeros/listar/por-cliente/${clienteId}`, {
    headers: { "X-CSRF-Token": csrfToken }
  });
  return response.data;
};

// Listar contactos de emergencia por cliente
export const listarContactosEmergenciaPorCliente = async (clienteId) => {
  const csrfToken = localStorage.getItem("csrfToken");
  const response = await axios.get(`/contactos_emergencias/listar/por-cliente/${clienteId}`, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
  return response.data;
};

// Eliminar contacto de emergencia
export const eliminarContactoEmergencia = async (contactoId) => {
  const csrfToken = localStorage.getItem("csrfToken");
  await axios.delete(`/contactos_emergencias/eliminar/${contactoId}`, {
    headers: { "X-CSRF-Token": csrfToken },
    withCredentials: true
  });
};

// Eliminar todos los contactos de emergencia de un cliente
export const eliminarTodosContactosEmergenciaCliente = async (clienteId) => {
  const contactos = await listarContactosEmergenciaPorCliente(clienteId);
  await Promise.all(contactos.map(contacto =>
    eliminarContactoEmergencia(contacto.id)
  ));
};