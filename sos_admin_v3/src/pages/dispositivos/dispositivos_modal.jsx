/* dispositivos_modal.jsx */
/* -------------------*/
import React from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2"; // Asegúrate de tener SweetAlert2 instalado
import { eliminarDispositivo } from '../../services/dispositivos'; // Importa la función de la API

// Componente modal para mostrar información de un dispositivo
function DispositivoModal({ dispositivo, onClose, onDelete }) { // csrfToken ya no es necesario pasarlo como prop
  const handleDelete = async () => {
    if (window.Swal) {
      const result = await window.Swal.fire({
        title: '¿Desea eliminar este dispositivo?',
        html: `<p class="text-danger mt-3"><strong>Esta acción no se puede deshacer</strong></p>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        width: '400px'
      });

      if (result.isConfirmed) {
        try {
          // Llamar a la función de la API para eliminar el dispositivo
          await eliminarDispositivo(dispositivo.id);

          // Llamar a la función onDelete del padre para actualizar la lista (solo local)
          onDelete(dispositivo.id);
          onClose(); // Cerrar el modal después de eliminar

          // Mostrar mensaje de éxito
          window.Swal.fire({
            icon: "success",
            title: "Dispositivo eliminado",
            text: "El dispositivo ha sido eliminado correctamente.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error('Error al eliminar dispositivo:', error);
          // Mostrar mensaje de error
          window.Swal.fire({
            icon: "error",
            title: "Error",
            text: `Hubo un error al eliminar el dispositivo: ${error.message || error.response?.data?.error || 'Error desconocido'}`,
          });
        }
      }
    } else {
      // Fallback si SweetAlert2 no está disponible
      if (window.confirm(`¿Está seguro de que desea eliminar el dispositivo "${dispositivo.nombre}"?`)) {
        try {
          await eliminarDispositivo(dispositivo.id);
          onDelete(dispositivo.id);
          onClose();
        } catch (error) {
          console.error('Error al eliminar dispositivo:', error);
          alert("Error al eliminar el dispositivo");
        }
      }
    }
  };

  return (
    <div
      className="modal fade show d-flex justify-content-center align-items-center"
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 1050,
      }}
    >
      <div
        className="modal-dialog"
        style={{ maxWidth: "700px", width: "95%", border: "none", boxShadow: "none" }}
        role="document"
      >
        <div
          className="modal-content"
          style={{
            borderRadius: "20px",
            border: "none",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)",
            overflow: 'hidden'
          }}
        >
          <div
            className="modal-header text-white d-flex align-items-center justify-content-between"
            style={{ 
              backgroundColor: "#0891b2", 
              padding: "30px",
              border: "none"
            }}
          >
            <div className="d-flex align-items-center">
              <i className="fas fa-mobile-alt me-3" style={{ fontSize: "28px", color: "white" }}></i>
              <h5 className="modal-title mb-0" style={{ fontSize: "18px", fontWeight: 600, color: "white" }}>
                Detalles del Dispositivo: <strong>{dispositivo.nombre}</strong>
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
              style={{ fontSize: "1.2rem" }}
            ></button>
          </div>

          <div className="modal-body" style={{ backgroundColor: "#f8f9fa", padding: "30px" }}>
            <div className="text-center mb-4">
              <div style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                backgroundColor: "#0891b2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                boxShadow: "0 8px 16px rgba(8, 145, 178, 0.3)"
              }}>
                <i className="fas fa-mobile-alt" style={{ fontSize: "60px", color: "white" }}></i>
              </div>
            </div>
            
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <div className="bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-hashtag me-3" style={{ fontSize: "20px", color: "#0891b2" }}></i>
                    <h6 className="mb-0" style={{ fontWeight: 600, color: "#495057", fontSize: "1.1rem" }}>ID del Dispositivo</h6>
                  </div>
                  <div className="fw-semibold" style={{ fontSize: "1.2rem", color: "#212529" }}>{dispositivo.id}</div>
                </div>
              </div>
              
              <div className="col-12 col-md-6">
                <div className="bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-user me-3" style={{ fontSize: "20px", color: "#0891b2" }}></i>
                    <h6 className="mb-0" style={{ fontWeight: 600, color: "#495057", fontSize: "1.1rem" }}>ID del Cliente</h6>
                  </div>
                  <div className="fw-semibold" style={{ fontSize: "1.2rem", color: "#212529" }}>{dispositivo.clienteId}</div>
                </div>
              </div>
              
              <div className="col-12 col-md-6">
                <div className="bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-mobile-alt me-3" style={{ fontSize: "20px", color: "#0891b2" }}></i>
                    <h6 className="mb-0" style={{ fontWeight: 600, color: "#495057", fontSize: "1.1rem" }}>Modelo</h6>
                  </div>
                  <div className="fw-semibold" style={{ fontSize: "1.2rem", color: "#212529" }}>{dispositivo.nombre}</div>
                </div>
              </div>
              
              <div className="col-12 col-md-6">
                <div className="bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-microchip me-3" style={{ fontSize: "20px", color: "#0891b2" }}></i>
                    <h6 className="mb-0" style={{ fontWeight: 600, color: "#495057", fontSize: "1.1rem" }}>Tipo de Dispositivo</h6>
                  </div>
                  <div className="fw-semibold" style={{ fontSize: "1.2rem", color: "#212529" }}>{dispositivo.tipoDispositivo}</div>
                </div>
              </div>
              
              {dispositivo.tokenDispositivo && (
                <div className="col-12">
                  <div className="bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                    <div className="d-flex align-items-center mb-3">
                      <i className="fas fa-key me-3" style={{ fontSize: "20px", color: "#0891b2" }}></i>
                      <h6 className="mb-0" style={{ fontWeight: 600, color: "#495057", fontSize: "1.1rem" }}>Token del Dispositivo</h6>
                    </div>
                    <div className="fw-semibold text-break" style={{ 
                      fontSize: "0.9rem", 
                      color: "#212529", 
                      wordBreak: "break-all",
                      backgroundColor: "#f8f9fa",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #dee2e6"
                    }}>
                      {dispositivo.tokenDispositivo}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer bg-white d-flex justify-content-center border-0" style={{ padding: "30px" }}>
            <button
              className="btn d-flex align-items-center justify-content-center"
              onClick={handleDelete}
              style={{ 
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "10px 32px",
                fontSize: "1.08rem",
                fontWeight: 600,
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#c82333"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#dc3545"}
            >
              <i className="fas fa-trash me-2"></i> Eliminar Dispositivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

DispositivoModal.propTypes = {
  dispositivo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    clienteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombre: PropTypes.string.isRequired,
    tipoDispositivo: PropTypes.string.isRequired,
    tokenDispositivo: PropTypes.string,
    estado: PropTypes.string,
    fechaCreacion: PropTypes.string,
    eliminado: PropTypes.bool,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default DispositivoModal;
