// Event listener para cambios en el estado de autenticación
let authChangeListeners = [];

export const addAuthChangeListener = (listener) => {
  authChangeListeners.push(listener);
};

export const removeAuthChangeListener = (listener) => {
  authChangeListeners = authChangeListeners.filter(l => l !== listener);
};

const notifyAuthChange = () => {
  authChangeListeners.forEach(listener => listener());
};

export const logout = (navigate) => {
  localStorage.removeItem("usuario_id"); // Elimina el estado de autenticación
  notifyAuthChange(); // Notifica el cambio de estado
  navigate("/login"); // Redirige al login
};

export const setAuthenticated = (usuarioId) => {
  if (usuarioId) {
    localStorage.setItem("usuario_id", usuarioId);
    notifyAuthChange(); // Notifica el cambio de estado
  }
};

export const isAuthenticated = () => {
  const usuarioId = localStorage.getItem("usuario_id");
  console.log("Estado de autenticación:", usuarioId); // Verifica el valor de usuario_id
  return !!usuarioId; // Devuelve true si existe usuario_id
};