/* notificaciones_modal.jsx */
/* -------------------*/
import React from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";

// Componente modal para mostrar detalles de una notificación
function NotificacionModal({ notificacion, onClose, onDelete }) {
  // Función para confirmar eliminación con SweetAlert
  const confirmarEliminacion = () => {
    Swal.fire({
      title: "¿Desea eliminar esta alerta?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete();
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "La alerta ha sido eliminada.",
          timer: 1200,
          showConfirmButton: false,
        });
        onClose();
      }
    });
  };

  return (
    // Modal contenedor centrado en la pantalla con fondo oscuro
    <div
      className="modal fade show d-flex justify-content-center align-items-center"
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Fondo oscuro con opacidad para el modal
        display: "flex", // Flexbox para centrar el modal
        justifyContent: "center", // Centrado horizontal
        alignItems: "center", // Centrado vertical
      }}
    >
      <div className="modal-dialog" style={{ maxWidth: 600 }} role="document">
        <div
          className="modal-content"
          style={{
            border: "none",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Header */}
          <div
            className="modal-header text-white border-0 d-flex align-items-center position-relative"
            style={{ 
              background: "linear-gradient(135deg, #0891b2 0%, #0a7489 100%)",
              padding: "30px",
              borderRadius: "20px 20px 0 0"
            }}
          >
            <div className="d-flex align-items-center w-100">
              <i 
                className="fas fa-bell me-3 text-white" 
                style={{ fontSize: "28px" }}
              ></i>
              <h5 
                className="modal-title text-white mb-0" 
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Detalles de Notificación: <strong>{notificacion.presionBotonId}</strong>
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white position-absolute"
              style={{ top: "20px", right: "20px", fontSize: "1.2rem" }}
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body bg-white border-0" style={{ padding: "30px" }}>
            <div className="row g-3 mb-2">
              <div className="col-12 col-sm-6">
                <div 
                  className="bg-light rounded-3 p-3 h-100 shadow-sm border-0"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="text-muted mb-1" style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    <i className="fas fa-id-card me-2 text-primary"></i>ID:
                  </div>
                  <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{notificacion.id}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div 
                  className="bg-light rounded-3 p-3 h-100 shadow-sm border-0"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="text-muted mb-1" style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    <i className="fas fa-hand-pointer me-2 text-primary"></i>Presión Botón ID:
                  </div>
                  <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{notificacion.presionBotonId}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div 
                  className="bg-light rounded-3 p-3 h-100 shadow-sm border-0"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="text-muted mb-1" style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    <i className="fas fa-user me-2 text-success"></i>Cliente Notificado ID:
                  </div>
                  <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{notificacion.clienteNotificadoId}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div 
                  className="bg-light rounded-3 p-3 h-100 shadow-sm border-0"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="text-muted mb-1" style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    <i className="fas fa-bell me-2 text-warning"></i>Notificaciones Recibidas:
                  </div>
                  <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{notificacion.notificacionesRecibidas}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="modal-footer bg-light justify-content-center border-0"
            style={{ 
              padding: "20px 30px 30px 30px",
              borderRadius: "0 0 20px 20px",
              backgroundColor: "#f8f9fa"
            }}
          >
            <button
              className="btn btn-danger shadow-sm"
              onClick={confirmarEliminacion}
              style={{ 
                fontSize: "15px",
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                fontWeight: 600,
                minWidth: "120px"
              }}
            >
              <i className="fas fa-trash me-1"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// PropTypes para validar las props del componente
NotificacionModal.propTypes = {
  notificacion: PropTypes.shape({
    id: PropTypes.number.isRequired, // ID de la notificación
    presionBotonId: PropTypes.string.isRequired, // ID del botón presionado
    clienteNotificadoId: PropTypes.string.isRequired, // ID del cliente notificado
    notificacionesRecibidas: PropTypes.number.isRequired, // Número de notificaciones recibidas
  }).isRequired,
  onClose: PropTypes.func.isRequired, // Función para cerrar el modal
  onDelete: PropTypes.func.isRequired, // Función para eliminar la notificación
};

export default NotificacionModal;
