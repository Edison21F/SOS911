/* respuesta_usuario_modal.jsx */
/* -------------------*/
import React, { useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";

const BASE_IMG_URL = "/assets/img/";

// Función para generar un número aleatorio dentro de un rango
const generarNumeroAleatorio = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function RespuestaDeUsuarioModal({ usuario, onClose, onEliminar }) {
  // Generar valores aleatorios para los datos
  const presionBoton = generarNumeroAleatorio(1, 100);
  const numeroNotificaciones = generarNumeroAleatorio(0, 50);
  const numeroRespuestas = generarNumeroAleatorio(0, 50);
  const evaSOS = generarNumeroAleatorio(0, 50);
  const eva911 = generarNumeroAleatorio(0, 50);
  const innecesarias = generarNumeroAleatorio(0, 20);

  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  // Manejo de confirmación de eliminación
  const confirmarEliminacion = () => {
    Swal.fire({
      title: "¿Desea eliminar este informe?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        onEliminar(usuario.id);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El informe ha sido eliminado.",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div
      className="modal fade show d-flex justify-content-center align-items-center"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }} // Fondo oscuro para el modal
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
                className="fas fa-chart-bar me-3 text-white" 
                style={{ fontSize: "28px" }}
              ></i>
              <h5 
                className="modal-title text-white mb-0" 
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Respuesta del Usuario: <strong>{usuario.nombre}</strong>
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
            <div className="text-center mb-4">
              <img
                src={`${BASE_IMG_URL}respuesta.jpg`}
                alt={`Imagen de ${usuario.nombre}`}
                className="rounded-circle shadow"
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "cover",
                  border: "3px solid #e0e0e0",
                }}
                loading="lazy"
              />
            </div>
            <h4 className="text-center fw-bold mb-4" style={{ fontSize: "1.1rem", color: "#2d3748" }}>
              {usuario.nombre}
            </h4>
            <div className="row g-3 mb-2">
              <div className="col-12 col-sm-6">
                <div 
                  className="bg-light rounded-3 p-3 h-100 shadow-sm border-0"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="text-muted mb-1" style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    <i className="fas fa-id-card me-2 text-primary"></i>ID:
                  </div>
                  <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{usuario.id}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div 
                  className="bg-light rounded-3 p-3 h-100 shadow-sm border-0"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="text-muted mb-1" style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    <i className="fas fa-hand-pointer me-2 text-primary"></i>Presión del Botón:
                  </div>
                  <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{presionBoton}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div 
                  className="bg-light rounded-3 p-3 h-100 shadow-sm border-0"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="text-muted mb-1" style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    <i className="fas fa-bell me-2 text-warning"></i>Notificaciones:
                  </div>
                  <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{numeroNotificaciones}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div 
                  className="bg-light rounded-3 p-3 h-100 shadow-sm border-0"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="text-muted mb-1" style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    <i className="fas fa-reply me-2 text-success"></i>Respuestas:
                  </div>
                  <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{numeroRespuestas}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div 
                  className="bg-light rounded-3 p-3 h-100 shadow-sm border-0"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="text-muted mb-1" style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    <i className="fas fa-shield-alt me-2 text-info"></i>Eval. SOS:
                  </div>
                  <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{evaSOS}</div>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div 
                  className="bg-light rounded-3 p-3 h-100 shadow-sm border-0"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="text-muted mb-1" style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    <i className="fas fa-phone-alt me-2 text-secondary"></i>Eval. 911:
                  </div>
                  <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{eva911}</div>
                </div>
              </div>
              <div className="col-12">
                <div 
                  className="bg-light rounded-3 p-3 h-100 shadow-sm border-0"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="text-muted mb-1" style={{ fontSize: ".9rem", fontWeight: 600 }}>
                    <i className="fas fa-times-circle me-2 text-danger"></i>Innecesarias:
                  </div>
                  <div className="fw-semibold" style={{ fontSize: ".95rem" }}>{innecesarias}</div>
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

      {/* Alerta flotante para confirmar eliminación */}
      {mostrarAlerta && (
        <></>
      )}
    </div>
  );
}

// Validación de las propiedades que recibe el componente
RespuestaDeUsuarioModal.propTypes = {
  usuario: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombre: PropTypes.string.isRequired,
    imagen: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
};

export default RespuestaDeUsuarioModal;
