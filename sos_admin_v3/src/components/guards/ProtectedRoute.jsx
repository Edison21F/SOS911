import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, addAuthChangeListener, removeAuthChangeListener } from '../../config/auth';

const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState(isAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthState(isAuthenticated());
    };

    // Escucha cambios en el estado de autenticación
    addAuthChangeListener(handleAuthChange);
    

    // Cleanup
    return () => {
      removeAuthChangeListener(handleAuthChange);
    };
  }, []);

  // Si no está autenticado, redirige al login
  if (!authState) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza el componente
  return children;
};

export default ProtectedRoute;
