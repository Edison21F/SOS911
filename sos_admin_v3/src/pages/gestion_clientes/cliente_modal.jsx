import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { FaPhoneAlt, FaEnvelope, FaIdCard, FaMapMarkerAlt, FaHandsHelping, FaCalendarAlt } from 'react-icons/fa';
import { obtenerCsrfToken, actualizarEstadoCliente, eliminarCliente, obtenerNumerosCliente } from "../../services/clientes";

const BASE_IMG_URL = "/assets/img/";

function ClienteModal({ cliente, onClose, onUpdateCliente, onDelete }) {
  const [estadoLocal, setEstadoLocal] = useState(cliente.estado || "activo");
  const [editandoEstado, setEditandoEstado] = useState(false);
  const [isDeletedLocally, setIsDeletedLocally] = useState(cliente.eliminado);
  const [csrfToken, setCsrfToken] = useState('');
  const [numerosCliente, setNumerosCliente] = useState([]); // State to store client numbers
  const [loadingNumeros, setLoadingNumeros] = useState(true); // State for loading indicator

  useEffect(() => {
    obtenerCsrfToken().then(setCsrfToken).catch(() =>
      Swal.fire('Error de seguridad', 'No se pudo obtener el token CSRF. Intenta recargar la página.', 'error')
    );
  }, []);

  useEffect(() => {
    const fetchNumeros = async () => {
      setLoadingNumeros(true); // Set loading to true before fetching
      try {
        const data = await obtenerNumerosCliente(cliente.id); // Fetch numbers using the client's ID
        setNumerosCliente(data); // Update state with fetched numbers
      } catch (err) {
        console.error("Error al obtener números del cliente:", err);
        setNumerosCliente([]); // Clear numbers on error
      }
      setLoadingNumeros(false); // Set loading to false after fetching
    };
    if (cliente.id) { // Fetch numbers only if client.id is available
      fetchNumeros();
    }
  }, [cliente.id]); // Re-run effect when client.id changes

  const handleEstadoChange = (e) => setEstadoLocal(e.target.value);

  const guardarEstado = async () => {
    try {
      await actualizarEstadoCliente(cliente.id, estadoLocal);
      Swal.fire('¡Actualizado!', `Estado actualizado a: ${estadoLocal}`, 'success');
      onUpdateCliente({ ...cliente, estado: estadoLocal });
      setEditandoEstado(false);
    } catch (error) {
      Swal.fire('Error', 'Error al guardar estado.', 'error');
    }
  };

  const handleEliminarCliente = async () => {
    try {
      await obtenerCsrfToken();
      await eliminarCliente(cliente.id);
      setIsDeletedLocally(true);
      if (onDelete) {
        onDelete(cliente.id);
      } else {
        onUpdateCliente({ ...cliente, eliminado: true, estado_eliminado: 'eliminado' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: `Error al eliminar cliente: ${error.message}` });
    }
  };

  // Función para formatear la fecha de nacimiento
  const formatFechaNacimiento = (fecha) => {
    if (!fecha) return "N/A";
    try {
      const dateObj = new Date(fecha);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      }
    } catch (e) {
      console.error("Error al formatear fecha de nacimiento:", e);
    }
    return "N/A";
  };

  return (
    <div
      className="modal fade show d-flex justify-content-center align-items-center"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <div
        className="modal-dialog modal-xl"
        style={{ maxWidth: "700px" }}
        role="document"
      >
        <div 
          className="modal-content"
          style={{
            borderRadius: "20px",
            border: "none",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)",
            overflow: 'hidden',
          }}
        >
          <div 
            className="modal-header border-0"
            style={{ 
              background: "#0891b2",
              color: "white",
              padding: "20px 30px",
              borderRadius: "20px 20px 0 0"
            }}
          >
            <h5
              className="modal-title text-truncate"
              style={{ 
                maxWidth: "100%", 
                fontSize: "18px",
                fontWeight: "600",
                margin: 0
              }}
            >
              <i className="fas fa-user-tie me-2"></i>
              Detalles del Cliente: <strong>{cliente.nombre}</strong>
              {isDeletedLocally && <span className="ms-2 badge bg-danger">ELIMINADO</span>}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
              style={{
                opacity: "0.8",
                fontSize: "1.2rem"
              }}
            ></button>
          </div>

          <div className="modal-body bg-white" style={{ padding: "30px" }}>
            <div className="text-center mb-4">
              <img
                src={`${BASE_IMG_URL}${cliente.imagen || 'default_user.jpg'}`}
                alt={`Imagen de ${cliente.nombre}`}
                className="rounded-circle shadow"
                style={{ 
                  width: "120px", 
                  height: "120px", 
                  objectFit: "cover", 
                  border: "4px solid #f8f9fa",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)"
                }}
                loading="lazy"
              />
            </div>
            <h3 className="text-center fw-bold mb-4" style={{ fontSize: "1.18rem" }}>{cliente.nombre}</h3>
            <div className="row g-3 mb-2">
              <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                <div className="bg-light rounded-3 p-3 h-100 shadow-sm w-100 d-flex flex-column align-items-center justify-content-center">
                  <FaIdCard style={{ color: '#6366f1', fontSize: '1.25rem', marginBottom: '4px' }} />
                  <div className="text-muted mb-1 text-center" style={{ fontSize: "1rem", fontWeight: 600 }}>ID:</div>
                  <div className="fw-semibold text-center" style={{ fontSize: "1.08rem" }}>{cliente.id}</div>
                </div>
              </div>
              <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                <div className="bg-light rounded-3 p-3 h-100 shadow-sm w-100 d-flex flex-column align-items-center justify-content-center">
                  <FaEnvelope style={{ color: '#0891b2', fontSize: '1.25rem', marginBottom: '4px' }} />
                  <div className="text-muted mb-1 text-center" style={{ fontSize: "1rem", fontWeight: 600 }}>Correo:</div>
                  <div className="fw-semibold text-center" style={{ fontSize: "1.08rem" }}>{cliente.correo || cliente.correo_electronico || "N/A"}</div>
                </div>
              </div>
              <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                <div className="bg-light rounded-3 p-3 h-100 shadow-sm w-100 d-flex flex-column align-items-center justify-content-center">
                  <FaIdCard style={{ color: '#6366f1', fontSize: '1.25rem', marginBottom: '4px' }} />
                  <div className="text-muted mb-1 text-center" style={{ fontSize: "1rem", fontWeight: 600 }}>Cédula:</div>
                  <div className="fw-semibold text-center" style={{ fontSize: "1.08rem" }}>{cliente.cedula || cliente.cedula_identidad || "N/A"}</div>
                </div>
              </div>
              <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                <div className="bg-light rounded-3 p-3 h-100 shadow-sm w-100 d-flex flex-column align-items-center justify-content-center">
                  <FaMapMarkerAlt style={{ color: '#f59e42', fontSize: '1.25rem', marginBottom: '4px' }} />
                  <div className="text-muted mb-1 text-center" style={{ fontSize: "1rem", fontWeight: 600 }}>Dirección:</div>
                  <div className="fw-semibold text-center" style={{ fontSize: "1.08rem" }}>{cliente.direccion || "N/A"}</div>
                </div>
              </div>
              {/* Fila con Fecha de Nacimiento y Número de Ayudas centrados */}
              <div className="row g-3 mb-2">
                <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                  <div className="bg-light rounded-3 p-3 h-100 shadow-sm w-100 d-flex flex-column align-items-center justify-content-center">
                    <FaCalendarAlt style={{ color: '#28a745', fontSize: '1.25rem', marginBottom: '4px' }} />
                    <div className="text-muted mb-1 text-center" style={{ fontSize: "1rem", fontWeight: 600 }}>Fecha de Nacimiento:</div>
                    <div className="fw-semibold text-center" style={{ fontSize: "1.08rem" }}>{formatFechaNacimiento(cliente.fecha_nacimiento)}</div>
                  </div>
                </div>
                <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                  <div className="bg-light rounded-3 p-3 h-100 shadow-sm w-100 d-flex flex-column align-items-center justify-content-center">
                    <FaHandsHelping style={{ color: '#6366f1', fontSize: '1.25rem', marginBottom: '4px' }} />
                    <div className="text-muted mb-1 text-center" style={{ fontSize: "1rem", fontWeight: 600 }}>Número de Ayudas:</div>
                    <div className="fw-bold text-primary text-center" style={{ fontSize: "1.08rem" }}>{cliente.numero_ayudas || 0}</div>
                  </div>
                </div>
              </div>

              {/* Teléfonos del Cliente */}
              <div className="row mb-2 justify-content-center">
                <div className="col-12 col-md-8 d-flex flex-column align-items-center mx-auto">
                  <div className="mb-2 text-center fw-bold" style={{ fontSize: "1.08rem", color: "#0891b2" }}>
                    Teléfonos del Cliente
                  </div>
                  {loadingNumeros ? (
                    <div className="bg-light rounded-3 p-3 shadow-sm w-100 text-center" style={{ minHeight: 60 }}>
                      <span className="text-muted">Cargando números...</span>
                    </div>
                  ) : (
                    numerosCliente.length === 0 ? (
                      <div className="bg-light rounded-3 p-3 shadow-sm w-100 text-center" style={{ minHeight: 60 }}>
                        <span className="text-muted">Sin números</span>
                      </div>
                    ) : (
                      <div className="bg-light rounded-3 p-3 shadow-sm w-100 text-center d-flex flex-wrap justify-content-center align-items-center gap-2" style={{ minHeight: 60 }}>
                        {numerosCliente.map((n, idx) => (
                          <span key={n.id} className="badge mx-1" style={{ background: '#e0f7fa', color: '#0891b2', fontWeight: 700, fontSize: '1.01rem', border: '1px solid #10b981', borderRadius: 16, padding: '7px 16px' }}>
                            <FaPhoneAlt className="me-1" style={{ color: '#0891b2' }} />{n.numero}
                          </span>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-footer bg-light justify-content-center"
            style={{
              padding: "20px 30px",
              borderRadius: "0 0 20px 20px",
              borderTop: "1px solid #dee2e6"
            }}
          >
            {/* Botón de Eliminar Cliente */}
            <button
              className="btn btn-danger d-flex align-items-center justify-content-center"
              onClick={async () => {
                const result = await Swal.fire({
                  title: `¿Eliminar cliente?`,
                  html: `<b>${cliente.nombre}</b> será marcado como "eliminado" (inactivo). Esta acción es reversible por un administrador.`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#d33",
                  cancelButtonColor: "#3085d6",
                  confirmButtonText: "Sí, eliminar",
                  cancelButtonText: "Cancelar"
                });
                if (result.isConfirmed) {
                  await handleEliminarCliente();
                  await Swal.fire({
                    icon: "success",
                    title: "Cliente Marcado como Eliminado",
                    text: `El cliente ha sido marcado como eliminado correctamente.`,
                    timer: 1500,
                    showConfirmButton: false
                  });
                  onClose();
                }
              }}
              style={{
                fontSize: "1.08rem",
                padding: "10px 32px",
                borderRadius: "14px",
                fontWeight: "600"
              }}
              disabled={isDeletedLocally}
            >
              <i className="fas fa-trash-alt me-1"></i> {isDeletedLocally ? 'Cliente Eliminado' : 'Eliminar Cliente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ClienteModal.propTypes = {
  cliente: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombre: PropTypes.string.isRequired,
    correo: PropTypes.string,
    correo_electronico: PropTypes.string,
    telefono: PropTypes.string,
    cedula: PropTypes.string,
    cedula_identidad: PropTypes.string,
    direccion: PropTypes.string,
    estado: PropTypes.string,
    numero_ayudas: PropTypes.number,
    eliminado: PropTypes.bool,
    estado_eliminado: PropTypes.string,
    imagen: PropTypes.string,
    fecha_nacimiento: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdateCliente: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};

export default ClienteModal;