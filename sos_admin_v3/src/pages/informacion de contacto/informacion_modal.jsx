/* informacion_contacto_usuario_modal.jsx */
/* -------------------*/
import React, { useState } from "react";
import PropTypes from "prop-types";
import { actualizarUsuarioNumero } from "../../services/usuarios_numeros";
import Swal from "sweetalert2"; // Importa SweetAlert

function InformacionModal({ informacion, onClose, setInformaciones }) {
  const [nombre, setNombre] = useState(informacion.nombre);
  const [numero, setNumero] = useState(informacion.numero);
  const [editando, setEditando] = useState(false);
  const [seleccionada, setSeleccionada] = useState(false); // Estado para marcar la tarjeta seleccionada

  const guardarCambios = async () => {
    let csrfToken = localStorage.getItem("csrfToken");
    if (!csrfToken) {
        Swal.fire({
            icon: "error",
            title: "Error de seguridad",
            text: "Token CSRF no disponible. Recargue la página.",
        });
        return;
    }

    try {
      const response = await actualizarUsuarioNumero(informacion.id, { nombre, numero });
      // Actualiza el estado en el componente padre
      setInformaciones((prevInformaciones) =>
        prevInformaciones.map((info) =>
          info.id === informacion.id ? { ...info, nombre, numero } : info
        )
      );
      setEditando(false); // Salimos del modo de edición
      onClose(); // Cerramos el modal

      // Mostrar alerta de éxito al editar
      Swal.fire({
        icon: "success",
        title: "¡Edición exitosa!",
        text: "El contacto ha sido actualizado correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al guardar los cambios:", error.response?.data?.message || error.message);
      Swal.fire({
        icon: "error",
        title: "Error al editar",
        text: error.response?.data?.message || "Hubo un error al guardar los cambios. Por favor, inténtelo de nuevo.",
      });
    }
  };

  const handleSeleccionar = () => {
    setSeleccionada(!seleccionada); // Al hacer clic, alternamos el estado de selección
  };

  return (
    <div
      className="modal fade show d-flex justify-content-center align-items-center"
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="modal-dialog"
        style={{
          maxWidth: "900px",
          width: "100%",
        }}
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
              <i className="fas fa-user-circle me-2"></i>
              Detalles del Usuario: <strong>{informacion.nombre}</strong>
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
            <div className="text-center mb-4" onClick={handleSeleccionar}>
              <img
                src="/assets/img/Pinteres.jpeg" // Ruta absoluta para la imagen
                alt={`Imagen de ${informacion.nombre}`}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: seleccionada ? "4px solid #0891b2" : "3px solid #e9ecef",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              />
            </div>
            <table className="table table-borderless" style={{ fontSize: "16px" }}>
              <tbody>
                <tr>
                  <th style={{ width: "30%", color: "#495057", fontWeight: "600" }}>Nombre:</th>
                  <td>
                    {editando ? (
                      <input
                        type="text"
                        className="form-control"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "10px 15px",
                          fontSize: "16px",
                          transition: "border-color 0.3s ease"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#0891b2"}
                        onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                      />
                    ) : (
                      <span style={{ color: "#212529", fontWeight: "500" }}>{informacion.nombre}</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <th style={{ width: "30%", color: "#495057", fontWeight: "600" }}>Número:</th>
                  <td>
                    {editando ? (
                      <input
                        type="text"
                        className="form-control"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "10px 15px",
                          fontSize: "16px",
                          transition: "border-color 0.3s ease"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#0891b2"}
                        onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                      />
                    ) : (
                      <span style={{ color: "#212529", fontWeight: "500" }}>{informacion.numero}</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div 
            className="modal-footer bg-light d-flex justify-content-center"
            style={{ 
              padding: "20px 30px",
              borderRadius: "0 0 20px 20px",
              borderTop: "1px solid #dee2e6"
            }}
          >
            {!editando ? (
              <button
                className="btn btn-primary me-2 d-flex align-items-center justify-content-center"
                style={{ 
                  fontWeight: 600, 
                  fontSize: "1.08rem", 
                  padding: "10px 32px", 
                  borderRadius: "14px" 
                }}
                onClick={() => setEditando(true)}
              >
                <i className="fas fa-edit me-1"></i> Editar
              </button>
            ) : (
              <button
                className="btn btn-primary me-2 d-flex align-items-center justify-content-center"
                style={{ 
                  fontWeight: 600, 
                  fontSize: "1.08rem", 
                  padding: "10px 32px", 
                  borderRadius: "14px" 
                }}
                onClick={guardarCambios}
              >
                <i className="fas fa-save me-1"></i> Guardar Cambios
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

InformacionModal.propTypes = {
  informacion: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    numero: PropTypes.string.isRequired, 
    // `imagen` ya no es requerido si siempre usas una ruta estática.
    // Si la imagen fuera dinámica, debería ser PropTypes.string.isRequired
    eliminado: PropTypes.bool.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  setInformaciones: PropTypes.func.isRequired, 
};

export default InformacionModal;
