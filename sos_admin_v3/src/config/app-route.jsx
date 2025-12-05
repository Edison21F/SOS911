import React, { useEffect } from 'react';
import App from './../app.jsx';
import Dashboard from './../pages/dashboard/dashboard.jsx';
import Error from './../pages/error/error.jsx';
import Usuarios from '../pages/gestion_usuarios/gestion_usuarios.jsx';
import Ubicaciones from '../pages/ubicaciones/ubicaciones.jsx';
import Rol from '../pages/roles/rol.jsx';
import GestionClientes from '../pages/gestion_clientes/gestion_cliente.jsx';
import InformacionContactosUsuarios from './../pages/informacion de contacto/informacion.jsx';
import InformacionContactosClientes from '../pages/informacion_contactos_clientes/informacion.jsx';
import ContactosEmergencia from '../pages/contactos_emergencia/contactos_emergencia.jsx';
import GestionGrupos from '../pages/grupos/grupos.jsx';
import RespuestaUsuario from '../pages/informes/respuesta_de_usuario.jsx';
import Login from '../pages/Login/login.jsx';
import Registro from '../pages/registro/registro.jsx'
import GestionBoton from '../pages/gestion_boton/gestion_boton.jsx'
import Notificaciones from '../pages/notificaciones/notificaciones.jsx'
import Dispositivos from '../pages/dispositivos/dispositivos.jsx';
import Perfil from '../pages/perfil/perfil.jsx';
import Estadisticas from '../pages/estadisticas/estadisticas.jsx'; 
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/guards';

const AppRoute = [
  {
    path: '*',
    element: <App />,
    children: [
      { path: '', element: <Navigate to="/login" /> }, // Redirige desde la raíz a /login
      { path: 'dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: 'gestion-usuarios', element: <ProtectedRoute><Usuarios /></ProtectedRoute> },
      { path: 'gestion-clientes', element: <ProtectedRoute><GestionClientes /></ProtectedRoute> },
      { path: 'informacion-contacto-usuarios', element: <ProtectedRoute><InformacionContactosUsuarios /></ProtectedRoute> },
      { path: 'informacion-contacto-clientes', element: <ProtectedRoute><InformacionContactosClientes /></ProtectedRoute> },
      { path: 'contactos-emergencia', element: <ProtectedRoute><ContactosEmergencia /></ProtectedRoute> },
      { path: 'rol', element: <ProtectedRoute><Rol /></ProtectedRoute> },
      { path: 'grupos', element: <ProtectedRoute><GestionGrupos /></ProtectedRoute> },
      { path: 'ubicacion', element: <ProtectedRoute><Ubicaciones /></ProtectedRoute> },
      { path: 'gestion-boton', element: <ProtectedRoute><GestionBoton /></ProtectedRoute> },
      { path: 'respuesta-usuario', element: <ProtectedRoute><RespuestaUsuario /></ProtectedRoute> },
      { path: 'notificaciones', element: <ProtectedRoute><Notificaciones /></ProtectedRoute> },
      { path: 'dispositivos', element: <ProtectedRoute><Dispositivos /></ProtectedRoute> },
      { path: 'perfil', element: <ProtectedRoute><Perfil /></ProtectedRoute> },
      { path: '*', element: <Error /> },
      { path: 'estadisticas', element: <ProtectedRoute><Estadisticas /></ProtectedRoute> }, 
    ]
  },
  // Ruta específica para el Login, sin el layout principal
  {
    path: '/login',
    element: <Login />, // Ruta inicial apunta al Login
  },
  {
    path: '/registro',
    element: <Registro />
  }
];

export const logout = (navigate) => {
  localStorage.removeItem("usuario_id"); // Elimina el estado de autenticación
  navigate("/login"); // Redirige al login
};

export default AppRoute;