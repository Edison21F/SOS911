import api from '../api/api';

export interface Cliente {
  id?: number; // ID del cliente (opcional, ya que no estará presente al crear uno nuevo)
  nombre: string;
  correo_electronico: string;
  cedula_identidad: string;
  direccion: string;
  fecha_nacimiento: string; // Añadido el campo fecha_nacimiento
  estado?: string; // Estado del cliente (ej. 'activo', 'inactivo', 'eliminado')
  numero_ayudas?: number; // Número de ayudas (opcional)
  contrasena_hash: string; // Hash de la contraseña
  estado_eliminado?: string; // Estado de eliminación (ej. 'activo', 'eliminado')
}

// Función para obtener todos los clientes
export const getClientes = async (): Promise<Cliente[]> => {
  // Ruta corregida a '/clientes/listar' según tu router
  const response = await api.get('/clientes/listar');
  return response.data; // Retorna los datos de la respuesta
};

// Función para obtener un cliente por su ID
export const getClienteById = async (id: number): Promise<Cliente> => {
  // Ruta corregida a '/clientes/detalle/:id' según tu router
  const response = await api.get(`/clientes/detalle/${id}`);
  return response.data; // Retorna los datos del cliente
};

// Función para crear un nuevo cliente
export const crearCliente = async (cliente: Cliente): Promise<Cliente> => {
  // Ruta corregida a '/clientes/registro' según tu router
  const response = await api.post('/clientes/registro', cliente);
  return response.data; // Retorna los datos del cliente creado
};

// Función para actualizar un cliente por su ID
export const updateCliente = async (id: number, cliente: Partial<Cliente>): Promise<Cliente> => {
  // Ruta corregida a '/clientes/actualizar/:id' según tu router
  const response = await api.put(`/clientes/actualizar/${id}`, cliente);
  return response.data; // Retorna los datos del cliente actualizado
};

// Función para eliminar un cliente por su ID (borrado lógico)
export const deleteCliente = async (id: number): Promise<void> => {
  // Ruta corregida a '/clientes/eliminar/:id' según tu router
  await api.delete(`/clientes/eliminar/${id}`);
};
