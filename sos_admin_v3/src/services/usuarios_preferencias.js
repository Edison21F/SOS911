import axios from '../api/axios';

// Obtener preferencias de usuario
export const obtenerPreferenciasUsuario = async (idUsuario) => {
  const csrfToken = localStorage.getItem("csrfToken");
  if (!csrfToken) {
    console.warn("CSRF token no disponible al cargar preferencias.");
    return null;
  }
  try {
    const response = await axios.get(`/usuarios/preferencias/listar/${idUsuario}`,
      {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      }
    );
    if (response.data && response.data.preferencias) {
      return response.data.preferencias;
    }
    return null;
  } catch (error) {
    console.error('Error al cargar preferencias:', error.response?.data?.message || error.message);
    return null;
  }
};


// Guardar (actualizar o crear) preferencias de usuario
export const guardarPreferenciasUsuario = async (idUsuario, tema, sidebarMinimizadoBackendValue) => {
  const csrfToken = localStorage.getItem("csrfToken");
  if (!csrfToken) {
    console.error("CSRF token no disponible.");
    return;
  }
  const preferenceData = {
    tema: tema,
    sidebarMinimizado: sidebarMinimizadoBackendValue,
  };
  try {
    // Intenta actualizar las preferencias (PUT)
    await axios.put(`/usuarios/preferencias/actualizar/${idUsuario}`,
      preferenceData,
      {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      }
    );
    console.log("Preferencias actualizadas en el backend.");
  } catch (error) {
    // Si el error es un "Preferencias no encontradas" (404), intenta crearlas (POST)
    if (error.response && error.response.status === 404) {
      try {
        await axios.post(`/usuarios/preferencias/registrar/${idUsuario}`,
          preferenceData,
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        console.log("Preferencias registradas por primera vez en el backend.");
      } catch (err) {
        console.error('Error al crear preferencias:', err.response?.data?.message || err.message);
      }
    } else {
      console.error('Error al guardar preferencias:', error.response?.data?.message || error.message);
    }
  }
};
